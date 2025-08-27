import React from 'react';
import type { ComponentType } from '../../../types';

interface CanvasEmptyStateProps {
  onAddComponent: (type: ComponentType) => void;
}

const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({ onAddComponent }) => {
  const handleAddHorizontalLayout = () => {
    onAddComponent('horizontal_layout');
  };

  const handleAddVerticalLayout = () => {
    onAddComponent('vertical_layout');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#6b7280',
        fontSize: '16px',
        marginBottom: '24px'
      }}>
        Drop components here to build your form
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          onClick={handleAddHorizontalLayout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ↔ Add Row Layout
        </button>
        <button
          onClick={handleAddVerticalLayout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ↕ Add Column Layout
        </button>
      </div>
      <div style={{ fontSize: '14px', color: '#9ca3af' }}>
        Or drag components from the sidebar
      </div>
    </div>
  );
};

export default CanvasEmptyState;