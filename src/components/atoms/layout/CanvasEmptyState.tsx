
import React from 'react';

const CanvasEmptyState: React.FC = () => {
  return (
    <div className="canvas-empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-16)',
      textAlign: 'center',
      color: 'var(--color-gray-500)',
      border: '2px dashed var(--color-gray-300)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-gray-50)'
    }}>
      <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>
        📝
      </div>
      <h3 style={{ 
        margin: '0 0 var(--space-2) 0',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-gray-700)'
      }}>
        Start Building Your Form
      </h3>
      <p style={{ 
        margin: 0,
        fontSize: 'var(--text-sm)',
        maxWidth: '300px',
        lineHeight: '1.5'
      }}>
        Drag components from the sidebar to start building your form. You can rearrange, edit, and customize each component.
      </p>
    </div>
  );
};

export default CanvasEmptyState;
