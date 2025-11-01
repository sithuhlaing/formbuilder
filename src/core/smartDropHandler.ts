/**
 * Enhanced Smart Drop Handler - PRD-Aligned Layout Logic
 * 
 * Implements sophisticated layout system from the PRD:
 * - Canvas is ALWAYS column layout (vertical)
 * - Horizontal layouts are CONTAINERS inside the column
 * - Drop position detection: 20% edges (horizontal), 30% edges (vertical)
 * - Auto-dissolution when rows have ≤1 child
 * - Row capacity limit of 4 components
 * - Row layouts can only move vertically (top/bottom)
 */

import { v4 as uuidv4 } from 'uuid';
import type { Component, ComponentType } from '../types/components';
import { createComponent } from './componentUtils';

// PRD-aligned drop position enum
export const DropPosition = {
  BEFORE: 'before',  // Top 30% → Insert in column above target
  AFTER: 'after',    // Bottom 30% → Insert in column below target
  LEFT: 'left',      // Left 20% → Create/expand horizontal layout
  RIGHT: 'right',    // Right 20% → Create/expand horizontal layout
  CENTER: 'center',  // Middle 60% → Special handling (usually blocked)
  INSIDE: 'inside'   // Container drop (rare, specific cases)
} as const;

export type DropPosition = typeof DropPosition[keyof typeof DropPosition];

export interface DropZoneInfo {
  targetComponentId?: string;
  position: DropPosition;
  index: number;
  parentId?: string;
  isValid: boolean;
  reason?: string; // For invalid drops
}

export interface DragData {
  dragType: 'new-item' | 'existing-item';
  sourceId?: string;           // Only for existing-item
  componentType: ComponentType; // Component being dragged
  item?: Component;             // Full component data (for existing-item)
  isRowLayout?: boolean;        // Flag for row layout dragging
}

// Helper function to check DropPosition values
function isDropPosition(value: string): value is DropPosition {
  return Object.values(DropPosition).includes(value as DropPosition);
}

export interface DropZoneConfig {
  // PRD-specified percentages
  horizontalEdge: number;   // 0.2 = 20% (left/right)
  verticalEdge: number;     // 0.3 = 30% (top/bottom)
  centerBlocked: boolean;   // Whether center is valid drop zone
}

const PRD_CONFIG: DropZoneConfig = {
  horizontalEdge: 0.2,
  verticalEdge: 0.3,
  centerBlocked: true // For row interiors
};

/**
 * PRD-aligned drop position calculation
 * Priority: Horizontal zones take precedence over vertical zones
 */
export function calculateDropZone(
  clientOffset: { x: number; y: number },
  elementRect: DOMRect,
  targetComponent: Component,
  config: DropZoneConfig = PRD_CONFIG
): DropPosition | null {
  
  // Calculate percentages
  const xPercent = (clientOffset.x - elementRect.left) / elementRect.width;
  const yPercent = (clientOffset.y - elementRect.top) / elementRect.height;
  
  // Validate percentages are in bounds
  if (xPercent < 0 || xPercent > 1 || yPercent < 0 || yPercent > 1) {
    return null; // Mouse outside element
  }
  
  // PRIORITY 1: Check horizontal zones (left/right)
  // These take precedence because they create horizontal layouts
  if (xPercent < config.horizontalEdge) {
    return DropPosition.LEFT;
  }
  if (xPercent > (1 - config.horizontalEdge)) {
    return DropPosition.RIGHT;
  }
  
  // PRIORITY 2: Check vertical zones (top/bottom)
  if (yPercent < config.verticalEdge) {
    return DropPosition.BEFORE;
  }
  if (yPercent > (1 - config.verticalEdge)) {
    return DropPosition.AFTER;
  }
  
  // PRIORITY 3: Center area
  // Special handling based on target type
  if (targetComponent.type === 'horizontal_layout') {
    // Center of row container = blocked (must use edges)
    return config.centerBlocked ? null : DropPosition.CENTER;
  }
  
  // Center of regular component = insert after (default behavior)
  return DropPosition.AFTER;
}

