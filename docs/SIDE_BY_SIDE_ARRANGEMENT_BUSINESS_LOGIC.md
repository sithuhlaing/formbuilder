# Side-by-Side Arrangement Business Logic

## Overview

The side-by-side arrangement system manages horizontal layout of form components within the canvas. This document defines the core business logic for creating, managing, and expanding horizontal row layouts.

## Core Principles

### 1. Dynamic Layout Transformation System
The form builder automatically transitions between **Column Layout** (default/vertical) and **Row Layout** (horizontal) based on element count and arrangement patterns:

- **Default Mode**: Column Layout (vertical arrangement, top-to-bottom)
- **Horizontal Mode**: Row Layout (side-by-side arrangement, left-to-right)  
- **Automatic Container Management**: Containers are created/dissolved based on element positioning

### 2. Layout State Transitions

#### State 1: Empty Canvas (Default Column Mode)
```
Canvas (Column Layout - Default Mode)
├── [Empty] - Only top/bottom drop zones available
```

#### State 2: Single Element (Column Mode)
```  
Canvas (Column Layout)
├── Component A - Available: Top, Bottom
```

#### State 3: Two Elements - Choice Point
**Option 3A: Vertical Arrangement (Column Layout)**
```
Canvas (Column Layout)  
├── Component A - Available: Top, Bottom
└── Component B - Available: Top, Bottom
```

**Option 3B: Horizontal Arrangement (Row Layout)**
```
Canvas (Column Layout)
└── Horizontal Layout (Row Container)
    ├── Component A - Available: Left, Right  
    └── Component B - Available: Left, Right
```

#### State 4: Three Elements - Multiple Configurations

**Option 4A: All Vertical (Pure Column Layout)**
```
Canvas (Column Layout)
├── Component A - Available: Top, Bottom
├── Component B - Available: Top, Bottom  
└── Component C - Available: Top, Bottom
```

**Option 4B: Mixed Layout (Column + Row Hybrid)**
```
Canvas (Column Layout)
├── Component A - Available: Top, Bottom (standalone)
└── Horizontal Layout (Row Container) - Available: Top, Bottom (as unit)
    ├── Component B - Available: Left, Right
    └── Component C - Available: Left, Right
```

**Option 4C: All Horizontal (Single Row Layout)**
```
Canvas (Column Layout)
└── Horizontal Layout (Row Container) - Available: Top, Bottom (as unit)
    ├── Component A - Available: Left, Right
    ├── Component B - Available: Left, Right
    └── Component C - Available: Left, Right
```

### 3. Container Lifecycle Management
- **Auto-Creation**: Row containers created when 2+ elements arranged side-by-side
- **Auto-Expansion**: Row containers expand to accommodate up to 4 elements
- **Auto-Dissolution**: Row containers dissolve when reduced to 1 element
- **Auto-Preservation**: Column layout (default mode) always maintained at canvas level

## Business Logic Rules

### Rule 1: Hierarchical Drop Zone Priority
**Scope**: Determines which drop zone takes precedence when multiple zones overlap

```typescript
enum DropZonePriority {
  COMPONENT_LEVEL = 1,    // Highest priority: Left/Right of individual components
  ROW_LAYOUT_LEVEL = 2,   // Medium priority: Top/Bottom of entire row
  CANVAS_LEVEL = 3        // Lowest priority: Canvas empty areas
}
```

**Priority Resolution Logic**:
1. **Component Level First**: If cursor is in left/right edge of component within row → Insert within row
2. **Row Level Second**: If cursor is in top/bottom edge of row → Insert above/below entire row
3. **Canvas Level Last**: If cursor is in empty canvas area → Create new standalone component

### Rule 2: Row Layout Dragging Rules
**Scenario**: Dragging an entire horizontal layout to reposition it

```typescript
// Before: 
// [Component A]
// [Row Layout [Component B, Component C]]
// [Component D]

// Action: Drag Row Layout above Component A
// After:
// [Row Layout [Component B, Component C]]
// [Component A] 
// [Component D]
```

**Implementation Logic**:
1. Detect drag initiation from row layout drag handle
2. Treat entire row layout as single draggable unit
3. Maintain all child components within row during drag
4. Allow vertical repositioning only (no horizontal splitting)
5. Update form structure while preserving row integrity

