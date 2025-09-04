# Business Logic & Functional Requirements

## Core Functional Requirements

### 1. Form Building
- **Drag & Drop**: Drag components from palette to canvas
- **Multi-Page Forms**: Create forms with multiple pages  
- **Component Properties**: Edit labels, validation, options via properties panel
- **Layout Management**: Arrange components vertically or horizontally
- **Undo/Redo**: 50-action history for all changes

### 2. Template Management
- **Save Templates**: Store form designs with metadata
- **Load Templates**: Import saved templates
- **Export Options**: JSON template or advanced schema
- **Template Library**: Browse and manage saved templates

### 3. Form Validation
- **Required Fields**: Mark components as mandatory
- **Input Validation**: Email, number, file type validation
- **Real-time Feedback**: Immediate validation as user builds
- **Error Display**: Clear error messages and indicators

## Drag-Drop Business Logic

### Core Drop Position Types

**Position Types**: `before`, `after`, `inside`, `left`, `right`, `center`
**Drag Types**: `new-item` (from palette), `existing-item` (repositioning)

### CRITICAL: Drag Source Logic

#### Two Different Drag Behaviors Based on Source:

**1. Drag from Left Panel (Component Palette) = CREATE NEW**
```typescript
// When dragging from component palette:
dragType: 'new-item'
action: CREATE new component + place in target location
result: New component added to form, palette component unchanged

// Example:
// Drag "Text Input" from palette to canvas
// → Creates NEW Text Input component on canvas
// → Palette still shows "Text Input" for future use
```

**2. Drag from Canvas (Existing Components) = REARRANGE EXISTING** 
```typescript
// When dragging existing component on canvas:
dragType: 'existing-item'
sourceId: 'component-123'  // ID of component being moved
action: MOVE existing component to new location (no creation)
result: Same component moved, no new component created

// Example:
// Drag existing "Email Input" component to different position
// → MOVES the Email Input component to new location
// → No new component created, just rearrangement
```

### Canvas Drop Behavior Algorithms

#### Position Detection Algorithm
Mouse position determines drop type based on target element bounds:

```typescript
// Position calculation (mouse relative to target element)
if (yPercent < 0.3) → 'before' (insert above)
if (yPercent > 0.7) → 'after' (insert below)  
if (xPercent < 0.25) → 'left' (side-by-side left)
if (xPercent > 0.75) → 'right' (side-by-side right)
else → 'inside' (add to container)
```

## Complex Layout Transition System

### The Complete Layout Evolution Logic

#### Stage 1: Empty Canvas → First Element
```typescript
// Canvas starts empty (always column layout)
Canvas (Column Layout - Default) {
  // Empty - ready for first element
}

// First drop anywhere → Single element in column
Canvas (Column Layout) {
  Component A  // First element, positioned vertically
}
```

#### Stage 2: One Element → Two Elements Decision Point
```typescript
// Two-element choice point based on drop position:

// Option A: Top/Bottom Drop → Vertical Column Layout
if (dropPosition === 'top' || dropPosition === 'bottom') {
  Canvas (Column Layout) {
    Component A,  // Original element
    Component B   // New element above/below
  }
}

// Option B: Left/Right Drop → Horizontal Row Container Creation
if (dropPosition === 'left' || dropPosition === 'right') {
  Canvas (Column Layout) {
    RowLayout Container {
      Component A,  // Original element  
      Component B   // New element side-by-side
    }
  }
}
```

#### Stage 3: Two Elements → Three Elements Expansion
```typescript
// From vertical column with 2 elements:
Canvas (Column Layout) {
  Component A,
  Component B
}

// Add third element - Multiple options:

// Option 1: Top/Bottom → Stay in Column Layout
Canvas (Column Layout) {
  Component A,
  Component B,
  Component C   // Added above/below → Column grows
}

// Option 2: Left/Right on any element → Create Row + Column Mix
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B   // Side-by-side pair
  },
  Component C     // Standalone in column
}

// From horizontal row with 2 elements:
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B
  }
}

// Add third element - Multiple options:

// Option 1: Left/Right → Expand Row Container
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B,
    Component C   // Added to row → Row expands (max 4)
  }
}

// Option 2: Top/Bottom → Add to Column Layout
Canvas (Column Layout) {
  Component C,    // Added above row
  RowLayout Container {
    Component A,
    Component B
  }
}
```

#### Stage 4: Container Dissolution Logic
```typescript
// Rule: Any action reducing row container to ≤1 child → AUTO-DISSOLVE

// Scenario 1: Delete from 2-element row
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B   // Delete this
  }
}
// Result: Row dissolves, Component A becomes standalone
Canvas (Column Layout) {
  Component A     // Promoted to column level
}

// Scenario 2: Drag out from 3-element row  
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B,
    Component C   // Drag this out
  }
}
// Result: Row keeps 2 elements, dragged element goes to column
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B   // Row container preserved
  },
  Component C     // Moved to column level
}

// Scenario 3: Drag out from 2-element row
Canvas (Column Layout) {
  RowLayout Container {
    Component A,
    Component B   // Drag this out
  }
}
// Result: Row dissolves completely, both become standalone
Canvas (Column Layout) {
  Component A,    // Promoted to column level
  Component B     // Moved to column level
}
```