/**
 * Handle corner drops - horizontal takes precedence over vertical
 */
function handleCornerDrop(
  xPercent: number,
  yPercent: number,
  config: DropZoneConfig
): DropPosition {
  
  // When mouse is in corner zone, both horizontal and vertical zones active
  // Priority: Horizontal takes precedence over vertical
  
  const isLeftEdge = xPercent < config.horizontalEdge;
  const isRightEdge = xPercent > (1 - config.horizontalEdge);
  const isTopEdge = yPercent < config.verticalEdge;
  const isBottomEdge = yPercent > (1 - config.verticalEdge);
  
  // Top-left corner
  if (isTopEdge && isLeftEdge) {
    return DropPosition.LEFT; // Horizontal wins
  }
  
  // Top-right corner
  if (isTopEdge && isRightEdge) {
    return DropPosition.RIGHT; // Horizontal wins
  }
  
  // Bottom-left corner
  if (isBottomEdge && isLeftEdge) {
    return DropPosition.LEFT; // Horizontal wins
  }
  
  // Bottom-right corner
  if (isBottomEdge && isRightEdge) {
    return DropPosition.RIGHT; // Horizontal wins
  }
  
  // Not in corner, use standard detection
  return DropPosition.AFTER; // Fallback
}

/**
 * Special handling for drops on row layouts
 */
function getDropPositionForRowLayout(
  mouseX: number,
  mouseY: number,
  rowElement: HTMLElement,
  rowComponent: Component
): DropPosition | null {
  
  const rect = rowElement.getBoundingClientRect();
  const yPercent = (mouseY - rect.top) / rect.height;
  
  // Special zones for row layouts
  const ROW_TOP_ZONE = 0.15;    // Top 15% = insert above entire row
  const ROW_BOTTOM_ZONE = 0.85; // Bottom 15% = insert below entire row
  
  // Top edge = insert above entire row
  if (yPercent < ROW_TOP_ZONE) {
    return DropPosition.BEFORE;
  }
  
  // Bottom edge = insert below entire row
  if (yPercent > ROW_BOTTOM_ZONE) {
    return DropPosition.AFTER;
  }
  
  // Interior = delegate to child component detection
  // This would need implementation to find which child is under the mouse
  return null; // For now, block interior drops
}

/**
 * PRD-aligned horizontal layout creation
 * Row container with 2-4 components, layout configuration
 */
export function createHorizontalLayout(
  component1: Component,
  component2: Component,
  layoutConfig?: {
    distribution?: 'equal' | 'auto' | 'custom';
    spacing?: 'tight' | 'normal' | 'loose';
    alignment?: 'top' | 'center' | 'bottom';
  }
): Component {
  return {
    id: `row-${uuidv4()}`,
    type: 'horizontal_layout',
    label: 'Row Layout',
    fieldId: '', // Not used for data collection
    required: false,
    validation: {},
    children: [component1, component2],
    // Add layout config to style for now since properties doesn't exist
    style: {
      display: 'flex',
      gap: layoutConfig?.spacing === 'tight' ? '8px' : layoutConfig?.spacing === 'loose' ? '24px' : '16px',
      alignItems: layoutConfig?.alignment || 'top'
    }
  };
}

/**
 * PRD auto-dissolution logic
 * Automatically dissolves horizontal layout containers when ≤1 child
 */
export interface DissolutionContext {
  rowLayout: Component;
  parentComponents: Component[];
  trigger: 'delete' | 'move_out' | 'manual';
}

export function checkAndDissolveRowContainer(context: DissolutionContext): Component[] {
  const { rowLayout, parentComponents, trigger } = context;
  
  // Step 1: Check if dissolution is needed
  if (!rowLayout.children || rowLayout.children.length > 1) {
    // Row still has multiple children - no dissolution needed
    return parentComponents;
  }
  
  // Step 2: Extract remaining children (0 or 1)
  const remainingChildren = [...(rowLayout.children || [])];
  
  // Step 3: Find row's position in parent
  const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
  
  if (rowIndex === -1) {
    console.error('Row layout not found in parent');
    return parentComponents;
  }
  
  // Step 4: Create updated components array
  const updatedComponents = [...parentComponents];
  
  // Remove row layout
  updatedComponents.splice(rowIndex, 1);
  
  // Insert remaining children at same position
  if (remainingChildren.length > 0) {
    updatedComponents.splice(rowIndex, 0, ...remainingChildren);
  }
  
  // Step 5: Log dissolution for debugging
  console.log(`Row container dissolved (${trigger}):`, {
    rowId: rowLayout.id,
    formerChildren: remainingChildren,
    rowIndex: rowIndex
  });
  
  return updatedComponents;
}

