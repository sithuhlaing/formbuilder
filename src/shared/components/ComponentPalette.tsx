/**
 * ComponentPalette - Simplified Left Panel Component
 * Consolidates component selection into clean cross-domain interface
 */

import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { CanvasManager } from '../../core/CanvasManager';
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
  const elementRef = useRef<HTMLDivElement>(null);
  const [{ opacity }, drag] = useDrag<
    { type: string; itemType: ComponentType },
    unknown,
    { opacity: number }
  >({
    type: 'new-item',
    item: { type: 'new-item', itemType: component.type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  // Connect the drag source to the element
  drag(elementRef);

  // Handle drag events using useEffect
  React.useEffect(() => {
    if (opacity < 1) {
      onDragStart();
    } else if (isDragging && opacity === 1) {
      onDragEnd();
    }
  }, [opacity, isDragging, onDragStart, onDragEnd]);

  return (
    <div
      ref={elementRef}
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['input_components', 'selection_components']));
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Input Components - EXACTLY AS DOCUMENTED
      { type: 'text_input', label: 'Text Input', description: 'Single line text field', icon: '📝', category: 'input_components' },
      { type: 'email_input', label: 'Email Input', description: 'Email address field with validation', icon: '📧', category: 'input_components' },
      { type: 'password_input', label: 'Password Input', description: 'Password field with masking', icon: '🔒', category: 'input_components' },
      { type: 'number_input', label: 'Number Input', description: 'Numeric input with validation', icon: '🔢', category: 'input_components' },
      { type: 'textarea', label: 'Text Area', description: 'Multi-line text input', icon: '📄', category: 'input_components' },
      { type: 'rich_text', label: 'Rich Text Editor', description: 'WYSIWYG text editor', icon: '✏️', category: 'input_components' },
      
      // Selection Components - EXACTLY AS DOCUMENTED
      { type: 'select', label: 'Select Dropdown', description: 'Single selection dropdown', icon: '📋', category: 'selection_components' },
      { type: 'multi_select', label: 'Multi Select', description: 'Multiple selection dropdown', icon: '☑️', category: 'selection_components' },
      { type: 'checkbox', label: 'Checkbox', description: 'Single checkbox input', icon: '✅', category: 'selection_components' },
      { type: 'radio_group', label: 'Radio Group', description: 'Single selection from multiple options', icon: '🔘', category: 'selection_components' },
      
      // Special Components - EXACTLY AS DOCUMENTED
      { type: 'date_picker', label: 'Date Picker', description: 'Calendar date selection', icon: '📅', category: 'special_components' },
      { type: 'file_upload', label: 'File Upload', description: 'File selection and upload', icon: '📎', category: 'special_components' },
      { type: 'signature', label: 'Signature Pad', description: 'Digital signature capture', icon: '✍️', category: 'special_components' },
      
      // Layout Components - EXACTLY AS DOCUMENTED
      { type: 'horizontal_layout', label: 'Horizontal Layout', description: 'Container for side-by-side components', icon: '📐', category: 'layout_components' },
      { type: 'vertical_layout', label: 'Vertical Layout', description: 'Container for stacked components', icon: '📏', category: 'layout_components' },
      
      // UI Components - EXACTLY AS DOCUMENTED
      { type: 'section_divider', label: 'Section Divider', description: 'Visual separator between form sections', icon: '➖', category: 'ui_components' },
      { type: 'button', label: 'Button', description: 'Action button for form interactions', icon: '🔲', category: 'ui_components' },
      { type: 'heading', label: 'Heading', description: 'Section heading or title', icon: '📰', category: 'ui_components' },
      { type: 'card', label: 'Card Container', description: 'Visual card container for grouping', icon: '🗂️', category: 'ui_components' }
    ];

    // Filter based on domain mode - ALIGNED WITH DOCUMENTATION
    let filteredComponents = baseComponents;
    
    if (domainMode === 'surveys') {
      // Surveys focus on data collection components - CORRECTED
      filteredComponents = baseComponents.filter(comp => {
        const surveyComponents = [
          // Input Components (6 components)
          'text_input', 'email_input', 'password_input', 'number_input', 'textarea', 'rich_text',
          // Selection Components (4 components)
          'select', 'multi_select', 'checkbox', 'radio_group',
          // Special Components (3 components) 
          'date_picker', 'file_upload', 'signature',
          // UI Components (1 component for surveys)
          'section_divider'
        ];
        return surveyComponents.includes(comp.type);
      });
    } else if (domainMode === 'workflows') {
      // Workflows focus on action-oriented components - CORRECTED
      filteredComponents = baseComponents.filter(comp => {
        const workflowComponents = [
          // Input Components (2 components)
          'text_input', 'textarea',
          // Selection Components (2 components)
          'select', 'checkbox',
          // UI Components (3 components for workflows)
          'button', 'heading', 'card'
        ];
        return workflowComponents.includes(comp.type);
      });
    }
    // 'forms' mode shows all components (default)
    
    console.log('🔍 Domain Mode:', domainMode);
    console.log('🔍 Base Components Count:', baseComponents.length);
    console.log('🔍 Filtered Components Count:', filteredComponents.length);
    console.log('🔍 All Categories:', [...new Set(filteredComponents.map(c => c.category))]);
    console.log('🔍 Special Components:', filteredComponents.filter(c => c.category === 'special_components'));
    console.log('🔍 UI Components:', filteredComponents.filter(c => c.category === 'ui_components'));

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
      input_components: 'Input Components',
      selection_components: 'Selection Components',
      special_components: 'Special Components',
      layout_components: 'Layout Components',
      ui_components: 'UI Components'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      input_components: '📝',
      selection_components: '☑️',
      special_components: '⭐',
      layout_components: '📐',
      ui_components: '🎨'
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
              // Sort categories in documented order
              const order = ['input_components', 'selection_components', 'special_components', 'layout_components', 'ui_components'];
              const aIndex = order.indexOf(a);
              const bIndex = order.indexOf(b);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
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
