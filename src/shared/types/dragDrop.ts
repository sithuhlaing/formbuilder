
export interface DragItem {
  type: string;
  componentType?: string;
  component?: any;
  index?: number;
}

export type DropIntent = 'add' | 'reorder' | 'move';

export interface DropResult {
  intent: DropIntent;
  targetId?: string;
  targetIndex?: number;
  position?: 'before' | 'after' | 'left' | 'right' | 'inside';
}
