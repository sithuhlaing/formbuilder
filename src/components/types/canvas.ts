
import type { ComponentType, FormComponentData } from '../types';

export interface CanvasProps {
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onAddComponent: (type: ComponentType) => void;
  onInsertWithPosition?: (type: ComponentType, targetId: string, position: 'before' | 'after') => void;
  onInsertBetween?: (type: ComponentType, insertIndex: number) => void;
  onInsertHorizontal?: (type: ComponentType, targetId: string, position: 'left' | 'right') => void;
  onDropInContainer?: (item: { type: ComponentType; id?: string }, containerId: string) => void;
}
