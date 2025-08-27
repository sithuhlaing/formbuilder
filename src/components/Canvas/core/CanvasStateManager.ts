/**
 * Canvas State Manager - Single source of truth for canvas operations
 * Implements the exact drag-and-drop rules from JSON specification:
 * - source_left_panel: create_new_item → increase canvas collection by 1
 * - source_canvas: intent_before/after → insert above/below target
 * - source_canvas: intent_left/right → insert left/right (create RowLayout if none)
 * - rowlayout_rules: max_one_row, dissolve_if_one_left, add_item at left/right
 * - remove_item: drag out → remove from canvas → update schema
 */

import type { FormComponentData, ComponentType } from '../../../types';
import type { CanvasNode, CanvasState } from './types';

export class CanvasStateManager {
  private state: CanvasState;
  private createComponent: (type: ComponentType) => FormComponentData;

  constructor(
    initialState: CanvasState,
    createComponentFn: (type: ComponentType) => FormComponentData
  ) {
    this.state = { ...initialState };
    this.createComponent = createComponentFn;
  }

  /**
   * source_left_panel: action = "create_new_item"
   * result = "increase canvas collection by 1"
   */
  createNewItem(componentType: ComponentType): CanvasNode {
    const newComponent = this.createComponent(componentType);
    console.log('📋 Left Panel → Canvas: Creating new item', {
      type: componentType,
      id: newComponent.id,
      action: 'create_new_item',
      result: 'increase canvas collection by 1'
    });
    
    return {
      id: newComponent.id,
      type: newComponent.type,
      props: this.extractProps(newComponent)
    };
  }

  /**
   * Rule 6: Move existing item (same ID)
   */
  moveExistingItem(itemId: string, fromPosition: number, toPosition: number): CanvasState {
    const newNodes = [...this.state.nodes];
    const [movedItem] = newNodes.splice(fromPosition, 1);
    newNodes.splice(toPosition, 0, movedItem);

    this.state = { nodes: newNodes };
    return { ...this.state };
  }

  /**
   * source_canvas horizontal arrangement:
   * - intent_left: "insert left of target (create RowLayout if none)"
   * - intent_right: "insert right of target (create RowLayout if none)"
   * rowlayout_rules: max_one_row = true, dissolve_if_one_left = true
   */
  handleHorizontalArrangement(
    draggedItem: CanvasNode | ComponentType,
    targetItemId: string,
    intent: 'LEFT' | 'RIGHT'
  ): CanvasState {
    console.log('↔️ Canvas Horizontal Arrangement:', {
      intent: intent === 'LEFT' ? 'insert left of target' : 'insert right of target',
      rule: 'create RowLayout if none',
      maxOneRow: true
    });

    const targetIndex = this.findNodeIndex(targetItemId);
    if (targetIndex === -1) return { ...this.state };

    const targetNode = this.state.nodes[targetIndex];
    const draggedNode = typeof draggedItem === 'string' 
      ? this.createNewItem(draggedItem)
      : draggedNode;

    // rowlayout_rules: max_one_row = true
    if (!this.hasRowLayout()) {
      // No RowLayout exists - create the first and only one
      const newRowLayout = this.createRowLayout(targetNode, draggedNode, intent);
      const newNodes = [...this.state.nodes];
      newNodes.splice(targetIndex, 1, newRowLayout);
      
      this.state = { nodes: newNodes };
      console.log('✅ Created RowLayout (max_one_row enforced)');
      return { ...this.state };
    }

    // RowLayout exists - add to existing one (max_one_row rule)
    const rowLayout = this.findRowLayout();
    if (rowLayout && this.isNodeInRowLayout(targetItemId, rowLayout)) {
      // Target is inside existing RowLayout - add item based on pointer
      console.log('🎯 Adding to existing RowLayout at', intent, 'position');
      return this.addToExistingRowLayout(draggedNode, targetItemId, intent);
    }

    // Target is outside RowLayout - move target to RowLayout and add dragged item
    console.log('🔄 Moving target to existing RowLayout and adding dragged item');
    return this.moveTargetToRowLayoutAndAddDragged(targetNode, draggedNode, intent);
  }

