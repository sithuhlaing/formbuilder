import type { ComponentType } from '../../../types';

export interface DragItem {
  type: ComponentType;
  id?: string;
  isFromContainer?: boolean;
  containerPath?: string;
  index?: number;
}

export interface CanvasActions {
  onAddComponent: (componentType: ComponentType) => void;
  onInsertBetween?: (componentType: ComponentType, insertIndex: number) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string) => void;
}
