import type { DragItem, CanvasActions, IDragDropHandler, DropPosition } from '../types';
import type { FormComponentData } from '../../../types';

export class ComponentDragDropHandler implements IDragDropHandler {
  private dropPosition: DropPosition | null = null;

  constructor(
    private actions: CanvasActions,
    private component: FormComponentData,
    private index: number,
    private elementRef: React.RefObject<HTMLDivElement>
  ) {}

  handleHover(item: DragItem, monitor: any): void {
    if (!this.elementRef.current) return;
    if (item.id === this.component.id) return;
    
    const dragIndex = item.index;
    const hoverIndex = this.index;
    
    // Determine rectangle on screen
    const hoverBoundingRect = this.elementRef.current.getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return;
    
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    
    // Determine drop position
    const isLeftHalf = hoverClientX < hoverMiddleX;
    const isTopHalf = hoverClientY < hoverMiddleY;
    
    // Store drop position for visual feedback
    this.dropPosition = {
      isLeftHalf,
      isTopHalf,
      dragIndex: dragIndex ?? -1,
      hoverIndex
    };

    (this.elementRef.current as any).dropPosition = this.dropPosition;
  }

  handleDrop(item: DragItem, monitor: any): void {
    if (item.type && typeof item.type === 'string' && !item.id && !item.isFromContainer) {
      // New component from sidebar
      this.handleNewComponentDrop(item);
    } else if (item.id && item.index !== undefined && !item.isFromContainer) {
      // Existing component rearrangement (within canvas)
      this.handleComponentRearrangement(item);
    } else if (item.isFromContainer && item.id && item.containerPath) {
      // Component moved from container
      this.handleContainerToCanvasDrop(item);
    }
  }

  private handleNewComponentDrop(item: DragItem): void {
    if (this.dropPosition) {
      const { isLeftHalf } = this.dropPosition;
      
      if (this.actions.onInsertHorizontal) {
        this.actions.onInsertHorizontal(item.type, this.component.id);
      } else if (this.actions.onInsertBetween) {
        this.actions.onInsertBetween(item.type, isLeftHalf ? this.index : this.index + 1);
      }
    } else if (this.actions.onInsertBetween) {
      this.actions.onInsertBetween(item.type, this.index + 1);
    }
  }

  private handleComponentRearrangement(item: DragItem): void {
    if (item.index !== undefined && item.index !== this.index) {
      this.actions.onMoveComponent(item.index, this.index);
    }
  }

  private handleContainerToCanvasDrop(item: DragItem): void {
    if (item.id && item.containerPath && this.actions.onMoveFromContainerToCanvas) {
      this.actions.onMoveFromContainerToCanvas(item.id, item.containerPath);
    }
  }

  getDropIndicatorStyle(): Record<string, any> {
    if (!this.dropPosition) return {};
    
    const { isLeftHalf } = this.dropPosition;
    return {
      '&::before': {
        content: '""',
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: '#3b82f6',
        ...(isLeftHalf 
          ? { left: '-2px', top: '0', bottom: '0', width: '4px' }
          : { right: '-2px', top: '0', bottom: '0', width: '4px' }
        )
      }
    };
  }

  canDrop(item: DragItem): boolean {
    return ['existing-component', 'component', 'nested-component'].includes(item.type);
  }
}