/**
 * Add component to existing row with capacity validation
 */
export function addToExistingRow(
  rowLayout: Component,
  newComponent: Component,
  targetComponent: Component,
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT
): { success: boolean; updatedRow?: Component; reason?: string } {
  
  // Step 1: Validate capacity (PRD: max 4 components)
  if (!rowLayout.children || rowLayout.children.length >= 4) {
    return {
      success: false,
      reason: 'This row already contains the maximum of 4 components.'
    };
  }
  
  // Step 2: Find target position within row
  const targetIndex = rowLayout.children.findIndex(c => c.id === targetComponent.id);
  
  if (targetIndex === -1) {
    return {
      success: false,
      reason: 'Target component not found in row.'
    };
  }
  
  // Step 3: Insert new component
  const insertIndex = dropPosition === DropPosition.LEFT ? targetIndex : targetIndex + 1;
  const updatedChildren = [...rowLayout.children];
  updatedChildren.splice(insertIndex, 0, newComponent);
  
  // Step 4: Update row layout
  const updatedRow = {
    ...rowLayout,
    children: updatedChildren
  };
  
  return {
    success: true,
    updatedRow
  };
}

/**
 * Complete horizontal layout creation with validation
 */
export interface HorizontalLayoutCreationContext {
  dragData: DragData;
  targetComponent: Component;
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT;
  parentComponents: Component[];
}

export function createHorizontalLayoutComplete(context: HorizontalLayoutCreationContext): Component[] {
  
  const { dragData, targetComponent, dropPosition, parentComponents } = context;
  
  // Step 1: Get or create the dragged component
  let draggedComponent: Component;
  
  if (dragData.dragType === 'new-item') {
    // CREATE new component from palette
    draggedComponent = createComponent(dragData.componentType);
  } else {
    // USE existing component (will be removed from old position)
    draggedComponent = dragData.item!;
  }
  
  // Step 2: Check if target is already in a horizontal layout
  const targetInRow = findParentRowLayout(targetComponent, parentComponents);
  
  if (targetInRow) {
    // Target is already in a row - try to add to existing row
    const result = addToExistingRow(targetInRow, draggedComponent, targetComponent, dropPosition);
    
    if (!result.success) {
      console.error('Failed to add to existing row:', result.reason);
      return parentComponents;
    }
    
    // Replace the row in parent components
    const updatedComponents = [...parentComponents];
    const rowIndex = updatedComponents.findIndex(c => c.id === targetInRow.id);
    if (rowIndex !== -1) {
      updatedComponents[rowIndex] = result.updatedRow!;
    }
    
    return updatedComponents;
  }
  
  // Step 3: Create new horizontal layout container
  const newRowLayout = createHorizontalLayout(
    draggedComponent, 
    targetComponent,
    {
      distribution: 'equal',
      spacing: 'normal',
      alignment: 'top'
    }
  );
  
  // Step 4: Replace target component with new row layout
  const targetIndex = parentComponents.findIndex(c => c.id === targetComponent.id);
  const updatedComponents = [...parentComponents];
  updatedComponents.splice(targetIndex, 1, newRowLayout);
  
  return updatedComponents;
}

/**
 * Helper: Find parent row layout for a component
 */
function findParentRowLayout(
  targetComponent: Component,
  components: Component[]
): Component | null {
  
  for (const component of components) {
    if (component.type === 'horizontal_layout') {
      // Search within this row's children
      const childIndex = component.children?.findIndex(c => c.id === targetComponent.id);
      if (childIndex !== undefined && childIndex !== -1) {
        return component;
      }
    }
  }
  
  return null;
}

