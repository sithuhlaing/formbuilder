import React, { useCallback } from 'react';
import DragDropReorderingCanvas from './DragDropReorderingCanvas';
import type { FormComponentData, ComponentType } from '../../../types';

interface SimpleReorderingCanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
  createComponent?: (type: ComponentType) => FormComponentData;
}

const SimpleReorderingCanvas: React.FC<SimpleReorderingCanvasProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onUpdateComponent,
  onMoveComponent,
  onAddComponent,
  onUpdateComponents,
  onRemoveFromContainer,
  onMoveFromContainerToCanvas,
  createComponent,
}) => {
  // Enhanced move handler that works with array indices
  const handleMoveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log(`Canvas: Moving component from ${dragIndex} to ${hoverIndex}`);
    
    if (dragIndex === hoverIndex) return;
    
    // Call the original move handler if provided (for backward compatibility)
    if (onMoveComponent) {
      onMoveComponent(dragIndex, hoverIndex);
    }
    
    // Also handle the move directly using onUpdateComponents for immediate feedback
    const draggedComponent = components[dragIndex];
    if (!draggedComponent) return;
    
    const newComponents = [...components];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, draggedComponent);
    
    onUpdateComponents(newComponents);
  }, [components, onMoveComponent, onUpdateComponents]);

  return (
    <div
      data-testid="canvas"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <DragDropReorderingCanvas
        components={components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        onUpdateComponent={onUpdateComponent}
        onDeleteComponent={onDeleteComponent}
        onMoveComponent={handleMoveComponent}
        onAddComponent={onAddComponent}
        onUpdateComponents={onUpdateComponents}
        onRemoveFromContainer={onRemoveFromContainer}
        onMoveFromContainerToCanvas={onMoveFromContainerToCanvas}
        createComponent={createComponent}
      />
    </div>
  );
};

export default SimpleReorderingCanvas;