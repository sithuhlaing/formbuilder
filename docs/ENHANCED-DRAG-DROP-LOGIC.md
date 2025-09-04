# Enhanced Drag and Drop Layout Logic

## Overview
The Form Builder implements an intelligent drag and drop system with advanced layout detection and visual highlighting. This system automatically manages row and column layouts based on drop positions and existing container contexts.

## Core Positioning System

### Zone Detection Priority
The system uses percentage-based zones with the following priority:

1. **Vertical Zones (Top/Bottom)** - Always available for column layout
   - Top zone: `y < height * 0.30` (30% threshold)
   - Bottom zone: `y > height * 0.70` (70% threshold)

2. **Horizontal Zones (Left/Right)** - For row layout creation/extension
   - Left zone: `x < width * 0.25` (25% threshold)  
   - Right zone: `x > width * 0.75` (75% threshold)

3. **Center Zone** - For direct replacement/insertion
   - Middle area: Remaining 50% width × 40% height

## Enhanced Layout Rules

### Rule 1: Vertical Layout Priority (Top/Bottom zones)
```typescript
if (position === 'top' || position === 'bottom') {
  // Always allow vertical positioning for column layout
  return position;
}
```
- **Top/Bottom drops**: Always create vertical (column) layout
- **Visual feedback**: "Drop Above (Column Layout)" / "Drop Below (Column Layout)"
- **Behavior**: Maintains canvas as column layout regardless of element count

### Rule 2: Horizontal Layout Intelligence (Left/Right zones)
```typescript
if (position === 'left' || position === 'right') {
  if (layoutContext.isCurrentRowLayout) {
    // Target IS a row layout container - add as member
    return position; // Add to existing row layout
  } else {
    // Target is regular element - form new row layout
    return `form-row-${position}`; // Signal to create new row layout
  }
}
```

#### For Regular Elements:
- **Left/Right drops**: Create new row layout container
- **Visual feedback**: "Create Row Layout (Left)" / "Create Row Layout (Right)"
- **Behavior**: Forms horizontal container with original element + new element

#### For Existing Row Layout Containers:
- **Left/Right drops**: Add to existing row layout
- **Visual feedback**: "Add to Row Layout (Left)" / "Add to Row Layout (Right)"
- **Behavior**: Extends existing horizontal container

### Rule 3: Within Row Layout Constraints
```typescript
if (targetItem.type === 'horizontal_layout') {
  // Inside row layout: only left/right/center allowed
  if (position === 'top' || position === 'bottom') {
    // Convert vertical to horizontal within row layout
    return 'right'; // Default to right side
  }
  return position; // Allow left/right/center
}
```
- **Within row layouts**: Only horizontal positioning allowed
- **Top/Bottom drops**: Converted to right-side positioning
- **Visual feedback**: Shows horizontal positioning options only

### Rule 4: Row Layout Dragging Constraints
```typescript
if (dragItem.dragType === 'row-layout') {
  // Row layouts can only move vertically (top/bottom)
  if (position === 'left' || position === 'right') {
    return 'center'; // Prevent horizontal row layout movement
  }
  return position;
}
```
- **Row layout containers**: Can only be repositioned vertically
- **Left/Right drops**: Converted to center positioning
- **Behavior**: Maintains row layout integrity during moves

### Rule 5: Prevent Nested Row Layouts
```typescript
if (dragItem.item?.type === 'horizontal_layout' && targetItem.type === 'horizontal_layout') {
  // Row layout onto row layout - convert to vertical positioning
  return 'bottom'; // Place below existing row layout
}
```
- **Row onto row**: Prevents nesting, converts to vertical positioning
- **Behavior**: Places row layout below existing row layout

## Visual Highlighting System

### Enhanced Drop Zone Highlights
The system provides intelligent visual feedback based on context:

#### Top Zone Highlight
```jsx
{(dropPosition === 'top' || dropPosition.includes('top')) && (
  <div className="drop-highlight drop-highlight--top">
    <span className="drop-label">Drop Above (Column Layout)</span>
  </div>
)}
```

#### Bottom Zone Highlight
```jsx
{(dropPosition === 'bottom' || dropPosition.includes('bottom')) && (
  <div className="drop-highlight drop-highlight--bottom">
    <span className="drop-label">Drop Below (Column Layout)</span>
  </div>
)}
```