/**
 * PRD row layout dragging implementation
 * Row layouts can ONLY be repositioned vertically (top/bottom)
 */
export interface RowDragData {
  dragType: 'existing-item';
  sourceId: string;              // Row layout ID
  componentType: 'horizontal_layout';
  item: Component; // Entire row
  isRowLayout: true;              // Flag for special handling
}

export function createRowDragData(rowLayout: Component): RowDragData {
  return {
    dragType: 'existing-item',
    sourceId: rowLayout.id,
    componentType: 'horizontal_layout',
    item: rowLayout,
    isRowLayout: true
  };
}

/**
 * PRD row layout validation - strict constraints
 */
export function validateRowLayoutDrop(
  dragData: RowDragData,
  targetComponent: Component,
  dropPosition: DropPosition
): { valid: boolean; reason?: string } {
  
  // Rule 1: Row layouts can ONLY be positioned vertically (top/bottom)
  if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
    return {
      valid: false,
      reason: 'Row layouts can only be repositioned vertically. Use top or bottom drop zones.'
    };
  }
  
  // Rule 2: Cannot drop row inside another row (no nesting)
  if (targetComponent.type === 'horizontal_layout') {
    // Dropping on another row - only BEFORE or AFTER allowed
    if (dropPosition !== DropPosition.BEFORE && dropPosition !== DropPosition.AFTER) {
      return {
        valid: false,
        reason: 'Cannot nest row layouts inside other rows. Drop above or below instead.'
      };
    }
  }
  
  // Rule 3: Cannot drop row inside its own children (circular reference)
  const draggedRow = dragData.item;
  if (draggedRow.children?.some(c => c.id === targetComponent.id)) {
    return {
      valid: false,
      reason: 'Cannot drop row inside its own children.'
    };
  }
  
  // Valid drop
  return { valid: true };
}

/**
 * PRD row layout move implementation
 */
export function moveRowLayout(
  rowLayout: Component,
  targetComponent: Component,
  dropPosition: DropPosition.BEFORE | DropPosition.AFTER,
  parentComponents: Component[]
): Component[] {
  
  // Step 1: Validate drop
  const dragData = createRowDragData(rowLayout);
  const validation = validateRowLayoutDrop(dragData, targetComponent, dropPosition);
  
  if (!validation.valid) {
    console.error('Row layout drop invalid:', validation.reason);
    return parentComponents;
  }
  
  // Step 2: Find current and target indices
  const currentIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
  const targetContext = findComponentWithContext(targetComponent, parentComponents);
  
  if (currentIndex === -1 || targetContext.targetIndex === -1) {
    console.error('Row or target not found');
    return parentComponents;
  }
  
  // Step 3: Remove row from current position
  const updatedComponents = [...parentComponents];
  updatedComponents.splice(currentIndex, 1);
  
  // Step 4: Adjust target index if needed (if removing before target)
  let adjustedTargetIndex = targetContext.targetIndex;
  if (currentIndex < targetContext.targetIndex) {
    adjustedTargetIndex--;
  }
  
  // Step 5: Insert at new position
  const insertIndex = dropPosition === DropPosition.BEFORE ? adjustedTargetIndex : adjustedTargetIndex + 1;
  updatedComponents.splice(insertIndex, 0, rowLayout);
  
  // Step 6: Log the move for debugging
  console.log(`Row layout moved:`, {
    rowId: rowLayout.id,
    fromIndex: currentIndex,
    toIndex: insertIndex,
    dropPosition: dropPosition,
    childrenCount: rowLayout.children?.length || 0
  });
  
  return updatedComponents;
}

/**
 * Helper: Find component with context for row operations
 */
interface ComponentContext {
  targetIndex: number;
  isInRow: boolean;
  rowLayout?: Component;
  parentComponents: Component[];
}