#### Horizontal Layout Creation Logic

**Two-Element Choice Point**:
```typescript
// When dropping left/right of existing component
1. Check if target already in horizontal layout
2. If in layout + space available → Add to existing (max 4 items)
3. If not in layout → Create new horizontal container
4. Replace target with: HorizontalLayout { children: [newComponent, target] }
```

**Container Management**:
- **Auto-dissolve**: When horizontal layout has ≤1 child, dissolve container
- **Max capacity**: Horizontal layouts limited to 4 components
- **Nesting prevention**: No horizontal layouts inside horizontal layouts

#### Vertical Arrangement Logic

**Default Column Behavior**:
```typescript
// Canvas defaults to vertical (column) layout
insertBefore(targetId) → Splice component at target index
insertAfter(targetId) → Splice component at target index + 1
```

**Multi-level Hierarchy**:
```
Canvas (Column Layout)
├── Component A
├── HorizontalLayout Container
│   ├── Component B (only left/right positions)
│   └── Component C (only left/right positions)
└── Component D
```

### Advanced Arrangement Algorithms

#### Existing Component Repositioning

**Reposition Flow**:
1. **Find Source**: Locate component by ID (recursive search)
2. **Remove Source**: Extract component from current position  
3. **Clean Containers**: Auto-dissolve empty horizontal layouts
4. **Insert at Target**: Apply same insertion logic as new components
5. **Validate**: Prevent self-drop and parent→child drops

#### Layout Transformation Rules

**Rule 1: Empty Canvas**
```typescript
handleDrop(position.center) → [newComponent]
```

**Rule 2: Horizontal Layout Creation**
```typescript
insertHorizontal(targetId, newComponent, 'left') → {
  // Find target component
  // Create horizontal_layout container  
  // Set children: [newComponent, targetComponent] 
  // Replace target with container
}
```

**Rule 3: Container Dissolution** 
```typescript
removeComponent(componentId) → {
  if (horizontalLayout.children.length <= 1) {
    // Move remaining child to parent level
    // Delete horizontal layout container
  }
}
```

**Rule 4: Nested Layout Navigation**
```typescript
// Recursive search through layout hierarchy
insertBefore(components, targetId) → {
  for each component {
    if component.id === targetId → insert here
    if component.children → recursively search children
  }
}
```

### Row Layout Drag-Drop Constraints

#### Row Layout Movement Rules

**Rule 1: Row Layout as Single Unit**
```typescript
// Row layouts can only be dragged as complete containers
// Individual components inside row layouts cannot be dragged out
// Row layout moves vertically only (top/bottom positions relative to other elements)
dragType: 'row-layout'
allowedPositions: ['before', 'after'] // Only vertical positioning
restrictions: ['left', 'right', 'inside'] // No horizontal or nested positioning
```

**Rule 2: Internal Row Arrangement**
```typescript
// Inside row layouts: only left-right arrangement allowed
// Components within row layout can only be reordered horizontally
// No vertical stacking within row layouts
withinRowLayout: {
  allowedPositions: ['left', 'right'] // Only horizontal positioning
  maxComponents: 4 // Maximum items per row
  arrangement: 'horizontal-only' // No vertical sub-layouts
}
```

**Rule 3: Root Level Container Behavior**
```typescript
// Root canvas: only top-bottom arrangement (column layout)
// Side-by-side drops create row layouts with exactly 2 elements
rootLevel: {
  defaultLayout: 'column' // Vertical arrangement
  sideBySideAction: 'createRowLayout' // Left/right drops create horizontal containers
  targetElements: 'individual-components' // Row creation targets specific components, not containers
}
```

**Rule 4: Row Layout Creation Logic**
```typescript
// Row layouts created when dropping beside individual components
// Dragged element + target element = new row layout container
// Row layout becomes single draggable unit after creation
createRowLayout(draggedElement, targetElement) → {
  newRowLayout: {
    type: 'horizontal_layout',
    children: [draggedElement, targetElement],
    dragBehavior: 'single-unit',
    internalArrangement: 'horizontal-only'
  }
}
```

**Rule 5: No Nested Row Layouts**
```typescript
// Row layouts cannot contain other row layouts
// Prevents complex nested horizontal structures
// Maintains simple two-level hierarchy: Canvas (vertical) → Row (horizontal)
preventNesting: {
  rowInRow: false, // No horizontal layouts inside horizontal layouts
  maxDepth: 2 // Canvas → Row Layout → Components (max 2 levels)
}
```

### Advanced Layout Transition Scenarios

