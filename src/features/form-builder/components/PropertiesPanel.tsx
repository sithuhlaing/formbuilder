/**
 * Clean Properties Panel - Form Builder Feature
 * Single purpose: Edit selected component properties
 */

import React from 'react';
import { ComponentEngine } from '../../../core';
import type { FormComponentData } from '../../../types';

interface PropertiesPanelProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedComponent, 
  onUpdateComponent 
}) => {
  if (!selectedComponent) {
    return (
      <aside className="properties-panel">
        <h3>Properties</h3>
        <div className="properties-panel__empty">
          <p>Select a component to edit its properties</p>
        </div>
      </aside>
    );
  }

  const handleChange = (field: keyof FormComponentData, value: any) => {
    onUpdateComponent({ [field]: value });
  };

  return (
    <aside className="properties-panel">
      <h3>Properties</h3>
      <div className="properties-form">
        
        <div className="form-group">
          <label htmlFor="component-label">Label</label>
          <input
            id="component-label"
            type="text"
            value={selectedComponent.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="component-placeholder">Placeholder</label>
          <input
            id="component-placeholder"
            type="text"
            value={selectedComponent.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedComponent.required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
            Required field
          </label>
        </div>

        {/* Type-specific properties */}
        {selectedComponent.type === 'select' && (
          <div className="form-group">
            <label htmlFor="component-options">Options (one per line)</label>
            <textarea
              id="component-options"
              value={selectedComponent.options?.join('\n') || ''}
              onChange={(e) => handleChange('options', e.target.value.split('\n').filter(Boolean))}
              className="form-control"
              rows={4}
            />
          </div>
        )}

        {selectedComponent.type === 'textarea' && (
          <div className="form-group">
            <label htmlFor="component-rows">Rows</label>
            <input
              id="component-rows"
              type="number"
              min="2"
              max="10"
              value={selectedComponent.rows || 3}
              onChange={(e) => handleChange('rows', parseInt(e.target.value))}
              className="form-control"
            />
          </div>
        )}

      </div>
    </aside>
  );
};