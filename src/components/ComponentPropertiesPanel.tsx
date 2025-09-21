/**
 * COMPONENT PROPERTIES PANEL
 * Allows users to select and edit component properties
 * Displays different property editors based on component type
 */

import React, { useState } from 'react';
import type { Component, ComponentType } from '../types/components';
import {
  isInputComponent,
  isSelectionComponent,
  isLayoutComponent,
  isContentComponent,
  getComponentCategory
} from '../types/components';

export interface ComponentPropertiesPanelProps {
  selectedComponent: Component | null;
  onUpdateComponent: (id: string, updates: Partial<Component>) => void;
  onClosePanel?: () => void;
}

export function ComponentPropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onClosePanel
}: ComponentPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'validation' | 'styling'>('basic');

  if (!selectedComponent) {
    return (
      <div className="properties-panel properties-panel--empty">
        <div className="properties-panel__empty-state">
          <div className="empty-state-icon">⚙️</div>
          <h3>No Component Selected</h3>
          <p>Click on a component in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateComponent(selectedComponent.id, { [property]: value });
  };

  const handleValidationChange = (validationUpdate: Partial<Component['validation']>) => {
    const currentValidation = selectedComponent.validation || {};
    onUpdateComponent(selectedComponent.id, {
      validation: { ...currentValidation, ...validationUpdate }
    });
  };

  const handleStyleChange = (styleUpdate: Partial<React.CSSProperties>) => {
    const currentStyle = selectedComponent.style || {};
    onUpdateComponent(selectedComponent.id, {
      style: { ...currentStyle, ...styleUpdate }
    });
  };

  const componentCategory = getComponentCategory(selectedComponent.type);

  return (
    <div className="properties-panel">
      {/* Header */}
      <div className="properties-panel__header">
        <div className="properties-panel__title">
          <span className="component-icon">
            {getComponentIcon(selectedComponent.type)}
          </span>
          <div>
            <h3>{selectedComponent.label || 'Component Properties'}</h3>
            <p className="component-type-label">{selectedComponent.type.replace('_', ' ')}</p>
          </div>
        </div>
        {onClosePanel && (
          <button
            className="properties-panel__close"
            onClick={onClosePanel}
            title="Close Properties Panel"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="properties-panel__tabs">
        <button
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button
          className={`tab ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button
          className={`tab ${activeTab === 'styling' ? 'active' : ''}`}
          onClick={() => setActiveTab('styling')}
        >
          Styling
        </button>
      </div>

      {/* Tab Content */}
      <div className="properties-panel__content">
        {activeTab === 'basic' && (
          <BasicPropertiesTab
            component={selectedComponent}
            onPropertyChange={handlePropertyChange}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationPropertiesTab
            component={selectedComponent}
            onValidationChange={handleValidationChange}
          />
        )}

        {activeTab === 'styling' && (
          <StylingPropertiesTab
            component={selectedComponent}
            onStyleChange={handleStyleChange}
          />
        )}
      </div>
    </div>
  );
}

// Basic Properties Tab Component
interface BasicPropertiesTabProps {
  component: Component;
  onPropertyChange: (property: string, value: any) => void;
}

function BasicPropertiesTab({ component, onPropertyChange }: BasicPropertiesTabProps) {
  return (
    <div className="properties-tab">
      {/* Label */}
      <div className="property-group">
        <label className="property-label">Label</label>
        <input
          type="text"
          className="property-input"
          value={component.label}
          onChange={(e) => onPropertyChange('label', e.target.value)}
          placeholder="Enter component label"
        />
      </div>

      {/* Required */}
      {isInputComponent(component) || isSelectionComponent(component) ? (
        <div className="property-group">
          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={component.required || false}
              onChange={(e) => onPropertyChange('required', e.target.checked)}
            />
            <span>Required field</span>
          </label>
        </div>
      ) : null}

      {/* Placeholder for input components */}
      {isInputComponent(component) ? (
        <div className="property-group">
          <label className="property-label">Placeholder</label>
          <input
            type="text"
            className="property-input"
            value={component.placeholder || ''}
            onChange={(e) => onPropertyChange('placeholder', e.target.value)}
            placeholder="Enter placeholder text"
          />
        </div>
      ) : null}

      {/* Default Value */}
      {(isInputComponent(component) || isSelectionComponent(component)) ? (
        <div className="property-group">
          <label className="property-label">Default Value</label>
          <input
            type={component.type === 'number_input' ? 'number' : 'text'}
            className="property-input"
            value={component.defaultValue || ''}
            onChange={(e) => onPropertyChange('defaultValue', e.target.value)}
            placeholder="Enter default value"
          />
        </div>
      ) : null}

      {/* Help Text */}
      <div className="property-group">
        <label className="property-label">Help Text</label>
        <input
          type="text"
          className="property-input"
          value={component.helpText || ''}
          onChange={(e) => onPropertyChange('helpText', e.target.value)}
          placeholder="Enter help text"
        />
      </div>

      {/* Component-specific properties */}
      <ComponentSpecificProperties
        component={component}
        onPropertyChange={onPropertyChange}
      />
    </div>
  );
}

// Component-specific properties
function ComponentSpecificProperties({ component, onPropertyChange }: BasicPropertiesTabProps) {
  switch (component.type) {
    case 'textarea':
      return (
        <>
          <div className="property-group">
            <label className="property-label">Rows</label>
            <input
              type="number"
              className="property-input"
              value={component.rows || 3}
              onChange={(e) => onPropertyChange('rows', parseInt(e.target.value))}
              min="1"
              max="20"
            />
          </div>
        </>
      );

    case 'heading':
      return (
        <div className="property-group">
          <label className="property-label">Heading Level</label>
          <select
            className="property-select"
            value={component.level || 1}
            onChange={(e) => onPropertyChange('level', parseInt(e.target.value))}
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
            <option value={5}>H5</option>
            <option value={6}>H6</option>
          </select>
        </div>
      );

    case 'button':
      return (
        <>
          <div className="property-group">
            <label className="property-label">Button Variant</label>
            <select
              className="property-select"
              value={component.variant || 'primary'}
              onChange={(e) => onPropertyChange('variant', e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="property-group">
            <label className="property-label">Button Size</label>
            <select
              className="property-select"
              value={component.size || 'md'}
              onChange={(e) => onPropertyChange('size', e.target.value)}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div className="property-group">
            <label className="property-checkbox">
              <input
                type="checkbox"
                checked={component.fullWidth || false}
                onChange={(e) => onPropertyChange('fullWidth', e.target.checked)}
              />
              <span>Full width</span>
            </label>
          </div>
        </>
      );

    case 'number_input':
      return (
        <>
          <div className="property-group">
            <label className="property-label">Step</label>
            <input
              type="number"
              className="property-input"
              value={component.step || 1}
              onChange={(e) => onPropertyChange('step', parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
        </>
      );

    case 'file_upload':
      return (
        <>
          <div className="property-group">
            <label className="property-label">Accepted File Types</label>
            <input
              type="text"
              className="property-input"
              value={component.accept || ''}
              onChange={(e) => onPropertyChange('accept', e.target.value)}
              placeholder="e.g., .jpg,.png,.pdf"
            />
          </div>
          <div className="property-group">
            <label className="property-checkbox">
              <input
                type="checkbox"
                checked={component.multiple || false}
                onChange={(e) => onPropertyChange('multiple', e.target.checked)}
              />
              <span>Allow multiple files</span>
            </label>
          </div>
        </>
      );

    case 'paragraph':
      return (
        <div className="property-group">
          <label className="property-label">Content</label>
          <textarea
            className="property-textarea"
            value={component.content || ''}
            onChange={(e) => onPropertyChange('content', e.target.value)}
            placeholder="Enter paragraph content"
            rows={4}
          />
        </div>
      );

    case 'select':
    case 'radio_group':
      return (
        <OptionsEditor
          component={component}
          onPropertyChange={onPropertyChange}
        />
      );

    default:
      return null;
  }
}

// Options Editor for select and radio components
function OptionsEditor({ component, onPropertyChange }: BasicPropertiesTabProps) {
  const options = component.options || [];

  const addOption = () => {
    const newOptions = [...options, { label: 'New Option', value: `option_${options.length + 1}` }];
    onPropertyChange('options', newOptions);
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onPropertyChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onPropertyChange('options', newOptions);
  };

  return (
    <div className="property-group">
      <label className="property-label">Options</label>
      <div className="options-editor">
        {options.map((option, index) => (
          <div key={index} className="option-row">
            <input
              type="text"
              className="option-input"
              value={option.label}
              onChange={(e) => updateOption(index, 'label', e.target.value)}
              placeholder="Option label"
            />
            <input
              type="text"
              className="option-input"
              value={option.value}
              onChange={(e) => updateOption(index, 'value', e.target.value)}
              placeholder="Option value"
            />
            <button
              type="button"
              className="option-remove"
              onClick={() => removeOption(index)}
              title="Remove option"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-option-btn"
          onClick={addOption}
        >
          + Add Option
        </button>
      </div>
    </div>
  );
}

// Validation Properties Tab
interface ValidationPropertiesTabProps {
  component: Component;
  onValidationChange: (validationUpdate: Partial<Component['validation']>) => void;
}

function ValidationPropertiesTab({ component, onValidationChange }: ValidationPropertiesTabProps) {
  const validation = component.validation || {};

  return (
    <div className="properties-tab">
      {/* Required validation */}
      <div className="property-group">
        <label className="property-checkbox">
          <input
            type="checkbox"
            checked={validation.required || false}
            onChange={(e) => onValidationChange({ required: e.target.checked })}
          />
          <span>Required</span>
        </label>
      </div>

      {/* String length validation for text inputs */}
      {isInputComponent(component) && (
        <>
          <div className="property-group">
            <label className="property-label">Minimum Length</label>
            <input
              type="number"
              className="property-input"
              value={validation.minLength || ''}
              onChange={(e) => onValidationChange({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="No minimum"
              min="0"
            />
          </div>

          <div className="property-group">
            <label className="property-label">Maximum Length</label>
            <input
              type="number"
              className="property-input"
              value={validation.maxLength || ''}
              onChange={(e) => onValidationChange({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="No maximum"
              min="1"
            />
          </div>
        </>
      )}

      {/* Number range validation */}
      {component.type === 'number_input' && (
        <>
          <div className="property-group">
            <label className="property-label">Minimum Value</label>
            <input
              type="number"
              className="property-input"
              value={validation.min || ''}
              onChange={(e) => onValidationChange({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="No minimum"
            />
          </div>

          <div className="property-group">
            <label className="property-label">Maximum Value</label>
            <input
              type="number"
              className="property-input"
              value={validation.max || ''}
              onChange={(e) => onValidationChange({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="No maximum"
            />
          </div>
        </>
      )}

      {/* Pattern validation */}
      {isInputComponent(component) && (
        <div className="property-group">
          <label className="property-label">Pattern (Regex)</label>
          <input
            type="text"
            className="property-input"
            value={validation.pattern || ''}
            onChange={(e) => onValidationChange({ pattern: e.target.value || undefined })}
            placeholder="e.g., ^[A-Za-z]+$"
          />
        </div>
      )}

      {/* Custom validation message */}
      <div className="property-group">
        <label className="property-label">Custom Error Message</label>
        <input
          type="text"
          className="property-input"
          value={validation.message || ''}
          onChange={(e) => onValidationChange({ message: e.target.value || undefined })}
          placeholder="Enter custom error message"
        />
      </div>
    </div>
  );
}

// Styling Properties Tab
interface StylingPropertiesTabProps {
  component: Component;
  onStyleChange: (styleUpdate: Partial<React.CSSProperties>) => void;
}

function StylingPropertiesTab({ component, onStyleChange }: StylingPropertiesTabProps) {
  const style = component.style || {};

  return (
    <div className="properties-tab">
      {/* Colors */}
      <div className="property-group">
        <label className="property-label">Text Color</label>
        <input
          type="color"
          className="property-color"
          value={style.color || '#000000'}
          onChange={(e) => onStyleChange({ color: e.target.value })}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Background Color</label>
        <input
          type="color"
          className="property-color"
          value={style.backgroundColor || '#ffffff'}
          onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
        />
      </div>

      {/* Typography */}
      <div className="property-group">
        <label className="property-label">Font Size</label>
        <input
          type="text"
          className="property-input"
          value={style.fontSize || ''}
          onChange={(e) => onStyleChange({ fontSize: e.target.value || undefined })}
          placeholder="e.g., 16px, 1rem"
        />
      </div>

      <div className="property-group">
        <label className="property-label">Font Weight</label>
        <select
          className="property-select"
          value={style.fontWeight || 'normal'}
          onChange={(e) => onStyleChange({ fontWeight: e.target.value || undefined })}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="500">500</option>
          <option value="600">600</option>
          <option value="700">700</option>
          <option value="800">800</option>
          <option value="900">900</option>
        </select>
      </div>

      {/* Spacing */}
      <div className="property-group">
        <label className="property-label">Margin</label>
        <input
          type="text"
          className="property-input"
          value={style.margin || ''}
          onChange={(e) => onStyleChange({ margin: e.target.value || undefined })}
          placeholder="e.g., 10px, 1rem 2rem"
        />
      </div>

      <div className="property-group">
        <label className="property-label">Padding</label>
        <input
          type="text"
          className="property-input"
          value={style.padding || ''}
          onChange={(e) => onStyleChange({ padding: e.target.value || undefined })}
          placeholder="e.g., 10px, 1rem 2rem"
        />
      </div>

      {/* Border */}
      <div className="property-group">
        <label className="property-label">Border</label>
        <input
          type="text"
          className="property-input"
          value={style.border || ''}
          onChange={(e) => onStyleChange({ border: e.target.value || undefined })}
          placeholder="e.g., 1px solid #ccc"
        />
      </div>

      <div className="property-group">
        <label className="property-label">Border Radius</label>
        <input
          type="text"
          className="property-input"
          value={style.borderRadius || ''}
          onChange={(e) => onStyleChange({ borderRadius: e.target.value || undefined })}
          placeholder="e.g., 4px, 0.5rem"
        />
      </div>
    </div>
  );
}

// Helper function to get component icons
function getComponentIcon(type: ComponentType): string {
  const icons: Record<ComponentType, string> = {
    text_input: '📝',
    email_input: '📧',
    number_input: '🔢',
    textarea: '📄',
    select: '📋',
    radio_group: '⚪',
    checkbox: '☑️',
    date_picker: '📅',
    file_upload: '📎',
    horizontal_layout: '⚌',
    vertical_layout: '☰',
    button: '🔘',
    heading: '📰',
    paragraph: '📃',
    divider: '➖',
    section_divider: '┅'
  };
  return icons[type] || '⚙️';
}

// CSS Classes (would normally be in a separate CSS file)
export const COMPONENT_PROPERTIES_PANEL_STYLES = `
.properties-panel {
  width: 320px;
  height: 100%;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.properties-panel--empty {
  justify-content: center;
  align-items: center;
}

.properties-panel__empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.properties-panel__header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.properties-panel__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.component-icon {
  font-size: 1.5rem;
}

.properties-panel__title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.component-type-label {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.properties-panel__close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.properties-panel__close:hover {
  background: #f3f4f6;
  color: #374151;
}

.properties-panel__tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #374151;
  background: #f9fafb;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: white;
}

.properties-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.properties-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.property-input,
.property-select,
.property-textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.property-input:focus,
.property-select:focus,
.property-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.property-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.property-checkbox input[type="checkbox"] {
  margin: 0;
}

.property-color {
  width: 60px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.options-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.option-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.option-remove {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-remove:hover {
  background: #dc2626;
}

.add-option-btn {
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.add-option-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Responsive design */
@media (max-width: 768px) {
  .properties-panel {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
    box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
  }
}
`;