/**
 * PropertiesEditor - Simplified Right Panel Component
 * Consolidates PropertiesPanel into clean cross-domain interface
 */

import React, { useEffect, useState, useMemo } from 'react';
import { CanvasManager, type CanvasState } from '../../core/CanvasManager';
import type { FormComponentData } from '../../types/component';

interface PropertiesEditorProps {
  canvasManager: CanvasManager;
  className?: string;
}

export const PropertiesEditor: React.FC<PropertiesEditorProps> = ({
  canvasManager,
  className = ''
}) => {
  const [canvasState, setCanvasState] = useState<CanvasState>(canvasManager.getState());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Subscribe to canvas state changes
  useEffect(() => {
    const unsubscribe = canvasManager.subscribe(setCanvasState);
    return unsubscribe;
  }, [canvasManager]);

  // Get selected component from reactive state
  const selectedComponent = useMemo(() => {
    if (!canvasState.selectedComponentId) return null;
    
    const findComponentById = (components: FormComponentData[], id: string): FormComponentData | null => {
      for (const component of components) {
        if (component.id === id) {
          return component;
        }
        if (component.type === 'horizontal_layout' && component.children) {
          const found = findComponentById(component.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findComponentById(canvasState.components, canvasState.selectedComponentId);
  }, [canvasState.components, canvasState.selectedComponentId]);

  const stats = canvasManager.getStats();

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateProperty = (property: string, value: any) => {
    if (!selectedComponent) return;
    canvasManager.updateComponent(selectedComponent.id, { [property]: value });
  };

  const renderPropertyInput = (property: string, value: any, type: 'text' | 'checkbox' | 'select' | 'textarea' | 'number' = 'text', options?: string[]) => {
    const inputStyle = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    };

    switch (type) {
      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateProperty(property, e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {property === 'required' ? 'Required field' : 'Enable'}
            </span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateProperty(property, e.target.value)}
            style={inputStyle}
          >
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateProperty(property, e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateProperty(property, e.target.value)}
            style={inputStyle}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateProperty(property, e.target.value)}
            style={inputStyle}
          />
        );
    }
  };

  const renderSection = (sectionId: string, title: string, children: React.ReactNode) => {
    const isExpanded = expandedSections.has(sectionId);
    
    return (
      <div key={sectionId} style={{ marginBottom: '16px' }}>
        <button
          onClick={() => toggleSection(sectionId)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: isExpanded ? '#f3f4f6' : '#fff',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          {title}
          <span style={{ 
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▶
          </span>
        </button>
        
        {isExpanded && (
          <div style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            backgroundColor: '#fff'
          }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderPropertyGroup = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className={`properties-editor ${className}`} style={{
      width: '320px',
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
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Properties
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '4px'
        }}>
          {selectedComponent ? `${canvasManager.getDomainLabel(selectedComponent.type)} selected` : 'No selection'}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        {selectedComponent ? (
          <>
            {/* Basic Properties */}
            {renderSection('basic', 'Basic Settings', (
              <>
                {renderPropertyGroup('Label', 
                  renderPropertyInput('label', selectedComponent.label, 'text')
                )}
                
                {renderPropertyGroup('Field ID', 
                  <input
                    type="text"
                    value={selectedComponent.fieldId || selectedComponent.id}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                )}
                
                {renderPropertyGroup('Required', 
                  renderPropertyInput('required', selectedComponent.required, 'checkbox')
                )}
              </>
            ))}

            {/* Input Settings */}
            {(['text_input', 'textarea', 'email_input', 'password_input', 'rich_text'].includes(selectedComponent.type)) &&
              renderSection('input', 'Input Settings', (
                <>
                  {renderPropertyGroup('Placeholder', 
                    renderPropertyInput('placeholder', selectedComponent.placeholder, 'text')
                  )}
                  
                  {selectedComponent.type === 'rich_text' && renderPropertyGroup('Height', 
                    renderPropertyInput('height', selectedComponent.height, 'text')
                  )}
                </>
              ))
            }

            {/* Number Settings */}
            {selectedComponent.type === 'number_input' &&
              renderSection('number', 'Number Settings', (
                <>
                  {renderPropertyGroup('Minimum', 
                    renderPropertyInput('min', selectedComponent.min, 'number')
                  )}
                  
                  {renderPropertyGroup('Maximum', 
                    renderPropertyInput('max', selectedComponent.max, 'number')
                  )}
                  
                  {renderPropertyGroup('Step', 
                    renderPropertyInput('step', selectedComponent.step, 'number')
                  )}
                </>
              ))
            }

            {/* Options */}
            {(['select', 'radio_group', 'checkbox_group', 'multi_select'].includes(selectedComponent.type)) &&
              renderSection('options', 'Options', (
                renderPropertyGroup('Options (one per line)', 
                  <textarea
                    value={selectedComponent.options?.map(opt => 
                      typeof opt === 'string' ? opt : opt.label || opt.value
                    ).join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(opt => opt.trim());
                      updateProperty('options', options.map(opt => ({ label: opt.trim(), value: opt.trim() })));
                    }}
                    rows={4}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                )
              ))
            }

            {/* Layout */}
            {renderSection('layout', 'Layout', (
              <>
                {renderPropertyGroup('Width', 
                  renderPropertyInput('width', selectedComponent.width || 'auto', 'select', 
                    ['auto', '25%', '33%', '50%', '66%', '75%', '100%'])
                )}
                
                {renderPropertyGroup('Alignment', 
                  renderPropertyInput('alignment', selectedComponent.alignment || 'left', 'select', 
                    ['left', 'center', 'right'])
                )}
              </>
            ))}

            {/* Advanced */}
            {renderSection('advanced', 'Advanced', (
              <>
                {renderPropertyGroup('Default Value', 
                  renderPropertyInput('defaultValue', selectedComponent.defaultValue, 'text')
                )}
                
                {renderPropertyGroup('Help Text', 
                  renderPropertyInput('helpText', selectedComponent.helpText, 'textarea')
                )}
                
                {renderPropertyGroup('Description', 
                  renderPropertyInput('description', selectedComponent.description, 'textarea')
                )}
              </>
            ))}
          </>
        ) : (
          // Empty State
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5
            }}>
              ⚙️
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#374151'
            }}>
              No Component Selected
            </h4>
            <p style={{
              fontSize: '14px',
              margin: 0,
              maxWidth: '200px'
            }}>
              Select a component from the canvas to edit its properties.
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
        {stats.domainMode} mode • {stats.componentCount} components
      </div>
    </div>
  );
};
