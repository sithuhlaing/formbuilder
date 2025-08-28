import React from 'react';
import type { FormComponentData } from '../../../types';

interface PropertyEditorProps {
  component: FormComponentData;
  onUpdate: (updates: Partial<FormComponentData>) => void;
}

export const SelectPropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => {
  const options = component.options || [];

  const addOption = () => {
    const newOptions = [...options, { label: 'New Option', value: `option_${Date.now()}` }];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
          Label
        </label>
        <input
          type="text"
          value={component.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="required"
          checked={component.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        <label htmlFor="required" style={{ fontSize: '12px', color: '#374151' }}>
          Required field
        </label>
      </div>

      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <label style={{ fontSize: '12px', color: '#6b7280' }}>
            Options
          </label>
          <button
            onClick={addOption}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
              background: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            + Add Option
          </button>
        </div>
        
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="text"
              placeholder="Label"
              value={option.label}
              onChange={(e) => updateOption(index, 'label', e.target.value)}
              style={{
                flex: 1,
                padding: '4px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="text"
              placeholder="Value"
              value={option.value}
              onChange={(e) => updateOption(index, 'value', e.target.value)}
              style={{
                flex: 1,
                padding: '4px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <button
              onClick={() => removeOption(index)}
              style={{
                padding: '4px',
                border: '1px solid #ef4444',
                borderRadius: '3px',
                background: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};