#### Complete Element Count Transitions
```typescript
// 1 Element → 2 Elements
Canvas: [A] + drop(B, position) → {
  if (position === 'top' || position === 'bottom') {
    Canvas: [A, B] or [B, A]  // Column layout
  }
  if (position === 'left' || position === 'right') {
    Canvas: [RowLayout[A, B]]  // Row container created
  }
}

// 2 Elements → 3 Elements (Multiple Paths)
// Path 1: From Column Layout
Canvas: [A, B] + drop(C, position) → {
  // Option 1: Maintain column
  if (position === 'top' || position === 'bottom') {
    Canvas: [A, B, C] or [A, C, B] or [C, A, B]
  }
  // Option 2: Create mixed layout
  if (position === 'left' || position === 'right' on A or B) {
    Canvas: [RowLayout[A, C], B] or [A, RowLayout[B, C]]
  }
}

// Path 2: From Row Layout
Canvas: [RowLayout[A, B]] + drop(C, position) → {
  // Option 1: Expand row (max 4 elements)
  if (position === 'left' || position === 'right' on A or B) {
    Canvas: [RowLayout[A, B, C]]  // Row expands
  }
  // Option 2: Add to column
  if (position === 'top' || position === 'bottom' on RowLayout) {
    Canvas: [C, RowLayout[A, B]] or [RowLayout[A, B], C]
  }
}

// 3 Elements → 2 Elements (Dissolution Scenarios)
// Scenario 1: Remove from 3-element row
Canvas: [RowLayout[A, B, C]] - remove(C) → {
  Canvas: [RowLayout[A, B]]  // Row preserved with 2 elements
}

// Scenario 2: Remove from 2-element row  
Canvas: [RowLayout[A, B]] - remove(B) → {
  Canvas: [A]  // Row dissolved, A promoted to column
}

// Scenario 3: Drag out from row
Canvas: [RowLayout[A, B, C]] - drag(C, to column) → {
  Canvas: [RowLayout[A, B], C]  // C moved to column, row preserved
}

Canvas: [RowLayout[A, B]] - drag(B, to column) → {
  Canvas: [A, B]  // Row dissolved, both promoted to column
}
```

#### Mixed Layout Complexity Examples
```typescript
// Complex multi-row scenario
Canvas: [
  Component A,                    // Standalone in column
  RowLayout[B, C, D],            // 3-element row
  Component E,                    // Standalone in column  
  RowLayout[F, G]                // 2-element row
]

// Drag operations and results:
drag(C, above A) → Canvas: [
  C,                             // Moved to top
  Component A,
  RowLayout[B, D],              // Row preserved with 2 elements
  Component E,
  RowLayout[F, G]
]

drag(G, left of E) → Canvas: [
  Component A,
  RowLayout[B, C, D],
  RowLayout[E, G],              // New row created with E and G
  Component F                    // F promoted from dissolved row
]
```

### Drop Zone Hierarchy System

#### Zone Priority Levels
1. **Component Level** (Priority 1): Direct replacement/positioning relative to component
2. **Container Level** (Priority 2): Operations within horizontal/vertical containers
3. **Canvas Level** (Priority 3): Top-level canvas operations

#### Visual Drop Feedback
```typescript
DropFeedback = {
  before: { indicator: '↑', description: 'Insert above' },
  after: { indicator: '↓', description: 'Insert below' },
  left: { indicator: '←', description: 'Place side-by-side (left)' },
  right: { indicator: '→', description: 'Place side-by-side (right)' },
  inside: { indicator: '⊕', description: 'Add to container' },
  center: { indicator: '⊙', description: 'Add to canvas' }
}
```

### Validation & Safety Rules

#### Drop Validation Checks
- **Self-drop prevention**: `sourceId !== targetId`
- **Circular reference prevention**: Parent cannot be dropped into its own child
- **Container capacity limits**: Max 4 items in horizontal layouts
- **Layout nesting rules**: No horizontal inside horizontal

#### Error Handling
- **Target not found**: Append to end of components array
- **Invalid position**: Log error, return original components
- **Validation failure**: Return original state with error message

## Core Layout System (Simple and Clear)

### The Two Layout Types

#### 1. Column Layout (Default/Vertical) - THE CANVAS
- **Always the main container** - Canvas is ALWAYS column layout
- **Stacks elements vertically** - top to bottom
- **Contains**: Standalone components AND row containers
- **Drop zones**: Top/Bottom for vertical positioning

#### 2. Row Layout (Horizontal) - CONTAINERS INSIDE COLUMN
- **Containers within the column layout** - NOT a replacement for column
- **Arranges elements horizontally** - left to right
- **Contains**: 2-4 components (minimum 2, maximum 4)
- **Drop zones**: Left/Right for horizontal positioning within container
- **Auto-dissolves**: When ≤1 element remains

### Layout Structure Reality
```typescript
// Canvas is ALWAYS Column Layout
Canvas (Column Layout - Always) {
  // Can contain standalone components
  Component A,
  
  // Can contain row containers  
  Row Container {
    Component B,  // Left/Right positioning within row
    Component C   // Left/Right positioning within row
  },
  
  // Can contain more standalone components
  Component D,
  
  // Can contain multiple row containers
  Row Container {
    Component E,
    Component F,
    Component G   // Up to 4 components per row
  }
}
```

