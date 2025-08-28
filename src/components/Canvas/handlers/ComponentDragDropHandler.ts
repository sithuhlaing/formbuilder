import type { RefObject } from 'react';
import type { XYCoord } from 'react-dnd';
import type { FormComponentData } from '../../../types';
import type { CanvasActions, DragItem } from '../types';

export class ComponentDragDropHandler {
  private actions: CanvasActions;
  private component: FormComponentData;
  private index: number;
  private itemRef: RefObject<HTMLDivElement>;
  private dropIndicatorStyle: React.CSSProperties = {};

  constructor(
    actions: CanvasActions,
    component: FormComponentData,
    index: number,
    itemRef: RefObject<HTMLDivElement>
  ) {
    this.actions = actions;
    this.component = component;
    this.index = index;
    this.itemRef = itemRef;
  }

  public handleHover(item: DragItem, monitor: any): void {
    if (!this.itemRef.current) {
      return;
    }
    if (item.id === this.component.id) {
      return;
    }
    
    const dragIndex = item.index;
    const hoverIndex = this.index;
    
    // Determine rectangle on screen
    const hoverBoundingRect = this.itemRef.current.getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) {
      return;
    }
    
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    
    // Determine drop position
    const isLeftHalf = hoverClientX < hoverMiddleX;
    const isTopHalf = hoverClientY < hoverMiddleY;
    
    // Store drop position for visual feedback
    const dropPosition = {
      isLeftHalf,
      isTopHalf,
      dragIndex: dragIndex ?? -1,
      hoverIndex
    };

    this.dropIndicatorStyle = this.getDropIndicatorStyle(dropPosition);

    (this.itemRef.current as any).dropPosition = dropPosition;
  }

  public handleDrop(item: DragItem, monitor: any): void {
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
    if (this.dropIndicatorStyle && this.dropIndicatorStyle['&::before']) {
      const isLeftHalf = this.dropIndicatorStyle['&::before'].left === '-2px';
      
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

  private getDropIndicatorStyle(dropPosition: any): Record<string, any> {
    if (!dropPosition) return {};
    
    const { isLeftHalf } = dropPosition;
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

  public canDrop(item: DragItem): boolean {
    return ['existing-component', 'component', 'nested-component'].includes(item.type);
  }
}