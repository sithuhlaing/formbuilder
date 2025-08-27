import type { DragItem, CanvasActions } from '../types';

export interface IDropZoneStrategy {
  handleDrop(item: DragItem): void;
  getAcceptedTypes(): string[];
  getDropIndicatorText(): string;
}

export class BetweenComponentsDropStrategy implements IDropZoneStrategy {
  constructor(
    private actions: CanvasActions,
    private insertIndex: number
  ) {}

  handleDrop(item: DragItem): void {
    if (this.actions.onInsertBetween) {
      this.actions.onInsertBetween(item.type, this.insertIndex);
    } else {
      this.actions.onAddComponent(item.type);
    }
  }

  getAcceptedTypes(): string[] {
    return ['component'];
  }

  getDropIndicatorText(): string {
    return 'Drop here to insert';
  }
}

export class CanvasMainDropStrategy implements IDropZoneStrategy {
  constructor(private actions: CanvasActions) {}

  handleDrop(item: DragItem): void {
    if (item.type && typeof item.type === 'string' && !item.isFromContainer) {
      this.actions.onAddComponent(item.type);
    } else if (item.isFromContainer && item.id && item.containerPath) {
      this.actions.onMoveFromContainerToCanvas?.(item.id, item.containerPath);
    }
  }

  getAcceptedTypes(): string[] {
    return ['component', 'nested-component'];
  }

  getDropIndicatorText(): string {
    return 'Drop components here to build your form';
  }
}