### Auto-Dissolution Logic

#### When Row Containers Auto-Dissolve
```typescript
// Rule: If row container has ≤1 child → AUTO-DISSOLVE
if (rowContainer.children.length <= 1) {
  // 1. Extract remaining child (if any)
  // 2. Delete row container
  // 3. Place child as standalone component in canvas column
  // 4. Clean up container references
}
```

#### Dissolution Scenarios
1. **Delete component from 2-element row** → Row dissolves, both become standalone
2. **Drag component out of 2-element row** → Row dissolves, both become standalone  
3. **Move component from 2-element row to another row** → Original row dissolves

### Canvas Management Logic

#### Canvas State Orchestration
The CanvasManager coordinates between drag-drop operations and state management:

**Core Canvas Operations**:
```typescript
// Add component with position control
addComponent(type, { index?, targetId?, side? }) → {
  if (targetId + side) → Create horizontal layout via DragDropService
  if (index) → Insert at specific position  
  else → Append to end + auto-select component
}

// Component lifecycle management
updateComponent(id, updates) → Recursive search and update
deleteComponent(id) → Remove + auto-dissolve empty containers
moveComponent(fromIndex, toIndex) → Array splice operation
```

**Auto-Dissolution Algorithm**:
```typescript
// When deleting from horizontal layout
if (horizontalLayout.children.length === 1) {
  // Move remaining child to parent level
  // Remove horizontal layout container
} else if (horizontalLayout.children.length === 0) {
  // Remove entire horizontal layout
}
```

#### Drop Zone Strategies

**Strategy Pattern Implementation**:
```typescript
// Between Components Strategy
BetweenComponentsDropStrategy.handleDrop() → {
  onInsertBetween(type, insertIndex) || onAddComponent(type)
}

// Canvas Main Strategy  
CanvasMainDropStrategy.handleDrop() → {
  if (isFromContainer) → onMoveFromContainerToCanvas(id, path)
  else → onAddComponent(type) // New from palette
}
```

**Container-to-Canvas Movement**:
- **Extract from container**: Remove component from horizontal layout
- **Auto-dissolve parent**: If container becomes empty/single-child
- **Insert on canvas**: Add at canvas level with proper positioning

#### Cross-Domain Adaptations

**Domain-Specific Component Sets**:
```typescript
getDomainComponents() → {
  'surveys': ['text_input', 'textarea', 'select', 'radio_group', 'checkbox_group'],
  'workflows': ['text_input', 'textarea', 'select', 'button', 'heading'],
  'forms': ComponentEngine.getAllComponentTypes() // Full set
}
```

**Dynamic Labels**:
- **Survey mode**: "Field" → "Question" 
- **Workflow mode**: "Field" → "Step"
- **Form mode**: Default labels maintained

### Left Panel Component Organization

#### Component Grouping Structure
```typescript
interface ComponentCategory {
  category: 'input_components' | 'selection_components' | 'special_components' 
           | 'layout_components' | 'ui_components';
  icon: string;
  label: string;
  components: ComponentType[];
}

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    category: 'input_components',
    icon: '📝',
    label: 'Input Components',
    components: ['text_input', 'email_input', 'password_input', 'number_input', 'textarea', 'rich_text']
  },
  {
    category: 'selection_components', 
    icon: '☑️',
    label: 'Selection Components',
    components: ['select', 'multi_select', 'checkbox', 'radio_group']
  },
  {
    category: 'special_components',
    icon: '⭐',
    label: 'Special Components', 
    components: ['date_picker', 'file_upload', 'signature']
  },
  {
    category: 'layout_components',
    icon: '📐',
    label: 'Layout Components',
    components: ['horizontal_layout', 'vertical_layout']
  },
  {
    category: 'ui_components',
    icon: '🎨',
    label: 'UI Components',
    components: ['section_divider', 'button', 'heading', 'card']
  }
];
```

#### Domain-Specific Filtering
```typescript
// Different domains show different component sets
const getDomainComponents = (domain: 'forms' | 'surveys' | 'workflows') => {
  switch (domain) {
    case 'surveys':
      return {
        input_components: ['text_input', 'textarea', 'rich_text'],
        selection_components: ['select', 'radio_group', 'checkbox'],
        special_components: ['date_picker'],
        ui_components: ['section_divider', 'heading']
      };
    
    case 'workflows':
      return {
        input_components: ['text_input', 'textarea'],
        selection_components: ['select', 'checkbox'], 
        ui_components: ['button', 'heading', 'card']
      };
    
    case 'forms':
    default:
      return ALL_COMPONENT_CATEGORIES; // Full component set
  }
};
```

## Detailed Implementation Instructions

### Simple Drop Position Logic (No Element Counting)

#### The ONLY Rule That Matters: Drop Position

**Canvas is ALWAYS Column Layout** - this never changes regardless of how many elements.

#### Drop Position Determines Behavior:

**1. Top/Bottom Drop = Column Positioning**
```typescript
// Anywhere you drop TOP or BOTTOM of any element:
// → Insert in column layout (vertical positioning)

Canvas (Always Column) {
  Component A,
  Component B,  // ← TOP/BOTTOM drops create this vertical arrangement
  Component C
}
```

