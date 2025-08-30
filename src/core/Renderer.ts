/**
 * Renderer - Consolidated Component Rendering Logic Layer
 * Handles all component rendering operations in the simplified architecture
 */

import React from 'react';
import type { FormComponentData, ComponentType } from '../types/component';

export interface RenderConfig {
  cssPrefix: string;
  enableSelection: boolean;
  enableDragDrop: boolean;
  readOnlyMode: boolean;
  showLabels: boolean;
  showRequiredIndicators: boolean;
}

export interface RenderContext {
  selectedItemId: string | null;
  isDragging: boolean;
  isHover: boolean;
  onSelect?: (componentId: string) => void;
  onDelete?: (componentId: string) => void;
  onMove?: (sourceId: string, targetId: string, position: string) => void;
}

export class Renderer {
  private config: RenderConfig;

  constructor(config: Partial<RenderConfig> = {}) {
    this.config = {
      cssPrefix: 'form-builder',
      enableSelection: true,
      enableDragDrop: true,
      readOnlyMode: false,
      showLabels: true,
      showRequiredIndicators: true,
      ...config
    };
  }

  /**
   * Main render method - renders a component with context
   */
  renderComponent(
    component: FormComponentData,
    context: RenderContext = { selectedItemId: null, isDragging: false, isHover: false }
  ): React.ReactElement {
    const { cssPrefix } = this.config;
    const isSelected = context.selectedItemId === component.id;
    
    // Handle horizontal layout rendering
    if (component.type === 'horizontal_layout') {
      return this.renderHorizontalLayout(component, context);
    }

    // Render regular component
    return React.createElement('div', {
      key: component.id,
      className: this.getComponentClasses(component, isSelected, context.isDragging),
      'data-component-id': component.id,
      'data-component-type': component.type,
      'data-testid': `component-${component.type}`,
      onClick: this.config.enableSelection ? () => context.onSelect?.(component.id) : undefined,
      style: this.getComponentStyles(component, isSelected)
    }, [
      // Selection indicator
      this.config.enableSelection && isSelected && this.renderSelectionIndicator(),
      
      // Drag handle
      this.config.enableDragDrop && !this.config.readOnlyMode && this.renderDragHandle(component),
      
      // Delete button
      this.config.enableDragDrop && !this.config.readOnlyMode && isSelected && this.renderDeleteButton(component, context),
      
      // Component content
      this.renderComponentContent(component)
    ].filter(Boolean));
  }

  /**
   * Render horizontal layout with children
   */
  private renderHorizontalLayout(
    component: FormComponentData,
    context: RenderContext
  ): React.ReactElement {
    const { cssPrefix } = this.config;
    const isSelected = context.selectedItemId === component.id;

    return React.createElement('div', {
      key: component.id,
      className: `${cssPrefix}__horizontal-layout`,
      'data-component-id': component.id,
      'data-component-type': 'horizontal_layout',
      'data-testid': 'row-layout',
      style: {
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        padding: '8px',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: isSelected ? '#eff6ff' : '#f9fafb',
        minHeight: '60px',
        alignItems: 'stretch'
      }
    }, [
      // Layout selection indicator
      this.config.enableSelection && isSelected && this.renderSelectionIndicator('Layout'),
      
      // Layout delete button
      this.config.enableDragDrop && !this.config.readOnlyMode && isSelected && 
        this.renderDeleteButton(component, context),
      
      // Children
      ...(component.children || []).map((child, index) => 
        React.createElement('div', {
          key: child.id,
          className: `${cssPrefix}__layout-item`,
          'data-testid': `row-item-${index}`,
          style: {
            flex: 1,
            minWidth: '0'
          }
        }, this.renderComponent(child, context))
      )
    ].filter(Boolean));
  }

