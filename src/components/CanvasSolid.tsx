import React from 'react';
import type { FormComponentData, ComponentType } from '../types';
import CanvasDropZone from './Canvas/components/CanvasDropZone';
import ComponentDropIndicator from './Canvas/components/ComponentDropIndicator';
import DraggableCanvasItem from './Canvas/components/DraggableCanvasItem';
import CanvasEmptyState from './Canvas/components/CanvasEmptyState';
import { CanvasMainDropStrategy, BetweenComponentsDropStrategy } from './Canvas/strategies/DropZoneStrategy';
import type { CanvasActions } from './Canvas/types';

interface CanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onAddComponent: (type: ComponentType) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onInsertBetween?: (type: ComponentType, insertIndex: number) => void;
  onInsertHorizontal?: (type: ComponentType, targetId: string, position?: 'left' | 'right') => void;
  onDropInContainer?: (item: { type: ComponentType; id?: string }, containerId: string) => void;
  onDropInContainerWithPosition?: (item: { type: ComponentType; id?: string }, containerId: string, position: 'left' | 'center' | 'right') => void;
  onRearrangeWithinContainer?: (containerId: string, dragIndex: number, hoverIndex: number) => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
}

const CanvasSolid: React.FC<CanvasProps> = (props) => {
  const actions: CanvasActions = {
    onSelectComponent: props.onSelectComponent,
    onDeleteComponent: props.onDeleteComponent,
    onUpdateComponent: props.onUpdateComponent,
    onAddComponent: props.onAddComponent,
    onMoveComponent: props.onMoveComponent,
    onInsertBetween: props.onInsertBetween,
    onInsertHorizontal: props.onInsertHorizontal,
    onDropInContainer: props.onDropInContainer,
    onDropInContainerWithPosition: props.onDropInContainerWithPosition,
    onRearrangeWithinContainer: props.onRearrangeWithinContainer,
    onRemoveFromContainer: props.onRemoveFromContainer,
    onMoveFromContainerToCanvas: props.onMoveFromContainerToCanvas,
  };

  const mainDropStrategy = new CanvasMainDropStrategy(actions);

  return (
    <CanvasDropZone
      strategy={mainDropStrategy}
      style={{
        flex: 1,
        padding: '24px',
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        minHeight: '400px'
      }}
    >
      {props.components.length === 0 ? (
        <CanvasEmptyState onAddComponent={props.onAddComponent} />
      ) : (
        <div>
          {props.components.map((component, index) => (
            <React.Fragment key={component.id}>
              <ComponentDropIndicator 
                strategy={new BetweenComponentsDropStrategy(actions, index)}
              />
              <DraggableCanvasItem
                component={component}
                index={index}
                selectedComponentId={props.selectedComponentId}
                actions={actions}
              />
            </React.Fragment>
          ))}
          <ComponentDropIndicator 
            strategy={new BetweenComponentsDropStrategy(actions, props.components.length)}
          />
        </div>
      )}
    </CanvasDropZone>
  );
};

export default CanvasSolid;