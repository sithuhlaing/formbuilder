import React from 'react';
import type { FormComponentData } from '../types';

interface PropertiesProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

const Properties: React.FC<PropertiesProps> = ({ selectedComponent, onUpdateComponent }) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel properties-panel--empty">
        <div className="properties-panel__empty-state">
          Select a component to edit its properties
        </div>
      </div>
    );
  }

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(option => option.trim() !== '');
    onUpdateComponent({ options });
  };

  const handleFieldIdChange = (value: string) => {
    // Sanitize field ID to be valid HTML/form field name
    const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    onUpdateComponent({ fieldId: sanitized });
  };

  const handleFileTypesChange = (value: string) => {
    // Validate file extensions format
    const sanitized = value.split(',').map(type => {
      const trimmed = type.trim();
      return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
    }).join(',');
    onUpdateComponent({ acceptedFileTypes: sanitized });
  };

  return (
    <div className="properties-panel">
      <div className="properties__header">
        <h2>Properties</h2>
      </div>

      <div className="properties__content">
        {/* Component Type - Read Only */}
        <div className="properties-section">
          <label className="properties-section__title">
            Component Type
          </label>
          <div className="properties__readonly-field">
            {selectedComponent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>

        {/* Label */}
        <div className="properties-section">
          <label className="properties-section__title" htmlFor="prop-label">
            Label
          </label>
          <input
            id="prop-label"
            type="text"
            value={selectedComponent.label || ''}
            onChange={(e) => onUpdateComponent({ label: e.target.value })}
            className="properties__input"
            placeholder="Enter field label"
          />
        </div>

        {/* Field ID */}
        <div className="properties-section">
          <label className="properties-section__title" htmlFor="prop-field-id">
            Field ID
          </label>
          <input
            id="prop-field-id"
            type="text"
            value={selectedComponent.fieldId || ''}
            onChange={(e) => handleFieldIdChange(e.target.value)}
            className="properties__input"
            placeholder="field_name"
          />
          <small className="properties__help-text">
            Used as the form field name. Only letters, numbers, underscores, and hyphens allowed.
          </small>
        </div>

        {/* Required Field */}
        {selectedComponent.type !== 'section_divider' && selectedComponent.type !== 'horizontal_layout' && selectedComponent.type !== 'vertical_layout' && (
          <div className="properties-section">
            <label className="properties__checkbox-label">
              <input
                type="checkbox"
                checked={selectedComponent.required || false}
                onChange={(e) => onUpdateComponent({ required: e.target.checked })}
                className="properties__checkbox"
              />
              <span>Required Field</span>
            </label>
          </div>
        )}

        {/* Help Text */}
        <div className="properties-section">
          <label className="properties-section__title" htmlFor="prop-help-text">
            Help Text
          </label>
          <input
            id="prop-help-text"
            type="text"
            value={selectedComponent.helpText || ''}
            onChange={(e) => onUpdateComponent({ helpText: e.target.value })}
            className="properties__input"
            placeholder="Optional help text for users"
          />
        </div>

        {/* Placeholder for text inputs */}
        {(selectedComponent.type === 'text_input' || selectedComponent.type === 'textarea' || selectedComponent.type === 'number_input') && (
          <div className="properties-section">
            <label className="properties-section__title" htmlFor="prop-placeholder">
              Placeholder
            </label>
            <input
              id="prop-placeholder"
              type="text"
              value={selectedComponent.placeholder || ''}
              onChange={(e) => onUpdateComponent({ placeholder: e.target.value })}
              className="properties__input"
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Options for select/checkbox/radio components */}
        {(selectedComponent.type === 'select' || selectedComponent.type === 'multi_select' || selectedComponent.type === 'checkbox' || selectedComponent.type === 'radio_group') && (
          <div className="properties-section">
            <label className="properties-section__title" htmlFor="prop-options">
              Options (one per line)
            </label>
            <textarea
              id="prop-options"
              value={selectedComponent.options?.join('\n') || ''}
              onChange={(e) => handleOptionsChange(e.target.value)}
              rows={5}
              className="properties__textarea"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
            <small className="properties__help-text">
              Enter each option on a new line
            </small>
          </div>
        )}

        {/* Number input specific properties */}
        {selectedComponent.type === 'number_input' && (
          <>
            <div className="properties-section">
              <label className="properties-section__title" htmlFor="prop-min">
                Minimum Value
              </label>
              <input
                id="prop-min"
                type="number"
                value={selectedComponent.min || ''}
                onChange={(e) => onUpdateComponent({ min: e.target.value ? Number(e.target.value) : undefined })}
                className="properties__input"
                placeholder="No minimum"
              />
            </div>

            <div className="properties-section">
              <label className="properties-section__title" htmlFor="prop-max">
                Maximum Value
              </label>
              <input
                id="prop-max"
                type="number"
                value={selectedComponent.max || ''}
                onChange={(e) => onUpdateComponent({ max: e.target.value ? Number(e.target.value) : undefined })}
                className="properties__input"
                placeholder="No maximum"
              />
            </div>

            <div className="properties-section">
              <label className="properties-section__title" htmlFor="prop-step">
                Step
              </label>
              <input
                id="prop-step"
                type="number"
                value={selectedComponent.step || ''}
                onChange={(e) => onUpdateComponent({ step: e.target.value ? Number(e.target.value) : undefined })}
                className="properties__input"
                step="0.01"
                placeholder="1"
              />
            </div>
          </>
        )}

        {/* File upload specific properties */}
        {selectedComponent.type === 'file_upload' && (
          <div className="properties-section">
            <label className="properties-section__title" htmlFor="prop-file-types">
              Accepted File Types
            </label>
            <input
              id="prop-file-types"
              type="text"
              value={selectedComponent.acceptedFileTypes || ''}
              onChange={(e) => handleFileTypesChange(e.target.value)}
              className="properties__input"
              placeholder=".pdf,.doc,.docx,.jpg,.png"
            />
            <small className="properties__help-text">
              Comma-separated file extensions (e.g., .pdf,.doc,.jpg)
            </small>
          </div>
        )}

        {/* Section divider specific properties */}
        {selectedComponent.type === 'section_divider' && (
          <div className="properties-section">
            <label className="properties-section__title" htmlFor="prop-description">
              Description
            </label>
            <textarea
              id="prop-description"
              value={selectedComponent.description || ''}
              onChange={(e) => onUpdateComponent({ description: e.target.value })}
              rows={3}
              className="properties__textarea"
              placeholder="Optional description for this section"
            />
          </div>
        )}

        {/* Layout container specific properties */}
        {(selectedComponent.type === 'horizontal_layout' || selectedComponent.type === 'vertical_layout') && (
          <>
            <div className="properties-section">
              <label className="properties-section__title" htmlFor="prop-alignment">
                Alignment
              </label>
              <select
                id="prop-alignment"
                value={selectedComponent.layout?.alignment || 'start'}
                onChange={(e) => onUpdateComponent({ 
                  layout: { 
                    ...selectedComponent.layout, 
                    alignment: e.target.value as 'start' | 'center' | 'end' 
                  } 
                })}
                className="properties__select"
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
              </select>
            </div>

            <div className="properties-section">
              <label className="properties-section__title" htmlFor="prop-gap">
                Gap
              </label>
              <select
                id="prop-gap"
                value={selectedComponent.layout?.gap || 'medium'}
                onChange={(e) => onUpdateComponent({ 
                  layout: { 
                    ...selectedComponent.layout, 
                    gap: e.target.value as 'none' | 'small' | 'medium' | 'large' 
                  } 
                })}
                className="properties__select"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Show child components if any */}
            {selectedComponent.children && selectedComponent.children.length > 0 && (
              <div className="properties-section">
                <div className="properties-section__title">
                  Child Components ({selectedComponent.children.length})
                </div>
                <div className="properties__child-list">
                  {selectedComponent.children.map((child, index) => (
                    <div key={child.id} className="properties__child-item">
                      <span className="properties__child-index">{index + 1}.</span>
                      <span className="properties__child-label">{child.label}</span>
                      <span className="properties__child-type">({child.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Component Info */}
        <div className="properties-section properties-section--info">
          <div className="properties-section__title">
            Component Info
          </div>
          <div className="properties__info-grid">
            <div className="properties__info-item">
              <span className="properties__info-label">ID:</span>
              <span className="properties__info-value">{selectedComponent.id}</span>
            </div>
            <div className="properties__info-item">
              <span className="properties__info-label">Type:</span>
              <span className="properties__info-value">{selectedComponent.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;