  /**
   * Render component content based on type
   */
  private renderComponentContent(component: FormComponentData): React.ReactElement {
    const commonProps = {
      id: component.fieldId || component.id,
      name: component.fieldId || component.id,
      required: component.required,
      disabled: this.config.readOnlyMode,
      placeholder: component.placeholder,
      defaultValue: component.defaultValue,
      style: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px'
      }
    };

    const labelElement = this.config.showLabels && component.label ? 
      React.createElement('label', {
        htmlFor: component.fieldId || component.id,
        style: {
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }
      }, [
        component.label,
        this.config.showRequiredIndicators && component.required && 
          React.createElement('span', {
            style: { color: '#ef4444', marginLeft: '4px' }
          }, '*')
      ].filter(Boolean)) : null;

    const inputElement = this.renderInputElement(component, commonProps);

    return React.createElement('div', {
      className: `${this.config.cssPrefix}__field-wrapper`,
      style: { marginBottom: '16px' }
    }, [labelElement, inputElement].filter(Boolean));
  }

  /**
   * Render input element based on component type
   */
  private renderInputElement(component: FormComponentData, commonProps: any): React.ReactElement {
    switch (component.type) {
      case 'text_input':
        return React.createElement('input', {
          ...commonProps,
          type: 'text'
        });

      case 'email_input':
        return React.createElement('input', {
          ...commonProps,
          type: 'email'
        });

      case 'password_input':
        return React.createElement('input', {
          ...commonProps,
          type: 'password'
        });

      case 'number_input':
        return React.createElement('input', {
          ...commonProps,
          type: 'number',
          min: component.minimum,
          max: component.maximum,
          step: component.step
        });

      case 'date_picker':
        return React.createElement('input', {
          ...commonProps,
          type: 'date'
        });

      case 'file_upload':
        return React.createElement('input', {
          ...commonProps,
          type: 'file',
          multiple: component.multiple
        });

      case 'textarea':
        return React.createElement('textarea', {
          ...commonProps,
          rows: component.rows || 3,
          style: {
            ...commonProps.style,
            resize: 'vertical'
          }
        });

      case 'rich_text':
        // For simplified rendering, use textarea as fallback
        return React.createElement('div', {
          style: {
            ...commonProps.style,
            minHeight: component.height || '120px',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontStyle: 'italic'
          }
        }, 'Rich Text Editor');

      case 'select':
        return React.createElement('select', {
          ...commonProps
        }, [
          React.createElement('option', { value: '', key: 'empty' }, 'Select an option...'),
          ...(component.options || []).map((option, index) => 
            React.createElement('option', {
              key: index,
              value: typeof option === 'string' ? option : option.value
            }, typeof option === 'string' ? option : option.label)
          )
        ]);

      case 'multi_select':
        return React.createElement('select', {
          ...commonProps,
          multiple: true,
          size: Math.min((component.options || []).length, 5)
        }, (component.options || []).map((option, index) => 
          React.createElement('option', {
            key: index,
            value: typeof option === 'string' ? option : option.value
          }, typeof option === 'string' ? option : option.label)
        ));

      case 'radio_group':
        return React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '8px' }
        }, (component.options || []).map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionId = `${component.id}_${index}`;
          
          return React.createElement('label', {
            key: index,
            style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
          }, [
            React.createElement('input', {
              type: 'radio',
              name: component.fieldId || component.id,
              value: optionValue,
              id: optionId,
              disabled: commonProps.disabled
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, optionLabel)
          ]);
        }));

      case 'checkbox_group':
        return React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '8px' }
        }, (component.options || []).map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionId = `${component.id}_${index}`;
          
          return React.createElement('label', {
            key: index,
            style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
          }, [
            React.createElement('input', {
              type: 'checkbox',
              name: `${component.fieldId || component.id}[]`,
              value: optionValue,
              id: optionId,
              disabled: commonProps.disabled
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, optionLabel)
          ]);
        }));

      case 'checkbox':
        return React.createElement('label', {
          style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
        }, [
          React.createElement('input', {
            type: 'checkbox',
            name: component.fieldId || component.id,
            disabled: commonProps.disabled
          }),
          React.createElement('span', { style: { fontSize: '14px' } }, component.label || 'Checkbox')
        ]);

      case 'heading':
        const HeadingTag = `h${component.level || 2}` as keyof JSX.IntrinsicElements;
        return React.createElement(HeadingTag, {
          style: {
            fontSize: component.level === 1 ? '24px' : component.level === 3 ? '18px' : '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }
        }, component.label || 'Heading');

      case 'paragraph':
        return React.createElement('p', {
          style: {
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.5',
            margin: '0'
          }
        }, component.content || component.label || 'Paragraph text');

      case 'divider':
        return React.createElement('hr', {
          style: {
            border: 'none',
            borderTop: '1px solid #e5e7eb',
            margin: '16px 0'
          }
        });

      case 'signature':
        return React.createElement('div', {
          style: {
            width: '100%',
            height: '120px',
            border: '2px dashed #d1d5db',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontStyle: 'italic'
          }
        }, 'Signature Pad');

      default:
        return React.createElement('div', {
          style: {
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '14px'
          }
        }, `Unsupported component type: ${component.type}`);
    }
  }

  /**
   * Render selection indicator
   */
  private renderSelectionIndicator(label: string = 'Selected'): React.ReactElement {
    return React.createElement('div', {
      style: {
        position: 'absolute',
        top: '-8px',
        left: '-8px',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 6px',
        borderRadius: '3px',
        zIndex: 10,
        pointerEvents: 'none'
      }
    }, label);
  }

  /**
   * Render drag handle
   */
  private renderDragHandle(component: FormComponentData): React.ReactElement {
    return React.createElement('div', {
      className: 'drag-handle',
      style: {
        position: 'absolute',
        top: '4px',
        right: '32px',
        width: '20px',
        height: '20px',
        backgroundColor: '#6b7280',
        borderRadius: '3px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: 'white',
        zIndex: 5
      },
      title: 'Drag to move'
    }, '⋮⋮');
  }

  /**
   * Render delete button
   */
  private renderDeleteButton(component: FormComponentData, context: RenderContext): React.ReactElement {
    return React.createElement('button', {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        context.onDelete?.(component.id);
      },
      style: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        width: '24px',
        height: '24px',
        backgroundColor: '#ef4444',
        border: 'none',
        borderRadius: '3px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        zIndex: 5
      },
      title: 'Delete component'
    }, '×');
  }

  /**
   * Get component CSS classes
   */
  private getComponentClasses(
    component: FormComponentData,
    isSelected: boolean,
    isDragging: boolean
  ): string {
    const { cssPrefix } = this.config;
    const classes = [
      `${cssPrefix}__component`,
      `${cssPrefix}__component--${component.type}`,
    ];

    if (isSelected) classes.push(`${cssPrefix}__component--selected`);
    if (isDragging) classes.push(`${cssPrefix}__component--dragging`);

    return classes.join(' ');
  }

  /**
   * Get component inline styles
   */
  private getComponentStyles(
    component: FormComponentData,
    isSelected: boolean
  ): React.CSSProperties {
    return {
      position: 'relative',
      padding: '12px',
      margin: '4px 0',
      border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '6px',
      backgroundColor: isSelected ? '#eff6ff' : '#fff',
      transition: 'all 0.2s ease',
      width: component.width || 'auto',
      textAlign: component.alignment as any || 'left'
    };
  }

  /**
   * Get configuration
   */
  getConfig(): RenderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Create render context
   */
  createContext(
    selectedItemId: string | null = null,
    handlers: {
      onSelect?: (componentId: string) => void;
      onDelete?: (componentId: string) => void;
      onMove?: (sourceId: string, targetId: string, position: string) => void;
    } = {}
  ): RenderContext {
    return {
      selectedItemId,
      isDragging: false,
      isHover: false,
      ...handlers
    };
  }
}
