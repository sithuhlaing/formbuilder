import React, { useRef, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import HorizontalDragDropItem from './HorizontalDragDropItem';
import type { FormComponentData } from '../../../types';

interface RowLayoutContainerProps {
  component: FormComponentData; // The row layout component
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
  onAddComponentToRow?: (componentType: string, rowId: string, position: 'left' | 'right', targetIndex: number) => void;
  onUnwrapRowLayout?: (rowComponentId: string, childComponent: FormComponentData) => void;
}

const RowLayoutContainer: React.FC<RowLayoutContainerProps> = ({
  component,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onUpdateComponents,
  onRemoveFromContainer,
  onMoveFromContainerToCanvas,
  onAddComponentToRow,
  onUnwrapRowLayout,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  // Handle reordering within the row layout
  const handleMoveWithinRow = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!component.children || dragIndex === hoverIndex) return;

    console.log(`Moving within row: ${dragIndex} -> ${hoverIndex}`);
    
    const newChildren = [...component.children];
    const draggedChild = newChildren[dragIndex];
    
    // Remove from old position and insert at new position
    newChildren.splice(dragIndex, 1);
    newChildren.splice(hoverIndex, 0, draggedChild);
    
    // Update the row layout component
    const updatedRowComponent = {
      ...component,
      children: newChildren
    };

    console.log('Updated row children order:', newChildren.map(c => c.label));
    
    // Need to update the parent components list
    onUpdateComponent(updatedRowComponent);
  }, [component, onUpdateComponent]);

  // Handle removing component from row layout
  const handleRemoveFromRow = useCallback((childId: string) => {
    if (!component.children) return;
    
    console.log(`Removing ${childId} from row layout ${component.id}`);
    
    const newChildren = component.children.filter(child => child.id !== childId);
    
    // If only one child left, unwrap the row layout
    if (newChildren.length === 1) {
      console.log('Row has only one child left, unwrapping row layout...');
      const remainingChild = newChildren[0];
      
      // Signal the parent to replace this row layout with the remaining child.
      if (onUnwrapRowLayout) {
        onUnwrapRowLayout(component.id, remainingChild);
      } else {
        // Fallback if the unwrap handler is not provided, though it's not ideal.
        // This might happen if the component is used in a context where unwrapping isn't supported.
        console.warn('onUnwrapRowLayout is not implemented. Deleting row and losing last child.');
        onDeleteComponent(component.id);
      }
    } else if (newChildren.length === 0) {
      // If no children left, delete the entire row
      console.log('Row is empty, deleting row layout');
      onDeleteComponent(component.id);
    } else {
      // Update the row with remaining children
      const updatedRowComponent = {
        ...component,
        children: newChildren
      };
      onUpdateComponent(updatedRowComponent);
    }
  }, [component, onUpdateComponent, onDeleteComponent, onUpdateComponents, onUnwrapRowLayout]);

  // Handle moving component from row to main canvas
  const handleMoveToCanvas = useCallback((childId: string) => {
    console.log(`Moving ${childId} from row to canvas`);
    if (onMoveFromContainerToCanvas) {
      onMoveFromContainerToCanvas(childId, [component.id]);
    }
  }, [component.id, onMoveFromContainerToCanvas]);

  // Handle adding new component from palette to row
  const handleAddToRow = useCallback((componentType: string, position: 'left' | 'right', targetIndex: number) => {
    console.log(`🔶 RowLayoutContainer: Adding ${componentType} to row ${component.id} at ${position} of index ${targetIndex}`);
    
    if (onAddComponentToRow) {
      onAddComponentToRow(componentType, component.id, position, targetIndex);
    }
  }, [component.id, onAddComponentToRow]);

  // Drop zone for accepting new components into the row
  const [{ canDrop }, drop] = useDrop(() => ({
    accept: ['component', 'reorder-component'],
    drop: (item: any) => {
      // Handle drops from palette or other sources
      if (item.type && typeof item.type === 'string' && !item.component) {
        console.log('Adding new component to row layout:', item.type);
        // This would need to be handled by parent component
        // For now, we'll just log it
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      setIsOver(monitor.isOver({ shallow: true }));
    },
  }));

  drop(ref);

  if (!component.children || component.children.length === 0) {
    return (
      <div
        ref={ref}
        style={{
          padding: '16px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: isOver ? '#f3f4f6' : '#f9fafb',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '14px',
        }}
        onClick={() => onSelectComponent(component.id)}
      >
        Empty row layout - drag components here
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        padding: '12px',
        border: selectedComponentId === component.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: isOver ? '#f0f9ff' : '#ffffff',
        boxShadow: selectedComponentId === component.id 
          ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectComponent(component.id);
      }}
    >
      {/* Row layout header */}
      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '8px',
          fontWeight: '500',
        }}
      >
        Row Layout ({component.children.length} items)
      </div>

      {/* Delete row button when selected */}
      {selectedComponentId === component.id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteComponent(component.id);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#ef4444',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            zIndex: 10,
          }}
          title="Delete row layout"
        >
          ×
        </button>
      )}

      {/* Horizontal drag-drop items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          alignItems: 'stretch',
          minHeight: '60px',
        }}
      >
        {component.children.map((child, index) => (
          <HorizontalDragDropItem
            key={child.id}
            component={child}
            index={index}
            containerPath={[component.id]}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onUpdateComponent={onUpdateComponent}
            onMoveWithinContainer={handleMoveWithinRow}
            onRemoveFromContainer={handleRemoveFromRow}
            onMoveToCanvas={handleMoveToCanvas}
            onAddToRow={handleAddToRow}
          />
        ))}
      </div>
    </div>
  );
};

export default RowLayoutContainer;