  /**
   * source_canvas vertical arrangement:
   * - intent_before: "insert above target"
   * - intent_after: "insert below target"
   */
  handleVerticalArrangement(
    draggedItem: CanvasNode | ComponentType,
    targetItemId: string | null,
    intent: 'BEFORE' | 'AFTER' | 'APPEND_TO_CANVAS_END'
  ): CanvasState {
    console.log('↕️ Canvas Vertical Arrangement:', {
      intent: intent === 'BEFORE' ? 'insert above target' : intent === 'AFTER' ? 'insert below target' : 'append to end'
    });

    const draggedNode = typeof draggedItem === 'string' 
      ? this.createNewItem(draggedItem)
      : draggedNode;

    const newNodes = [...this.state.nodes];

    if (intent === 'APPEND_TO_CANVAS_END') {
      newNodes.push(draggedNode);
      console.log('📎 Appended to canvas end');
    } else if (targetItemId) {
      const targetIndex = this.findNodeIndex(targetItemId);
      if (targetIndex !== -1) {
        const insertIndex = intent === 'BEFORE' ? targetIndex : targetIndex + 1;
        newNodes.splice(insertIndex, 0, draggedNode);
        console.log(`✅ Inserted ${intent === 'BEFORE' ? 'above' : 'below'} target at index ${insertIndex}`);
      }
    }

    this.state = { nodes: newNodes };
    return { ...this.state };
  }

  /**
   * remove_item rule: "drag out → remove from canvas → update schema"
   */
  removeItemFromCanvas(itemId: string): CanvasState {
    console.log('🗑️ Remove Item Rule:', {
      action: 'drag out',
      result: 'remove from canvas → update schema',
      itemId
    });

    // Remove from regular canvas nodes
    let wasRemoved = false;
    let newNodes = this.state.nodes.filter(node => {
      if (node.id === itemId) {
        wasRemoved = true;
        return false;
      }
      return true;
    });

    // Remove from RowLayout if present
    if (!wasRemoved) {
      newNodes = newNodes.map(node => {
        if (node.type === 'horizontal_layout' && node.children) {
          const filteredChildren = node.children.filter(child => child.id !== itemId);
          if (filteredChildren.length !== node.children.length) {
            wasRemoved = true;
            return { ...node, children: filteredChildren };
          }
        }
        return node;
      });
    }

    this.state = { nodes: newNodes };
    console.log(`✅ Item ${itemId} removed from canvas, schema updated`);
    
    // Auto-cleanup RowLayout if needed (dissolve_if_one_left rule)
    return this.cleanupRowLayout();
  }

  /**
   * Rules 13-14: Handle moving into/out of RowLayout
   */
  moveFromRowLayoutToCanvas(
    itemId: string,
    targetPosition: number,
    intent: 'BEFORE' | 'AFTER' | 'APPEND_TO_CANVAS_END'
  ): CanvasState {
    // Remove from RowLayout
    const item = this.removeFromRowLayout(itemId);
    if (!item) return { ...this.state };

    // Add to canvas at specified position
    return this.handleVerticalArrangement(item, null, intent);
  }

  /**
   * Rules 15-16: RowLayout lifecycle management
   */
  cleanupRowLayout(): CanvasState {
    const rowLayout = this.findRowLayout();
    if (!rowLayout) return { ...this.state };

    // rowlayout_rules: dissolve_if_one_left = true
    if (rowLayout.children?.length === 1) {
      console.log('📉 Dissolving RowLayout (only 1 item left)');
      this.dissolveRowLayout();
    } else if (rowLayout.children?.length === 0) {
      console.log('🗑️ Removing empty RowLayout');
      this.removeRowLayout();
    }

    return { ...this.state };
  }

