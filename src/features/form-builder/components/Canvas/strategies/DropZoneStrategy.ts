import type { DragItem, CanvasActions } from '../types';

export abstract class DropZoneStrategy {
  protected actions: CanvasActions;

  constructor(actions: CanvasActions) {
    this.actions = actions;
  }

  abstract handleDrop(dragItem: DragItem): void;
  abstract getAcceptedTypes(): string[];
  abstract getDropIndicatorText(): string;
}

export class BetweenComponentsDropStrategy extends DropZoneStrategy {
  private insertIndex: number;

  constructor(actions: CanvasActions, insertIndex: number) {
    super(actions);
    this.insertIndex = insertIndex;
  }

  handleDrop(dragItem: DragItem): void {
    if (this.actions.onInsertBetween) {
      this.actions.onInsertBetween(dragItem.type, this.insertIndex);
    } else {
      // Fallback to onAddComponent if onInsertBetween is not available
      this.actions.onAddComponent(dragItem.type);
    }
  }

  getAcceptedTypes(): string[] {
    return ['component'];
  }

  getDropIndicatorText(): string {
    return 'Drop here to insert';
  }
}

export class CanvasMainDropStrategy extends DropZoneStrategy {
  handleDrop(dragItem: DragItem): void {
    if (dragItem.isFromContainer && dragItem.id && dragItem.containerPath) {
      // Handle component moved from container to canvas
      if (this.actions.onMoveFromContainerToCanvas) {
        this.actions.onMoveFromContainerToCanvas(dragItem.id, dragItem.containerPath);
      }
    } else {
      // Handle new component from palette
      this.actions.onAddComponent(dragItem.type);
    }
  }

  getAcceptedTypes(): string[] {
    return ['component', 'nested-component'];
  }

  getDropIndicatorText(): string {
    return 'Drop components here to build your form';
  }
}
