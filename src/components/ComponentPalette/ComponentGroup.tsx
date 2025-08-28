import React, { useState } from 'react';
import type { ComponentType } from '../../types';
import type { ComponentGroup as ComponentGroupData } from './data/componentGroups';
import { DraggableComponent } from './DraggableComponent';

interface ComponentGroupProps {
  group: ComponentGroupData;
  onAddComponent: (type: ComponentType) => void;
  isMobile?: boolean;
  defaultExpanded?: boolean;
}

export const ComponentGroup: React.FC<ComponentGroupProps> = ({
  group,
  onAddComponent,
  isMobile = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Group Header */}
      <button
        onClick={toggleExpansion}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
      >
        <span>{group.title}</span>
        <span 
          style={{ 
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▶
        </span>
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div style={{ 
          marginTop: '8px',
          paddingLeft: '4px'
        }}>
          {group.components.map((component) => (
            <DraggableComponent
              key={component.type}
              component={component}
              onAddComponent={onAddComponent}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
};