  /**
   * Rule 22: Export current state as JSON
   */
  exportJSON(): CanvasState {
    return { ...this.state };
  }

  /**
   * Get current state
   */
  getState(): CanvasState {
    return { ...this.state };
  }

  // Helper methods
  private extractProps(component: FormComponentData): Record<string, any> {
    const { id, type, label, ...props } = component;
    return props;
  }

  private findNodeIndex(nodeId: string): number {
    return this.state.nodes.findIndex(node => node.id === nodeId);
  }

  private hasRowLayout(): boolean {
    return this.state.nodes.some(node => node.type === 'horizontal_layout');
  }

  private findRowLayout(): CanvasNode | null {
    return this.state.nodes.find(node => node.type === 'horizontal_layout') || null;
  }

  private isNodeInRowLayout(nodeId: string, rowLayout: CanvasNode): boolean {
    return rowLayout.children?.some(child => child.id === nodeId) || false;
  }

  private createRowLayout(target: CanvasNode, dragged: CanvasNode, intent: 'LEFT' | 'RIGHT'): CanvasNode {
    const children = intent === 'LEFT' ? [dragged, target] : [target, dragged];
    
    return {
      id: `row_${Date.now()}`,
      type: 'horizontal_layout',
      children
    };
  }

  private addToExistingRowLayout(
    draggedNode: CanvasNode,
    targetItemId: string,
    intent: 'LEFT' | 'RIGHT'
  ): CanvasState {
    const newNodes = this.state.nodes.map(node => {
      if (node.type === 'horizontal_layout' && node.children) {
        const targetIndex = node.children.findIndex(child => child.id === targetItemId);
        if (targetIndex !== -1) {
          const newChildren = [...node.children];
          const insertIndex = intent === 'LEFT' ? targetIndex : targetIndex + 1;
          newChildren.splice(insertIndex, 0, draggedNode);
          return { ...node, children: newChildren };
        }
      }
      return node;
    });

    this.state = { nodes: newNodes };
    return { ...this.state };
  }

  private moveTargetToRowLayoutAndAddDragged(
    targetNode: CanvasNode,
    draggedNode: CanvasNode,
    intent: 'LEFT' | 'RIGHT'
  ): CanvasState {
    const rowLayout = this.findRowLayout();
    if (!rowLayout || !rowLayout.children) return { ...this.state };

    const newChildren = [...rowLayout.children];
    const targetChildren = intent === 'LEFT' 
      ? [draggedNode, targetNode, ...newChildren]
      : [...newChildren, targetNode, draggedNode];

    const newNodes = this.state.nodes.map(node => {
      if (node.type === 'horizontal_layout') {
        return { ...node, children: targetChildren };
      }
      return node.id === targetNode.id ? null : node;
    }).filter(Boolean) as CanvasNode[];

    this.state = { nodes: newNodes };
    return { ...this.state };
  }

  private removeFromRowLayout(itemId: string): CanvasNode | null {
    let removedItem: CanvasNode | null = null;

    const newNodes = this.state.nodes.map(node => {
      if (node.type === 'horizontal_layout' && node.children) {
        const itemIndex = node.children.findIndex(child => child.id === itemId);
        if (itemIndex !== -1) {
          removedItem = node.children[itemIndex];
          const newChildren = node.children.filter(child => child.id !== itemId);
          return { ...node, children: newChildren };
        }
      }
      return node;
    });

    this.state = { nodes: newNodes };
    return removedItem;
  }

  private dissolveRowLayout(): void {
    const rowLayout = this.findRowLayout();
    if (!rowLayout || !rowLayout.children?.length) return;

    const remainingItem = rowLayout.children[0];
    const newNodes = this.state.nodes.map(node => 
      node.type === 'horizontal_layout' ? remainingItem : node
    );

    this.state = { nodes: newNodes };
  }

  private removeRowLayout(): void {
    const newNodes = this.state.nodes.filter(node => node.type !== 'horizontal_layout');
    this.state = { nodes: newNodes };
  }
}