### Rule 3: Blocked Drop Zones
**Scenario**: Preventing invalid drop operations within row layouts

```typescript
interface BlockedDropZones {
  // Inside row layout - center areas of components
  componentCenterAreas: {
    blocked: true;
    reason: "Use left/right edges for horizontal insertion";
    alternative: "Drop above/below row for vertical insertion";
  };
  
  // Row layout interior (not component edges)
  rowInteriorAreas: {
    blocked: true;
    reason: "Cannot insert into middle of row layout";  
    alternative: "Use component left/right edges or row top/bottom edges";
  };
  
  // Nested row layouts
  nestedRowLayouts: {
    blocked: true;
    reason: "Row layouts cannot be nested inside other rows";
    alternative: "Drop above/below existing row to create separate row";
  };
}
```

### Rule 4: Dynamic Layout Transformation Rules

#### Rule 4A: Empty Canvas Behavior
**State**: Empty Canvas (No components)
**Available Actions**: 
- Drop component anywhere → Creates single element in Column Layout
- Only top/bottom drop zones active (vertical arrangement)

```typescript
// Initial State: [Empty Canvas]
// Action: Drop Component A anywhere
// Result: [Canvas: Component A] (Column Layout mode)
```

#### Rule 4B: Two-Element Choice Point
**State**: Two elements can be arranged vertically OR horizontally

**Scenario 1: Vertical Arrangement (Top/Bottom Drop)**
```typescript
// Before: [Canvas: Component A]  
// Action: Drop Component B above/below Component A
// Result: [Canvas: Component A, Component B] (Column Layout maintained)
```

**Scenario 2: Horizontal Arrangement (Left/Right Drop)**
```typescript
// Before: [Canvas: Component A]
// Action: Drop Component B left/right of Component A  
// Result: [Canvas: Row Container [Component A, Component B]] (Row Layout created)
```

#### Rule 4C: Three-Element Layout Transformation

**Path 1: Pure Column Layout (3 Vertical Elements)**
```typescript
// State: [Canvas: Component A, Component B, Component C]
// All components: Top/Bottom drop zones only
// Layout: Pure vertical arrangement
```

**Path 2: Mixed Layout (1 Column + 1 Row)**  
```typescript
// State: [Canvas: Component A, Row Container [Component B, Component C]]
// Component A: Top/Bottom zones (as standalone)
// Row Container: Top/Bottom zones (as single unit)
// Component B,C: Left/Right zones (within row)
```

**Path 3: Single Row Layout (3 Horizontal Elements)**
```typescript
// State: [Canvas: Row Container [Component A, Component B, Component C]]
// Row Container: Top/Bottom zones (as single unit)
// All components: Left/Right zones (within row)
```

### Rule 5: Element Extraction and Container Dissolution

#### Rule 5A: Extract from Row (3→2+1 Transformation)
**Scenario**: Remove one element from 3-element row layout

```typescript
// Before: [Canvas: Row Container [A, B, C]]
// Action: Drag Component C out (top/bottom drop)
// After: [Canvas: Component C, Row Container [A, B]] (Mixed layout)
```

**Implementation Logic**:
1. Detect component being dragged out of row container
2. Remove component from row container children
3. Preserve row container with remaining 2 components
4. Insert extracted component at canvas level (column position)
5. Result: Mixed layout (Column + Row hybrid)

#### Rule 5B: Complete Row Dissolution (2→2 Transformation)
**Scenario**: Remove element from 2-element row layout

```typescript
// Before: [Canvas: Row Container [A, B]]
// Action: Drag Component B out (top/bottom drop)  
// After: [Canvas: Component A, Component B] (Pure column layout)
```

**Implementation Logic**:
1. Detect row container reduced to single element
2. Extract remaining component from dissolving container
3. Delete empty row container
4. Convert both components to column layout elements
5. Result: Pure column layout restored

#### Rule 5C: Progressive Row Expansion (2→3→4 Growth)
**Scenario**: Add elements to existing row layout

```typescript
// Before: [Canvas: Row Container [A, B]]
// Action: Drag Component C to left/right of A or B
// After: [Canvas: Row Container [A, B, C]] (Expanded row)

// Before: [Canvas: Row Container [A, B, C]]  
// Action: Drag Component D to left/right position
// After: [Canvas: Row Container [A, B, C, D]] (Maximum capacity)
```