**2. Left/Right Drop = Row Container Creation/Expansion**  
```typescript
// Anywhere you drop LEFT or RIGHT of any element:
// → Create row container OR add to existing row container

// First left/right drop creates container:
Canvas (Always Column) {
  Row Container {
    Component A,
    Component B   // ← LEFT/RIGHT drop created this horizontal container
  }
}

// Subsequent left/right drops expand the row:
Canvas (Always Column) {
  Row Container {
    Component A,
    Component B,
    Component C   // ← Another LEFT/RIGHT drop expanded the row
  }
}
```

**Test Cases Needed**: Drop position detection, container creation, column preservation

### Core Business Logic Rules

#### Rule 1: Drop Position Detection
**The system detects WHERE you drop and responds accordingly**

```typescript
// Mouse position relative to target element determines action:
if (dropPosition === 'top' || dropPosition === 'bottom') {
  // → Column positioning (vertical)
  insertInColumn(component, targetElement, position);
}

if (dropPosition === 'left' || dropPosition === 'right') {
  // → Row container creation/expansion (horizontal)
  createOrExpandRowContainer(component, targetElement, position);
}
```
**Test Cases Needed**: Drop position detection, accurate mouse position calculation

#### Rule 2: Drag Source Handling Logic
**System handles drag source differently for creation vs rearrangement**

```typescript
function handleDrop(dragType, sourceId, targetId, position, componentType) {
  if (dragType === 'new-item') {
    // CREATE NEW COMPONENT from palette
    const newComponent = ComponentEngine.createComponent(componentType);
    insertComponentAtPosition(newComponent, targetId, position);
    
  } else if (dragType === 'existing-item' && sourceId) {
    // MOVE EXISTING COMPONENT from canvas
    const existingComponent = findAndRemoveComponent(sourceId);
    insertComponentAtPosition(existingComponent, targetId, position);
    
    // Handle container dissolution if source was in row
    checkAndDissolveEmptyContainers();
  }
}
```

#### Rule 3: Automatic Container Management  
**System automatically creates and destroys row containers as needed**

```typescript
// Auto-creation: When left/right drop happens (for BOTH drag types)
if (position === 'left' || position === 'right') {
  if (!targetElement.isInRowContainer) {
    createRowContainer([targetElement, droppedComponent]);
  } else {
    addToExistingRowContainer(targetElement.parentRow, droppedComponent);
  }
}

// Auto-dissolution: When row container ≤ 1 child (especially after moves)
if (rowContainer.children.length <= 1) {
  dissolveRowContainer(rowContainer);
  moveChildrenToColumn(rowContainer.children);
}
```
**Test Cases Needed**: 
- Drag source detection (palette vs canvas)
- Component creation vs component movement
- Container creation for both drag types
- Container dissolution after moves
- Automatic cleanup

### Element Extraction and Container Dissolution

#### Row Container Extraction Logic
**When you drag an element OUT of a row container:**

```typescript
// Simple rule: Check remaining children count after extraction
function extractFromRowContainer(elementToExtract, rowContainer) {
  // Remove element from row
  rowContainer.children.remove(elementToExtract);
  
  // Check what's left
  if (rowContainer.children.length <= 1) {
    // AUTO-DISSOLVE: Extract remaining child, delete container
    dissolveRowContainer(rowContainer);
  }
  // If ≥2 children remain, row container stays
}
```

#### Container Dissolution Scenarios
**Any action that reduces row container to ≤1 child triggers auto-dissolution:**

1. **Delete element from row**
2. **Drag element out of row** 
3. **Move element from row to another location**

**Test Cases Needed**:
- Extraction detection and handling
- Auto-dissolution trigger logic  
- Container cleanup
- Column layout maintenance

#### Row Container Expansion
**When you drop left/right on elements IN a row container:**

```typescript
// Simple rule: Add to existing row (up to capacity limit)
function expandRowContainer(newElement, targetElementInRow) {
  const rowContainer = targetElementInRow.parentRowContainer;
  
  if (rowContainer.children.length < MAX_ROW_CAPACITY) {
    rowContainer.children.insert(newElement, position);
  } else {
    // Handle capacity limit (show error or create new row)
  }
}
```

**Test Cases Needed**:
- Row expansion logic
- Capacity limit enforcement
- Position accuracy within row

### Missing Critical Logic - Hierarchical Drop Zones

#### Drop Zone Priority System (IMPORTANT)
```typescript
enum DropZonePriority {
  COMPONENT_LEVEL = 1,    // Highest priority: Left/Right of individual components
  ROW_LAYOUT_LEVEL = 2,   // Medium priority: Top/Bottom of entire row
  CANVAS_LEVEL = 3        // Lowest priority: Canvas empty areas
}

// Priority Resolution Logic:
// 1. Component Level First: Left/right edge of component within row → Insert within row
// 2. Row Level Second: Top/bottom edge of row → Insert above/below entire row  
// 3. Canvas Level Last: Empty canvas area → Create new standalone component
```