#### Left Zone Highlight - Context Aware
```jsx
{(dropPosition === 'left' || dropPosition.includes('left')) && (
  <div className="drop-highlight drop-highlight--left">
    <span className="drop-label">
      {layoutContext.isCurrentRowLayout 
        ? 'Add to Row Layout (Left)' 
        : 'Create Row Layout (Left)'}
    </span>
  </div>
)}
```

#### Right Zone Highlight - Context Aware
```jsx
{(dropPosition === 'right' || dropPosition.includes('right')) && (
  <div className="drop-highlight drop-highlight--right">
    <span className="drop-label">
      {layoutContext.isCurrentRowLayout 
        ? 'Add to Row Layout (Right)' 
        : 'Create Row Layout (Right)'}
    </span>
  </div>
)}
```

#### Special Row Formation Highlights
```jsx
{dropPosition.startsWith('form-row-') && (
  <div className="drop-highlight drop-highlight--form-row">
    <span className="drop-label">
      Form New Row Layout ({dropPosition.replace('form-row-', '').toUpperCase()})
    </span>
  </div>
)}
```

## Layout Context Detection

### Row Layout Context
```typescript
const detectRowLayoutContext = useCallback(() => {
  // Check if current item is a row layout
  const isCurrentRowLayout = item.type === 'horizontal_layout';
  
  return {
    isCurrentRowLayout,
    hasRowLayoutSiblings: false, // TODO: Implement sibling detection
    canFormRowLayout: !isCurrentRowLayout,
    canExtendRowLayout: isCurrentRowLayout
  };
}, [item.type]);
```

## Complex Layout Scenarios

### Scenario 1: Empty Canvas → First Element
- **Drop position**: Any
- **Behavior**: Element appears in center
- **Layout**: No container needed

### Scenario 2: One Element → Two Elements
- **Top/Bottom drop**: Creates vertical column layout
- **Left/Right drop**: Creates horizontal row layout container
- **Center drop**: Replaces existing element

### Scenario 3: Row Layout Extension
- **Target**: Existing row layout container
- **Left/Right drop**: Adds element to existing row
- **Top/Bottom drop**: Converted to right-side addition
- **Visual**: Shows "Add to Row Layout" feedback

### Scenario 4: Row Layout Creation
- **Target**: Regular element (not row layout)
- **Left/Right drop**: Creates new row layout container
- **Behavior**: Original element + new element in horizontal container
- **Visual**: Shows "Create Row Layout" feedback

### Scenario 5: Cross-Layout Movement
- **From row to column**: Element moves from horizontal to vertical positioning
- **From column to row**: Element joins or creates horizontal layout
- **Visual**: Context-aware highlighting shows destination layout type

### Scenario 6: Row Layout Dissolution
- **Trigger**: Row layout reduced to ≤1 child
- **Behavior**: Container automatically dissolves
- **Result**: Remaining element promoted to parent level

## CSS Classes and Styling

### Drop Zone Highlights
```css
.drop-highlight {
  position: absolute;
  pointer-events: none;
  border: 2px dashed #007bff;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 4px;
  z-index: 1000;
}

.drop-highlight--top {
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
}

.drop-highlight--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
}

.drop-highlight--left {
  top: 0;
  bottom: 0;
  left: 0;
  width: 25%;
}

.drop-highlight--right {
  top: 0;
  bottom: 0;
  right: 0;
  width: 25%;
}

.drop-highlight--form-row {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}
```

### Drop Labels
```css
.drop-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
```

## Integration Points

### State Management
- **FormStateEngine**: Handles layout creation and dissolution
- **useFormBuilder**: Provides drag-drop event handlers
- **SmartDropZone**: Implements positioning logic and visual feedback

### Event Flow
1. **Hover**: Calculate position → Apply constraints → Show highlights
2. **Drop**: Validate position → Execute layout operation → Update state
3. **Visual**: Update highlights → Show feedback → Clear on completion

### Callback Chain
```
SmartDropZone → DragDropCanvas → FormCanvasAdapter → useFormBuilder → FormStateEngine
```

## Testing Considerations

### Test Scenarios
1. **Position Detection**: Verify correct zone calculation
2. **Layout Creation**: Test row layout formation
3. **Layout Extension**: Test adding to existing rows
4. **Constraint Application**: Verify rule enforcement
5. **Visual Feedback**: Test highlight display
6. **Context Detection**: Verify layout context awareness

### Mock Requirements
- Mouse position simulation
- Drag item creation
- Layout context setup
- Visual element verification

This enhanced system provides intelligent, context-aware drag and drop functionality with comprehensive visual feedback and automatic layout management.