### Rule 6: Layout Mode Detection and Enforcement

#### Column Layout Mode (Default/Vertical)
- **Activation**: Default state, or when no horizontal arrangements exist
- **Available Drop Zones**: Top, Bottom (vertical positioning)
- **Element Behavior**: All elements are standalone or row containers
- **Visual Indicators**: Horizontal drop lines above/below elements

#### Row Layout Mode (Horizontal)  
- **Activation**: When elements are arranged left-to-right within container
- **Available Drop Zones**: Left, Right (horizontal positioning within row)
- **Element Behavior**: Components are children of horizontal layout container
- **Visual Indicators**: Vertical drop lines left/right of components

#### Mixed Layout Mode (Hybrid)
- **Activation**: Combination of standalone elements and row containers
- **Available Drop Zones**: Context-dependent (column zones for canvas, row zones within containers)
- **Element Behavior**: Mixed standalone and containerized elements
- **Visual Indicators**: Both horizontal and vertical drop lines based on context

### Rule 7: Initial Side-by-Side Creation
**Scenario**: Dragging component to the left/right of an existing standalone component

```typescript
// Before: [Component A]
// Action: Drag Component B to right of Component A
// After: [Horizontal Layout [Component A, Component B]]
```

**Implementation Logic**:
1. Detect drop position as `left` or `right`
2. Create new `horizontal_layout` container
3. Move target component into layout as first child
4. Add new component as second child (position based on `left`/`right`)
5. Replace original component with new horizontal layout

### Rule 2: Progressive Row Expansion  
**Scenario**: Dragging component to left/right of component already in horizontal layout

```typescript
// Before: [Horizontal Layout [Component A, Component B]]
// Action: Drag Component C to right of Component B
// After: [Horizontal Layout [Component A, Component B, Component C]]
```

**Implementation Logic**:
1. Detect that target component is within existing horizontal layout
2. Find target component's position within layout children
3. Insert new component at calculated index based on drop side
4. Validate row doesn't exceed maximum capacity (default: 4 components)

### Rule 3: Row Capacity Management
**Constraints**:
- **Maximum Components per Row**: 4 components (configurable)
- **Minimum Components per Row**: 2 components
- **Auto-dissolution**: Rows with only 1 component automatically dissolve back to standalone

```typescript
interface HorizontalLayoutConfig {
  maxComponentsPerRow: number;     // Default: 4
  minComponentsPerRow: number;     // Default: 2  
  autoDissolveEmptyRows: boolean;  // Default: true
}
```

### Rule 4: Row Dissolution Logic
**Scenarios for Row Dissolution**:

1. **Single Component Remaining**: When row has only 1 component left after deletion
```typescript
// Before: [Horizontal Layout [Component A]]
// After: [Component A] (standalone)
```

2. **Empty Row**: When all components are removed from row
```typescript
// Before: [Horizontal Layout []]
// After: [] (layout removed entirely)
```

## Drop Zone Behavior

### Hierarchical Drop Zone System

The system implements **nested drop zone behavior** with different rules for individual components vs. row layouts:

#### Level 1: Individual Component Drop Zones (Within Row Layout)
**Scope**: Components inside a horizontal layout
**Available Positions**: Left and Right only

| Drop Position | Visual Indicator | Result |
|---------------|------------------|--------|
| **Left Edge** | Blue line on left side of component | Insert to left within same row |
| **Right Edge** | Blue line on right side of component | Insert to right within same row |
| **Center Area** | No drop allowed | Blocked - use left/right edges |

#### Level 2: Row Layout Drop Zones (Entire Row)
**Scope**: The horizontal layout container as a whole unit
**Available Positions**: Top and Bottom only

| Drop Position | Visual Indicator | Result |
|---------------|------------------|--------|
| **Top Edge** | Horizontal blue line above entire row | Insert new component/row above this row |
| **Bottom Edge** | Horizontal blue line below entire row | Insert new component/row below this row |
| **Row Interior** | No drop allowed for external components | Internal left/right positioning only |

### Nested Drop Zone Detection Logic

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

### Row Layout Dragging Behavior

#### Drag Handle System
**Row Layout as Single Unit**: Entire horizontal layouts can be dragged and repositioned

```typescript
interface RowLayoutDragBehavior {
  // Drag initiation
  dragHandle: {
    location: 'top-left-corner' | 'left-border' | 'drag-icon';
    visual: 'grip-dots' | 'drag-handle-icon';
    cursor: 'move' | 'grab';
  };
  
  // Drag feedback
  dragFeedback: {
    rowHighlight: boolean;        // Highlight entire row during drag
    ghostPreview: boolean;        // Show ghost image of entire row
    dropZonePreview: boolean;     // Show valid drop zones
  };
  
  // Drop validation
  dropValidation: {
    allowRowReordering: boolean;  // Can reorder rows vertically
    allowRowNesting: boolean;     // Can nest rows (false by default)
    preserveRowIntegrity: boolean; // Keep all child components together
  };
}
```

## Component Data Structure

### Horizontal Layout Component Schema
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

### Child Component Constraints
- **Width Distribution**: Components within horizontal layout share available width
- **Responsive Behavior**: On small screens, horizontal layouts can wrap to vertical stacks
- **Validation Independence**: Each child component validates independently

## State Management Integration

### FormStateEngine Actions

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

## Dynamic Layout Transformation Flow

### Complete Transformation State Machine

The system follows a sophisticated state machine that automatically manages layout transformations based on element count, positioning, and user actions:

```mermaid
stateDiagram-v2
    [*] --> EmptyCanvas
    
    EmptyCanvas --> SingleElement : Drop Component
    
    SingleElement --> TwoVertical : Drop Top/Bottom
    SingleElement --> TwoHorizontal : Drop Left/Right
    
    TwoVertical --> ThreeVertical : Drop Top/Bottom
    TwoVertical --> MixedLayout : Drop Left/Right on element
    
    TwoHorizontal --> ThreeHorizontal : Drop Left/Right
    TwoHorizontal --> MixedLayout : Drop Top/Bottom outside row
    TwoHorizontal --> TwoVertical : Extract element (dissolution)
    
    ThreeVertical --> FourVertical : Drop Top/Bottom
    ThreeVertical --> MixedLayout : Drop Left/Right on element
    
    ThreeHorizontal --> FourHorizontal : Drop Left/Right (max capacity)
    ThreeHorizontal --> MixedLayout : Extract element
    ThreeHorizontal --> TwoVertical : Extract 2 elements (full dissolution)
    
    MixedLayout --> ThreeVertical : Dissolve row container
    MixedLayout --> ThreeHorizontal : Move standalone to row
    MixedLayout --> FourMixed : Add more elements
    
    FourHorizontal --> MixedLayout : Extract element
    FourVertical --> MixedLayout : Create horizontal grouping
```

### Detailed Transformation Scenarios

#### Scenario 1: Progressive Column Building (Default Mode)
```typescript
// Step 1: Empty Canvas
Canvas: []
Available: Anywhere (creates column layout)

// Step 2: Single Element  
Canvas: [Component A]
Available: Top/Bottom of A (vertical expansion)

// Step 3: Two Elements (Vertical)
Canvas: [Component A, Component B] 
Available: Top/Bottom of each element

// Step 4: Three Elements (Pure Column)
Canvas: [Component A, Component B, Component C]
Available: Top/Bottom of each element (pure vertical mode)
```

#### Scenario 2: Horizontal Layout Creation and Evolution
```typescript
// Step 1: Single Element
Canvas: [Component A]
Available: Left/Right (horizontal trigger)

// Step 2: Create Row Container
// Action: Drop Component B to right of A
Canvas: [Row Container [Component A, Component B]]
Available: Left/Right within row, Top/Bottom of container

// Step 3: Expand Row
// Action: Drop Component C to right of B
Canvas: [Row Container [Component A, Component B, Component C]]
Available: Left/Right within row, Top/Bottom of container

// Step 4: Maximum Row Capacity  
// Action: Drop Component D to left/right position
Canvas: [Row Container [Component A, Component B, Component C, Component D]]
Available: Only Top/Bottom of container (row full)
```

