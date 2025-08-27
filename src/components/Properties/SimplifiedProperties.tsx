/**
 * Simplified Properties Component
 * Uses PropertyEditorRegistry for modular property editing
 */

import React from 'react';
import { getPropertyEditor } from './PropertyEditorRegistry';
import type { FormComponentData } from '../../types';

interface SimplifiedPropertiesProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

const SimplifiedProperties: React.FC<SimplifiedPropertiesProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <h3>Properties</h3>
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const PropertyEditor = getPropertyEditor(selectedComponent.type);

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <div className="component-type-badge">
          {selectedComponent.type}
        </div>
      </div>

      <div className="properties-content">
        <PropertyEditor
          component={selectedComponent}
          onUpdate={onUpdateComponent}
        />
      </div>

      <style jsx>{`
        .properties-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-left: 1px solid #e5e7eb;
        }

        .properties-empty {
          padding: 24px;
          text-align: center;
          color: #6b7280;
        }

        .properties-empty h3 {
          margin-bottom: 8px;
          color: #374151;
        }

        .properties-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .properties-header h3 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
        }

        .component-type-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .properties-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        :global(.property-group) {
          margin-bottom: 24px;
        }

        :global(.property-group h3) {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }

        :global(.form-group) {
          margin-bottom: 16px;
        }

        :global(.form-group label) {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        :global(.form-control) {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: #ffffff;
        }

        :global(.form-control:focus) {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        :global(.btn-primary) {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        :global(.btn-primary:hover) {
          background: #2563eb;
        }

        :global(.btn-secondary) {
          background: #6b7280;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        :global(.btn-secondary:hover) {
          background: #4b5563;
        }

        :global(.btn-secondary:disabled) {
          background: #d1d5db;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SimplifiedProperties;