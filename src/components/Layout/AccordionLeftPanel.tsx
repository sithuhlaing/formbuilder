/**
 * Accordion Left Panel Component
 * Type: accordion, Grouping: by_title, State: collapsed, Content: draggable_components
 */

import React from 'react';
import type { ComponentType } from '../../types';
import { ComponentGroup, componentGroups } from '../ComponentPalette';

interface AccordionLeftPanelProps {
  onAddComponent: (type: ComponentType) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

const AccordionLeftPanel: React.FC<AccordionLeftPanelProps> = ({
  onAddComponent,
  isCollapsed = false,
  onToggle,
  isMobile = false
}) => {
  if (isCollapsed && !isMobile) return null;

  return (
    <div className={`sidebar ${isMobile ? 'sidebar--mobile' : ''}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div>
          <h2>Components</h2>
          <p className="sidebar__description">
            {isMobile ? 'Tap or drag to canvas' : 'Drag to canvas or click to add'}
          </p>
        </div>
        
        {isMobile && onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Accordion Content */}
      <div className="sidebar__content">
        {componentGroups.map((group) => (
          <ComponentGroup
            key={group.title}
            group={group}
            onAddComponent={onAddComponent}
            isMobile={isMobile}
            defaultExpanded={true}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        {isMobile ? 
          `${componentGroups.reduce((acc, group) => acc + group.components.length, 0)} components available` :
          'Drag components to build your form'
        }
      </div>
    </div>
  );
};

export default AccordionLeftPanel;