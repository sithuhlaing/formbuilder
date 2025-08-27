/**
 * Accordion Left Panel Component
 * Type: accordion, Grouping: by_title, State: collapsed, Content: draggable_components
 */

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { ComponentType } from '../../types';

interface AccordionLeftPanelProps {
  onAddComponent: (type: ComponentType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface ComponentGroup {
  title: string;
  components: {
    type: ComponentType;
    name: string;
    icon: string;
    description: string;
  }[];
}

const componentGroups: ComponentGroup[] = [
  {
    title: "Input Fields",
    components: [
      { type: "text_input", name: "Text Input", icon: "📝", description: "Single line text input" },
      { type: "email", name: "Email", icon: "📧", description: "Email address input" },
      { type: "password", name: "Password", icon: "🔒", description: "Password input field" },
      { type: "number", name: "Number", icon: "🔢", description: "Numeric input field" },
      { type: "textarea", name: "Textarea", icon: "📄", description: "Multi-line text input" }
    ]
  },
  {
    title: "Selection",
    components: [
      { type: "select", name: "Dropdown", icon: "📋", description: "Single selection dropdown" },
      { type: "multi_select", name: "Multi Select", icon: "☑️", description: "Multiple selection dropdown" },
      { type: "radio", name: "Radio Group", icon: "🔘", description: "Single choice from options" },
      { type: "checkbox", name: "Checkbox", icon: "✅", description: "Multiple choice options" }
    ]
  },
  {
    title: "Advanced",
    components: [
      { type: "file_upload", name: "File Upload", icon: "📁", description: "File upload field" },
      { type: "signature", name: "Signature", icon: "✍️", description: "Digital signature pad" },
      { type: "rich_text", name: "Rich Text", icon: "🎨", description: "Formatted text editor" },
      { type: "section_divider", name: "Section Divider", icon: "➖", description: "Visual section separator" }
    ]
  }
];

interface DraggableComponentProps {
  component: ComponentGroup['components'][0];
  onAddComponent: (type: ComponentType) => void;
  isMobile: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onAddComponent,
  isMobile
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      onClick={() => onAddComponent(component.type)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '12px',
        padding: isMobile ? '8px 12px' : '12px 16px',
        margin: '4px 8px',
        background: isDragging ? '#f3f4f6' : '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        userSelect: 'none',
        fontSize: isMobile ? '13px' : '14px'
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      title={`${component.description}\n\nClick to add or drag to canvas`}
    >
      <div style={{
        fontSize: isMobile ? '16px' : '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isMobile ? '24px' : '28px',
        height: isMobile ? '24px' : '28px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        flexShrink: 0
      }}>
        {component.icon}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: '500',
          color: '#374151',
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {component.name}
        </div>
        {!isMobile && (
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {component.description}
          </div>
        )}
      </div>
      
      <div style={{
        fontSize: '10px',
        color: '#9ca3af',
        opacity: 0.5,
        flexShrink: 0
      }}>
        ⋮⋮
      </div>
    </div>
  );
};

interface AccordionSectionProps {
  group: ComponentGroup;
  onAddComponent: (type: ComponentType) => void;
  isMobile: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  group,
  onAddComponent,
  isMobile
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Default: collapsed

  return (
    <div style={{
      borderBottom: '1px solid #f3f4f6',
      background: '#ffffff'
    }}>
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: isMobile ? '12px 16px' : '16px 20px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: isMobile ? '14px' : '15px',
          fontWeight: '600',
          color: '#374151'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span>{group.title}</span>
        <span style={{
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          ▶
        </span>
      </button>

      {/* Accordion Content */}
      <div style={{
        overflow: 'hidden',
        maxHeight: isExpanded ? '500px' : '0px',
        transition: 'max-height 0.3s ease',
        background: '#fafafa'
      }}>
        <div style={{ padding: '8px 0' }}>
          {group.components.map((component) => (
            <DraggableComponent
              key={component.type}
              component={component}
              onAddComponent={onAddComponent}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AccordionLeftPanel: React.FC<AccordionLeftPanelProps> = ({
  onAddComponent,
  isCollapsed,
  onToggle,
  isMobile
}) => {
  if (isCollapsed && !isMobile) {
    return null; // Hidden in desktop when collapsed
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: isMobile ? '12px 16px' : '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Components
          </h3>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: isMobile ? '11px' : '12px',
            color: '#6b7280'
          }}>
            {isMobile ? 'Tap or drag to canvas' : 'Drag to canvas or click to add'}
          </p>
        </div>
        
        {isMobile && (
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
      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {componentGroups.map((group) => (
          <AccordionSection
            key={group.title}
            group={group}
            onAddComponent={onAddComponent}
            isMobile={isMobile}
          />
        ))}
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
        {componentGroups.reduce((total, group) => total + group.components.length, 0)} components available
      </div>
    </div>
  );
};

export default AccordionLeftPanel;