function findComponentWithContext(
  target: Component,
  components: Component[]
): ComponentContext {
  
  // Search top-level components
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    
    // Direct match
    if (component.id === target.id) {
      return {
        targetIndex: i,
        isInRow: false,
        parentComponents: components
      };
    }
    
    // Search within horizontal layouts
    if (component.type === 'horizontal_layout') {
      const rowLayout = component;
      const childIndex = rowLayout.children?.findIndex(c => c.id === target.id);
      
      if (childIndex !== undefined && childIndex !== -1) {
        return {
          targetIndex: i, // Row's index in parent
          isInRow: true,
          rowLayout: rowLayout,
          parentComponents: components
        };
      }
    }
  }
  
  // Not found
  return {
    targetIndex: -1,
    isInRow: false,
    parentComponents: components
  };
}

/**
 * PRD: Check for circular reference in row dragging
 */
function isChildOfRow(
  targetComponent: Component,
  potentialParentRow: Component
): boolean {
  
  if (!potentialParentRow.children) {
    return false;
  }
  
  // Check if target is a direct child
  if (potentialParentRow.children.some(c => c.id === targetComponent.id)) {
    return true;
  }
  
  // Recursively check nested rows (though PRD says no nesting)
  for (const child of potentialParentRow.children) {
    if (child.type === 'horizontal_layout') {
      if (isChildOfRow(targetComponent, child)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Handles smart drop logic
 * Returns: { components: Component[], selectedId: string }
 */
export function handleSmartDrop(
  components: Component[],
  componentType: ComponentType,
  dropZone: DropZoneInfo
): { components: Component[]; selectedId: string } {
  const newComponent = createComponent(componentType);

  // Simple case: drop at specific index (no target component)
  if (!dropZone.targetComponentId) {
    const newComponents = [...components];
    newComponents.splice(dropZone.index, 0, newComponent);
    return { components: newComponents, selectedId: newComponent.id };
  }

  // Find target component
  const targetIndex = components.findIndex(c => c.id === dropZone.targetComponentId);
  if (targetIndex === -1) {
    // Target not found, append to end
    return { components: [...components, newComponent], selectedId: newComponent.id };
  }

  const targetComponent = components[targetIndex];
  const newComponents = [...components];

  // Handle different drop positions
  switch (dropZone.position) {
    case 'before':
      // Insert before target
      newComponents.splice(targetIndex, 0, newComponent);
      break;

    case 'after':
      // Insert after target
      newComponents.splice(targetIndex + 1, 0, newComponent);
      break;

    case 'left':
    case 'right':
      // Create horizontal layout
      const existingComponent = newComponents[targetIndex];
      const horizontalLayout = dropZone.position === 'left'
        ? createHorizontalLayout(newComponent, existingComponent)
        : createHorizontalLayout(existingComponent, newComponent);

      // Replace existing component with layout
      newComponents[targetIndex] = horizontalLayout;
      break;

    case 'inside':
      // Drop inside layout component
      if (targetComponent.type === 'horizontal_layout' || targetComponent.type === 'vertical_layout') {
        const updatedTarget = {
          ...targetComponent,
          children: [...(targetComponent.children || []), newComponent]
        };
        newComponents[targetIndex] = updatedTarget;
      } else {
        // Not a layout, insert after
        newComponents.splice(targetIndex + 1, 0, newComponent);
      }
      break;
  }

  return { components: newComponents, selectedId: newComponent.id };
}

/**
 * Insert component into nested layout
 */
export function insertIntoNestedLayout(
  components: Component[],
  componentType: ComponentType,
  parentLayoutId: string,
  position?: number
): { components: Component[]; selectedId: string } {
  const newComponent = createComponent(componentType);

  const insertIntoChildren = (comps: Component[]): Component[] => {
    return comps.map(comp => {
      if (comp.id === parentLayoutId) {
        const children = comp.children || [];
        const insertIndex = position !== undefined ? position : children.length;
        const newChildren = [...children];
        newChildren.splice(insertIndex, 0, newComponent);

        return {
          ...comp,
          children: newChildren
        };
      }

      // Recursively search in children
      if (comp.children) {
        return {
          ...comp,
          children: insertIntoChildren(comp.children)
        };
      }

      return comp;
    });
  };

  return {
    components: insertIntoChildren(components),
    selectedId: newComponent.id
  };
}
