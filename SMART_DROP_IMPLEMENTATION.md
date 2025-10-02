# Smart Drop Handler Implementation

## Features Implemented

### Feature 2.3: Auto-create Horizontal Layout
**Requirement**: Drag a second component and drop it on the right side of the first component to automatically create a two-column horizontal layout.

**Implementation**:
- When dragging a component from the palette over an existing component, the system detects which edge zone you're hovering over
- **Left Edge (20% from left)**: Dropping here creates a horizontal layout with the new component on the LEFT
- **Right Edge (20% from right)**: Dropping here creates a horizontal layout with the new component on the RIGHT
- The system automatically wraps both components in a `horizontal_layout` container

**Visual Feedback**:
- Green vertical bar appears on the left or right edge when hovering in those zones
- Pulsing animation indicates the drop will create a horizontal layout

### Feature 2.4: Drop into Nested Layouts
**Requirement**: Drag a third component and drop it into one of the columns inside the new horizontal layout.

**Implementation**:
- When hovering over a layout component (horizontal_layout or vertical_layout), the center area (60%) becomes an "inside" drop zone
- Dropping in this zone adds the component as a child of the layout
- Supports unlimited nesting of layouts

**Visual Feedback**:
- Yellow dashed border appears when hovering in the "inside" zone of a layout component
- Indicates the component will be added as a child to the layout

## Drop Zones

The smart drop handler divides each component into 5 zones:

1. **Before Zone** (top 50%, excluding edges): Insert component BEFORE the target
   - Visual: Blue horizontal bar at the top

2. **After Zone** (bottom 50%, excluding edges): Insert component AFTER the target
   - Visual: Blue horizontal bar at the bottom

3. **Left Zone** (left 20%): Create horizontal layout with new component on LEFT
   - Visual: Green vertical bar on the left edge

4. **Right Zone** (right 20%): Create horizontal layout with new component on RIGHT
   - Visual: Green vertical bar on the right edge

5. **Inside Zone** (center 60% for layout components only): Add as child to layout
   - Visual: Yellow dashed border around the entire component

## Files Modified

### Core Logic
- `/src/core/smartDropHandler.ts` - NEW FILE
  - `calculateDropZone()` - Determines which zone the cursor is in
  - `createHorizontalLayout()` - Creates a horizontal layout wrapper
  - `handleSmartDrop()` - Main drop logic that handles all scenarios
  - `insertIntoNestedLayout()` - Handles inserting into layout children

### Canvas Components
- `/src/components/SimpleCanvas.tsx`
  - Added hover detection to track cursor position over components
  - Integrated smart drop logic with `handleSmartDrop()`
  - Passes drop zone info to draggable components for visual feedback

- `/src/components/SimpleDraggableComponent.tsx`
  - Added drop zone visual indicators (colored bars and borders)
  - Added `dropZone` and `componentRef` props

### Wiring Components
- `/src/features/form-builder/components/Canvas.tsx`
  - Added `onUpdateComponents` prop to pass through to SimpleCanvas

- `/src/features/form-builder/components/CanvasCard.tsx`
  - Added `onUpdateComponents` prop to pass through to Canvas

- `/src/features/form-builder/components/FormBuilder.tsx`
  - Destructures `updateComponents` from useFormBuilder hook
  - Passes it to CanvasCard

### State Management
- `/src/hooks/useSimpleFormBuilder.ts`
  - Added `updateComponents()` method to replace entire component array
  - Includes history tracking for undo/redo support

## How It Works

### Step 1: User Drags Component from Palette
- Component palette items have type `'component-type'`
- When dragging starts, the drag item includes the `componentType` (e.g., 'text_input')

### Step 2: Hovering Over Canvas
- SimpleCanvas tracks mouse position in real-time during hover
- Uses `componentRefs` Map to get DOM positions of all components
- Detects which component is being hovered over

### Step 3: Calculate Drop Zone
- Calls `calculateDropZone(clientOffset, elementRect, isLayoutComponent)`
- Returns one of: 'before', 'after', 'left', 'right', or 'inside'
- This info is stored in `dropZoneInfo` state

### Step 4: Visual Feedback
- DropZoneInfo is passed to the hovered component via `dropZone` prop
- SimpleDraggableComponent renders colored indicators based on the zone
- User sees exactly where the component will be dropped

### Step 5: Drop
- On drop, SimpleCanvas calls `handleSmartDrop(components, componentType, dropZoneInfo)`
- handleSmartDrop creates the appropriate structure:
  - 'left' or 'right': Creates horizontal layout
  - 'inside': Adds to layout children
  - 'before' or 'after': Simple insertion
- Returns new components array and selected ID

### Step 6: Update State
- New components array is passed to `updateComponents()` hook
- Hook updates the current page's components
- Saves to history for undo/redo
- UI re-renders with new structure

## Testing the Feature

### Test 2.3: Create Horizontal Layout

1. Open the form builder (http://localhost:5174)
2. Drag a "Text Input" component from the palette to the canvas
3. Drag another "Text Input" component
4. Hover over the first component on the **right edge** (you'll see a green bar)
5. Drop - A horizontal layout is created with both components side-by-side

### Test 2.4: Drop into Nested Layout

1. After completing Test 2.3 (you should have a horizontal layout)
2. Drag a "Number Input" component from the palette
3. Hover over the horizontal layout in the **center** (you'll see a yellow dashed border)
4. Drop - The number input is added inside the horizontal layout as a third column

## Edge Cases Handled

1. **No target component**: Falls back to simple vertical insertion
2. **Dropping on non-layout with 'inside' zone**: Treats as 'after' instead
3. **Empty canvas**: First component always goes to position 0
4. **Nested layouts**: Recursively searches for the target layout to insert into
5. **History management**: All smart drops are tracked in undo/redo history

## Color Coding

- **Blue** (#007bff): Vertical insertion (before/after)
- **Green** (#28a745): Horizontal layout creation (left/right)
- **Yellow** (#ffc107): Nested insertion (inside layout)

This color scheme helps users understand the different types of drops available.
