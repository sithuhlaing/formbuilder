import React from 'react';
import type { FormComponentData } from '../../../types';

interface PropertyEditorProps {
  component: FormComponentData;
  onUpdate: (updates: Partial<FormComponentData>) => void;
}

export const GenericPropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => (
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