
import React, { useRef, useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import RichTextEditor from '../../atoms/forms/RichTextEditor';
import type { FormComponentData, ComponentType } from '../../../types';

interface FormComponentRendererProps {
  component: FormComponentData;
  isInContainer?: boolean;
  containerPath?: string[]; // Path to this component (for nested removal)
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveToContainer?: (componentId: string, fromPath: string[], toPath: string[], position?: number) => void;
  onMoveToCanvas?: (componentId: string, fromPath: string[]) => void;
  onDropInContainer?: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  onDropInContainerWithPosition?: (item: { type: ComponentType; id?: string }, containerId: string, position: 'left' | 'center' | 'right') => void;
  onRearrangeWithinContainer?: (containerId: string, dragIndex: number, hoverIndex: number) => void;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string | null) => void;
}

interface LayoutContainerProps {
  component: FormComponentData;
  direction: 'horizontal' | 'vertical';
  title: string;
}

// Draggable component that can be moved between containers and canvas
const DraggableNestedComponent: React.FC<{
  component: FormComponentData;
  isInContainer: boolean;
  containerPath: string[];
  containerIndex?: number;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveToCanvas?: (componentId: string, fromPath: string[]) => void;
  onDropInContainer?: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  onDropInContainerWithPosition?: (item: { type: ComponentType; id?: string }, containerId: string, position: 'left' | 'center' | 'right') => void;
  onRearrangeWithinContainer?: (containerId: string, dragIndex: number, hoverIndex: number) => void;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string | null) => void;
}> = ({ 
  component, 
  isInContainer, 
  containerPath,
  containerIndex,
  onRemoveFromContainer,
  onMoveToCanvas,
  onDropInContainer,
  onDropInContainerWithPosition,
  onRearrangeWithinContainer,
  selectedComponentId,
  onSelectComponent
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'nested-component',
    item: { 
      id: component.id, 
      type: component.type,
      component,
      isFromContainer: isInContainer,
      containerPath,
      containerIndex
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('Drag ended:', { dropResult, isInContainer, containerPath });
      
      if (!dropResult) {
        // Dropped outside any valid drop zone - move to canvas
        console.log('Component dropped outside container, moving to canvas');
        if (onMoveToCanvas && isInContainer) {
          onMoveToCanvas(item.id, containerPath);
        }
      } else if (dropResult.droppedOnCanvas && isInContainer) {
        // Explicitly dropped on canvas - this is handled by Canvas component
        console.log('Component dropped on canvas, Canvas will handle the move');
      }
    }
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['component', 'nested-component'],
    hover: (item: any, monitor) => {
      if (!ref.current) return;
      if (item.id === component.id) return; // Can't drop on itself
      
      // Check if this is rearrangement within the same container
      if (item.isFromContainer && 
          item.containerPath && containerPath &&
          item.containerPath.length === containerPath.length &&
          item.containerPath.every((path: string, index: number) => path === containerPath[index]) &&
          typeof item.containerIndex === 'number' &&
          typeof containerIndex === 'number' &&
          onRearrangeWithinContainer) {
        
        const dragIndex = item.containerIndex;
        const hoverIndex = containerIndex;
        
        if (dragIndex === hoverIndex) return;
        
        // Get the container ID (last in path)
        const containerId = containerPath[containerPath.length - 1];
        
        // Determine drop position based on mouse position
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        const clientOffset = monitor.getClientOffset();
        
        if (!clientOffset) return;
        
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;
        
        // Only rearrange when crossing the middle point
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
        
        onRearrangeWithinContainer(containerId, dragIndex, hoverIndex);
        item.containerIndex = hoverIndex; // Update the item's index
      }
    },
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return; // Already handled by nested drop
      
      // Return drop result to indicate successful drop
      return { 
        droppedIntoComponent: true, 
        targetId: component.id,
        containerPath 
      };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }));

  drag(drop(ref));

  const isSelected = selectedComponentId === component.id;

  return (
    <div
      ref={ref}
      style={{
        padding: '8px',
        margin: '4px',
        border: isSelected ? '2px solid #3b82f6' : isOver && canDrop ? '2px solid #10b981' : '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onSelectComponent?.(component.id)}
    >
      {/* Drag handle for nested components */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '16px',
          height: '16px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#9ca3af',
          opacity: isSelected ? 1 : 0.5,
          background: isDragging ? '#3b82f6' : 'transparent',
          borderRadius: '2px'
        }}
        title="Drag to move component"
      >
        ⋮⋮
      </div>

      {/* Remove from container button */}
      {isSelected && isInContainer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onRemoveFromContainer) {
              onRemoveFromContainer(component.id, containerPath);
            }
          }}
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Remove from container"
        >
          ×
        </button>
      )}

      <div style={{ marginTop: isInContainer ? '16px' : '0' }}>
        <FormComponentRenderer 
          component={component} 
          isInContainer={false} // Prevent infinite nesting
          containerPath={containerPath}
          onRemoveFromContainer={onRemoveFromContainer}
          onMoveToCanvas={onMoveToCanvas}
          onDropInContainer={onDropInContainer}
          onDropInContainerWithPosition={onDropInContainerWithPosition}
          onRearrangeWithinContainer={onRearrangeWithinContainer}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
        />
      </div>
    </div>
  );
};

