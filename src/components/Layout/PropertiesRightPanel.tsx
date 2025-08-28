/**
 * Properties Right Panel Component
 * Shows properties for the selected component in a fixed right panel
 */

import React from 'react';
import type { FormComponentData } from '../../types';
import { getPropertyEditor } from '../Properties/PropertyEditorRegistry';

interface PropertiesRightPanelProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

const PropertiesRightPanel: React.FC<PropertiesRightPanelProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  if (!selectedComponent) {
    return (
      <div className="properties">
        {/* Panel Header */}
        <div className="properties__header">
          <h2>Properties</h2>
          <p>Select a component to edit properties</p>
        </div>

        {/* Empty state */}
        <div className="properties__content properties__empty">
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
    <div className="properties">
      {/* Panel Header */}
      <div className="properties__header">
        <h2>
          {isRowLayout ? '↔️' : '📝'} Properties
        </h2>
        <p>
          {isRowLayout 
            ? `Row Layout (${selectedComponent.children?.length || 0} items)`
            : selectedComponent.type?.replace('_', ' ') || 'Component'}
        </p>
      </div>

      {/* Properties Content */}
      <div className="properties__content">
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
            {(() => {
              const PropertyEditor = getPropertyEditor(selectedComponent.type);
              return <PropertyEditor component={selectedComponent} onUpdate={handleUpdate} />;
            })()}
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