#### Scenario 3: Element Extraction and Container Management
```typescript
// Starting State: 3-Element Row
Canvas: [Row Container [A, B, C]]

// Action: Drag Component C above/below the row container
// Result: Mixed Layout
Canvas: [
  Component C,                    // Extracted element (standalone)
  Row Container [A, B]           // Remaining 2-element row
]

// Available Drop Zones:
// Component C: Top/Bottom (column behavior)
// Row Container: Top/Bottom (as single unit)
// Components A, B: Left/Right (within row)
```

#### Scenario 4: Complete Row Dissolution
```typescript
// Starting State: 2-Element Row  
Canvas: [Row Container [A, B]]

// Action: Drag Component B above/below the row container
// Result: Complete Dissolution → Pure Column Layout
Canvas: [Component A, Component B]

// Implementation:
// 1. Remove Component B from row container
// 2. Row container now has only Component A (< minimum)
// 3. Extract Component A from dissolving container
// 4. Delete empty row container
// 5. Place both A and B as column layout elements
```

#### Scenario 5: Mixed Layout Complexity
```typescript
// State: Complex Mixed Layout
Canvas: [
  Component A,                    // Standalone (column element)
  Row Container [B, C, D],       // 3-element row
  Component E,                    // Standalone (column element)  
  Row Container [F, G]           // 2-element row
]

// Available Drop Zones by Context:
// Component A: Top/Bottom (column positioning)
// Row Container [B,C,D]: Top/Bottom (row unit positioning)
// Components B,C,D: Left/Right (within-row positioning)
// Component E: Top/Bottom (column positioning)
// Row Container [F,G]: Top/Bottom (row unit positioning)
// Components F,G: Left/Right (within-row positioning)

// Extraction Example:
// Action: Drag Component C above Component A
// Result: 
Canvas: [
  Component C,                    // Extracted element
  Component A,                    // Existing standalone
  Row Container [B, D],          // Row reduced to 2 elements
  Component E,                    // Unchanged
  Row Container [F, G]           // Unchanged
]
```

## Drag and Drop Flow

### Hierarchical Drag and Drop Flow Diagram

```mermaid
graph TD
    A[Drag Operation Initiated] --> B{Drag Source Type?}
    
    B -->|Individual Component| C[Component Drag Flow]
    B -->|Entire Row Layout| D[Row Layout Drag Flow]
    
    C --> E{Drop Zone Detection}
    E -->|Component Left/Right Edge| F[Within Row Insertion]
    E -->|Row Top/Bottom Edge| G[Above/Below Row Insertion]  
    E -->|Canvas Empty Area| H[Standalone Component Creation]
    E -->|Blocked Center Area| I[Show Error: Use Edges]
    
    F --> J{Target Row Has Space?}
    J -->|Yes| K[Insert in Row Position]
    J -->|No| L[Show Error: Row Full]
    
    G --> M[Create Component Above/Below Row]
    H --> N[Create Standalone Component]
    
    D --> O{Row Drop Target}
    O -->|Above Another Row| P[Reorder: Move Row Up]
    O -->|Below Another Row| Q[Reorder: Move Row Down]
    O -->|Between Components| R[Insert Row Between Elements]
    O -->|Invalid Nesting Target| S[Show Error: No Nesting]
    
    K --> T[Update Row Layout Children]
    M --> U[Update Form Structure]
    N --> V[Add to Form Components]
    P --> W[Reorder Form Structure]
    Q --> W
    R --> U
    
    T --> X[Trigger Re-render]
    U --> X
    V --> X
    W --> X
```

### Row Layout Drag and Drop Specifics

#### 1. Row Layout Drag Initiation
```typescript
interface RowLayoutDragInitiation {
  // Drag handle detection
  dragHandleZones: {
    topLeftCorner: { width: '20px', height: '20px' };
    leftBorder: { width: '8px', height: '100%' };
    dragIcon: { width: '16px', height: '16px' };
  };
  
  // Drag behavior
  dragBehavior: {
    highlightEntireRow: true;        // Visual feedback
    preserveChildComponents: true;   // All children move together
    preventHorizontalDrag: true;     // Only vertical repositioning
    showDropZoneIndicators: true;    // Show valid drop areas
  };
}
```