// Simple position drop zone for container positioning
const PositionDropZone: React.FC<{
  position: 'left' | 'center' | 'right';
  onDrop: (item: any, position: 'left' | 'center' | 'right') => void;
  isVisible: boolean;
}> = ({ position, onDrop, isVisible }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['component', 'nested-component'],
    drop: (item) => {
      onDrop(item, position);
      return { droppedAtPosition: position };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  if (!isVisible) return null;

  return (
    <div
      ref={drop}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '33.33%',
        left: position === 'left' ? '0%' : position === 'center' ? '33.33%' : '66.66%',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        border: isOver ? '2px dashed #3b82f6' : 'none',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#3b82f6',
        fontWeight: '500',
        zIndex: 10,
        pointerEvents: isOver ? 'all' : 'none'
      }}
    >
      {isOver && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          Drop {position}
        </div>
      )}
    </div>
  );
};

const LayoutContainer: React.FC<LayoutContainerProps & {
  containerPath?: string[];
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveToCanvas?: (componentId: string, fromPath: string[]) => void;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string | null) => void;
  onDropInContainer?: (item: any, containerId: string, position?: 'left' | 'center' | 'right') => void;
  onDropInContainerWithPosition?: (item: { type: ComponentType; id?: string }, containerId: string, position: 'left' | 'center' | 'right') => void;
  onRearrangeWithinContainer?: (containerId: string, dragIndex: number, hoverIndex: number) => void;
}> = ({ 
  component, 
  direction, 
  title,
  containerPath = [],
  onRemoveFromContainer,
  onMoveToCanvas,
  selectedComponentId,
  onSelectComponent,
  onDropInContainer,
  onDropInContainerWithPosition,
  onRearrangeWithinContainer
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleSmartDrop = (item: any, position: 'left' | 'center' | 'right') => {
    console.log('Smart drop:', item, 'position:', position, 'container:', component.id);
    
    if (onDropInContainer) {
      onDropInContainer(item, component.id, position);
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['component', 'nested-component'],
    hover: (item, monitor) => {
      setIsDragOver(monitor.isOver({ shallow: true }));
    },
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return; // Already handled by nested drop
      
      // Default drop (center) if no specific position was selected
      handleSmartDrop(item, 'center');
      return { droppedIntoContainer: true, containerId: component.id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  const baseStyle = { marginBottom: '8px' };

  return (
    <div style={baseStyle}>
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>{title}</span>
        <div style={{ 
          flex: 1, 
          height: '1px', 
          backgroundColor: '#d1d5db' 
        }} />
      </div>
      <div 
        ref={drop}
        style={{ 
          display: 'flex', 
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: '12px', 
          padding: '12px',
          border: isOver ? '2px dashed #3b82f6' : '1px dashed #d1d5db',
          borderRadius: '6px',
          backgroundColor: isOver ? '#eff6ff' : '#f8fafc',
          minHeight: '60px',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        {/* Position drop zones for horizontal layouts */}
        {direction === 'horizontal' && isDragOver && (
          <>
            <PositionDropZone
              position="left"
              onDrop={handleSmartDrop}
              isVisible={true}
            />
            <PositionDropZone
              position="center"
              onDrop={handleSmartDrop}
              isVisible={true}
            />
            <PositionDropZone
              position="right"
              onDrop={handleSmartDrop}
              isVisible={true}
            />
          </>
        )}
        {component.children && component.children.length > 0 ? (
          component.children.map((child, index) => (
            <div 
              key={child.id} 
              style={{ 
                flex: direction === 'horizontal' ? 1 : 'none',
                position: 'relative'
              }}
            >
              <DraggableNestedComponent
                component={child}
                isInContainer={true}
                containerPath={[...containerPath, component.id]}
                containerIndex={index}
                onRemoveFromContainer={onRemoveFromContainer}
                onMoveToCanvas={onMoveToCanvas}
                onDropInContainer={onDropInContainer}
                onDropInContainerWithPosition={onDropInContainerWithPosition}
                onRearrangeWithinContainer={onRearrangeWithinContainer}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
              />
              {direction === 'horizontal' && index < component.children!.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#d1d5db'
                }} />
              )}
            </div>
          ))
        ) : (
          <div style={{ 
            flex: 1,
            padding: '20px', 
            textAlign: 'center', 
            color: '#6b7280',
            fontSize: '14px',
            border: '1px dashed #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div>
              <div style={{ marginBottom: '8px' }}>
                {direction === 'horizontal' ? '↔' : '↕'} Drop components here
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {direction === 'horizontal' ? 'Components will be arranged side by side' : 'Components will be stacked vertically'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormComponentRenderer: React.FC<FormComponentRendererProps> = ({ 
  component,
  isInContainer = false,
  containerPath = [],
  onRemoveFromContainer,
  onMoveToContainer,
  onMoveToCanvas,
  onDropInContainer,
  onDropInContainerWithPosition,
  onRearrangeWithinContainer,
  selectedComponentId,
  onSelectComponent
}) => {
  // Pass through container management functions
  const handleMoveToContainer = onMoveToContainer;
  const handleRemoveFromContainer = onRemoveFromContainer;
  const handleMoveToCanvas = onMoveToCanvas;
  const baseStyle = {
    marginBottom: '8px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text_input':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="text"
              placeholder={component.placeholder}
              style={inputStyle}
              disabled
            />
          </div>
        );

      case 'number_input':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="number"
              placeholder={component.placeholder}
              min={component.min}
              max={component.max}
              step={component.step}
              style={inputStyle}
              disabled
            />
          </div>
        );

      case 'textarea':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              placeholder={component.placeholder}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              disabled
            />
          </div>
        );

      case 'select':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <select style={inputStyle} disabled>
              <option>Select an option...</option>
              {component.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'multi_select':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <select multiple style={{ ...inputStyle, height: '120px' }} disabled>
              {component.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {component.options?.map((option, index) => (
                <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="checkbox" disabled />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case 'radio_group':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {component.options?.map((option, index) => (
                <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="radio" name={component.fieldId} disabled />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case 'date_picker':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="date"
              style={inputStyle}
              disabled
            />
          </div>
        );

      case 'file_upload':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="file"
              accept={component.acceptedFileTypes}
              style={inputStyle}
              disabled
            />
            {component.acceptedFileTypes && (
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Accepted types: {component.acceptedFileTypes}
              </small>
            )}
          </div>
        );

      case 'section_divider':
        return (
          <div style={{ ...baseStyle, padding: '16px 0', borderBottom: '2px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {component.label}
            </h3>
            {component.description && (
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                {component.description}
              </p>
            )}
          </div>
        );

      case 'rich_text':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <RichTextEditor
                placeholder="Type your rich text content here..."
                disabled={true}
                value="<p>This is a <strong>rich text editor</strong> with <em>formatting</em> capabilities.</p><ul><li>Bold, italic, underline</li><li>Bullet points</li><li>Numbered lists</li></ul>"
              />
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                fontSize: '10px',
                color: '#6b7280',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 6px',
                borderRadius: '4px',
                zIndex: 10
              }}>
                Preview Mode
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div style={baseStyle}>
            <label style={labelStyle}>
              {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{
              width: '100%',
              height: '120px',
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Signature pad (preview)
            </div>
          </div>
        );

      case 'horizontal_layout':
        return (
          <LayoutContainer
            component={component}
            direction="horizontal"
            title="Row Layout"
            containerPath={containerPath}
            onRemoveFromContainer={handleRemoveFromContainer}
            onMoveToCanvas={handleMoveToCanvas}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onDropInContainerWithPosition={onDropInContainerWithPosition}
            onRearrangeWithinContainer={onRearrangeWithinContainer}
            onDropInContainer={(item, containerId, position) => {
              console.log('Drop in horizontal container:', item, containerId, 'position:', position);
              // Handle both new components and moves from other containers
              if (item.type && !item.isFromContainer) {
                // New component from sidebar - use position-aware function
                if (onDropInContainerWithPosition) {
                  onDropInContainerWithPosition(item, containerId, position || 'center');
                } else if (onDropInContainer) {
                  onDropInContainer(item, containerId);
                }
              } else if (item.isFromContainer) {
                // Component being moved from another container
                console.log('Moving component between containers at position:', position);
                if (handleMoveToContainer) {
                  handleMoveToContainer(item.id, item.containerPath, [...(containerPath || []), containerId], position);
                }
              }
            }}
          />
        );

      case 'vertical_layout':
        return (
          <LayoutContainer
            component={component}
            direction="vertical"
            title="Column Layout"
            containerPath={containerPath}
            onRemoveFromContainer={handleRemoveFromContainer}
            onMoveToCanvas={handleMoveToCanvas}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onDropInContainerWithPosition={onDropInContainerWithPosition}
            onRearrangeWithinContainer={onRearrangeWithinContainer}
            onDropInContainer={(item, containerId, position) => {
              console.log('Drop in vertical container:', item, containerId, 'position:', position);
              // Handle both new components and moves from other containers  
              if (item.type && !item.isFromContainer) {
                // New component from sidebar - use fallback to regular drop
                if (onDropInContainer) {
                  onDropInContainer(item, containerId);
                }
              } else if (item.isFromContainer) {
                // Component being moved from another container
                console.log('Moving component between containers');
                if (handleMoveToContainer) {
                  handleMoveToContainer(item.id, item.containerPath, [...(containerPath || []), containerId], position);
                }
              }
            }}
          />
        );

      default:
        return (
          <div style={baseStyle}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626'
            }}>
              Unknown component type: {component.type}
            </div>
          </div>
        );
    }
  };

  return renderComponent();
};

export default FormComponentRenderer;
