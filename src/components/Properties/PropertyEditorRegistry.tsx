/**
 * Property Editor Registry - Modular property editing components
 * Extracted from the large Properties component for better maintainability
 */

import React from 'react';
import type { FormComponentData } from '../../types';

interface PropertyEditorProps {
  component: FormComponentData;
  onUpdate: (updates: Partial<FormComponentData>) => void;
}

type PropertyEditor = React.FC<PropertyEditorProps>;

// Basic property editors
const TextInputPropertyEditor: PropertyEditor = ({ component, onUpdate }) => (
  <div className="property-group">
    <h3>Text Input Properties</h3>
    
    <div className="form-group">
      <label>Label</label>
      <input
        type="text"
        value={component.label || ''}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>Placeholder</label>
      <input
        type="text"
        value={(component as any).placeholder || ''}
        onChange={(e) => onUpdate({ placeholder: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={component.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>
    </div>

    <div className="form-group">
      <label>Help Text</label>
      <textarea
        value={(component as any).helpText || ''}
        onChange={(e) => onUpdate({ helpText: e.target.value })}
        className="form-control"
        rows={2}
      />
    </div>
  </div>
);

const SelectPropertyEditor: PropertyEditor = ({ component, onUpdate }) => {
  const options = (component as any).options || ['Option 1', 'Option 2'];

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_: any, i: number) => i !== index);
      onUpdate({ options: newOptions });
    }
  };

  return (
    <div className="property-group">
      <h3>Select Properties</h3>
      
      <div className="form-group">
        <label>Label</label>
        <input
          type="text"
          value={component.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={component.required || false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Required
        </label>
      </div>

      <div className="form-group">
        <label>Options</label>
        {options.map((option: string, index: number) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="form-control"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 1}
              className="btn-secondary"
              style={{ minWidth: '32px' }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="btn-primary"
          style={{ marginTop: '8px' }}
        >
          Add Option
        </button>
      </div>
    </div>
  );
};

const TextareaPropertyEditor: PropertyEditor = ({ component, onUpdate }) => (
  <div className="property-group">
    <h3>Textarea Properties</h3>
    
    <div className="form-group">
      <label>Label</label>
      <input
        type="text"
        value={component.label || ''}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>Placeholder</label>
      <input
        type="text"
        value={(component as any).placeholder || ''}
        onChange={(e) => onUpdate({ placeholder: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>Rows</label>
      <input
        type="number"
        min="2"
        max="10"
        value={(component as any).rows || 4}
        onChange={(e) => onUpdate({ rows: parseInt(e.target.value) })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={component.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>
    </div>
  </div>
);

const RichTextPropertyEditor: PropertyEditor = ({ component, onUpdate }) => (
  <div className="property-group">
    <h3>Rich Text Properties</h3>
    
    <div className="form-group">
      <label>Content</label>
      <textarea
        value={(component as any).content || ''}
        onChange={(e) => onUpdate({ content: e.target.value })}
        className="form-control"
        rows={4}
        placeholder="Enter rich text content..."
      />
    </div>
  </div>
);

const FileUploadPropertyEditor: PropertyEditor = ({ component, onUpdate }) => (
  <div className="property-group">
    <h3>File Upload Properties</h3>
    
    <div className="form-group">
      <label>Label</label>
      <input
        type="text"
        value={component.label || ''}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>Accepted File Types</label>
      <input
        type="text"
        value={(component as any).acceptedTypes || ''}
        onChange={(e) => onUpdate({ acceptedTypes: e.target.value })}
        className="form-control"
        placeholder=".pdf,.doc,.docx,.jpg,.png"
      />
    </div>

    <div className="form-group">
      <label>Max File Size (MB)</label>
      <input
        type="number"
        min="1"
        max="100"
        value={(component as any).maxSize || 10}
        onChange={(e) => onUpdate({ maxSize: parseInt(e.target.value) })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={component.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>
    </div>
  </div>
);

// Default fallback editor
const DefaultPropertyEditor: PropertyEditor = ({ component, onUpdate }) => (
  <div className="property-group">
    <h3>General Properties</h3>
    
    <div className="form-group">
      <label>Label</label>
      <input
        type="text"
        value={component.label || ''}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>Field ID</label>
      <input
        type="text"
        value={component.fieldId || ''}
        onChange={(e) => onUpdate({ fieldId: e.target.value })}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={component.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>
    </div>
  </div>
);

// Registry mapping component types to their property editors
export const propertyEditorRegistry: Record<string, PropertyEditor> = {
  text_input: TextInputPropertyEditor,
  email: TextInputPropertyEditor,
  password: TextInputPropertyEditor,
  number: TextInputPropertyEditor,
  textarea: TextareaPropertyEditor,
  select: SelectPropertyEditor,
  multi_select: SelectPropertyEditor,
  radio: SelectPropertyEditor,
  checkbox: SelectPropertyEditor,
  file_upload: FileUploadPropertyEditor,
  rich_text: RichTextPropertyEditor,
};

/**
 * Get property editor for a specific component type
 */
export function getPropertyEditor(componentType: string): PropertyEditor {
  return propertyEditorRegistry[componentType] || DefaultPropertyEditor;
}