#### Visual Drop Zone Indicators
| Drop Position | Visual Indicator | Result |
|---------------|------------------|--------|
| **Left Edge** | Blue line on left side of component | Insert to left within same row |
| **Right Edge** | Blue line on right side of component | Insert to right within same row |
| **Top Edge** | Horizontal blue line above entire row | Insert above this row |
| **Bottom Edge** | Horizontal blue line below entire row | Insert below this row |
| **Center Area** | No drop allowed | Blocked - use edges |

#### Blocked Drop Zones  
```typescript
interface BlockedDropZones {
  componentCenterAreas: {
    blocked: true;
    reason: "Use left/right edges for horizontal insertion";
  };
  
  rowInteriorAreas: {
    blocked: true;
    reason: "Cannot insert into middle of row layout";  
  };
  
  nestedRowLayouts: {
    blocked: true;
    reason: "Row layouts cannot be nested inside other rows";
  };
}
```

### Row Layout Dragging (Entire Row Movement)

#### Row Layout as Single Unit
**Row layouts are draggable containers that move as complete units:**

```typescript
// Row Layout Drag Behavior
interface RowLayoutDragBehavior {
  dragType: 'existing-item';           // Same as individual components
  sourceId: 'row-layout-123';         // Row layout ID
  dragHandle: {
    location: 'row-header' | 'left-border' | 'drag-grip';
    visual: '⋮⋮' | 'drag-handle-icon' | 'grip-dots';
    position: 'top-left' | 'left-edge';
  };
  
  // Drag constraints
  preserveRowIntegrity: true;          // All child components move together  
  allowVerticalRepositioning: true;    // Can move row up/down in column
  preventHorizontalDrag: true;         // No horizontal repositioning of rows
  preventNestedRows: true;             // Cannot drop row inside another row
}

// Row Movement Examples:
// Before: [Component A, Row[B,C], Component D]
// After:  [Row[B,C], Component A, Component D]  // Row moved up

// Before: [Row[A,B], Component C, Row[D,E]]  
// After:  [Component C, Row[A,B], Row[D,E]]   // First row moved down
```

#### Row Layout Drop Zones
```typescript
// Row layouts have restricted drop zones when being dragged:
interface RowLayoutDropZones {
  validDropTargets: [
    'above-component',     // Drop above any standalone component
    'below-component',     // Drop below any standalone component  
    'above-row',          // Drop above another row layout
    'below-row',          // Drop below another row layout
    'canvas-empty-area'   // Drop in empty canvas areas
  ];
  
  invalidDropTargets: [
    'inside-row',         // Cannot nest rows inside rows
    'left-right-of-component', // Rows cannot be positioned horizontally
    'replace-component'   // Cannot replace individual components
  ];
}
```

#### Row Layout Drag Implementation
```typescript
// Row layout components are draggable like individual components
const RowLayoutDragSource = {
  type: 'existing-item',
  item: {
    type: 'existing-item',
    sourceId: rowLayout.id,
    item: rowLayout,           // Entire row layout object
    dragType: 'row-layout'     // Special drag type for rows
  },
  
  // Drag preview shows entire row with all children
  dragPreview: {
    showAllChildren: true,
    opacity: 0.7,
    border: 'dashed 2px blue',
    preserveLayout: true       // Maintain horizontal arrangement in preview
  }
};

// Drop handling for row layouts
const handleRowLayoutDrop = (dragItem, targetId, position) => {
  if (dragItem.dragType === 'row-layout') {
    // Move entire row layout to new position
    moveRowLayout(dragItem.sourceId, targetId, position);
    
    // Validate no circular references or invalid nesting
    validateRowLayoutPlacement(dragItem.sourceId, targetId);
  }
};
```

### Component Data Structure Details

#### Horizontal Layout Component Schema
```typescript
interface HorizontalLayoutComponent extends FormComponentData {
  type: 'horizontal_layout';
  id: string;                    // Unique layout identifier
  fieldId: string;              // Not used for data collection
  label: string;                // "Row Layout" (not displayed)
  children: FormComponentData[]; // Array of 2-4 child components
  
  // Layout-specific properties
  layoutConfig: {
    distribution: 'equal' | 'auto' | 'custom';  // Width distribution
    spacing: 'tight' | 'normal' | 'loose';      // Inter-component spacing
    alignment: 'top' | 'center' | 'bottom';     // Vertical alignment
    wrapBehavior: 'nowrap' | 'wrap';            // Responsive behavior
  };
}
```

#### Child Component Constraints
- **Width Distribution**: Components within horizontal layout share available width
- **Responsive Behavior**: On small screens, horizontal layouts can wrap to vertical stacks
- **Validation Independence**: Each child component validates independently

### Nested Drop Zone Detection Logic (For Test Validation)

