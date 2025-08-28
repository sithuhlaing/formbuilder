import type { FormComponentData, ComponentType } from '../../types';

export interface DragItem {
  type: ComponentType;
  id?: string;
  index?: number;
  isFromContainer?: boolean;
  containerPath?: string[];
  containerIndex?: number;
  containerId?: string;
}

export interface DropPosition {
  isLeftHalf: boolean;
  isTopHalf: boolean;
  dragIndex: number;
  hoverIndex: number;
}

export interface CanvasActions {
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

export interface IDragDropHandler {
  handleDrop(item: DragItem, monitor: any): void;
  handleHover?(item: DragItem, monitor: any): void;
  canDrop?(item: DragItem): boolean;
}

export interface IDropZone {
  acceptTypes: string[];
  onDrop: (item: DragItem) => void;
  isOver: boolean;
}