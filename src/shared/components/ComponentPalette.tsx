/**
 * ComponentPalette - Simplified Left Panel Component
 * Consolidates component selection into clean cross-domain interface
 */

import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { CanvasManager, type CanvasState } from '../../core/CanvasManager';
import { ComponentEngine } from '../../core/ComponentEngine';
import type { ComponentType } from '../../types/component';

interface ComponentPaletteProps {
  canvasManager: CanvasManager;
  className?: string;
}

interface ComponentInfo {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  category: string;
}

const DraggableComponent: React.FC<{
  component: ComponentInfo;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ component, isDragging, onDragStart, onDragEnd }) => {
  const [{ opacity }, drag] = useDrag({
    type: 'new-item',
    item: { type: 'new-item', itemType: component.type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    begin: onDragStart,
    end: onDragEnd,
  });

  return (
    <div
      ref={drag}
      style={{
        opacity,
        padding: '12px',
        margin: '4px 0',
        backgroundColor: isDragging ? '#e5f3ff' : '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{
        fontSize: '20px',
        minWidth: '24px',
        textAlign: 'center'
      }}>
        {component.icon}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '2px'
        }}>
          {component.label}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          lineHeight: '1.3'
        }}>
          {component.description}
        </div>
      </div>
    </div>
  );
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  canvasManager,
  className = ''
}) => {
  const [canvasState, setCanvasState] = useState<CanvasState>(canvasManager.getState());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['input', 'selection']));
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Subscribe to canvas state changes
  useEffect(() => {
    const unsubscribe = canvasManager.subscribe(setCanvasState);
    return unsubscribe;
  }, [canvasManager]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Get available components based on domain mode
  const getAvailableComponents = (): ComponentInfo[] => {
    const domainMode = canvasManager.getConfig().crossDomainMode;
    
    const baseComponents: ComponentInfo[] = [
      // Input Components
      { type: 'text_input', label: 'Text Input', description: 'Single line text field', icon: '📝', category: 'input' },
      { type: 'textarea', label: 'Text Area', description: 'Multi-line text field', icon: '📄', category: 'input' },
      { type: 'rich_text', label: 'Rich Text', description: 'WYSIWYG text editor', icon: '✏️', category: 'input' },
      { type: 'email_input', label: 'Email', description: 'Email address field', icon: '📧', category: 'input' },
      { type: 'password_input', label: 'Password', description: 'Password input field', icon: '🔒', category: 'input' },
      { type: 'number_input', label: 'Number', description: 'Numeric input field', icon: '🔢', category: 'input' },
      { type: 'date_picker', label: 'Date', description: 'Date selection field', icon: '📅', category: 'input' },
      { type: 'file_upload', label: 'File Upload', description: 'File selection field', icon: '📎', category: 'input' },
      
      // Selection Components
      { type: 'select', label: 'Dropdown', description: 'Single selection dropdown', icon: '📋', category: 'selection' },
      { type: 'multi_select', label: 'Multi Select', description: 'Multiple selection dropdown', icon: '☑️', category: 'selection' },
      { type: 'radio_group', label: 'Radio Group', description: 'Single choice options', icon: '🔘', category: 'selection' },
      { type: 'checkbox_group', label: 'Checkbox Group', description: 'Multiple choice options', icon: '☑️', category: 'selection' },
      { type: 'checkbox', label: 'Checkbox', description: 'Single checkbox field', icon: '✅', category: 'selection' },
      
      // Display Components
      { type: 'heading', label: 'Heading', description: 'Section heading text', icon: '📰', category: 'display' },
      { type: 'paragraph', label: 'Paragraph', description: 'Descriptive text block', icon: '📝', category: 'display' },
      { type: 'divider', label: 'Divider', description: 'Visual section separator', icon: '➖', category: 'display' },
      
      // Special Components
      { type: 'signature', label: 'Signature', description: 'Digital signature pad', icon: '✍️', category: 'special' }
    ];

    // Filter based on domain mode
    let filteredComponents = baseComponents;
    
    if (domainMode === 'surveys') {
      // Surveys might emphasize selection components
      filteredComponents = baseComponents.map(comp => {
        if (comp.category === 'selection') {
          return { ...comp, category: 'primary' };
        }
        return comp;
      });
    } else if (domainMode === 'workflows') {
      // Workflows might emphasize special components
      filteredComponents = baseComponents.map(comp => {
        if (['signature', 'file_upload', 'date_picker'].includes(comp.type)) {
          return { ...comp, category: 'primary' };
        }
        return comp;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filteredComponents = filteredComponents.filter(comp =>
        comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredComponents;
  };

  const groupedComponents = getAvailableComponents().reduce((groups, component) => {
    const category = component.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(component);
    return groups;
  }, {} as Record<string, ComponentInfo[]>);

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      primary: 'Primary',
      input: 'Input Fields',
      selection: 'Selection',
      display: 'Display',
      special: 'Special'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      primary: '⭐',
      input: '📝',
      selection: '☑️',
      display: '📄',
      special: '🔧'
    };
    return icons[category] || '📦';
  };

  const renderCategory = (category: string, components: ComponentInfo[]) => {
    const isExpanded = expandedCategories.has(category);
    
    return (
      <div key={category} style={{ marginBottom: '16px' }}>
        <button
          onClick={() => toggleCategory(category)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: isExpanded ? '#f3f4f6' : '#fff',
            color: '#374151',
            fontSize: '13px',
            fontWeight: '600',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getCategoryIcon(category)}
            {getCategoryLabel(category)}
            <span style={{
              backgroundColor: '#e5e7eb',
              color: '#6b7280',
              fontSize: '11px',
              fontWeight: '500',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {components.length}
            </span>
          </span>
          <span style={{ 
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▶
          </span>
        </button>
        
        {isExpanded && (
          <div style={{
            marginTop: '8px',
            paddingLeft: '4px'
          }}>
            {components.map((component) => (
              <DraggableComponent
                key={component.type}
                component={component}
                isDragging={isDragging}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const stats = canvasManager.getStats();

  return (
    <div className={`component-palette ${className}`} style={{
      width: '280px',
      height: '100%',
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Components
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '12px'
        }}>
          Drag components to canvas
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        {Object.keys(groupedComponents).length > 0 ? (
          Object.entries(groupedComponents)
            .sort(([a], [b]) => {
              // Sort categories: primary first, then alphabetical
              if (a === 'primary') return -1;
              if (b === 'primary') return 1;
              return a.localeCompare(b);
            })
            .map(([category, components]) => renderCategory(category, components))
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '12px',
              opacity: 0.5
            }}>
              🔍
            </div>
            <p style={{
              fontSize: '14px',
              margin: 0
            }}>
              No components found for "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f9fafb',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        {stats.domainMode} mode • {Object.values(groupedComponents).flat().length} available
      </div>
    </div>
  );
};
