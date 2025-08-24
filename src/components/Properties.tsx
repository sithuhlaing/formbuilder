import React from "react";
import type { PropertiesProps } from "./types";

const Properties: React.FC<PropertiesProps> = ({
  component,
  onUpdateComponent,
}) => {
  if (!component) {
    return (
      <div className="empty-state">
        <div className="empty-state__illustration">⚙️</div>
        <h3 className="empty-canvas__title">No Component Selected</h3>
        <p className="empty-canvas__description">
          Select a component to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Basic Properties */}
      <div className="properties-section">
        <h3 className="properties-section__title">
          <span className="properties-section__icon">📝</span>
          Basic Properties
        </h3>
        
        <div className="field-group">
          <label className="field-group__label">Label</label>
          <input
            type="text"
            value={component.label}
            onChange={(e) => onUpdateComponent({ label: e.target.value })}
            className="input"
            placeholder="Enter field label"
          />
        </div>

        <div className="field-group">
          <label className="checkbox">
            <input
              type="checkbox"
              className="checkbox__input"
              checked={component.required || false}
              onChange={(e) => onUpdateComponent({ required: e.target.checked })}
            />
            <div className="checkbox__box"></div>
            Required Field
          </label>
        </div>
      </div>

      {/* Field-specific Properties */}
      {(component.placeholder !== undefined) && (
        <div className="properties-section">
          <h3 className="properties-section__title">
            <span className="properties-section__icon">💬</span>
            Display Options
          </h3>
          
          <div className="field-group">
            <label className="field-group__label">Placeholder Text</label>
            <input
              type="text"
              value={component.placeholder}
              onChange={(e) => onUpdateComponent({ placeholder: e.target.value })}
              className="input"
              placeholder="Enter placeholder text"
            />
          </div>
        </div>
      )}

      {component.options && (
        <div className="properties-section">
          <h3 className="properties-section__title">
            <span className="properties-section__icon">📋</span>
            Options
          </h3>
          
          <div className="field-group">
            <label className="field-group__label">Available Options</label>
            <textarea
              value={component.options.join('\n')}
              onChange={(e) => {
                // Don't filter immediately - let user type and use Enter for new lines
                const rawLines = e.target.value.split('\n');
                onUpdateComponent({ options: rawLines });
              }}
              onBlur={(e) => {
                // Clean up empty lines when user finishes editing
                const cleanLines = e.target.value.split('\n').map(line => line.trim()).filter(Boolean);
                if (cleanLines.length > 0) {
                  onUpdateComponent({ options: cleanLines });
                }
              }}
              onKeyDown={(e) => {
                // Ensure Enter key works for new lines
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              className="textarea"
              rows={6}
              placeholder="Enter each option on a new line:&#10;Option 1&#10;Option 2&#10;Option 3"
              style={{ resize: 'vertical', minHeight: '120px', whiteSpace: 'pre-wrap' }}
            />
            <p className="field-group__description">
              Enter each option on a separate line
            </p>
          </div>
        </div>
      )}

      {/* Layout Properties for individual components */}
      <div className="properties-section">
        <h3 className="properties-section__title">
          <span className="properties-section__icon">📐</span>
          Layout & Style
        </h3>
        
        <div className="field-group">
          <label className="field-group__label">Width</label>
          <select
            value={component.layout?.width || 'auto'}
            onChange={(e) => onUpdateComponent({ 
              layout: { 
                ...component.layout, 
                width: e.target.value 
              } 
            })}
            className="select"
          >
            <option value="auto">Auto</option>
            <option value="25%">25% (Quarter)</option>
            <option value="33.33%">33% (Third)</option>
            <option value="50%">50% (Half)</option>
            <option value="66.66%">66% (Two-thirds)</option>
            <option value="75%">75% (Three-quarters)</option>
            <option value="100%">100% (Full width)</option>
          </select>
        </div>
      </div>

      {/* Container Layout Properties */}
      {(component.type === 'horizontal_container' || component.type === 'vertical_container') && (
        <div className="properties-section">
          <h3 className="properties-section__title">
            <span className="properties-section__icon">🗂️</span>
            Container Settings
          </h3>
          
          <div className="field-group">
            <label className="field-group__label">Alignment</label>
            <select
              value={component.layout?.alignment || 'start'}
              onChange={(e) => onUpdateComponent({ 
                layout: { 
                  ...component.layout, 
                  alignment: e.target.value as any 
                } 
              })}
              className="select"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-group__label">Gap Between Items</label>
            <select
              value={component.layout?.gap || 'medium'}
              onChange={(e) => onUpdateComponent({ 
                layout: { 
                  ...component.layout, 
                  gap: e.target.value as any 
                } 
              })}
              className="select"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      )}

      {/* Validation */}
      <div className="properties-section">
        <h3 className="properties-section__title">
          <span className="properties-section__icon">✅</span>
          Validation
        </h3>
        
        <div className="field-group">
          <label className="field-group__label">Validation Type</label>
          <select
            value={component.validation || 'none'}
            onChange={(e) => onUpdateComponent({ validation: e.target.value as any })}
            className="select"
          >
            <option value="none">None</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="custom">Custom Regex</option>
          </select>
        </div>

        {component.validation === 'custom' && (
          <div className="field-group">
            <label className="field-group__label">Custom Regex Pattern</label>
            <input
              type="text"
              value={component.customValidation || ''}
              onChange={(e) => onUpdateComponent({ customValidation: e.target.value })}
              className="input"
              placeholder="^[A-Za-z0-9]+$"
            />
            <p className="field-group__description">
              Enter a regular expression pattern for validation
            </p>
          </div>
        )}
      </div>

      {/* Field ID */}
      <div className="properties-section">
        <h3 className="properties-section__title">
          <span className="properties-section__icon">🔗</span>
          Technical
        </h3>
        
        <div className="field-group">
          <label className="field-group__label">Field ID</label>
          <input
            type="text"
            value={component.fieldId || ''}
            onChange={(e) => onUpdateComponent({ fieldId: e.target.value })}
            className="input"
            placeholder="field_id"
          />
          <p className="field-group__description">
            Unique identifier for this field in form submissions
          </p>
        </div>

        <div className="field-group">
          <label className="field-group__label">Help Text</label>
          <input
            type="text"
            value={component.helpText || ''}
            onChange={(e) => onUpdateComponent({ helpText: e.target.value })}
            className="input"
            placeholder="Additional help text for users"
          />
          <p className="field-group__description">
            Optional help text displayed with the field
          </p>
        </div>
      </div>
    </div>
  );
};

export default Properties;