```typescript
interface HierarchicalDropZoneDetection {
  // Level 1: Individual Component Zones (within row layout)
  componentLevel: {
    leftZone: { start: 0, end: 0.2 };      // Left 20% triggers left insertion
    rightZone: { start: 0.8, end: 1.0 };   // Right 20% triggers right insertion
    blockedCenter: { start: 0.2, end: 0.8 }; // Center 60% blocked for external drops
  };
  
  // Level 2: Row Layout Zones (entire horizontal layout)
  rowLayoutLevel: {
    topZone: { start: 0, end: 0.15 };       // Top 15% triggers insert above row
    bottomZone: { start: 0.85, end: 1.0 };  // Bottom 15% triggers insert below row
    interiorZone: { start: 0.15, end: 0.85 }; // Interior delegates to component level
  };
  
  // Level 3: Canvas Level (between row layouts)
  canvasLevel: {
    betweenRowsZone: true;                   // Gaps between row layouts allow insertion
    canvasEmptyArea: true;                   // Empty canvas areas allow direct insertion
  };
}
```

**Test Cases Needed**:
- Zone boundary detection (0.2, 0.8, 0.15, 0.85)
- Zone priority resolution
- Mouse position calculations
- Edge case handling

### FormStateEngine Actions (For State Testing)

#### 1. CREATE_HORIZONTAL_LAYOUT
```typescript
{
  type: 'CREATE_HORIZONTAL_LAYOUT',
  payload: {
    targetComponentId: string;     // Component to include in layout
    newComponentType: ComponentType; // Component being added
    insertSide: 'left' | 'right';  // Which side to add new component
  }
}
```

#### 2. ADD_TO_HORIZONTAL_LAYOUT
```typescript
{
  type: 'ADD_TO_HORIZONTAL_LAYOUT', 
  payload: {
    layoutId: string;              // Target horizontal layout
    componentType: ComponentType;   // Component to add
    insertIndex: number;           // Position within layout children
  }
}
```

#### 3. DISSOLVE_HORIZONTAL_LAYOUT
```typescript
{
  type: 'DISSOLVE_HORIZONTAL_LAYOUT',
  payload: {
    layoutId: string;              // Layout to dissolve
    preserveComponents: boolean;   // Keep child components as standalone
  }
}
```

#### 4. MOVE_ROW_LAYOUT
```typescript
{
  type: 'MOVE_ROW_LAYOUT',
  payload: {
    rowLayoutId: string;           // Row layout to move
    targetPosition: {
      type: 'above' | 'below' | 'between';
      targetId: string;            // Target component/row ID
      insertIndex?: number;        // Specific position (for 'between')
    };
    preserveIntegrity: boolean;    // Keep all child components together
  }
}
```

#### 5. REORDER_ROW_LAYOUTS
```typescript
{
  type: 'REORDER_ROW_LAYOUTS',
  payload: {
    sourceRowId: string;           // Row being moved
    targetRowId: string;           // Target row position
    insertPosition: 'above' | 'below';
    formPageId: string;            // Page containing the rows
  }
}
```

**Test Cases Needed**:
- Action payload validation
- State transition testing
- Edge case handling for each action
- Error state management

### Performance Testing Requirements

#### Component Load Testing
```typescript
interface PerformanceTestScenarios {
  small: { components: 10, expectedRenderTime: '<50ms' };
  medium: { components: 50, expectedRenderTime: '<150ms' };
  large: { components: 200, expectedRenderTime: '<300ms' };
  massive: { components: 1000, expectedRenderTime: '<1000ms' };
}
```

#### Memory Usage Testing
```typescript
interface MemoryTestTargets {
  initialLoad: { target: '<50MB', components: 100 };
  afterInteraction: { target: '<80MB', interactions: 50 };
  longSession: { target: '<100MB', duration: '30min' };
}
```

**Test Cases Needed**:
- Performance benchmarking
- Memory leak detection
- Render time validation
- Interaction responsiveness

## Missing Critical Validation & Error Handling

### Layout Validation Rules
```typescript
interface LayoutValidationRules {
  // Child component limits
  maxChildrenPerRow: 4;           // Maximum components per horizontal layout
  minChildrenPerRow: 2;           // Minimum components (below this = auto-dissolve)
  
  // Component type restrictions
  restrictedInHorizontalLayout: [
    'section_divider',            // Generally not allowed in horizontal layouts
    'rich_text'                   // May be restricted due to width requirements
  ];
  
  // Validation methods
  validateHorizontalLayoutCreation(targetComponent, newComponent): ValidationResult;
  validateComponentAddition(layout, newComponent): ValidationResult;
  validateLayoutDissolution(layout): ValidationResult;
}
```

### Error Handling Scenarios
```typescript
// Common error scenarios with user-friendly messages
const ErrorScenarios = {
  rowCapacityExceeded: {
    error: "Cannot add component: Row already contains maximum number of components (4)",
    resolution: "Create new row or remove existing component",
    userAction: "Show alternative drop zones"
  },
  
  invalidComponentType: {
    error: "Component type 'section_divider' cannot be added to horizontal layout",
    resolution: "Show alternative drop zones (above/below row)",
    userAction: "Highlight valid drop areas"
  },
  
  layoutDissolutionConflict: {
    error: "Cannot remove component: Would leave empty horizontal layout",
    resolution: "Auto-dissolve layout and convert remaining components to standalone",
    userAction: "Automatically handle dissolution"
  }
};
```

