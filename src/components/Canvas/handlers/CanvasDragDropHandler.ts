import type { DragItem, CanvasActions, IDragDropHandler } from '../types';

export class CanvasDragDropHandler implements IDragDropHandler {
  constructor(private actions: CanvasActions) {}

  handleDrop(item: DragItem, monitor: any): void {
    console.log('Canvas drop:', { item, didDrop: monitor.didDrop() });
    
    if (!monitor.didDrop()) {
      if (item.type && typeof item.type === 'string' && !item.isFromContainer) {
        // New component from sidebar
        this.actions.onAddComponent(item.type);
      } else if (item.isFromContainer && item.id && item.containerPath) {
        // Component being moved from container to canvas
        console.log('Moving component from container to canvas:', item.id);
        this.actions.onMoveFromContainerToCanvas?.(item.id, item.containerPath);
      }
    }
  }

  canDrop(item: DragItem): boolean {
    return ['component', 'nested-component'].includes(item.type);
  }
}