import React, { useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import FormComponentRenderer from './molecules/forms/FormComponentRenderer';
import type { FormComponentData, ComponentType } from '../types';

interface CanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponent?: (updates: Partial<FormComponentData>) => void;
  onAddComponent: (type: ComponentType) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onInsertWithPosition?: (type: ComponentType, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onInsertBetween?: (type: ComponentType, insertIndex: number) => void;
  onInsertHorizontal?: (type: ComponentType, targetId: string) => void;
  onDropInContainer?: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  onDropInContainerWithPosition?: (item: { type: ComponentType; id?: string }, containerId: string, position: 'left' | 'center' | 'right') => void;
  onRearrangeWithinContainer?: (containerId: string, dragIndex: number, hoverIndex: number) => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
  onMoveToContainer?: (componentId: string, fromPath: string[], toPath: string[], position?: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onUpdateComponent,
  onAddComponent,
  onMoveComponent,
  onInsertWithPosition,
  onInsertBetween,
  onInsertHorizontal,
  onDropInContainer,
  onDropInContainerWithPosition,
  onRearrangeWithinContainer,
  onRemoveFromContainer,
  onMoveFromContainerToCanvas,
  onMoveToContainer
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['component', 'nested-component'],
    drop: (item: any, monitor) => {
      console.log('Canvas drop:', { item, didDrop: monitor.didDrop() });
      
      if (!monitor.didDrop()) {
        if (item.type && typeof item.type === 'string' && !item.isFromContainer) {
          // New component from sidebar
          onAddComponent(item.type);
        } else if (item.isFromContainer) {
          // Component being moved from container to canvas
          console.log('Moving component from container to canvas:', item.id);
          handleMoveFromContainerToCanvas(item.id, item.containerPath);
        }
      }
      
      // Always return a drop result so nested components know they were dropped successfully
      return { droppedOnCanvas: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  const handleMoveFromContainerToCanvas = (componentId: string, containerPath: string[]) => {
    console.log('Moving component from container to canvas:', componentId, containerPath);
    if (onMoveFromContainerToCanvas) {
      onMoveFromContainerToCanvas(componentId, containerPath);
    }
  };

  const handleRemoveFromContainer = (componentId: string, containerPath: string[]) => {
    console.log('Removing component from container:', componentId, containerPath);
    if (onRemoveFromContainer) {
      onRemoveFromContainer(componentId, containerPath);
    }
  };

  const handleAddHorizontalLayout = () => {
    onAddComponent('horizontal_layout');
  };

  const handleAddVerticalLayout = () => {
    onAddComponent('vertical_layout');
  };

  const DropZone: React.FC<{ index: number }> = ({ index }) => {
    const [{ isOver: isDropZoneOver }, dropZone] = useDrop(() => ({
      accept: 'component',
      drop: (item: { type: ComponentType }) => {
        if (onInsertBetween) {
          onInsertBetween(item.type, index);
        } else {
          onAddComponent(item.type);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    }));

    return (
      <div
        ref={dropZone}
        style={{
          height: isDropZoneOver ? '40px' : '4px',
          backgroundColor: isDropZoneOver ? '#dbeafe' : 'transparent',
          border: isDropZoneOver ? '2px dashed #3b82f6' : 'none',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: isDropZoneOver ? '8px 0' : '2px 0',
          fontSize: '12px',
          color: '#6b7280'
        }}
      >
        {isDropZoneOver && 'Drop here to insert'}
      </div>
    );
  };

  const DraggableComponentItem: React.FC<{ 
    component: FormComponentData; 
    index: number;
  }> = ({ component, index }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'existing-component',
      item: { id: component.id, index, type: component.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }));

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: ['existing-component', 'component', 'nested-component'],
      hover: (item: any, monitor) => {
        if (!ref.current) return;
        
        const dragIndex = item.index;
        const hoverIndex = index;
        
        // Don't replace items with themselves
        if (item.id === component.id) return;
        
        // Determine rectangle on screen
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        
        // Determine mouse position
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;
        
        // Determine drop position
        const isLeftHalf = hoverClientX < hoverMiddleX;
        const isTopHalf = hoverClientY < hoverMiddleY;
        
        // Store drop position for visual feedback
        (ref.current as any).dropPosition = {
          isLeftHalf,
          isTopHalf,
          dragIndex,
          hoverIndex
        };
      },
      drop: (item: any, monitor) => {
        if (item.type && typeof item.type === 'string' && !item.id && !item.isFromContainer) {
          // New component from sidebar
          const dropPos = (ref.current as any)?.dropPosition;
          if (dropPos) {
            const { isLeftHalf, isTopHalf } = dropPos;
            
            if (isLeftHalf || !isLeftHalf) {
              // For now, insert horizontally next to this component
              if (onInsertHorizontal) {
                onInsertHorizontal(item.type, component.id);
              } else if (onInsertBetween) {
                onInsertBetween(item.type, isTopHalf ? index : index + 1);
              }
            }
          } else {
            // Default behavior
            if (onInsertBetween) {
              onInsertBetween(item.type, index + 1);
            }
          }
        } else if (item.id && item.index !== undefined && !item.isFromContainer) {
          // Existing component rearrangement (within canvas)
          if (onMoveComponent && item.index !== index) {
            onMoveComponent(item.index, index);
          }
        } else if (item.isFromContainer) {
          // Component moved from container - insert at position
          if (onInsertBetween) {
            // First remove from container, then add to canvas
            handleMoveFromContainerToCanvas(item.id, item.containerPath);
            // Note: This would need more sophisticated logic to actually move the component
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }));

    drag(drop(ref));

    const getDropIndicatorStyle = () => {
      if (!isOver || !canDrop) return {};
      
      const dropPos = (ref.current as any)?.dropPosition;
      if (dropPos) {
        const { isLeftHalf, isTopHalf } = dropPos;
        return {
          '&::before': {
            content: '""',
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: '#3b82f6',
            ...(isLeftHalf 
              ? { left: '-2px', top: '0', bottom: '0', width: '4px' }
              : { right: '-2px', top: '0', bottom: '0', width: '4px' }
            )
          }
        };
      }
      return {};
    };

    return (
      <>
        <DropZone index={index} />
        <div
          ref={ref}
          style={{
            marginBottom: '16px',
            padding: '12px',
            border: selectedComponentId === component.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
            borderColor: isOver && canDrop ? '#10b981' : undefined,
            borderRadius: '6px',
            backgroundColor: isDragging ? '#f3f4f6' : '#ffffff',
            opacity: isDragging ? 0.5 : 1,
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            boxShadow: selectedComponentId === component.id ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transform: isDragging ? 'rotate(5deg)' : 'none',
            transition: 'all 0.2s ease',
            ...getDropIndicatorStyle()
          }}
          onClick={() => onSelectComponent(component.id)}
        >
          {/* Drag handle */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '20px',
              height: '20px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#9ca3af',
              opacity: selectedComponentId === component.id ? 1 : 0.3
            }}
            title="Drag to rearrange"
          >
            ⋮⋮
          </div>

          {selectedComponentId === component.id && (
            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onInsertHorizontal) {
                    onInsertHorizontal('text_input', component.id);
                  }
                }}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Add component to the right"
              >
                →
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Delete component"
              >
                ×
              </button>
            </div>
          )}
          
          <div style={{ marginLeft: '24px' }}>
            <FormComponentRenderer 
              component={component}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              onRemoveFromContainer={handleRemoveFromContainer}
              onMoveToCanvas={handleMoveFromContainerToCanvas}
              onDropInContainer={onDropInContainer}
              onDropInContainerWithPosition={onDropInContainerWithPosition}
              onRearrangeWithinContainer={onRearrangeWithinContainer}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      ref={drop}
      style={{
        flex: 1,
        padding: '24px',
        backgroundColor: isOver ? '#eff6ff' : '#f9fafb',
        border: '2px dashed #d1d5db',
        borderColor: isOver ? '#3b82f6' : '#d1d5db',
        borderRadius: '8px',
        minHeight: '400px',
        transition: 'all 0.2s ease'
      }}
    >
      {components.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#6b7280',
            fontSize: '16px',
            marginBottom: '24px'
          }}>
            Drop components here to build your form
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
            <button
              onClick={handleAddHorizontalLayout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ↔ Add Row Layout
            </button>
            <button
              onClick={handleAddVerticalLayout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ↕ Add Column Layout
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            Or drag components from the sidebar
          </div>
        </div>
      ) : (
        <div>
          {components.map((component, index) => (
            <DraggableComponentItem key={component.id} component={component} index={index} />
          ))}
          <DropZone index={components.length} />
        </div>
      )}
    </div>
  );
};

export default Canvas;