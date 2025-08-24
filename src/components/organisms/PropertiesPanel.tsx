import React from 'react';
import type { PropertiesProps, FormComponentData } from '../types';

const PropertiesPanel: React.FC<PropertiesProps> = ({ component, onUpdateComponent }) => {
  if (!component) {
    return (
      <div className="properties-panel">
        <h3>Properties</h3>
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          Select a component to edit its properties
        </p>
      </div>
    );
  }

  const handleInputChange = (field: keyof FormComponentData, value: any) => {
    onUpdateComponent({ [field]: value });
  };

  const handleValidationChange = (field: string, value: any) => {
    onUpdateComponent({
      validation: {
        ...component.validation,
        [field]: value,
      },
    });
  };

  const handleLayoutChange = (field: string, value: any) => {
    onUpdateComponent({
      layout: {
        ...component.layout,
        [field]: value,
      },
    });
  };

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(option => option.trim() !== '');
    onUpdateComponent({ options });
  };

  const renderBasicProperties = () => (
    <div className="property-group">
      <h4>Basic Properties</h4>
      
      <div className="property-field">
        <label>Label</label>
        <input
          type="text"
          value={component.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
          placeholder="Enter label"
        />
      </div>

      {['text_input', 'number_input', 'textarea'].includes(component.type) && (
        <div className="property-field">
          <label>Placeholder</label>
          <input
            type="text"
            value={component.placeholder || ''}
            onChange={(e) => handleInputChange('placeholder', e.target.value)}
            placeholder="Enter placeholder text"
          />
        </div>
      )}

      <div className="property-field checkbox-field">
        <input
          type="checkbox"
          id="required"
          checked={component.required || false}
          onChange={(e) => handleInputChange('required', e.target.checked)}
        />
        <label htmlFor="required">Required</label>
      </div>
    </div>
  );

  const renderOptionsProperties = () => {
    if (!['select', 'multi_select', 'radio_group'].includes(component.type)) {
      return null;
    }

    return (
      <div className="property-group">
        <h4>Options</h4>
        <div className="property-field">
          <label>Options (one per line)</label>
          <textarea
            value={(component.options || []).join('\n')}
            onChange={(e) => handleOptionsChange(e.target.value)}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={5}
          />
        </div>
      </div>
    );
  };

  const renderValidationProperties = () => (
    <div className="property-group">
      <h4>Validation</h4>
      
      {component.type === 'text_input' && (
        <div className="property-field">
          <label>Validation Type</label>
          <select
            value={component.validation?.type || 'none'}
            onChange={(e) => handleValidationChange('type', e.target.value)}
          >
            <option value="none">None</option>
            <option value="email">Email</option>
            <option value="custom">Custom Pattern</option>
          </select>
        </div>
      )}

      {component.validation?.type === 'custom' && (
        <div className="property-field">
          <label>Pattern (RegEx)</label>
          <input
            type="text"
            value={component.validation?.pattern || ''}
            onChange={(e) => handleValidationChange('pattern', e.target.value)}
            placeholder="^[A-Za-z]+$"
          />
        </div>
      )}

      {['text_input', 'textarea', 'number_input'].includes(component.type) && (
        <>
          <div className="property-field">
            <label>Minimum Length/Value</label>
            <input
              type="number"
              value={component.validation?.min || ''}
              onChange={(e) => handleValidationChange('min', parseInt(e.target.value) || undefined)}
              placeholder="0"
            />
          </div>
          
          <div className="property-field">
            <label>Maximum Length/Value</label>
            <input
              type="number"
              value={component.validation?.max || ''}
              onChange={(e) => handleValidationChange('max', parseInt(e.target.value) || undefined)}
              placeholder="100"
            />
          </div>
        </>
      )}

      <div className="property-field">
        <label>Validation Message</label>
        <input
          type="text"
          value={component.validation?.message || ''}
          onChange={(e) => handleValidationChange('message', e.target.value)}
          placeholder="Please enter a valid value"
        />
      </div>
    </div>
  );

  const renderLayoutProperties = () => (
    <div className="property-group">
      <h4>Layout</h4>
      
      <div className="property-field">
        <label>Width</label>
        <select
          value={component.layout?.width || 'auto'}
          onChange={(e) => handleLayoutChange('width', e.target.value)}
        >
          <option value="auto">Auto</option>
          <option value="25%">25%</option>
          <option value="33.333%">33%</option>
          <option value="50%">50%</option>
          <option value="66.666%">66%</option>
          <option value="75%">75%</option>
          <option value="100%">100%</option>
        </select>
      </div>

      <div className="property-field">
        <label>Alignment</label>
        <select
          value={component.layout?.alignment || 'left'}
          onChange={(e) => handleLayoutChange('alignment', e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );

  const renderAdvancedProperties = () => (
    <div className="property-group">
      <h4>Advanced</h4>
      
      <div className="property-field">
        <label>Component ID</label>
        <input
          type="text"
          value={component.id}
          disabled
          style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
        />
      </div>

      <div className="property-field">
        <label>Component Type</label>
        <input
          type="text"
          value={component.type}
          disabled
          style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
        />
      </div>

      {component.defaultValue !== undefined && (
        <div className="property-field">
          <label>Default Value</label>
          <input
            type="text"
            value={component.defaultValue || ''}
            onChange={(e) => handleInputChange('defaultValue', e.target.value)}
            placeholder="Enter default value"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        Editing: <strong>{component.label || component.type}</strong>
      </div>
      
      {renderBasicProperties()}
      {renderOptionsProperties()}
      {renderValidationProperties()}
      {renderLayoutProperties()}
      {renderAdvancedProperties()}
    </div>
  );
};

export default PropertiesPanel;