#### 2. Row Layout Drop Validation
```typescript
interface RowLayoutDropValidation {
  // Valid drop targets for entire row layouts
  validDropTargets: {
    aboveOtherRows: boolean;         // Can drop above other row layouts
    belowOtherRows: boolean;         // Can drop below other row layouts
    betweenStandaloneComponents: boolean; // Can drop between individual components
    emptyCanvasAreas: boolean;       // Can drop in empty canvas space
  };
  
  // Invalid drop targets
  invalidDropTargets: {
    insideOtherRows: boolean;        // Cannot nest rows inside rows
    componentCenterAreas: boolean;   // Cannot drop on component centers
    componentEdgeAreas: boolean;     // Cannot drop on component left/right edges
  };
}
```

### Nested Drop Zone Resolution Algorithm

```typescript
class HierarchicalDropZoneResolver {
  static resolveDropZone(
    mousePosition: { x: number, y: number },
    targetElement: HTMLElement,
    formStructure: FormComponentData[]
  ): DropZoneResult {
    
    // Priority 1: Check component-level zones (left/right edges)
    const componentZone = this.detectComponentEdgeZone(mousePosition, targetElement);
    if (componentZone.detected && componentZone.type === 'edge') {
      return {
        level: 'component',
        action: 'insert_in_row',
        position: componentZone.side, // 'left' | 'right'
        targetId: componentZone.componentId
      };
    }
    
    // Priority 2: Check row-level zones (top/bottom edges)  
    const rowZone = this.detectRowLayoutZone(mousePosition, targetElement);
    if (rowZone.detected && rowZone.type === 'edge') {
      return {
        level: 'row',
        action: 'insert_relative_to_row',
        position: rowZone.side, // 'above' | 'below'
        targetId: rowZone.rowLayoutId
      };
    }
    
    // Priority 3: Check canvas-level zones (empty areas)
    const canvasZone = this.detectCanvasZone(mousePosition, formStructure);
    if (canvasZone.detected) {
      return {
        level: 'canvas',
        action: 'create_standalone',
        position: canvasZone.insertIndex
      };
    }
    
    // Priority 4: Blocked zone
    return {
      level: 'blocked',
      action: 'show_error',
      message: 'Drop not allowed in this area. Use component edges or row edges.'
    };
  }
}
```

## Validation Rules

### Layout Validation
1. **Child Component Limit**: Maximum 4 components per horizontal layout
2. **Minimum Components**: Horizontal layouts must have at least 2 components
3. **Component Type Restrictions**: Some components may be restricted from horizontal layouts:
   - `section_divider`: Generally not allowed in horizontal layouts
   - `rich_text`: May be restricted due to width requirements

### Business Rules Validation
```typescript
interface LayoutValidationRules {
  validateHorizontalLayoutCreation(
    targetComponent: FormComponentData,
    newComponent: FormComponentData
  ): ValidationResult;
  
  validateComponentAddition(
    layout: HorizontalLayoutComponent,
    newComponent: FormComponentData
  ): ValidationResult;
  
  validateLayoutDissolution(
    layout: HorizontalLayoutComponent
  ): ValidationResult;
}
```

## Error Handling

### Common Error Scenarios

1. **Row Capacity Exceeded**
   - **Error**: "Cannot add component: Row already contains maximum number of components (4)"
   - **Resolution**: Suggest creating new row or removing existing component

2. **Invalid Component Type**
   - **Error**: "Component type 'section_divider' cannot be added to horizontal layout"
   - **Resolution**: Show alternative drop zones (above/below)

3. **Layout Dissolution Conflict** 
   - **Error**: "Cannot remove component: Would leave empty horizontal layout"
   - **Resolution**: Auto-dissolve layout and convert remaining components to standalone

## Responsive Behavior

### Mobile/Small Screen Adaptation
```typescript
interface ResponsiveLayoutBehavior {
  breakpoints: {
    mobile: '< 768px';     // Stack vertically
    tablet: '768px - 1024px'; // 2 components per row max  
    desktop: '> 1024px';   // Full horizontal layout (up to 4)
  };
  
  stackingBehavior: {
    mobile: 'vertical_stack';      // All components stack vertically
    tablet: 'two_column_wrap';     // Max 2 components per row with wrapping
    desktop: 'horizontal_layout';   // Full horizontal layout
  };
}
```

## Performance Considerations

