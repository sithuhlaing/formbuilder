import React, { useCallback } from 'react';
import CanvasDropZone from './Canvas/components/CanvasDropZone';
import SmartCanvasItem from './Canvas/components/SmartCanvasItem';
import CanvasEmptyState from './Canvas/components/CanvasEmptyState';
import { CanvasMainDropStrategy } from './Canvas/strategies/DropZoneStrategy';
import { SmartCanvasHandler } from './Canvas/handlers/SmartCanvasHandler';
import type { FormComponentData, ComponentType } from '../types';
import type { CanvasActions } from './Canvas/types';
import type { PositionDetectionResult } from './Canvas/types/positioning';

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
  onUpdateComponents: (components: FormComponentData[]) => void;
}

const CanvasWithSmartPositioning: React.FC<CanvasProps> = (props) => {
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

  // Create smart canvas handler
  const smartHandler = new SmartCanvasHandler(props.components, {
    onAddComponent: props.onAddComponent,
    onMoveComponent: props.onMoveComponent,
    onInsertBetween: props.onInsertBetween,
    onUpdateComponents: props.onUpdateComponents,
    onRemoveFromContainer: props.onRemoveFromContainer,
    onMoveFromContainerToCanvas: props.onMoveFromContainerToCanvas,
  });

  const handleSmartDrop = useCallback((result: PositionDetectionResult, componentType: ComponentType) => {
    console.log('Smart drop:', result);
    smartHandler.handleSmartDrop(result, componentType);
  }, [smartHandler]);

  const handleItemSmartDrop = useCallback((result: PositionDetectionResult & { componentType: string }) => {
    console.log('Item smart drop:', result);
    smartHandler.handleSmartDrop(result, result.componentType as ComponentType);
  }, [smartHandler]);

  // Enhanced main drop strategy that uses smart positioning
  const mainDropStrategy = {
    handleDrop: (item: any) => {
      if (item.type && typeof item.type === 'string' && !item.isFromContainer) {
        // For main canvas drops (not on specific components), add to end
        props.onAddComponent(item.type);
      } else if (item.isFromContainer && item.id && item.containerPath) {
        props.onMoveFromContainerToCanvas?.(item.id, item.containerPath);
      }
    },
    getAcceptedTypes: () => ['component', 'nested-component'],
    getDropIndicatorText: () => 'Drop components here to build your form'
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {props.components.map((component, index) => (
            <SmartCanvasItem
              key={component.id}
              component={component}
              index={index}
              selectedComponentId={props.selectedComponentId}
              actions={actions}
              onSmartDrop={handleItemSmartDrop}
            />
          ))}
          
          {/* Bottom drop zone for adding to end - using React DnD */}
          <CanvasDropZone
            strategy={{
              handleDrop: (item: any) => {
                if (item.type && typeof item.type === 'string') {
                  props.onAddComponent(item.type);
                }
              },
              getAcceptedTypes: () => ['component'],
              getDropIndicatorText: () => 'Drop here to add to end'
            }}
            style={{
              height: '40px',
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px',
              marginTop: '8px',
              backgroundColor: 'transparent'
            }}
          >
            <span>Drop here to add to end</span>
          </CanvasDropZone>
        </div>
      )}
    </CanvasDropZone>
  );
};

export default CanvasWithSmartPositioning;