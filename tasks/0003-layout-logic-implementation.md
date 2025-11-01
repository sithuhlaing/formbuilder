# Visual Form Builder - Layout Logic Implementation Guide

**📊 For visual flowcharts of all this logic, see: `0004-layout-logic-flowcharts.md`**

This document contains detailed algorithms and code. For visual understanding, refer to the flowcharts document first.

---

## Document Purpose

This document contains the **complete business logic** for the drag-drop layout system. Every scenario, edge case, and decision tree is documented here for implementation.

**Target Audience:** Developers implementing the core layout engine

---

## Table of Contents

1. [Core Layout Principles](#core-layout-principles)
2. [Drag Source Detection](#drag-source-detection)
3. [Drop Position Detection](#drop-position-detection)
4. [Horizontal Layout Creation](#horizontal-layout-creation)
5. [Vertical Layout Management](#vertical-layout-management)
6. [Auto-Dissolution Logic](#auto-dissolution-logic)
7. [Row Layout Dragging](#row-layout-dragging)
8. [Mixed Layout Transitions](#mixed-layout-transitions)
9. [Validation & Constraints](#validation--constraints)
10. [Complete Implementation Examples](#complete-implementation-examples)

---

## Core Layout Principles

### Principle 1: Canvas is ALWAYS Column Layout

```typescript
// IMMUTABLE RULE: Canvas structure never changes
const CANVAS_STRUCTURE = {
  type: 'canvas',
  layout: 'column', // ALWAYS - never changes
  children: [
    // Can contain:
    // - Standalone components (rendered vertically)
    // - Horizontal layout containers (rendered vertically but contain horizontal children)
  ]
};
```

**Critical Understanding:**
- Canvas = Column = Vertical arrangement = ALWAYS
- Horizontal layouts are CONTAINERS inside the column, not a replacement for it
- Adding a horizontal layout doesn't change canvas from column to something else

### Principle 2: Drop Position Determines Behavior

```typescript
enum DropPosition {
  BEFORE = 'before',  // Top 30% → Insert in column above target
  AFTER = 'after',    // Bottom 30% → Insert in column below target
  LEFT = 'left',      // Left 20% → Create/expand horizontal layout
  RIGHT = 'right',    // Right 20% → Create/expand horizontal layout
  CENTER = 'center',  // Middle 60% → Special handling (usually blocked)
  INSIDE = 'inside'   // Container drop (rare, specific cases)
}

// THE GOLDEN RULE:
// Top/Bottom = Column positioning (vertical)
// Left/Right = Row creation/expansion (horizontal)
```

### Principle 3: Two Drag Sources

```typescript
enum DragType {
  NEW_ITEM = 'new-item',        // From palette → CREATE new component
  EXISTING_ITEM = 'existing-item' // From canvas → MOVE existing component
}

// CRITICAL DIFFERENCE:
// new-item: Creates NEW component, palette item stays
// existing-item: Moves SAME component, removes from old position
```

---

## Drag Source Detection

### Implementation

```typescript
interface DragData {
  dragType: 'new-item' | 'existing-item';
  sourceId?: string;           // Only for existing-item
  componentType: ComponentType; // Component being dragged
  item: any;                   // Full component data (for existing-item)
}

function handleDragStart(event: DragEvent, source: 'palette' | 'canvas', component: any) {
  let dragData: DragData;
  
  if (source === 'palette') {
    // Creating NEW component from palette
    dragData = {
      dragType: 'new-item',
      componentType: component.type,
      item: null // No existing item, will create fresh
    };
  } else {
    // Moving EXISTING component from canvas
    dragData = {
      dragType: 'existing-item',
      sourceId: component.id,
      componentType: component.type,
      item: component // Full component with all properties
    };
  }
  
  event.dataTransfer.setData('application/json', JSON.stringify(dragData));
}
```

### Decision Tree

```
┌─────────────────────┐
│   Drag Started      │
└──────────┬──────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
    Source: Palette                       Source: Canvas
           │                                     │
           ▼                                     ▼
    ┌──────────────┐                     ┌──────────────┐
    │  NEW_ITEM    │                     │EXISTING_ITEM │
    │              │                     │              │
    │ Action:      │                     │ Action:      │
    │ CREATE new   │                     │ MOVE existing│
    │ component    │                     │ component    │
    │              │                     │              │
    │ Palette item │                     │ Remove from  │
    │ stays visible│                     │ old position │
    └──────────────┘                     └──────────────┘
```

---

## Drop Position Detection

### Algorithm with Edge Cases

```typescript
interface DropZoneConfig {
  // Percentages for position detection
  horizontalEdge: number;   // 0.2 = 20% (left/right)
  verticalEdge: number;     // 0.3 = 30% (top/bottom)
  centerBlocked: boolean;   // Whether center is valid drop zone
}

const DEFAULT_CONFIG: DropZoneConfig = {
  horizontalEdge: 0.2,
  verticalEdge: 0.3,
  centerBlocked: true // For row interiors
};

function calculateDropPosition(
  mouseX: number,
  mouseY: number,
  targetElement: HTMLElement,
  targetComponent: FormComponentData,
  config: DropZoneConfig = DEFAULT_CONFIG
): DropPosition | null {
  
  const rect = targetElement.getBoundingClientRect();
  
  // Calculate percentages
  const xPercent = (mouseX - rect.left) / rect.width;
  const yPercent = (mouseY - rect.top) / rect.height;
  
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
```

### Edge Case Handling

#### Edge Case 1: Corner Drops

```typescript
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
  return null;
}
```

#### Edge Case 2: Drops on Row Layouts

```typescript
function getDropPositionForRowLayout(
  mouseX: number,
  mouseY: number,
  rowElement: HTMLElement,
  rowComponent: HorizontalLayoutComponent
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
  // Find which child component is under the mouse
  const childUnderMouse = findChildComponentAtPosition(mouseX, mouseY, rowComponent);
  
  if (childUnderMouse) {
    // Apply standard detection to child component
    return calculateDropPosition(mouseX, mouseY, childUnderMouse.element, childUnderMouse.component);
  }
  
  // Gap between children in row
  return null;
}
```

### Visual Feedback Implementation

```typescript
interface DropIndicator {
  type: 'line' | 'outline' | 'blocked';
  position: DropPosition;
  color: 'blue' | 'red';
  thickness: number;
}

function showDropIndicator(
  targetElement: HTMLElement,
  position: DropPosition,
  isValid: boolean
): DropIndicator {
  
  const indicator: DropIndicator = {
    type: isValid ? 'line' : 'blocked',
    position: position,
    color: isValid ? 'blue' : 'red',
    thickness: 2
  };
  
  // Remove any existing indicators
  removeAllDropIndicators();
  
  // Create and position indicator
  const indicatorElement = document.createElement('div');
  indicatorElement.className = 'drop-indicator';
  indicatorElement.style.position = 'absolute';
  indicatorElement.style.pointerEvents = 'none';
  indicatorElement.style.zIndex = '9999';
  
  const rect = targetElement.getBoundingClientRect();
  
  switch (position) {
    case DropPosition.BEFORE:
      // Horizontal line above element
      indicatorElement.style.top = `${rect.top}px`;
      indicatorElement.style.left = `${rect.left}px`;
      indicatorElement.style.width = `${rect.width}px`;
      indicatorElement.style.height = `${indicator.thickness}px`;
      indicatorElement.style.backgroundColor = indicator.color;
      break;
      
    case DropPosition.AFTER:
      // Horizontal line below element
      indicatorElement.style.top = `${rect.bottom}px`;
      indicatorElement.style.left = `${rect.left}px`;
      indicatorElement.style.width = `${rect.width}px`;
      indicatorElement.style.height = `${indicator.thickness}px`;
      indicatorElement.style.backgroundColor = indicator.color;
      break;
      
    case DropPosition.LEFT:
      // Vertical line on left edge
      indicatorElement.style.top = `${rect.top}px`;
      indicatorElement.style.left = `${rect.left}px`;
      indicatorElement.style.width = `${indicator.thickness}px`;
      indicatorElement.style.height = `${rect.height}px`;
      indicatorElement.style.backgroundColor = indicator.color;
      break;
      
    case DropPosition.RIGHT:
      // Vertical line on right edge
      indicatorElement.style.top = `${rect.top}px`;
      indicatorElement.style.left = `${rect.right}px`;
      indicatorElement.style.width = `${indicator.thickness}px`;
      indicatorElement.style.height = `${rect.height}px`;
      indicatorElement.style.backgroundColor = indicator.color;
      break;
      
    default:
      // Blocked indicator (red overlay)
      indicatorElement.style.top = `${rect.top}px`;
      indicatorElement.style.left = `${rect.left}px`;
      indicatorElement.style.width = `${rect.width}px`;
      indicatorElement.style.height = `${rect.height}px`;
      indicatorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      indicatorElement.style.cursor = 'not-allowed';
      break;
  }
  
  document.body.appendChild(indicatorElement);
  
  return indicator;
}
```

---

## Horizontal Layout Creation

### Complete Creation Logic

```typescript
interface HorizontalLayoutCreationContext {
  dragData: DragData;
  targetComponent: FormComponentData;
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT;
  parentComponents: FormComponentData[];
}

function createHorizontalLayout(context: HorizontalLayoutCreationContext): FormComponentData[] {
  
  const { dragData, targetComponent, dropPosition, parentComponents } = context;
  
  // Step 1: Get or create the dragged component
  let draggedComponent: FormComponentData;
  
  if (dragData.dragType === 'new-item') {
    // CREATE new component from palette
    draggedComponent = ComponentEngine.createComponent(dragData.componentType);
  } else {
    // USE existing component (will be removed from old position)
    draggedComponent = dragData.item;
  }
  
  // Step 2: Check if target is already in a horizontal layout
  const targetInRow = findParentRowLayout(targetComponent, parentComponents);
  
  if (targetInRow) {
    // Target is already in a row - try to add to existing row
    return addToExistingRow(targetInRow, draggedComponent, targetComponent, dropPosition);
  }
  
  // Step 3: Create new horizontal layout container
  const newRowLayout: HorizontalLayoutComponent = {
    type: 'horizontal_layout',
    id: generateUniqueId('row'),
    fieldId: '', // Not used for data collection
    label: 'Row Layout',
    required: false,
    validation: {},
    properties: {},
    children: [],
    layoutConfig: {
      distribution: 'equal',
      spacing: 'normal',
      alignment: 'top'
    }
  };
  
  // Step 4: Arrange children based on drop position
  if (dropPosition === DropPosition.LEFT) {
    newRowLayout.children = [draggedComponent, targetComponent];
  } else {
    newRowLayout.children = [targetComponent, draggedComponent];
  }
  
  // Step 5: Replace target component with new row layout
  const targetIndex = parentComponents.indexOf(targetComponent);
  const updatedComponents = [...parentComponents];
  updatedComponents.splice(targetIndex, 1, newRowLayout);
  
  // Step 6: If dragged component was existing, remove from old position
  if (dragData.dragType === 'existing-item') {
    const oldIndex = updatedComponents.findIndex(c => c.id === draggedComponent.id);
    if (oldIndex !== -1 && oldIndex !== targetIndex) {
      updatedComponents.splice(oldIndex, 1);
    }
  }
  
  // Step 7: Add to undo history
  addToHistory({
    type: 'CREATE_HORIZONTAL_LAYOUT',
    payload: {
      rowId: newRowLayout.id,
      children: newRowLayout.children,
      replacedComponent: targetComponent
    }
  });
  
  return updatedComponents;
}
```

### Adding to Existing Row

```typescript
function addToExistingRow(
  rowLayout: HorizontalLayoutComponent,
  newComponent: FormComponentData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT
): FormComponentData[] {
  
  // Step 1: Validate capacity
  if (rowLayout.children.length >= 4) {
    showError({
      title: 'Cannot Add Component',
      message: 'This row already contains the maximum of 4 components.',
      suggestions: [
        'Drop above or below this row instead',
        'Create a new row by dropping beside a different component',
        'Remove a component from this row first'
      ]
    });
    return null; // Drop rejected
  }
  
  // Step 2: Find target position within row
  const targetIndex = rowLayout.children.findIndex(c => c.id === targetComponent.id);
  
  if (targetIndex === -1) {
    console.error('Target component not found in row');
    return null;
  }
  
  // Step 3: Insert new component
  const insertIndex = dropPosition === DropPosition.LEFT ? targetIndex : targetIndex + 1;
  const updatedChildren = [...rowLayout.children];
  updatedChildren.splice(insertIndex, 0, newComponent);
  
  // Step 4: Update row layout
  rowLayout.children = updatedChildren;
  
  // Step 5: Add to undo history
  addToHistory({
    type: 'ADD_TO_HORIZONTAL_LAYOUT',
    payload: {
      rowId: rowLayout.id,
      componentId: newComponent.id,
      insertIndex: insertIndex
    }
  });
  
  return [rowLayout]; // Return updated row
}
```

### Decision Tree for Horizontal Layout

```
Drop LEFT or RIGHT of component
           │
           ▼
    ┌──────────────┐
    │ Is target in │
    │ row already? │
    └──────┬───────┘
           │
           ├──────────────────────────────┐
           │                              │
        NO │                           YES│
           │                              │
           ▼                              ▼
    ┌──────────────┐              ┌──────────────┐
    │Create NEW row│              │Check capacity│
    │              │              │   (4 max)    │
    │[target, new] │              └──────┬───────┘
    │   or         │                     │
    │[new, target] │              ┌──────┴───────┐
    └──────────────┘              │              │
                               FULL│         OK  │
                                   │              │
                                   ▼              ▼
                            ┌──────────┐   ┌──────────┐
                            │Show error│   │Add to row│
                            │Reject    │   │Update    │
                            │drop      │   │children  │
                            └──────────┘   └──────────┘
```

---

## Vertical Layout Management

### Insert Before/After Logic

```typescript
function insertInColumnLayout(
  components: FormComponentData[],
  newComponent: FormComponentData,
  targetComponent: FormComponentData,
  position: DropPosition.BEFORE | DropPosition.AFTER
): FormComponentData[] {
  
  // Step 1: Find target index (may be nested in row layout)
  const { targetIndex, isInRow, rowLayout } = findComponentWithContext(targetComponent, components);
  
  if (targetIndex === -1) {
    console.error('Target component not found');
    return components;
  }
  
  // Step 2: Determine insert index
  let insertIndex: number;
  
  if (isInRow) {
    // Target is in a row - insert relative to the ROW, not the component
    const rowIndex = components.findIndex(c => c.id === rowLayout.id);
    insertIndex = position === DropPosition.BEFORE ? rowIndex : rowIndex + 1;
  } else {
    // Target is standalone - insert directly
    insertIndex = position === DropPosition.BEFORE ? targetIndex : targetIndex + 1;
  }
  
  // Step 3: Insert component
  const updatedComponents = [...components];
  updatedComponents.splice(insertIndex, 0, newComponent);
  
  // Step 4: Add to history
  addToHistory({
    type: 'INSERT_COMPONENT',
    payload: {
      componentId: newComponent.id,
      insertIndex: insertIndex,
      position: position
    }
  });
  
  return updatedComponents;
}
```

### Helper Function: Find Component with Context

```typescript
interface ComponentContext {
  targetIndex: number;
  isInRow: boolean;
  rowLayout?: HorizontalLayoutComponent;
  parentComponents: FormComponentData[];
}

function findComponentWithContext(
  target: FormComponentData,
  components: FormComponentData[]
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
      const rowLayout = component as HorizontalLayoutComponent;
      const childIndex = rowLayout.children.findIndex(c => c.id === target.id);
      
      if (childIndex !== -1) {
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
```

---

## Auto-Dissolution Logic

### Complete Dissolution Implementation

```typescript
interface DissolutionContext {
  rowLayout: HorizontalLayoutComponent;
  parentComponents: FormComponentData[];
  trigger: 'delete' | 'move_out' | 'manual';
}

function checkAndDissolveRowContainer(context: DissolutionContext): FormComponentData[] {
  
  const { rowLayout, parentComponents, trigger } = context;
  
  // Step 1: Check if dissolution is needed
  if (rowLayout.children.length > 1) {
    // Row still has multiple children - no dissolution needed
    return parentComponents;
  }
  
  // Step 2: Extract remaining children (0 or 1)
  const remainingChildren = [...rowLayout.children];
  
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
  
  // Step 5: Show notification to user
  let message: string;
  
  if (remainingChildren.length === 1) {
    message = 'Row container dissolved (≤1 child). Component promoted to column level.';
  } else {
    message = 'Row container dissolved (empty). Layout updated.';
  }
  
  showNotification({
    type: 'info',
    message: message,
    duration: 3000
  });
  
  // Step 6: Add to undo history
  addToHistory({
    type: 'DISSOLVE_HORIZONTAL_LAYOUT',
    payload: {
      rowId: rowLayout.id,
      formerChildren: remainingChildren,
      rowIndex: rowIndex,
      trigger: trigger
    }
  });
  
  return updatedComponents;
}
```

### Dissolution Scenarios (All Cases)

#### Scenario 1: Delete from 2-Element Row

```typescript
function handleDeleteFromTwoElementRow(
  componentToDelete: FormComponentData,
  rowLayout: HorizontalLayoutComponent,
  parentComponents: FormComponentData[]
): FormComponentData[] {
  
  // Before: rowLayout.children = [Component A, Component B]
  
  // Step 1: Remove component from row
  const updatedChildren = rowLayout.children.filter(c => c.id !== componentToDelete.id);
  rowLayout.children = updatedChildren;
  
  // Step 2: Check dissolution (now 1 child)
  const result = checkAndDissolveRowContainer({
    rowLayout: rowLayout,
    parentComponents: parentComponents,
    trigger: 'delete'
  });
  
  // After: result = [Component A] (or [Component B]) - standalone in column
  
  return result;
}
```

#### Scenario 2: Drag Out from 2-Element Row

```typescript
function handleDragOutFromTwoElementRow(
  componentBeingDragged: FormComponentData,
  rowLayout: HorizontalLayoutComponent,
  parentComponents: FormComponentData[]
): FormComponentData[] {
  
  // Before: rowLayout.children = [Component A, Component B]
  
  // Step 1: Component is being dragged out (not removed yet)
  // This is handled during the drop operation
  
  // Step 2: When drop completes, remove from row
  const updatedChildren = rowLayout.children.filter(c => c.id !== componentBeingDragged.id);
  rowLayout.children = updatedChildren;
  
  // Step 3: Check dissolution (now 1 child)
  const result = checkAndDissolveRowContainer({
    rowLayout: rowLayout,
    parentComponents: parentComponents,
    trigger: 'move_out'
  });
  
  // After: result = [Component A, Component B] - both standalone in column
  // (Component B is wherever it was dropped, Component A is promoted)
  
  return result;
}
```

#### Scenario 3: Drag Out from 3-Element Row (No Dissolution)

```typescript
function handleDragOutFromThreeElementRow(
  componentBeingDragged: FormComponentData,
  rowLayout: HorizontalLayoutComponent,
  parentComponents: FormComponentData[]
): FormComponentData[] {
  
  // Before: rowLayout.children = [Component A, Component B, Component C]
  
  // Step 1: Remove component from row
  const updatedChildren = rowLayout.children.filter(c => c.id !== componentBeingDragged.id);
  rowLayout.children = updatedChildren;
  
  // Step 2: Check dissolution (now 2 children)
  const result = checkAndDissolveRowContainer({
    rowLayout: rowLayout,
    parentComponents: parentComponents,
    trigger: 'move_out'
  });
  
  // After: rowLayout.children = [Component A, Component B] - row preserved!
  // No dissolution because still has 2 children
  
  return result; // Returns parentComponents unchanged (row still exists)
}
```

#### Scenario 4: Manual Dissolution (User Triggered)

```typescript
function handleManualDissolution(
  rowLayout: HorizontalLayoutComponent,
  parentComponents: FormComponentData[]
): FormComponentData[] {
  
  // User clicks "Dissolve Row" button in properties panel
  
  // Extract all children regardless of count
  const allChildren = [...rowLayout.children];
  
  // Force dissolution
  const rowIndex = parentComponents.findIndex(c => c.id === rowLayout.id);
  const updatedComponents = [...parentComponents];
  
  // Remove row, replace with children
  updatedComponents.splice(rowIndex, 1, ...allChildren);
  
  // Show notification
  showNotification({
    type: 'success',
    message: `Row dissolved. ${allChildren.length} component(s) converted to standalone.`,
    duration: 3000
  });
  
  // Add to history
  addToHistory({
    type: 'DISSOLVE_HORIZONTAL_LAYOUT',
    payload: {
      rowId: rowLayout.id,
      formerChildren: allChildren,
      rowIndex: rowIndex,
      trigger: 'manual'
    }
  });
  
  return updatedComponents;
}
```

### Dissolution Decision Tree

```
Component removed from row
           │
           ▼
┌──────────────────────┐
│ Count remaining      │
│ children in row      │
└──────────┬───────────┘
           │
           ├────────────────────────────┐
           │                            │
      ≤1 child                      >1 child
           │                            │
           ▼                            ▼
┌──────────────────────┐      ┌──────────────────┐
│ AUTO-DISSOLVE        │      │ PRESERVE ROW     │
│                      │      │                  │
│ 1. Extract children  │      │ Row still valid  │
│ 2. Remove row        │      │ No action needed │
│ 3. Promote to column │      └──────────────────┘
│ 4. Show notification │
│ 5. Add to history    │
└──────────────────────┘
```

---

## Row Layout Dragging

### Row as Single Unit Logic

```typescript
interface RowDragData {
  dragType: 'existing-item';
  sourceId: string;              // Row layout ID
  componentType: 'horizontal_layout';
  item: HorizontalLayoutComponent; // Entire row
  isRowLayout: true;              // Flag for special handling
}

function handleRowLayoutDragStart(
  event: DragEvent,
  rowLayout: HorizontalLayoutComponent
): void {
  
  const dragData: RowDragData = {
    dragType: 'existing-item',
    sourceId: rowLayout.id,
    componentType: 'horizontal_layout',
    item: rowLayout,
    isRowLayout: true
  };
  
  event.dataTransfer.setData('application/json', JSON.stringify(dragData));
  
  // Visual feedback - entire row ghosted
  event.dataTransfer.setDragImage(
    createRowDragPreview(rowLayout),
    0,
    0
  );
}

function createRowDragPreview(rowLayout: HorizontalLayoutComponent): HTMLElement {
  const preview = document.createElement('div');
  preview.style.opacity = '0.7';
  preview.style.border = '2px dashed blue';
  preview.style.padding = '10px';
  preview.innerHTML = `
    <div>Row Layout (${rowLayout.children.length}/4)</div>
    <div style="display: flex; gap: 10px;">
      ${rowLayout.children.map(c => `<div>${c.label}</div>`).join('')}
    </div>
  `;
  document.body.appendChild(preview);
  return preview;
}
```

### Row Drop Validation

```typescript
function validateRowLayoutDrop(
  dragData: RowDragData,
  targetComponent: FormComponentData,
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
  const draggedRow = dragData.item as HorizontalLayoutComponent;
  if (draggedRow.children.some(c => c.id === targetComponent.id)) {
    return {
      valid: false,
      reason: 'Cannot drop row inside its own children.'
    };
  }
  
  // Valid drop
  return { valid: true };
}
```

### Row Layout Move Implementation

```typescript
function moveRowLayout(
  rowLayout: HorizontalLayoutComponent,
  targetComponent: FormComponentData,
  dropPosition: DropPosition.BEFORE | DropPosition.AFTER,
  parentComponents: FormComponentData[]
): FormComponentData[] {
  
  // Step 1: Validate drop
  const validation = validateRowLayoutDrop(
    { dragType: 'existing-item', sourceId: rowLayout.id, componentType: 'horizontal_layout', item: rowLayout, isRowLayout: true },
    targetComponent,
    dropPosition
  );
  
  if (!validation.valid) {
    showError({ title: 'Invalid Drop', message: validation.reason });
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
  
  // Step 6: Add to history
  addToHistory({
    type: 'MOVE_ROW_LAYOUT',
    payload: {
      rowId: rowLayout.id,
      fromIndex: currentIndex,
      toIndex: insertIndex
    }
  });
  
  return updatedComponents;
}
```

### Row Dragging Constraints

```typescript
const ROW_LAYOUT_CONSTRAINTS = {
  // Allowed drop positions
  allowedDropPositions: [
    DropPosition.BEFORE,  // Above target
    DropPosition.AFTER    // Below target
  ],
  
  // Blocked drop positions
  blockedDropPositions: [
    DropPosition.LEFT,    // No horizontal positioning
    DropPosition.RIGHT,   // No horizontal positioning
    DropPosition.INSIDE,  // No nesting in components
    DropPosition.CENTER   // No center drops
  ],
  
  // Validation rules
  rules: {
    noNesting: true,              // Cannot nest rows in rows
    noCircularReference: true,    // Cannot drop in own children
    onlyVerticalReposition: true, // Only up/down movement
    preserveIntegrity: true       // All children move together
  }
};

function validateRowDragDrop(
  dragData: RowDragData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition
): boolean {
  
  // Check allowed positions
  if (!ROW_LAYOUT_CONSTRAINTS.allowedDropPositions.includes(dropPosition)) {
    return false;
  }
  
  // Check nesting
  if (ROW_LAYOUT_CONSTRAINTS.rules.noNesting && targetComponent.type === 'horizontal_layout') {
    if (dropPosition !== DropPosition.BEFORE && dropPosition !== DropPosition.AFTER) {
      return false;
    }
  }
  
  // Check circular reference
  if (ROW_LAYOUT_CONSTRAINTS.rules.noCircularReference) {
    const draggedRow = dragData.item as HorizontalLayoutComponent;
    if (isChildOfRow(targetComponent, draggedRow)) {
      return false;
    }
  }
  
  return true;
}
```

---

## Mixed Layout Transitions

### Complete Element Count Transitions

#### Transition: 0 → 1 Element

```typescript
function handleFirstComponentAdd(
  components: FormComponentData[],
  newComponent: FormComponentData
): FormComponentData[] {
  
  // State: Empty canvas
  // Action: Add first component
  // Result: Single component in column layout
  
  return [newComponent];
  
  // Canvas structure:
  // Canvas (Column)
  // └── Component A
}
```

#### Transition: 1 → 2 Elements (Decision Point)

```typescript
function handleSecondComponentAdd(
  components: FormComponentData[],
  newComponent: FormComponentData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition
): FormComponentData[] {
  
  // State: One component in column
  // Action: Add second component
  // Result: Depends on drop position
  
  if (dropPosition === DropPosition.BEFORE || dropPosition === DropPosition.AFTER) {
    // OPTION A: Vertical (Column Layout)
    return insertInColumnLayout(components, newComponent, targetComponent, dropPosition);
    
    // Canvas structure:
    // Canvas (Column)
    // ├── Component A
    // └── Component B
    
  } else if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
    // OPTION B: Horizontal (Row Created)
    return createHorizontalLayout({
      dragData: { dragType: 'new-item', componentType: newComponent.type },
      targetComponent: targetComponent,
      dropPosition: dropPosition,
      parentComponents: components
    });
    
    // Canvas structure:
    // Canvas (Column)
    // └── Row Layout
    //     ├── Component A
    //     └── Component B
  }
}
```

#### Transition: 2 → 3 Elements (Multiple Paths)

```typescript
function handleThirdComponentAdd(
  components: FormComponentData[],
  newComponent: FormComponentData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition
): FormComponentData[] {
  
  // Current state could be:
  // Path A: Two components in column
  // Path B: One row with two components
  
  // Check current structure
  const hasRowLayout = components.some(c => c.type === 'horizontal_layout');
  
  if (!hasRowLayout) {
    // PATH A: From column layout with 2 components
    // Same options as 1→2 transition
    return handleSecondComponentAdd(components, newComponent, targetComponent, dropPosition);
    
  } else {
    // PATH B: From row layout with 2 components
    const rowLayout = components.find(c => c.type === 'horizontal_layout') as HorizontalLayoutComponent;
    
    if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
      // OPTION 1: Expand row (if capacity allows)
      if (rowLayout.children.length < 4) {
        return addToExistingRow(rowLayout, newComponent, targetComponent, dropPosition);
        
        // Canvas structure:
        // Canvas (Column)
        // └── Row Layout
        //     ├── Component A
        //     ├── Component B
        //     └── Component C
      } else {
        // Row full - insert in column instead
        return insertInColumnLayout(components, newComponent, rowLayout, DropPosition.AFTER);
      }
      
    } else {
      // OPTION 2: Add to column (above/below row)
      return insertInColumnLayout(components, newComponent, targetComponent, dropPosition);
      
      // Canvas structure:
      // Canvas (Column)
      // ├── Component C  (new)
      // └── Row Layout
      //     ├── Component A
      //     └── Component B
    }
  }
}
```

#### Transition: 3 → 2 Elements (Dissolution Scenarios)

```typescript
function handleComponentRemovalFrom3Elements(
  components: FormComponentData[],
  componentToRemove: FormComponentData
): FormComponentData[] {
  
  // Check if component is in a row
  const context = findComponentWithContext(componentToRemove, components);
  
  if (context.isInRow) {
    // Component is in a row
    const rowLayout = context.rowLayout;
    
    // Remove component from row
    const updatedRow = {
      ...rowLayout,
      children: rowLayout.children.filter(c => c.id !== componentToRemove.id)
    };
    
    // Check dissolution
    if (updatedRow.children.length <= 1) {
      // DISSOLVE: 3 → 2 via row dissolution
      return checkAndDissolveRowContainer({
        rowLayout: updatedRow,
        parentComponents: components,
        trigger: 'delete'
      });
      
      // Result: 2 standalone components in column
      
    } else {
      // PRESERVE: Row still has 2+ components
      const updatedComponents = [...components];
      const rowIndex = updatedComponents.findIndex(c => c.id === rowLayout.id);
      updatedComponents[rowIndex] = updatedRow;
      return updatedComponents;
      
      // Result: Row with 2 components + possibly other standalone components
    }
    
  } else {
    // Component is standalone in column
    return components.filter(c => c.id !== componentToRemove.id);
    
    // Result: 2 remaining components (could be row + component, or 2 components)
  }
}
```

### Layout Complexity Matrix

```typescript
interface LayoutComplexity {
  totalComponents: number;
  standaloneComponents: number;
  rowLayouts: number;
  componentsInRows: number;
  maxRowCapacity: number;
  averageRowFill: number;
}

function analyzeLayoutComplexity(components: FormComponentData[]): LayoutComplexity {
  
  let totalComponents = 0;
  let standaloneComponents = 0;
  let rowLayouts = 0;
  let componentsInRows = 0;
  let maxRowCapacity = 0;
  
  for (const component of components) {
    if (component.type === 'horizontal_layout') {
      rowLayouts++;
      const rowLayout = component as HorizontalLayoutComponent;
      componentsInRows += rowLayout.children.length;
      maxRowCapacity = Math.max(maxRowCapacity, rowLayout.children.length);
      totalComponents += rowLayout.children.length;
    } else {
      standaloneComponents++;
      totalComponents++;
    }
  }
  
  return {
    totalComponents,
    standaloneComponents,
    rowLayouts,
    componentsInRows,
    maxRowCapacity,
    averageRowFill: rowLayouts > 0 ? componentsInRows / rowLayouts : 0
  };
}
```

---

## Validation & Constraints

### Complete Validation System

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  componentId?: string;
  severity: 'error' | 'warning';
}

function validateLayoutOperation(
  operation: 'create_row' | 'add_to_row' | 'move_component' | 'move_row' | 'delete_component',
  context: any
): ValidationResult {
  
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  switch (operation) {
    case 'create_row':
      // Validate row creation
      validateRowCreation(context, errors, warnings);
      break;
      
    case 'add_to_row':
      // Validate adding to existing row
      validateAddToRow(context, errors, warnings);
      break;
      
    case 'move_component':
      // Validate component movement
      validateComponentMove(context, errors, warnings);
      break;
      
    case 'move_row':
      // Validate row layout movement
      validateRowMove(context, errors, warnings);
      break;
      
    case 'delete_component':
      // Validate component deletion
      validateComponentDelete(context, errors, warnings);
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

### Validation Rules

```typescript
// Rule 1: Row Capacity Limit
function validateRowCapacity(
  rowLayout: HorizontalLayoutComponent,
  errors: ValidationError[]
): void {
  
  if (rowLayout.children.length > 4) {
    errors.push({
      code: 'ROW_CAPACITY_EXCEEDED',
      message: 'Row layout cannot contain more than 4 components.',
      componentId: rowLayout.id,
      severity: 'error'
    });
  }
}

// Rule 2: Minimum Row Size (for creation)
function validateRowCreation(
  context: HorizontalLayoutCreationContext,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  
  // Row must have at least 2 components at creation
  const componentCount = 2; // Target + new component
  
  if (componentCount < 2) {
    errors.push({
      code: 'ROW_MIN_SIZE',
      message: 'Row layout must contain at least 2 components.',
      severity: 'error'
    });
  }
}

// Rule 3: No Nested Rows
function validateNoNestedRows(
  targetComponent: FormComponentData,
  errors: ValidationError[]
): void {
  
  if (targetComponent.type === 'horizontal_layout') {
    errors.push({
      code: 'NESTED_ROWS_NOT_ALLOWED',
      message: 'Cannot nest horizontal layouts inside other horizontal layouts.',
      componentId: targetComponent.id,
      severity: 'error'
    });
  }
}

// Rule 4: Circular Reference Prevention
function validateNoCircularReference(
  draggedComponent: FormComponentData,
  targetComponent: FormComponentData,
  errors: ValidationError[]
): void {
  
  if (draggedComponent.type === 'horizontal_layout') {
    const draggedRow = draggedComponent as HorizontalLayoutComponent;
    
    if (draggedRow.children.some(c => c.id === targetComponent.id)) {
      errors.push({
        code: 'CIRCULAR_REFERENCE',
        message: 'Cannot drop component inside its own children.',
        componentId: draggedComponent.id,
        severity: 'error'
      });
    }
  }
}

// Rule 5: Domain Component Compatibility
function validateDomainCompatibility(
  componentType: ComponentType,
  domain: 'forms' | 'surveys' | 'workflows',
  errors: ValidationError[]
): void {
  
  const allowedComponents = domainComponents[domain];
  const allAllowed = [
    ...allowedComponents.input,
    ...allowedComponents.selection,
    ...allowedComponents.special,
    ...allowedComponents.ui
  ];
  
  if (!allAllowed.includes(componentType)) {
    errors.push({
      code: 'COMPONENT_NOT_ALLOWED_IN_DOMAIN',
      message: `Component type "${componentType}" is not available in ${domain} domain.`,
      severity: 'error'
    });
  }
}
```

### Constraint Enforcement

```typescript
const LAYOUT_CONSTRAINTS = {
  // Row layout constraints
  row: {
    minComponents: 2,        // Minimum (below triggers auto-dissolution)
    maxComponents: 4,        // Maximum capacity
    allowedDropZones: ['left', 'right'], // Internal drop zones
    noNesting: true          // Cannot nest rows in rows
  },
  
  // Column layout constraints
  column: {
    allowedDropZones: ['before', 'after'], // Top/bottom
    unlimitedComponents: true  // No max limit
  },
  
  // Component constraints
  component: {
    uniqueFieldIds: true,    // Field IDs must be unique
    requiredFields: ['type', 'id', 'fieldId', 'label'],
    validationRequired: false // Optional validation rules
  },
  
  // Domain constraints
  domain: {
    enforceComponentFilter: true, // Restrict by domain
    allowDomainSwitch: true      // Can switch domains
  }
};

function enforceConstraints(
  operation: string,
  context: any
): boolean {
  
  const validation = validateLayoutOperation(operation, context);
  
  if (!validation.valid) {
    // Show errors to user
    validation.errors.forEach(error => {
      showError({
        title: 'Operation Not Allowed',
        message: error.message
      });
    });
    
    return false;
  }
  
  // Show warnings (non-blocking)
  validation.warnings.forEach(warning => {
    showWarning({
      message: warning.message
    });
  });
  
  return true;
}
```

---

## Complete Implementation Examples

### Example 1: Full Drag-Drop Flow (New Component from Palette)

```typescript
async function handleFullDragDropFlow(
  dragData: DragData,
  targetElement: HTMLElement,
  targetComponent: FormComponentData,
  mouseX: number,
  mouseY: number,
  currentComponents: FormComponentData[]
): Promise<FormComponentData[]> {
  
  // STEP 1: Calculate drop position
  const dropPosition = calculateDropPosition(mouseX, mouseY, targetElement, targetComponent);
  
  if (!dropPosition) {
    console.error('Invalid drop position');
    return currentComponents;
  }
  
  // STEP 2: Validate drop
  const validation = validateLayoutOperation('create_row', {
    dragData,
    targetComponent,
    dropPosition,
    parentComponents: currentComponents
  });
  
  if (!validation.valid) {
    showValidationErrors(validation.errors);
    return currentComponents;
  }
  
  // STEP 3: Create new component (if from palette)
  let componentToAdd: FormComponentData;
  
  if (dragData.dragType === 'new-item') {
    componentToAdd = ComponentEngine.createComponent(dragData.componentType);
  } else {
    componentToAdd = dragData.item;
  }
  
  // STEP 4: Execute layout operation
  let updatedComponents: FormComponentData[];
  
  if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
    // Create or add to horizontal layout
    updatedComponents = createHorizontalLayout({
      dragData,
      targetComponent,
      dropPosition,
      parentComponents: currentComponents
    });
  } else {
    // Insert in column layout
    updatedComponents = insertInColumnLayout(
      currentComponents,
      componentToAdd,
      targetComponent,
      dropPosition
    );
  }
  
  // STEP 5: If moving existing component, check for dissolution at old position
  if (dragData.dragType === 'existing-item') {
    const oldContext = findComponentWithContext(componentToAdd, currentComponents);
    
    if (oldContext.isInRow) {
      updatedComponents = checkAndDissolveRowContainer({
        rowLayout: oldContext.rowLayout,
        parentComponents: updatedComponents,
        trigger: 'move_out'
      });
    }
  }
  
  // STEP 6: Select newly added component
  setSelectedComponent(componentToAdd.id);
  
  // STEP 7: Show success notification
  showNotification({
    type: 'success',
    message: `Component added successfully`,
    duration: 2000
  });
  
  // STEP 8: Trigger re-render
  return updatedComponents;
}
```

### Example 2: Complex Multi-Step Rearrangement

```typescript
async function rearrangeComponentsInComplexLayout(
  componentToMove: FormComponentData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition,
  currentComponents: FormComponentData[]
): Promise<FormComponentData[]> {
  
  // Scenario: Moving Component C from Row 1 to beside Component D in Column
  
  // Before:
  // Canvas (Column)
  // ├── Row 1 [A, B, C]
  // ├── D
  // └── E
  
  // STEP 1: Find source context
  const sourceContext = findComponentWithContext(componentToMove, currentComponents);
  
  // STEP 2: Remove from source
  let updatedComponents = [...currentComponents];
  
  if (sourceContext.isInRow) {
    const sourceRow = sourceContext.rowLayout;
    sourceRow.children = sourceRow.children.filter(c => c.id !== componentToMove.id);
    
    // Check dissolution of source row
    updatedComponents = checkAndDissolveRowContainer({
      rowLayout: sourceRow,
      parentComponents: updatedComponents,
      trigger: 'move_out'
    });
  } else {
    // Remove from column
    updatedComponents = updatedComponents.filter(c => c.id !== componentToMove.id);
  }
  
  // STEP 3: Find new target context (indices may have shifted)
  const targetContext = findComponentWithContext(targetComponent, updatedComponents);
  
  // STEP 4: Insert at target
  if (dropPosition === DropPosition.LEFT || dropPosition === DropPosition.RIGHT) {
    // Create or add to row beside target
    updatedComponents = createHorizontalLayout({
      dragData: { dragType: 'existing-item', sourceId: componentToMove.id, componentType: componentToMove.type, item: componentToMove },
      targetComponent,
      dropPosition,
      parentComponents: updatedComponents
    });
  } else {
    // Insert in column
    updatedComponents = insertInColumnLayout(
      updatedComponents,
      componentToMove,
      targetComponent,
      dropPosition
    );
  }
  
  // After:
  // Canvas (Column)
  // ├── Row 1 [A, B]  ← Row preserved (still has 2)
  // ├── Row 2 [C, D]  ← New row created
  // └── E
  
  return updatedComponents;
}
```

### Example 3: Edge Case - Moving Component Within Same Row

```typescript
function moveComponentWithinSameRow(
  componentToMove: FormComponentData,
  targetComponent: FormComponentData,
  dropPosition: DropPosition.LEFT | DropPosition.RIGHT,
  rowLayout: HorizontalLayoutComponent
): HorizontalLayoutComponent {
  
  // Special case: Rearranging within same row
  
  // Find indices
  const sourceIndex = rowLayout.children.findIndex(c => c.id === componentToMove.id);
  const targetIndex = rowLayout.children.findIndex(c => c.id === targetComponent.id);
  
  if (sourceIndex === -1 || targetIndex === -1) {
    console.error('Component not found in row');
    return rowLayout;
  }
  
  // Create new children array
  const updatedChildren = [...rowLayout.children];
  
  // Remove from source
  updatedChildren.splice(sourceIndex, 1);
  
  // Adjust target index if needed
  let adjustedTargetIndex = targetIndex;
  if (sourceIndex < targetIndex) {
    adjustedTargetIndex--;
  }
  
  // Insert at target
  const insertIndex = dropPosition === DropPosition.LEFT ? adjustedTargetIndex : adjustedTargetIndex + 1;
  updatedChildren.splice(insertIndex, 0, componentToMove);
  
  // Update row
  return {
    ...rowLayout,
    children: updatedChildren
  };
}
```

---

## Testing Checklist

### Unit Tests

```typescript
describe('Layout Logic - Drop Position Detection', () => {
  test('Top 30% returns BEFORE', () => {
    const position = calculateDropPosition(50, 10, mockElement, mockComponent);
    expect(position).toBe(DropPosition.BEFORE);
  });
  
  test('Bottom 30% returns AFTER', () => {
    const position = calculateDropPosition(50, 90, mockElement, mockComponent);
    expect(position).toBe(DropPosition.AFTER);
  });
  
  test('Left 20% returns LEFT', () => {
    const position = calculateDropPosition(10, 50, mockElement, mockComponent);
    expect(position).toBe(DropPosition.LEFT);
  });
  
  test('Right 20% returns RIGHT', () => {
    const position = calculateDropPosition(90, 50, mockElement, mockComponent);
    expect(position).toBe(DropPosition.RIGHT);
  });
  
  test('Center returns blocked for row interiors', () => {
    const rowComponent = { type: 'horizontal_layout', ...mockComponent };
    const position = calculateDropPosition(50, 50, mockElement, rowComponent);
    expect(position).toBeNull();
  });
});

describe('Layout Logic - Horizontal Layout Creation', () => {
  test('Creates row with 2 components', () => {
    const result = createHorizontalLayout(mockContext);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('horizontal_layout');
    expect(result[0].children.length).toBe(2);
  });
  
  test('Row children in correct order (LEFT)', () => {
    const context = { ...mockContext, dropPosition: DropPosition.LEFT };
    const result = createHorizontalLayout(context);
    expect(result[0].children[0].id).toBe('new-component');
    expect(result[0].children[1].id).toBe('target-component');
  });
  
  test('Row children in correct order (RIGHT)', () => {
    const context = { ...mockContext, dropPosition: DropPosition.RIGHT };
    const result = createHorizontalLayout(context);
    expect(result[0].children[0].id).toBe('target-component');
    expect(result[0].children[1].id).toBe('new-component');
  });
});

describe('Layout Logic - Auto-Dissolution', () => {
  test('Dissolves row with 1 child', () => {
    const rowWith1Child = { ...mockRow, children: [mockComponent] };
    const result = checkAndDissolveRowContainer({
      rowLayout: rowWith1Child,
      parentComponents: [rowWith1Child],
      trigger: 'delete'
    });
    expect(result.length).toBe(1);
    expect(result[0].type).not.toBe('horizontal_layout');
  });
  
  test('Preserves row with 2 children', () => {
    const rowWith2Children = { ...mockRow, children: [mockComponent1, mockComponent2] };
    const result = checkAndDissolveRowContainer({
      rowLayout: rowWith2Children,
      parentComponents: [rowWith2Children],
      trigger: 'delete'
    });
    expect(result[0].type).toBe('horizontal_layout');
  });
  
  test('Dissolves row with 0 children', () => {
    const emptyRow = { ...mockRow, children: [] };
    const result = checkAndDissolveRowContainer({
      rowLayout: emptyRow,
      parentComponents: [emptyRow],
      trigger: 'delete'
    });
    expect(result.length).toBe(0);
  });
});
```

### Integration Tests

```typescript
describe('Layout Logic - Full Drag-Drop Flows', () => {
  test('Drag from palette creates new component', async () => {
    const dragData = { dragType: 'new-item', componentType: 'text_input' };
    const result = await handleFullDragDropFlow(dragData, ...mockParams);
    expect(result.length).toBeGreaterThan(initialComponents.length);
  });
  
  test('Drag from canvas moves existing component', async () => {
    const dragData = { dragType: 'existing-item', sourceId: 'comp-1', item: mockComponent };
    const result = await handleFullDragDropFlow(dragData, ...mockParams);
    expect(result.length).toBe(initialComponents.length); // Same count, just rearranged
  });
  
  test('Left/right drop creates horizontal layout', async () => {
    const result = await handleFullDragDropFlow(dragData, target, comp, LEFT_EDGE_X, ...);
    const hasRow = result.some(c => c.type === 'horizontal_layout');
    expect(hasRow).toBe(true);
  });
});
```

---

**END OF LAYOUT LOGIC IMPLEMENTATION GUIDE**

*Version: 1.0*  
*Last Updated: October 31, 2025*  
*Status: Implementation-Ready*

This document contains ALL the business logic needed to implement the drag-drop layout system. Every algorithm, edge case, and validation rule is specified for complete implementation.