### Optimization Strategies
1. **Layout Caching**: Cache horizontal layout calculations
2. **Minimal Re-renders**: Only re-render affected layout components
3. **Batch Operations**: Group multiple layout changes into single state update

### Memory Management
```typescript
interface LayoutPerformanceConfig {
  maxCachedLayouts: number;        // Default: 50
  cacheTTL: number;               // Cache time-to-live in ms
  enableBatchUpdates: boolean;     // Batch multiple layout changes
  enableVirtualization: boolean;   // For forms with many horizontal layouts
}
```

## Integration with Form Processing

### Data Collection Impact
- **Field Mapping**: Child components maintain their individual `fieldId` values
- **Validation Flow**: Each component validates independently, layout provides grouping only
- **Submission Format**: Layout structure is not reflected in submitted data

### JSON Schema Export
```typescript
// Horizontal layout is structural only - not exported to data schema
interface ExportBehavior {
  includeLayoutStructure: boolean;  // Include in template schema
  excludeFromDataSchema: boolean;   // Exclude from validation schema
  preserveFieldOrder: boolean;      // Maintain field order in export
}
```

## Implementation Architecture for Dynamic Transformations

### Layout Transformation Engine

```typescript
class DynamicLayoutTransformationEngine {
  
  /**
   * Main transformation controller
   * Determines which transformation to apply based on current state and action
   */
  static executeTransformation(
    currentState: FormComponentData[],
    action: LayoutTransformationAction
  ): LayoutTransformationResult {
    
    const detector = new LayoutStateDetector(currentState);
    const currentLayout = detector.detectLayoutState();
    
    switch (action.type) {
      case 'DROP_VERTICAL':
        return this.handleVerticalDrop(currentState, action, currentLayout);
      case 'DROP_HORIZONTAL':
        return this.handleHorizontalDrop(currentState, action, currentLayout);
      case 'EXTRACT_ELEMENT':
        return this.handleElementExtraction(currentState, action, currentLayout);
      case 'DISSOLVE_CONTAINER':
        return this.handleContainerDissolution(currentState, action, currentLayout);
    }
  }
  
  /**
   * Handle vertical drops (top/bottom positioning)
   * Creates column layout or positions relative to row containers
   */
  static handleVerticalDrop(
    currentState: FormComponentData[],
    action: VerticalDropAction,
    layoutState: LayoutState
  ): LayoutTransformationResult {
    
    if (layoutState.type === 'pure_column') {
      // Simple column insertion
      return this.insertInColumn(currentState, action.targetId, action.component, action.position);
    }
    
    if (layoutState.type === 'single_row' || layoutState.type === 'mixed') {
      // Check if dropping relative to row container
      const targetContainer = this.findRowContainer(currentState, action.targetId);
      
      if (targetContainer && action.extractFrom) {
        // Extract element from row and place in column
        return this.extractToColumn(currentState, action);
      } else {
        // Regular column insertion
        return this.insertInColumn(currentState, action.targetId, action.component, action.position);
      }
    }
  }
  
  /**
   * Handle horizontal drops (left/right positioning)  
   * Creates row containers or expands existing ones
   */
  static handleHorizontalDrop(
    currentState: FormComponentData[],
    action: HorizontalDropAction,
    layoutState: LayoutState
  ): LayoutTransformationResult {
    
    const targetComponent = this.findComponent(currentState, action.targetId);
    const existingContainer = this.findParentRowContainer(currentState, action.targetId);
    
    if (!existingContainer) {
      // Create new row container with target and new component
      return this.createRowContainer(currentState, action.targetId, action.component, action.position);
    } else {
      // Add to existing row container (if capacity allows)
      if (existingContainer.children.length >= 4) {
        return { success: false, error: 'Row container at maximum capacity' };
      }
      return this.expandRowContainer(currentState, existingContainer.id, action.component, action.position);
    }
  }
  
  /**
   * Handle element extraction from containers
   * Manages container dissolution when necessary
   */
  static handleElementExtraction(
    currentState: FormComponentData[],
    action: ExtractElementAction,
    layoutState: LayoutState
  ): LayoutTransformationResult {
    
    const sourceContainer = this.findParentRowContainer(currentState, action.elementId);
    
    if (!sourceContainer) {
      return { success: false, error: 'Element not in container' };
    }
    
    const remainingElements = sourceContainer.children.filter(child => child.id !== action.elementId);
    
    if (remainingElements.length === 1) {
      // Dissolve container - only one element remaining
      return this.dissolveRowContainer(currentState, sourceContainer.id, action.targetPosition);
    } else if (remainingElements.length >= 2) {
      // Preserve container with remaining elements
      return this.extractElementPreserveContainer(currentState, action);
    }
  }
}

/**
 * Layout state detection utility
 * Analyzes current form structure and determines layout patterns
 */
class LayoutStateDetector {
  constructor(private components: FormComponentData[]) {}
  
  detectLayoutState(): LayoutState {
    const rowContainers = this.components.filter(c => c.type === 'horizontal_layout');
    const standaloneComponents = this.components.filter(c => c.type !== 'horizontal_layout');
    
    if (rowContainers.length === 0) {
      return {
        type: 'pure_column',
        elementCount: standaloneComponents.length,
        availableActions: ['vertical_drop', 'horizontal_creation']
      };
    }
    
    if (rowContainers.length === 1 && standaloneComponents.length === 0) {
      return {
        type: 'single_row', 
        elementCount: rowContainers[0].children?.length || 0,
        availableActions: ['horizontal_expansion', 'element_extraction', 'vertical_positioning']
      };
    }
    
    return {
      type: 'mixed',
      rowContainers: rowContainers.length,
      standaloneComponents: standaloneComponents.length,
      availableActions: ['all_operations']
    };
  }
}

/**
 * Container lifecycle management
 * Handles creation, expansion, and dissolution of row containers
 */
class RowContainerLifecycleManager {
  
  /**
   * Create new row container from two components
   */
  static createRowContainer(
    components: FormComponentData[],
    targetComponentId: string,
    newComponent: FormComponentData,
    position: 'left' | 'right'
  ): FormComponentData[] {
    
    const targetIndex = components.findIndex(c => c.id === targetComponentId);
    const targetComponent = components[targetIndex];
    
    // Create horizontal layout container
    const rowContainer: FormComponentData = {
      id: generateId(),
      type: 'horizontal_layout',
      label: 'Row Layout',
      fieldId: `row_${Date.now()}`,
      required: false,
      children: position === 'left' 
        ? [newComponent, targetComponent]
        : [targetComponent, newComponent]
    };
    
    // Replace target component with new row container
    const result = [...components];
    result[targetIndex] = rowContainer;
    
    return result;
  }
  
  /**
   * Dissolve row container when reduced to single element
   */
  static dissolveRowContainer(
    components: FormComponentData[],
    containerID: string,
    targetPosition: InsertPosition
  ): FormComponentData[] {
    
    const containerIndex = components.findIndex(c => c.id === containerID);
    const container = components[containerIndex] as FormComponentData;
    
    // Extract remaining child component
    const remainingChild = container.children?.[0];
    
    if (!remainingChild) {
      // Empty container - just remove it
      return components.filter(c => c.id !== containerID);
    }
    
    // Replace container with remaining child component
    const result = [...components];
    result[containerIndex] = remainingChild;
    
    return result;
  }
}
```

## API Reference

### Core Methods

```typescript
class HorizontalLayoutManager {
  // Create horizontal layout with two components
  static createHorizontalLayout(
    targetComponent: FormComponentData,
    newComponent: FormComponentData, 
    insertSide: 'left' | 'right'
  ): HorizontalLayoutComponent;
  
  // Add component to existing horizontal layout
  static addToHorizontalLayout(
    layout: HorizontalLayoutComponent,
    component: FormComponentData,
    insertIndex: number
  ): HorizontalLayoutComponent;
  
  // Remove component from horizontal layout
  static removeFromHorizontalLayout(
    layout: HorizontalLayoutComponent,
    componentId: string
  ): HorizontalLayoutComponent | FormComponentData[];
  
  // Dissolve horizontal layout back to standalone components
  static dissolveHorizontalLayout(
    layout: HorizontalLayoutComponent
  ): FormComponentData[];
  
  // Validate horizontal layout operations
  static validateLayoutOperation(
    operation: LayoutOperation,
    context: LayoutContext
  ): ValidationResult;
}
```

This business logic documentation provides comprehensive guidance for implementing and maintaining the side-by-side arrangement system within the form builder architecture.