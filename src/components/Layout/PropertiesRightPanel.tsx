/**
 * Properties Right Panel Component
 * Shows properties for the selected component in a fixed right panel
 */

import React from 'react';
import type { FormComponentData } from '../../types';

interface PropertiesRightPanelProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

interface PropertyEditorProps {
  component: FormComponentData;
  onUpdate: (updates: Partial<FormComponentData>) => void;
}

const TextInputPropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => (
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
    
    <div>
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
        Field ID
      </label>
      <input
        type="text"
        value={component.fieldId || ''}
        onChange={(e) => onUpdate({ fieldId: e.target.value })}
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
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
        Placeholder
      </label>
      <input
        type="text"
        value={component.placeholder || ''}
        onChange={(e) => onUpdate({ placeholder: e.target.value })}
        style={{
          width: '100%',
          padding: '6px 8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
    </div>
  </div>
);

const SelectPropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => {
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

const GenericPropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => (
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
    
    <div>
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
        Field ID
      </label>
      <input
        type="text"
        value={component.fieldId || ''}
        onChange={(e) => onUpdate({ fieldId: e.target.value })}
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
  </div>
);

const getPropertyEditor = (component: FormComponentData, onUpdate: (updates: Partial<FormComponentData>) => void) => {
  switch (component.type) {
    case 'text_input':
    case 'email':
    case 'password':
    case 'number':
    case 'textarea':
      return <TextInputPropertyEditor component={component} onUpdate={onUpdate} />;
    
    case 'select':
    case 'multi_select':
    case 'radio':
    case 'checkbox':
      return <SelectPropertyEditor component={component} onUpdate={onUpdate} />;
    
    default:
      return <GenericPropertyEditor component={component} onUpdate={onUpdate} />;
  }
};

const PropertiesRightPanel: React.FC<PropertiesRightPanelProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  if (!selectedComponent) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff'
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Properties
          </h3>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Select a component to edit properties
          </p>
        </div>

        {/* Empty state */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>
              ⚙️
            </div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              No component selected
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Click on a form component to edit its properties
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormComponentData>) => {
    onUpdateComponent({
      ...updates,
      id: selectedComponent.id
    });
  };

  const isRowLayout = selectedComponent.type === 'horizontal_layout';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isRowLayout ? '↔️' : '📝'} Properties
        </h3>
        <p style={{
          margin: '2px 0 0 0',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {isRowLayout 
            ? `Row Layout (${selectedComponent.children?.length || 0} items)`
            : selectedComponent.type?.replace('_', ' ') || 'Component'}
        </p>
      </div>

      {/* Properties Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        {isRowLayout ? (
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
            border: '1px dashed #e5e7eb',
            borderRadius: '8px',
            background: '#fafafa'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>↔️</div>
            <div style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>
              Row Layout Container
            </div>
            <div style={{ fontSize: '12px' }}>
              Contains {selectedComponent.children?.length || 0} components
            </div>
            <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
              Width distribution is handled automatically
            </div>
          </div>
        ) : (
          <div>
            {/* Component Type Info */}
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Component: {selectedComponent.type?.replace('_', ' ') || 'Unknown'}
              </div>
              <div style={{ color: '#6b7280' }}>
                ID: {selectedComponent.id}
              </div>
            </div>

            {/* Property Editor */}
            {getPropertyEditor(selectedComponent, handleUpdate)}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        Properties are saved automatically
      </div>
    </div>
  );
};

export default PropertiesRightPanel;