### Responsive Behavior (Mobile/Desktop)
```typescript
interface ResponsiveLayoutBehavior {
  // Breakpoint definitions
  breakpoints: {
    mobile: '< 768px';           // Stack vertically on mobile
    tablet: '768px - 1024px';    // 2 components per row max  
    desktop: '> 1024px';         // Full horizontal layout (up to 4)
  };
  
  // Responsive stacking behavior
  stackingBehavior: {
    mobile: 'vertical_stack';       // All components stack vertically
    tablet: 'two_column_wrap';      // Max 2 components per row with wrapping
    desktop: 'horizontal_layout';   // Full horizontal layout
  };
  
  // Layout configuration per screen size
  layoutConfig: {
    mobile: { maxComponentsPerRow: 1, forceVerticalStack: true },
    tablet: { maxComponentsPerRow: 2, allowWrapping: true },
    desktop: { maxComponentsPerRow: 4, allowWrapping: false }
  };
}
```

### Performance Considerations
```typescript
interface LayoutPerformanceConfig {
  // Caching strategy
  maxCachedLayouts: number;        // Default: 50 cached layout calculations
  cacheTTL: number;               // Cache time-to-live in ms (default: 300000)
  
  // Batch processing
  enableBatchUpdates: boolean;     // Batch multiple layout changes into single state update
  batchTimeout: number;           // Timeout for batching (default: 16ms for 60fps)
  
  // Memory management
  enableVirtualization: boolean;   // For forms with many horizontal layouts
  virtualScrollThreshold: number; // Start virtualizing after N layouts (default: 50)
}

// Optimization strategies
const OptimizationStrategies = {
  layoutCaching: "Cache horizontal layout calculations to avoid recalculation",
  minimalReRenders: "Only re-render affected layout components when changes occur",
  batchOperations: "Group multiple layout changes into single state update",
  memoryManagement: "Clean up dissolved layouts and unused references"
};
```

### Form Processing Integration
```typescript
// Data collection behavior - IMPORTANT for form functionality
interface FormProcessingIntegration {
  // Field mapping behavior
  fieldMapping: {
    childComponentsKeepFieldId: true;     // Child components maintain individual fieldId values
    layoutNotInData: true;                // Layout structure not reflected in submitted data
    preserveFieldOrder: boolean;          // Maintain field order in form submission
  };
  
  // Validation flow
  validationFlow: {
    independentValidation: true;          // Each component validates independently
    layoutProvidesGrouping: true;         // Layout provides visual grouping only
    noLayoutValidation: true;             // Layout itself doesn't validate
  };
  
  // Export behavior
  exportBehavior: {
    includeLayoutStructure: boolean;      // Include in template schema export
    excludeFromDataSchema: boolean;       // Exclude from form data validation schema
    structuralOnly: true;                 // Layout is structural, not data-related
  };
}
```

## State Management Rules

### Component Lifecycle
1. **Create**: Generate unique ID, apply defaults, add to current page
2. **Update**: Validate changes, update properties, trigger re-render
3. **Delete**: Remove from structure, clean up references, update selection
4. **Move**: Update position, maintain relationships, validate placement

### Form State Consistency  
- **Single Source**: All changes go through FormStateEngine
- **Immutable Updates**: State changes create new state objects
- **History Tracking**: Every action saved for undo/redo
- **Validation**: State validation on every change

## User Workflows

### Building a Form
1. Start with empty canvas
2. Drag components from palette
3. Arrange using drag-drop positioning
4. Configure properties in right panel
5. Add validation rules
6. Save as template

### Managing Layout
1. **Vertical Layout** (default): Stack components top to bottom
2. **Horizontal Layout**: Create by dropping components left/right
3. **Mixed Layout**: Combine horizontal rows within vertical structure
4. **Reorganize**: Drag components or containers to new positions

### Template Operations
1. **Save**: Name template, store with metadata
2. **Load**: Select from template list, import into builder  
3. **Export JSON**: Generate headless form structure
4. **Export Schema**: Create advanced layout configuration

## Validation Requirements

### Component Validation
- **Required Fields**: Must have value before form submission
- **Type Validation**: Email format, number ranges, file types
- **Custom Rules**: Pattern matching, length limits
- **Error States**: Visual indicators and descriptive messages

### Form-Level Validation
- **Page Validation**: All components on page must be valid
- **Cross-Page Dependencies**: Handle multi-page validation flow  
- **Submission Readiness**: Entire form validation before export
- **Error Summary**: Aggregate validation results

## Performance Requirements

- **Large Forms**: Handle 1000+ components efficiently
- **Real-time Updates**: Immediate response to drag-drop operations
- **Memory Usage**: Optimize for long builder sessions
- **Rendering**: Lazy load components outside viewport
- **History**: Efficient undo/redo with minimal memory impact