/**
 * Comprehensive Canvas Component - Like Original System
 * Features: Positioning zones, horizontal layouts, smart drop zones
 */

import React, { useState, useRef, useCallback } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import type { FormComponentData, ComponentType } from '../../../types';

// Enhanced drag item type for comprehensive features
interface DragItem {
  type: ComponentType;
  id?: string;
  isFromContainer?: boolean;
  containerPath?: string;
  index?: number;
  componentType?: ComponentType;
}

interface SmartDropZoneProps {
  component: FormComponentData;
  index: number;
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'left' | 'right') => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  selectedId?: string;
}

// Component to render form component content directly in React
const ComponentContent: React.FC<{ component: FormComponentData }> = ({ component }) => {
  const requiredMark = component.required ? ' *' : '';
  
  switch (component.type) {
    case 'text_input':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="text" 
            className="form-field__input" 
            placeholder={component.placeholder || ''}
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'email_input':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="email" 
            className="form-field__input" 
            placeholder={component.placeholder || ''}
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'password_input':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="password" 
            className="form-field__input" 
            placeholder={component.placeholder || ''}
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'number_input':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="number" 
            className="form-field__input" 
            placeholder={component.placeholder || ''}
            min={component.min}
            max={component.max}
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'textarea':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <textarea 
            className="form-field__textarea" 
            placeholder={component.placeholder || ''}
            rows={component.rows || 4}
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'select':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <select className="form-field__select" required={component.required} disabled>
            <option value="">Choose an option</option>
            {(component.options || []).map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="form-field">
          <div className="form-field__checkbox-wrapper">
            <input 
              type="checkbox" 
              className="form-field__checkbox" 
              id={component.id}
              required={component.required}
              disabled
            />
            <label htmlFor={component.id} className="form-field__checkbox-label">
              {component.label}{requiredMark}
            </label>
          </div>
        </div>
      );
    
    case 'radio_group':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <div className="form-field__radio-group">
            {(component.options || []).map((option, index) => (
              <div key={index} className="form-field__radio-item">
                <input 
                  type="radio" 
                  className="form-field__radio" 
                  id={`${component.id}_${index}`}
                  name={component.id}
                  value={option}
                  required={component.required}
                  disabled
                />
                <label htmlFor={`${component.id}_${index}`} className="form-field__radio-label">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'date_picker':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="date" 
            className="form-field__input" 
            required={component.required}
            readOnly
          />
        </div>
      );
    
    case 'file_upload':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <input 
            type="file" 
            className="form-field__file" 
            accept={component.acceptedFileTypes}
            required={component.required}
            disabled
          />
        </div>
      );
    
    case 'section_divider':
      return (
        <div className="form-field">
          <hr className="form-field__divider" />
          {component.label && <h3 className="form-field__section-title">{component.label}</h3>}
        </div>
      );
    
    case 'signature':
      return (
        <div className="form-field">
          <label className="form-field__label">{component.label}{requiredMark}</label>
          <div className="signature-field">
            <div className="signature-placeholder">
              ✍️ Signature area
            </div>
          </div>
        </div>
      );
    
    case 'button':
      return (
        <div className="form-field">
          <button 
            type="button" 
            className={`btn btn--${component.buttonType || 'primary'}`}
            disabled
          >
            {component.buttonText || component.label}
          </button>
        </div>
      );
    
    case 'heading':
      const headingLevel = component.level || 1;
      const headingTag = `h${headingLevel}` as React.ElementType;
      return (
        <div className="form-field">
          {React.createElement(
            headingTag,
            { className: "form-field__heading" },
            component.text || component.label
          )}
        </div>
      );
    
    case 'card':
      return (
        <div className="form-field">
          <div className="card-preview">
            <div className="card-header">
              <span className="card-label">{component.label}</span>
            </div>
            <div className="card-content">
              {component.children?.map((child, index) => (
                <ComponentContent key={child.id || index} component={child} />
              ))}
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="form-field">
          <div className="form-field__unknown">
            <span className="form-field__error">Unknown component type: {component.type}</span>
          </div>
        </div>
      );
  }
};

const SmartDropZone: React.FC<SmartDropZoneProps> = ({ 
  component, 
  index, 
  onDrop, 
  onSelect, 
  onDelete,
  onMove,
  selectedId 
}) => {
  const [dropPosition, setDropPosition] = useState<string>('');
  const [isDropTarget, setIsDropTarget] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Drag functionality for existing components
  const [{ isDragging }, drag] = useDrag({
    type: 'existing-component',
    item: { type: 'existing-component', componentType: component.type, id: component.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Calculate drop position based on mouse coordinates
  const calculateDropPosition = useCallback((clientOffset: { x: number; y: number } | null) => {
    if (!elementRef.current || !clientOffset) return 'center';
    
    const rect = elementRef.current.getBoundingClientRect();
    const x = clientOffset.x - rect.left;
    const y = clientOffset.y - rect.top;
    
    const width = rect.width;
    const height = rect.height;
    
    // Horizontal zones (left/right) - 25% from each side
    if (x < width * 0.25) return 'left';
    if (x > width * 0.75) return 'right';
    
    // Vertical zones for remaining middle area (only when not in horizontal zones)
    if (y < height * 0.3) return 'before';  // Top 30%
    if (y > height * 0.7) return 'after';   // Bottom 30%
    
    return 'center'; // Middle 40%
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    hover: (item: DragItem, monitor) => {
      if (!elementRef.current) return;

      // Handle reordering of existing components - only show visual feedback, don't move yet
      if (item.type === 'existing-component' && typeof item.index === 'number') {
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = elementRef.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        
        if (!clientOffset) return;
        
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        // Show visual feedback for reordering - don't call onMove during hover
        setDropPosition(hoverClientY < hoverMiddleY ? 'before' : 'after');
        setIsDropTarget(true);

        // Don't call onMove here - it causes state updates during drag
        // onMove(dragIndex, hoverIndex);
        // item.index = hoverIndex;
      } else if (item.type !== 'existing-component') {
        // Handle new components from palette only
        const clientOffset = monitor.getClientOffset();
        const position = calculateDropPosition(clientOffset);
        setDropPosition(position);
        setIsDropTarget(true);
      }
    },
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      
      // Handle existing component reordering on drop
      if (item.type === 'existing-component' && typeof item.index === 'number') {
        const dragIndex = item.index;
        const hoverIndex = index;
        
        if (dragIndex !== hoverIndex) {
          // For existing component reordering, only do vertical reordering
          // Don't create horizontal layouts when reordering existing components
          const hoverBoundingRect = elementRef.current?.getBoundingClientRect();
          const clientOffset = monitor.getClientOffset();
          
          if (hoverBoundingRect && clientOffset) {
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            
            // Determine if we should insert before or after the hover target
            const insertBefore = hoverClientY < hoverMiddleY;
            let targetIndex = hoverIndex;
            
            // Adjust target index based on drag direction and insert position
            if (dragIndex < hoverIndex) {
              // Dragging down: if inserting before, use hoverIndex; if after, use hoverIndex
              targetIndex = insertBefore ? hoverIndex : hoverIndex;
            } else {
              // Dragging up: if inserting before, use hoverIndex; if after, use hoverIndex + 1
              targetIndex = insertBefore ? hoverIndex : hoverIndex;
            }
            
            onMove(dragIndex, targetIndex);
          } else {
            // Fallback to simple reorder
            onMove(dragIndex, hoverIndex);
          }
        }
        return; // Important: return early to prevent further processing
      } else {
        // Handle new components from palette - support all position types
        const clientOffset = monitor.getClientOffset();
        const position = calculateDropPosition(clientOffset);
        const componentType = item.componentType || item.type;
        
        // Ensure we have a valid component type
        if (!componentType || componentType === 'existing-component') {
          console.warn('❌ Invalid component type for new component drop:', item);
          return;
        }
        
        // Handle different drop positions with proper validation
        if (position === 'left' || position === 'right') {
          // Create horizontal layout for new components
          console.log('🏗️ Creating horizontal layout:', { componentType, targetId: component.id, position });
          onDrop(componentType, component.id, position);
        } else if (position === 'before' || position === 'after') {
          // Vertical insertion for new components
          console.log('📍 Vertical insertion:', { componentType, targetId: component.id, position });
          onDrop(componentType, component.id, position);
        } else if (position === 'center') {
          // Center drop - append to end of canvas, not after this component
          console.log('🎯 Center drop - appending to end of canvas');
          if (components && components.length > 0) {
            const lastComponent = components[components.length - 1];
            onDrop(componentType, lastComponent.id, 'after');
          } else {
            // Empty canvas or no components context
            onDrop(componentType, 'empty-canvas', 'after');
          }
        } else {
          // Fallback - append after current component
          console.log('🔄 Fallback drop:', { componentType, targetId: component.id });
          onDrop(componentType, component.id, 'after');
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Reset drop state when not hovering
  React.useEffect(() => {
    if (!isOver) {
      setDropPosition('');
      setIsDropTarget(false);
    }
  }, [isOver]);

  // Combine drag and drop refs
  const dragDropRef = useCallback((node: HTMLDivElement) => {
    drag(drop(node));
    elementRef.current = node;
  }, [drag, drop]);

  return (
    <div 
      ref={dragDropRef}
      className={`smart-drop-zone form-component ${
        selectedId === component.id ? 'is-selected' : ''
      } ${isDropTarget ? 'is-drop-target' : ''} ${
        dropPosition ? `hover-${dropPosition}` : ''
      } ${isDragging ? 'is-dragging' : ''}`}
      data-testid={`canvas-item-${index}`}
      data-component-id={component.id}
      onClick={() => onSelect(component.id)}
      style={{ 
        opacity: isDragging ? 0.7 : 1,
        border: isDragging ? '2px dashed #3b82f6' : undefined,
        background: isDragging ? 'transparent' : undefined,
        boxShadow: isDragging ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined
      }}
    >
      {/* Drop position indicators */}
      {isDropTarget && dropPosition === 'left' && (
        <div className="drop-position-label drop-position-label--left">
          Create Row Layout (Left)
        </div>
      )}
      {isDropTarget && dropPosition === 'right' && (
        <div className="drop-position-label drop-position-label--right">
          Create Row Layout (Right)
        </div>
      )}
      {isDropTarget && dropPosition === 'before' && (
        <div className="drop-position-label drop-position-label--top">
          Insert Before
        </div>
      )}
      {isDropTarget && dropPosition === 'after' && (
        <div className="drop-position-label drop-position-label--bottom">
          Insert After
        </div>
      )}
      {isDropTarget && dropPosition === 'center' && (
        <div className="drop-position-label drop-position-label--top">
          Add to End
        </div>
      )}

      {/* Drag handle and delete button */}
      <div className="form-component__hover-controls">
        <button 
          className="form-component__hover-action form-component__hover-action--drag"
          title="Drag to reorder"
          style={{ cursor: 'grab' }}
        >
          ⋮⋮
        </button>
        <button 
          className="form-component__hover-action form-component__hover-action--delete"
          title="Delete component"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
        >
          ×
        </button>
      </div>

      <ComponentContent component={component} />
    </div>
  );
};

interface RowLayoutProps {
  component: FormComponentData;
  index: number;
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'left' | 'right' | 'inside') => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  selectedId?: string;
}

const RowLayout: React.FC<RowLayoutProps> = ({
  component,
  onDrop,
  onSelect,
  onDelete,
  onMove,
  selectedId
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    drop: (item: DragItem) => {
      onDrop(item.type, component.id, 'inside');
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const children = component.children || [];

  return (
    <div 
      ref={drop}
      className={`row-layout-container ${isOver ? 'is-over' : ''} ${
        selectedId === component.id ? 'is-selected' : ''
      }`}
      data-testid="row-layout"
      data-component-id={component.id}
      onClick={() => onSelect(component.id)}
    >
      <div className="row-layout-container__header">
        <span>🏗️ Row Layout ({children.length} items)</span>
      </div>
      
      <div className="row-layout-container__content">
        {children.length === 0 ? (
          <div className="row-layout-container__empty">
            Drop components here to arrange side by side
          </div>
        ) : (
          children.map((child, childIndex) => (
            <div key={child.id} className="container-item">
              <SmartDropZone
                component={child}
                index={childIndex}
                onDrop={onDrop}
                onSelect={onSelect}
                onDelete={onDelete}
                onMove={(dragIndex, hoverIndex) => {
                  // Handle reordering within the row layout
                  console.log('🔄 Row layout reorder:', { dragIndex, hoverIndex, rowId: component.id });
                  // For now, use the parent onMove - this may need special handling
                  onMove(dragIndex, hoverIndex);
                }}
                selectedId={selectedId}
              />
            </div>
          ))
        )}
      </div>

      {/* Delete row layout button */}
      <button 
        className="row-layout-container__delete" 
        title="Delete row layout" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(component.id);
        }}
      >
        ×
      </button>
    </div>
  );
};

interface CanvasProps {
  components: FormComponentData[];
  onDrop: (componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'left' | 'right' | 'inside') => void;
  onSelect: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  selectedId?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  components, 
  onDrop, 
  onSelect, 
  onDelete,
  onMove,
  selectedId 
}) => {
  // Handle insertion between components
  const handleInsertBetween = useCallback((componentType: ComponentType, insertIndex: number) => {
    // Direct logic for inserting between components
    if (insertIndex === 0) {
      onDrop(componentType, 'empty-canvas', 'after');
    } else {
      const targetComponent = components[insertIndex - 1];
      onDrop(componentType, targetComponent.id, 'after');
    }
  }, [components, onDrop]);

  const [{ isOver }, drop] = useDrop({
    accept: ['component', 'existing-component'],
    drop: (item: DragItem, monitor) => {
      // Check if drop was handled by a child component
      if (monitor.didDrop()) {
        return;
      }
      
      // Get the component type from either field
      const componentType = item.componentType || item.type;
      
      // Handle drop at end of canvas OR empty canvas
      if (components.length > 0) {
        onDrop(componentType, components[components.length - 1].id, 'after');
      } else {
        // For empty canvas, create first component
        onDrop(componentType, 'empty-canvas', 'after');
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Expose test helper functions to window for testing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithTests = window as {
        __testMoveComponent__?: (sourceIndex: number, targetIndex: number) => void;
        __testInsertBetweenComponents__?: (type: string, index: number) => void;
        __testInsertHorizontalToComponent__?: (type: string, targetId: string, side?: 'left' | 'right') => void;
        __testAddToRowLayout__?: (type: string, rowLayoutId: string) => void;
        testDragFromPalette?: (componentType: string, targetId: string, position?: string) => void;
        testReorderComponents?: (fromIndex: number, toIndex: number) => void;
        testCreateHorizontalLayout?: (componentType: string, targetId: string, side?: 'left' | 'right') => void;
        testPositionBasedInsertion?: (componentType: string, targetId: string, zone: 'top' | 'bottom' | 'center' | 'left' | 'right') => void;
      };

      // Legacy test helper functions (for existing tests)
      windowWithTests.__testMoveComponent__ = (sourceIndex: number, targetIndex: number) => {
        console.log('🎯 Test reorder (legacy):', { sourceIndex, targetIndex });
        if (sourceIndex >= 0 && targetIndex >= 0 && sourceIndex < components.length && targetIndex < components.length) {
          onMove(sourceIndex, targetIndex);
        } else {
          console.error('❌ Invalid indices for move:', { sourceIndex, targetIndex, componentsLength: components.length });
        }
      };
      
      windowWithTests.__testInsertBetweenComponents__ = (componentType: string, insertIndex: number) => {
        console.log('🎯 Test insert between (legacy):', { componentType, insertIndex });
        handleInsertBetween(componentType as ComponentType, insertIndex);
      };
      
      windowWithTests.__testInsertHorizontalToComponent__ = (componentType: string, targetId: string, side?: 'left' | 'right') => {
        console.log('🎯 Test horizontal insert (legacy):', { componentType, targetId, side });
        onDrop(componentType, targetId, side || 'right');
      };
      
      windowWithTests.__testAddToRowLayout__ = (componentType: string, rowLayoutId: string) => {
        console.log('🎯 Test add to row layout (legacy):', { componentType, rowLayoutId });
        onDrop(componentType, rowLayoutId, 'inside');
      };

      // New test helper functions (improved API)
      windowWithTests.testDragFromPalette = (componentType: string, targetId: string, position: string = 'after') => {
        console.log('🧪 Test helper: dragFromPalette', { componentType, targetId, position });
        
        // Validate position parameter
        const validPositions = ['before', 'after', 'left', 'right', 'center'];
        const safePosition = validPositions.includes(position) ? position : 'after';
        
        if (onDrop) {
          onDrop(componentType, targetId, safePosition);
        }
      };

      windowWithTests.testReorderComponents = (fromIndex: number, toIndex: number) => {
        console.log('🧪 Test helper: reorderComponents', { fromIndex, toIndex });
        
        // Validate indices
        if (typeof fromIndex === 'number' && typeof toIndex === 'number' && 
            fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
          if (onMove) {
            onMove(fromIndex, toIndex);
          }
        } else {
          console.warn('❌ Invalid indices for reordering:', { fromIndex, toIndex });
        }
      };

      windowWithTests.testCreateHorizontalLayout = (componentType: string, targetId: string, side: 'left' | 'right' = 'right') => {
        console.log('🧪 Test helper: createHorizontalLayout', { componentType, targetId, side });
        
        // Validate side parameter
        const safeSide = (side === 'left' || side === 'right') ? side : 'right';
        
        if (onDrop) {
          onDrop(componentType, targetId, safeSide);
        }
      };

      windowWithTests.testPositionBasedInsertion = (componentType: string, targetId: string, zone: 'top' | 'bottom' | 'center' | 'left' | 'right') => {
        console.log('🧪 Test helper: positionBasedInsertion', { componentType, targetId, zone });
        
        // Map zone to position
        const zoneToPosition: Record<string, string> = {
          'top': 'before',
          'bottom': 'after', 
          'center': 'center',
          'left': 'left',
          'right': 'right'
        };
        
        const position = zoneToPosition[zone] || 'after';
        
        if (onDrop) {
          onDrop(componentType, targetId, position);
        }
      };
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        const windowWithTests = window as any;
        delete windowWithTests.__testMoveComponent__;
        delete windowWithTests.__testInsertBetweenComponents__;
        delete windowWithTests.__testInsertHorizontalToComponent__;
        delete windowWithTests.__testAddToRowLayout__;
        delete windowWithTests.testDragFromPalette;
        delete windowWithTests.testReorderComponents;
        delete windowWithTests.testCreateHorizontalLayout;
        delete windowWithTests.testPositionBasedInsertion;
      }
    };
  }, [handleInsertBetween, onDrop, onMove, components.length]);

  return (
    <div 
      ref={drop}
      className={`canvas survey-drop-zone ${isOver ? 'canvas--drop-hover is-drop-active' : ''}`}
      data-testid="canvas"
    >
      {components.length === 0 ? (
        <div className="canvas__empty empty-canvas">
          <div className="empty-canvas__icon">📝</div>
          <h3 className="empty-canvas__title">Drag components here to start building your form</h3>
          <p className="empty-canvas__description">
            Choose from input fields, selection controls, and layout components in the left panel
          </p>
        </div>
      ) : (
        <div className="canvas__content">
          {/* Drop zone at the beginning */}
          <BetweenDropZone index={0} onInsertBetween={handleInsertBetween} />
          
          {components.map((component, index) => (
            <React.Fragment key={component.id}>
              {/* Render component based on type */}
              {component.type === 'horizontal_layout' ? (
                <RowLayout
                  component={component}
                  index={index}
                  onDrop={onDrop}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onMove={onMove}
                  selectedId={selectedId}
                />
              ) : (
                <SmartDropZone
                  component={component}
                  index={index}
                  onDrop={onDrop}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onMove={onMove}
                  selectedId={selectedId}
                />
              )}
              
              {/* Drop zone after each component */}
              <BetweenDropZone index={index + 1} onInsertBetween={handleInsertBetween} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

interface BetweenDropZoneProps {
  index: number;
  onInsertBetween: (componentType: ComponentType, insertIndex: number) => void;
}

const BetweenDropZone: React.FC<BetweenDropZoneProps> = ({ index, onInsertBetween }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['component'],
    drop: (item: DragItem, monitor) => {
      // Only handle if this is the deepest drop target
      if (monitor.didDrop()) return;
      
      // Get component type from either field
      const componentType = item.componentType || item.type;
      
      // Only handle new components from palette, not existing components
      if (componentType && componentType !== 'existing-component') {
        console.log('🎯 Between-component drop:', { componentType, insertIndex: index });
        onInsertBetween(componentType, index);
      }
      // Let existing component reordering be handled by SmartDropZone
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`canvas-item__drop-zone ${isOver ? 'canvas-item__drop-zone--active' : ''}`}
      style={{ 
        height: isOver ? '40px' : '8px',
        margin: '4px 0',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}
      data-testid={`between-drop-zone-${index}`}
    >
      {isOver && (
        <div className="drop-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '12px',
          color: '#666',
          fontWeight: 500
        }}>
          Drop here to insert between components
        </div>
      )}
    </div>
  );
};

export default Canvas;