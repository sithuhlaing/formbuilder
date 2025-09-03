# Form Builder Architecture Guide

## Table of Contents
1. [Overview](#overview)
2. [Drag and Drop System](#drag-and-drop-system)
3. [Properties Panel System](#properties-panel-system)
4. [Inline Editing System](#inline-editing-system)
5. [Multi-Page Form Wizard System](#multi-page-form-wizard-system)
6. [Preview Modal Wizard System](#preview-modal-wizard-system)
7. [Dual JSON Schema Architecture](#dual-json-schema-architecture)
8. [Survey Data Collection & Analytics System](#survey-data-collection--analytics-system)
9. [Visual Analytics & Chart Generation](#visual-analytics--chart-generation)
10. [PDF Export & Report Generation](#pdf-export--report-generation)
11. [Headless JSON Schema](#headless-json-schema)
12. [JSON Marshal/Unmarshal Operations](#json-marshalunmarshal-operations)
13. [Form Layout and Field Loading](#form-layout-and-field-loading)
14. [JSON Export System](#json-export-system)
15. [Form Validation Engine](#form-validation-engine)
16. [Dependency Logic](#dependency-logic)
17. [Technical Implementation](#technical-implementation)

## Overview

The Form Builder is a sophisticated drag-and-drop interface for creating dynamic forms with advanced layout management, validation, and export capabilities. It operates on a headless JSON architecture, separating the form schema from its visual representation.

### Core Architecture Principles

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Visual UI     │    │  Business Logic │    │  JSON Schema    │
│                 │◄──►│                 │◄──►│                 │
│ • Drag & Drop   │    │ • State Engine  │    │ • Component Data│
│ • Component     │    │ • Validation    │    │ • Layout Config │
│   Rendering     │    │ • Dependencies  │    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Drag and Drop System

### Two Types of Drag-and-Drop Operations

The form builder supports two distinct drag-and-drop behaviors with different purposes and outcomes.

#### Type 1: Element Creation (Left Panel → Canvas)
```javascript
/**
 * CREATES NEW ELEMENTS
 * Source: Component Palette (Left Panel)
 * Target: Canvas Area
 * Purpose: Add new form components to the form
 * Result: New FormComponentData objects are created and inserted
 */
class ElementCreationDragDrop {
  static handlePaletteToCanvas(componentType, dropPosition, targetContainer) {
    // Create brand new component instance
    const newComponent = ComponentEngine.createComponent(componentType);
    
    // Insert into canvas at specified position
    return LayoutManager.insertNewComponent(targetContainer, newComponent, dropPosition);
  }
}

// Example: Dragging "Text Input" from left panel creates new text_input component
const creationExample = {
  source: 'left_panel_palette',
  draggedItem: { type: 'text_input', isNew: true },
  dropResult: {
    action: 'CREATE_NEW_COMPONENT',
    newComponent: {
      id: 'text_input_1643718392', // Generated unique ID
      type: 'text_input',
      label: 'Text Input',
      fieldId: 'field_1643718392'
      // ... other default properties
    }
  }
};
```

#### Type 2: Layout Rearrangement (Canvas → Canvas)
```javascript
/**
 * REARRANGES EXISTING ELEMENTS
 * Source: Canvas (Existing Component)
 * Target: Canvas (Different Position)
 * Purpose: Reorganize form layout without creating new components
 * Result: Existing components moved to new positions, layouts restructured
 */
class LayoutRearrangementDragDrop {
  static handleCanvasToCanvas(existingComponentId, dropPosition, targetContainer) {
    const existingComponent = ComponentEngine.findComponent(existingComponentId);
    
    // Remove from current position
    const sourceContainer = LayoutManager.findParentContainer(existingComponentId);
    LayoutManager.removeComponent(sourceContainer, existingComponentId);
    
    // Insert at new position (no new component created)
    return LayoutManager.insertExistingComponent(targetContainer, existingComponent, dropPosition);
  }
}

// Example: Moving existing text input to different position rearranges layout
const rearrangementExample = {
  source: 'canvas_existing_component',
  draggedItem: { id: 'text_input_1643718392', isExisting: true },
  dropResult: {
    action: 'REARRANGE_LAYOUT',
    movedComponent: 'text_input_1643718392', // Same component, new position
    layoutChanges: {
      sourceContainer: 'row_layout_456',
      targetContainer: 'column_layout_789',
      positionChange: 'moved_from_row_to_column'
    }
  }
};
```

### Element Deletion System

#### Hover-Based Delete Interface
```javascript
/**
 * Delete functionality appears on component hover
 * Location: Right corner of hovered component
 * Trigger: Mouse hover over any canvas component
 * Action: Click delete button to remove component
 */
class ComponentDeletionSystem {
  static renderDeleteButton(component) {
    return (
      <div className="component-hover-controls">
        <button 
          className="delete-button"
          onClick={() => this.handleDelete(component.id)}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    );
  }
  
  static handleDelete(componentId) {
    const parentContainer = LayoutManager.findParentContainer(componentId);
    
    // Remove component from container
    const updatedContainer = LayoutManager.removeComponent(parentContainer, componentId);
    
    // Check if container cleanup is needed
    const cleanupResult = LayoutCleanupManager.handleElementRemoval(updatedContainer, componentId);
    
    // Update form state
    FormStateEngine.executeAction({
      type: 'DELETE_COMPONENT',
      payload: { componentId, cleanupResult }
    });
  }
}
```

#### Delete Button Behavior
```javascript
const DELETE_BUTTON_BEHAVIOR = {
  visibility: {
    trigger: 'component_hover',
    position: 'top_right_corner',
    offset: { top: '-8px', right: '-8px' }
  },
  
  styling: {
    background: '#ef4444', // Red background
    color: 'white',
    shape: 'circle',
    size: '24px',
    icon: '×' // Close/delete symbol
  },
  
  functionality: {
    onClick: 'delete_component',
    confirmation: 'none', // Immediate deletion
    undoSupport: 'available_via_undo_system'
  },
  
  layoutImpact: {
    singleComponent: 'remove_from_container',
    lastInRowLayout: 'dissolve_row_to_column',
    multipleComponents: 'maintain_existing_layout'
  }
};
```

### Drag-Drop Operation Flow Comparison

#### Complete Operation Workflows

```javascript
/**
 * WORKFLOW 1: Creating New Elements (Left Panel → Canvas)
 */
const CREATION_WORKFLOW = {
  step1: {
    action: 'User starts drag from left panel component palette',
    data: { componentType: 'text_input', isNew: true }
  },
  
  step2: {
    action: 'Mouse moves over canvas area',
    effect: 'Smart drop zones activate, position detection begins'
  },
  
  step3: {
    action: 'Mouse hovers over drop position',
    effect: 'Visual feedback shows where new component will be created'
  },
  
  step4: {
    action: 'User releases mouse (drop)',
    process: [
      'ComponentEngine.createComponent(type) generates new instance',
      'LayoutManager.insertNewComponent() places it in layout',
      'FormStateEngine executes ADD_COMPONENT action',
      'Canvas re-renders with new component'
    ]
  },
  
  result: {
    componentsCount: '+1', // New component added to form
    layoutChange: 'Insert new component at dropped position',
    stateAction: 'ADD_COMPONENT'
  }
};

/**
 * WORKFLOW 2: Rearranging Existing Elements (Canvas → Canvas)
 */
const REARRANGEMENT_WORKFLOW = {
  step1: {
    action: 'User starts drag from existing canvas component',
    data: { componentId: 'text_input_123', isExisting: true }
  },
  
  step2: {
    action: 'Component is lifted from current position',
    effect: 'Source container may trigger layout dissolution check'
  },
  
  step3: {
    action: 'Mouse moves over different canvas position',
    effect: 'Drop zones show rearrangement options'
  },
  
  step4: {
    action: 'User releases mouse (drop)',
    process: [
      'LayoutManager.removeComponent() removes from source',
      'LayoutCleanupManager.checkDissolution() handles source cleanup',
      'LayoutManager.insertExistingComponent() places at target',
      'FormStateEngine executes REORDER_COMPONENTS action'
    ]
  },
  
  result: {
    componentsCount: '0', // No new components created
    layoutChange: 'Existing component moved to new position',
    stateAction: 'REORDER_COMPONENTS'
  }
};
```

#### Key Differences Between Operations

| Aspect | Creation (Palette → Canvas) | Rearrangement (Canvas → Canvas) |
|--------|----------------------------|----------------------------------|
| **Purpose** | Add new form components | Reorganize existing layout |
| **Source** | Left panel palette | Existing canvas component |
| **Component Count** | +1 (creates new) | 0 (moves existing) |
| **Component ID** | Generated new ID | Preserves existing ID |
| **Form State Action** | `ADD_COMPONENT` | `REORDER_COMPONENTS` |
| **Layout Impact** | Insert new element | Move existing element |
| **Visual Feedback** | "Add here" indicators | "Move here" indicators |
| **Undo Behavior** | Remove created component | Restore original position |

#### React DnD Implementation

```javascript
/**
 * Different drag types for different operations
 */
const DRAG_TYPES = {
  NEW_COMPONENT: 'new-component',    // From palette
  EXISTING_COMPONENT: 'existing-component' // From canvas
};

class DragDropImplementation {
  /**
   * Palette item drag configuration (creates new)
   */
  static createPaletteDragSource(componentType) {
    return useDrag(() => ({
      type: DRAG_TYPES.NEW_COMPONENT,
      item: { 
        componentType,
        isNew: true,
        source: 'palette'
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }));
  }
  
  /**
   * Canvas component drag configuration (rearranges)
   */
  static createCanvasDragSource(component) {
    return useDrag(() => ({
      type: DRAG_TYPES.EXISTING_COMPONENT,
      item: { 
        componentId: component.id,
        component,
        isExisting: true,
        source: 'canvas'
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }));
  }
  
  /**
   * Canvas drop target (accepts both types)
   */
  static createCanvasDropTarget() {
    return useDrop(() => ({
      accept: [DRAG_TYPES.NEW_COMPONENT, DRAG_TYPES.EXISTING_COMPONENT],
      
      drop: (item, monitor) => {
        const dropPosition = monitor.getClientOffset();
        
        if (item.isNew) {
          // Handle new component creation
          return this.handleNewComponentDrop(item.componentType, dropPosition);
        } else {
          // Handle existing component rearrangement
          return this.handleComponentRearrangement(item.componentId, dropPosition);
        }
      },
      
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }));
  }
}
```

### Position Detection Logic

The drag-and-drop system uses precise mouse coordinate calculations to determine drop positions:

```typescript
interface DropPosition {
  type: 'before' | 'after' | 'left' | 'right' | 'center';
  targetId: string;
  coordinates: { x: number; y: number };
}

// Position Detection Thresholds (from business logic)
const POSITION_THRESHOLDS = {
  horizontal: 0.25, // 25% from left/right edges
  vertical: 0.30,   // 30% from top/bottom edges
};
```

### Drop Zone Business Logic

#### Empty Canvas Behavior
```javascript
// Empty canvas accepts drops anywhere and creates column layout
if (canvasIsEmpty) {
  return {
    type: 'center',
    targetId: 'empty-canvas',
    action: 'CREATE_FIRST_COMPONENT'
  };
}
```

#### Populated Canvas Position Detection
```javascript
function detectDropPosition(mouseX, mouseY, targetBounds) {
  const relativeX = (mouseX - targetBounds.left) / targetBounds.width;
  const relativeY = (mouseY - targetBounds.top) / targetBounds.height;
  
  // Horizontal positioning (creates row layouts)
  if (relativeX <= POSITION_THRESHOLDS.horizontal) {
    return { type: 'left', action: 'CREATE_HORIZONTAL_LAYOUT' };
  }
  if (relativeX >= (1 - POSITION_THRESHOLDS.horizontal)) {
    return { type: 'right', action: 'CREATE_HORIZONTAL_LAYOUT' };
  }
  
  // Vertical positioning (maintains column layout)
  if (relativeY <= POSITION_THRESHOLDS.vertical) {
    return { type: 'before', action: 'INSERT_BEFORE' };
  }
  if (relativeY >= (1 - POSITION_THRESHOLDS.vertical)) {
    return { type: 'after', action: 'INSERT_AFTER' };
  }
  
  // Center drop appends to end for populated canvas
  return { type: 'center', action: 'APPEND_TO_END' };
}
```

### Advanced Layout Management System

#### Layout Container Logic

The form builder uses intelligent container management that adapts based on the number of elements and drop positions.

##### Single Element Container Behavior
```javascript
/**
 * When there's only one element in a container (plain layout)
 * The container behaves as a simple wrapper without specific layout constraints
 */
function handleSingleElementContainer(container, newComponent, dropPosition) {
  const existingElement = container.children[0];
  const relativePosition = calculateRelativePosition(dropPosition, existingElement.bounds);
  
  if (relativePosition.isCenter) {
    // Center drop: Create column layout with before/after positioning
    return createColumnLayout(existingElement, newComponent, relativePosition);
  } else if (relativePosition.isLeftRight) {
    // Left/Right drop: Create row layout
    return createRowLayout(existingElement, newComponent, relativePosition);
  }
}
```

##### Column Layout Management (Vertical Stacking)
```javascript
/**
 * Column layout manages vertical arrangement of elements
 * Elements can be inserted before, after, or between existing elements
 */
class ColumnLayoutManager {
  static insertIntoColumn(columnContainer, newComponent, targetElement, position) {
    const children = columnContainer.children;
    const targetIndex = children.findIndex(child => child.id === targetElement.id);
    
    switch (position) {
      case 'before':
        // Insert before target element (top of target)
        children.splice(targetIndex, 0, newComponent);
        break;
        
      case 'after':
        // Insert after target element (bottom of target)
        children.splice(targetIndex + 1, 0, newComponent);
        break;
        
      case 'between':
        // Insert between two elements when there are 3+ elements
        const insertIndex = this.calculateBetweenIndex(dropPosition, children);
        children.splice(insertIndex, 0, newComponent);
        break;
    }
    
    return { ...columnContainer, children };
  }
  
  /**
   * Handle three or more elements in column layout
   * Can insert: topmost, between any two elements, or bottommost
   */
  static calculateBetweenIndex(dropPosition, children) {
    const { y } = dropPosition;
    
    // Check if dropping at topmost position
    if (y < children[0].bounds.top) {
      return 0; // Insert at beginning
    }
    
    // Check if dropping at bottommost position
    if (y > children[children.length - 1].bounds.bottom) {
      return children.length; // Insert at end
    }
    
    // Find position between elements
    for (let i = 0; i < children.length - 1; i++) {
      const currentElement = children[i];
      const nextElement = children[i + 1];
      
      if (y > currentElement.bounds.bottom && y < nextElement.bounds.top) {
        return i + 1; // Insert between current and next
      }
    }
    
    return children.length; // Default to end
  }
}
```

##### Row Layout Management (Horizontal Arrangement)
```javascript
/**
 * Row layout manages horizontal arrangement of elements
 * Elements can be inserted left, right, or between existing elements
 */
class RowLayoutManager {
  static insertIntoRow(rowContainer, newComponent, targetElement, position) {
    const children = rowContainer.children;
    const targetIndex = children.findIndex(child => child.id === targetElement.id);
    
    switch (position) {
      case 'left':
        // Insert to the left of target element
        children.splice(targetIndex, 0, newComponent);
        break;
        
      case 'right':
        // Insert to the right of target element
        children.splice(targetIndex + 1, 0, newComponent);
        break;
        
      case 'between':
        // Insert between elements in row layout
        const insertIndex = this.calculateBetweenIndex(dropPosition, children);
        children.splice(insertIndex, 0, newComponent);
        break;
    }
    
    return { ...rowContainer, children };
  }
  
  /**
   * Handle three or more elements in row layout
   * Can insert: leftmost, between any two elements, or rightmost
   */
  static calculateBetweenIndex(dropPosition, children) {
    const { x } = dropPosition;
    
    // Check if dropping at leftmost position
    if (x < children[0].bounds.left) {
      return 0; // Insert at beginning
    }
    
    // Check if dropping at rightmost position
    if (x > children[children.length - 1].bounds.right) {
      return children.length; // Insert at end
    }
    
    // Find position between elements
    for (let i = 0; i < children.length - 1; i++) {
      const currentElement = children[i];
      const nextElement = children[i + 1];
      
      if (x > currentElement.bounds.right && x < nextElement.bounds.left) {
        return i + 1; // Insert between current and next
      }
    }
    
    return children.length; // Default to end
  }
}
```

#### Complete Drop Position Logic

```javascript
/**
 * Comprehensive drop position detection and layout management
 */
class AdvancedLayoutManager {
  static handleDrop(targetContainer, newComponent, dropPosition) {
    const childCount = targetContainer.children.length;
    
    switch (childCount) {
      case 0:
        // Empty container - add first element
        return this.addFirstElement(targetContainer, newComponent);
        
      case 1:
        // Single element - decide between column or row layout
        return this.handleSingleElementDrop(targetContainer, newComponent, dropPosition);
        
      default:
        // Multiple elements - insert based on existing layout type
        return this.handleMultiElementDrop(targetContainer, newComponent, dropPosition);
    }
  }
  
  static handleSingleElementDrop(container, newComponent, dropPosition) {
    const existingElement = container.children[0];
    const relativePosition = this.calculateRelativePosition(dropPosition, existingElement);
    
    if (relativePosition.horizontal <= 0.25) {
      // Left side - create row layout with new element on left
      return this.createRowLayout([newComponent, existingElement]);
    }
    
    if (relativePosition.horizontal >= 0.75) {
      // Right side - create row layout with new element on right
      return this.createRowLayout([existingElement, newComponent]);
    }
    
    if (relativePosition.vertical <= 0.30) {
      // Top - create column layout with new element above
      return this.createColumnLayout([newComponent, existingElement]);
    }
    
    if (relativePosition.vertical >= 0.70) {
      // Bottom - create column layout with new element below
      return this.createColumnLayout([existingElement, newComponent]);
    }
    
    // Center - default to column layout with new element below
    return this.createColumnLayout([existingElement, newComponent]);
  }
  
  static handleMultiElementDrop(container, newComponent, dropPosition) {
    if (container.type === 'column_layout') {
      return ColumnLayoutManager.insertIntoColumn(container, newComponent, dropPosition);
    }
    
    if (container.type === 'row_layout') {
      return RowLayoutManager.insertIntoRow(container, newComponent, dropPosition);
    }
    
    // Default container behavior
    return this.insertIntoDefaultContainer(container, newComponent, dropPosition);
  }
}
```

#### Layout Dissolution and Cleanup

```javascript
/**
 * Automatic layout container management
 * Removes unnecessary containers when they have only one child
 */
class LayoutCleanupManager {
  /**
   * Check and dissolve row layout containers with single child
   * Convert single-child row layouts back to column layout
   */
  static checkRowLayoutDissolution(rowLayout) {
    if (rowLayout.type === 'row_layout' && rowLayout.children.length === 1) {
      const remainingChild = rowLayout.children[0];
      
      // Promote remaining child to parent level
      // Remove row layout wrapper and place child in column layout
      return {
        action: 'DISSOLVE_ROW_LAYOUT',
        result: this.promoteToColumnLayout(remainingChild, rowLayout.parentId)
      };
    }
    
    return { action: 'NO_CHANGE', result: rowLayout };
  }
  
  /**
   * Convert single element from dissolved row layout to column layout positioning
   */
  static promoteToColumnLayout(element, parentContainerId) {
    return {
      id: element.id,
      type: element.type,
      ...element.properties,
      layoutContext: {
        container: 'column',
        position: 'single',
        parentId: parentContainerId
      }
    };
  }
  
  /**
   * Handle element removal and check for layout dissolution
   */
  static handleElementRemoval(container, removedElementId) {
    const updatedChildren = container.children.filter(child => child.id !== removedElementId);
    const updatedContainer = { ...container, children: updatedChildren };
    
    // Check if dissolution is needed
    if (updatedChildren.length === 1 && container.type === 'row_layout') {
      return this.checkRowLayoutDissolution(updatedContainer);
    }
    
    return { action: 'UPDATE_CONTAINER', result: updatedContainer };
  }
}
```

#### Complete Layout Flow Examples

```javascript
/**
 * Example scenarios demonstrating the layout management system
 */
const LAYOUT_SCENARIOS = {
  // Scenario 1: Plain layout with one element
  singleElementScenario: {
    initial: {
      type: 'container',
      children: [{ id: 'text1', type: 'text_input' }]
    },
    dropCenter: {
      action: 'Create column layout',
      result: {
        type: 'column_layout',
        children: [
          { id: 'text1', type: 'text_input' },
          { id: 'text2', type: 'text_input' } // New element after
        ]
      }
    },
    dropLeft: {
      action: 'Create row layout',
      result: {
        type: 'row_layout',
        children: [
          { id: 'text2', type: 'text_input' }, // New element left
          { id: 'text1', type: 'text_input' }
        ]
      }
    }
  },
  
  // Scenario 2: Three elements in column layout
  threeElementColumnScenario: {
    initial: {
      type: 'column_layout',
      children: [
        { id: 'text1', type: 'text_input' },
        { id: 'text2', type: 'text_input' },
        { id: 'text3', type: 'text_input' }
      ]
    },
    dropBetween: {
      action: 'Insert between elements 1 and 2',
      result: {
        type: 'column_layout',
        children: [
          { id: 'text1', type: 'text_input' },
          { id: 'text4', type: 'text_input' }, // New element between
          { id: 'text2', type: 'text_input' },
          { id: 'text3', type: 'text_input' }
        ]
      }
    },
    dropTopmost: {
      action: 'Insert at topmost position',
      result: {
        type: 'column_layout',
        children: [
          { id: 'text4', type: 'text_input' }, // New element at top
          { id: 'text1', type: 'text_input' },
          { id: 'text2', type: 'text_input' },
          { id: 'text3', type: 'text_input' }
        ]
      }
    }
  },
  
  // Scenario 3: Row layout dissolution
  rowLayoutDissolutionScenario: {
    initial: {
      type: 'row_layout',
      children: [
        { id: 'text1', type: 'text_input' },
        { id: 'text2', type: 'text_input' }
      ]
    },
    removeElement: {
      action: 'Remove text2, dissolve row layout',
      result: {
        type: 'column_layout', // Converted back to column
        children: [
          { id: 'text1', type: 'text_input' } // Single element promoted
        ]
      }
    }
  }
};
```

#### Position Detection Thresholds

```javascript
/**
 * Precise position detection rules for layout management
 */
const POSITION_DETECTION_RULES = {
  singleElement: {
    horizontal: {
      left: { threshold: 0.25, action: 'CREATE_ROW_LEFT' },
      right: { threshold: 0.75, action: 'CREATE_ROW_RIGHT' },
      center: { threshold: [0.25, 0.75], action: 'CREATE_COLUMN' }
    },
    vertical: {
      top: { threshold: 0.30, action: 'CREATE_COLUMN_BEFORE' },
      bottom: { threshold: 0.70, action: 'CREATE_COLUMN_AFTER' },
      center: { threshold: [0.30, 0.70], action: 'CREATE_COLUMN_AFTER' }
    }
  },
  
  multipleElements: {
    column: {
      between: { 
        detection: 'gap_between_elements',
        action: 'INSERT_BETWEEN'
      },
      edges: {
        top: { threshold: 'above_first_element', action: 'INSERT_TOPMOST' },
        bottom: { threshold: 'below_last_element', action: 'INSERT_BOTTOMMOST' }
      }
    },
    
    row: {
      between: {
        detection: 'gap_between_elements',
        action: 'INSERT_BETWEEN'
      },
      edges: {
        left: { threshold: 'left_of_first_element', action: 'INSERT_LEFTMOST' },
        right: { threshold: 'right_of_last_element', action: 'INSERT_RIGHTMOST' }
      }
    }
  }
};
```

This advanced layout management system ensures:

✅ **Smart Container Behavior**: Single elements create appropriate layouts based on drop position  
✅ **Flexible Insertion**: Support for topmost/bottommost and between-element positioning  
✅ **Automatic Cleanup**: Row layouts dissolve to column layouts when reduced to single elements  
✅ **Position-Aware Logic**: Different behavior for column vs row layouts  
✅ **No Unnecessary Containers**: Efficient layout structure without redundant wrappers

## Properties Panel System

### Overview

The Properties Panel provides a dynamic interface for editing selected form component properties. It adapts its fields based on the component type and implements conditional logic for advanced property configurations.

### Core Properties

Every form component supports these fundamental properties:

```typescript
interface BaseComponentProperties {
  label: string;           // Display name for the component
  placeholder?: string;    // Placeholder text for input fields
  required: boolean;       // Whether the field is mandatory
  fieldId: string;         // Unique identifier for form submission
}
```

### Component-Specific Properties

Different component types expose specialized properties:

```typescript
// Text Input Components
interface TextInputProperties extends BaseComponentProperties {
  minLength?: number;
  maxLength?: number;
  pattern?: string;        // Regex validation pattern
}

// Select Components
interface SelectProperties extends BaseComponentProperties {
  options: Array<{
    label: string;
    value: string;
  }>;
  multiple?: boolean;      // For multi-select dropdowns
}

// Rich Text Components
interface RichTextProperties extends BaseComponentProperties {
  height?: string;         // Editor height (e.g., "200px")
  toolbar?: string[];      // Available formatting tools
}

// Layout Components
interface LayoutProperties extends BaseComponentProperties {
  direction: 'horizontal' | 'vertical';
  spacing?: string;        // Gap between child elements
}
```

### Conditional Property Display

The properties panel implements smart conditional logic to show relevant fields based on user selections:

#### Checkbox/Radio Conditional Fields
```typescript
/**
 * When checkbox or radio components are selected,
 * additional properties become available:
 */
interface ConditionalProperties {
  showWhen: {
    field: string;         // Reference to another field
    operator: 'equals' | 'not_equals' | 'contains';
    value: string | string[];
  };
  hideWhen: {
    field: string;
    operator: 'equals' | 'not_equals';
    value: string | string[];
  };
}
```

#### Example Conditional Logic Implementation
```typescript
class PropertiesPanelRenderer {
  renderConditionalFields(component: FormComponentData): React.ReactNode {
    const conditionalFields = [];
    
    // Show options editor for select/radio/checkbox components
    if (['select', 'multi_select', 'radio_group', 'checkbox'].includes(component.type)) {
      conditionalFields.push(
        <OptionsEditor
          key="options"
          options={component.options || []}
          onChange={(options) => this.updateComponent({ options })}
        />
      );
    }
    
    // Show validation fields for input components
    if (component.type.includes('input') || component.type === 'textarea') {
      conditionalFields.push(
        <ValidationSettings
          key="validation"
          minLength={component.minLength}
          maxLength={component.maxLength}
          pattern={component.pattern}
          onChange={(validation) => this.updateComponent(validation)}
        />
      );
    }
    
    return conditionalFields;
  }
}
```

### Property Update Flow

```typescript
/**
 * Property updates follow a controlled flow:
 * 1. User modifies property in panel
 * 2. onChange handler captures the change
 * 3. FormStateEngine validates the update
 * 4. ComponentEngine applies the change
 * 5. Canvas re-renders with updated component
 */
class PropertyUpdateFlow {
  static handlePropertyChange(componentId: string, property: string, value: any) {
    // Validate property value
    const validation = ComponentEngine.validateProperty(property, value);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // Create update action
    const updateAction = FormStateEngine.createAction('UPDATE_COMPONENT', {
      componentId,
      updates: { [property]: value }
    });
    
    // Execute through state engine
    FormStateEngine.executeAction(updateAction);
  }
}
```

### Dynamic Property Panel Features

#### Real-time Validation
```typescript
interface PropertyValidation {
  required: boolean;
  pattern?: RegExp;
  minValue?: number;
  maxValue?: number;
  customValidator?: (value: any) => ValidationResult;
}

class PropertyValidator {
  static validateLabel(label: string): ValidationResult {
    if (!label || label.trim().length === 0) {
      return { isValid: false, message: 'Label is required' };
    }
    if (label.length > 100) {
      return { isValid: false, message: 'Label must be less than 100 characters' };
    }
    return { isValid: true };
  }
  
  static validateFieldId(fieldId: string, existingIds: string[]): ValidationResult {
    if (!fieldId || fieldId.trim().length === 0) {
      return { isValid: false, message: 'Field ID is required' };
    }
    if (existingIds.includes(fieldId)) {
      return { isValid: false, message: 'Field ID must be unique' };
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldId)) {
      return { isValid: false, message: 'Field ID must start with a letter and contain only letters, numbers, and underscores' };
    }
    return { isValid: true };
  }
}
```

#### Property Panel Layout
```typescript
interface PropertyPanelLayout {
  sections: Array<{
    title: string;
    properties: string[];
    conditional?: boolean;    // Show only when conditions met
    collapsible?: boolean;   // Can be collapsed by user
  }>;
}

const COMPONENT_PROPERTY_LAYOUTS: Record<ComponentType, PropertyPanelLayout> = {
  text_input: {
    sections: [
      {
        title: 'Basic Properties',
        properties: ['label', 'placeholder', 'required', 'fieldId']
      },
      {
        title: 'Validation',
        properties: ['minLength', 'maxLength', 'pattern'],
        collapsible: true
      }
    ]
  },
  select: {
    sections: [
      {
        title: 'Basic Properties',
        properties: ['label', 'placeholder', 'required', 'fieldId']
      },
      {
        title: 'Options',
        properties: ['options', 'multiple']
      },
      {
        title: 'Conditional Logic',
        properties: ['showWhen', 'hideWhen'],
        conditional: true
      }
    ]
  }
};
```

## Inline Editing System

### Overview

The canvas provides inline editing capabilities for component titles and labels, allowing users to modify text content directly without using the properties panel.

### Inline Title Editing

#### Implementation Architecture
```typescript
/**
 * Inline editing is triggered by:
 * 1. Double-click on component title/label
 * 2. Single-click when component is already selected
 * 3. Keyboard shortcut (F2) when component is focused
 */
interface InlineEditingState {
  isEditing: boolean;
  componentId: string;
  property: string;        // 'label', 'title', 'placeholder', etc.
  originalValue: string;
  currentValue: string;
}

class InlineEditingManager {
  private editingState: InlineEditingState | null = null;
  
  startEditing(componentId: string, property: string, currentValue: string) {
    this.editingState = {
      isEditing: true,
      componentId,
      property,
      originalValue: currentValue,
      currentValue
    };
    
    // Replace text with input element
    this.renderInlineInput();
  }
  
  finishEditing(save: boolean = true) {
    if (!this.editingState) return;
    
    if (save && this.editingState.currentValue !== this.editingState.originalValue) {
      // Apply the change through FormStateEngine
      FormStateEngine.executeAction({
        type: 'UPDATE_COMPONENT',
        payload: {
          componentId: this.editingState.componentId,
          updates: {
            [this.editingState.property]: this.editingState.currentValue
          }
        }
      });
    }
    
    this.editingState = null;
    this.renderNormalText();
  }
}
```

#### Inline Editing UI Components
```typescript
/**
 * React component for inline text editing
 */
const InlineTextEditor: React.FC<{
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
}> = ({ value, onSave, onCancel, placeholder, maxLength }) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Auto-focus and select all text
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };
  
  const handleBlur = () => {
    // Save on blur (click outside)
    onSave(editValue);
  };
  
  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className="inline-text-editor"
    />
  );
};
```

#### Canvas Integration
```typescript
/**
 * Component renderer with inline editing support
 */
const EditableComponentTitle: React.FC<{
  component: FormComponentData;
  isSelected: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onFinishEdit: (newValue: string) => void;
}> = ({ component, isSelected, isEditing, onStartEdit, onFinishEdit }) => {
  
  if (isEditing) {
    return (
      <InlineTextEditor
        value={component.label}
        onSave={onFinishEdit}
        onCancel={() => onFinishEdit(component.label)} // Revert to original
        placeholder="Enter component label"
        maxLength={100}
      />
    );
  }
  
  return (
    <div
      className={`component-title ${isSelected ? 'selected' : ''}`}
      onClick={isSelected ? onStartEdit : undefined}
      onDoubleClick={onStartEdit}
      title="Double-click to edit"
    >
      {component.label || 'Untitled Component'}
    </div>
  );
};
```

### Editable Properties

Different component types support different inline-editable properties:

#### Text Components
- **Label**: Main display text
- **Placeholder**: Input field placeholder text

#### Layout Components  
- **Title**: Container section title
- **Description**: Optional section description

#### Option Components (Select, Radio, Checkbox)
- **Label**: Component label
- **Option Labels**: Individual option text (inline editing in options list)

### Inline Editing Workflow

```typescript
/**
 * Complete inline editing workflow
 */
class InlineEditingWorkflow {
  static readonly WORKFLOW_STEPS = {
    TRIGGER: 'User triggers inline edit (double-click, F2, etc.)',
    ACTIVATE: 'Switch component to edit mode',
    INPUT: 'User modifies text content',
    VALIDATE: 'Real-time validation of input',
    SAVE: 'Commit changes to FormStateEngine',
    REVERT: 'Cancel changes and restore original value'
  };
  
  static handleInlineEdit(componentId: string, property: string) {
    const component = ComponentEngine.findComponent(componentId);
    if (!component) return;
    
    // Step 1: Trigger validation
    const canEdit = this.validateEditPermission(component, property);
    if (!canEdit.allowed) {
      throw new Error(canEdit.reason);
    }
    
    // Step 2: Activate editing
    const editingManager = new InlineEditingManager();
    editingManager.startEditing(componentId, property, component[property]);
    
    // Step 3: Handle save/cancel
    editingManager.onSave = (newValue: string) => {
      const validation = ComponentEngine.validateProperty(property, newValue);
      if (validation.isValid) {
        FormStateEngine.executeAction({
          type: 'UPDATE_COMPONENT',
          payload: { componentId, updates: { [property]: newValue } }
        });
      } else {
        // Show validation error
        NotificationService.showError(validation.message);
      }
    };
  }
}
```

### Keyboard Shortcuts

```typescript
interface InlineEditingShortcuts {
  F2: 'Start editing selected component label';
  Enter: 'Save changes and exit edit mode';
  Escape: 'Cancel changes and exit edit mode';
  Tab: 'Save and move to next editable property';
  'Shift+Tab': 'Save and move to previous editable property';
}

class KeyboardShortcutHandler {
  static handleKeyDown(e: KeyboardEvent, selectedComponentId: string | null) {
    if (!selectedComponentId) return;
    
    switch (e.key) {
      case 'F2':
        e.preventDefault();
        InlineEditingWorkflow.handleInlineEdit(selectedComponentId, 'label');
        break;
        
      case 'Enter':
        if (InlineEditingManager.isEditing()) {
          e.preventDefault();
          InlineEditingManager.finishEditing(true);
        }
        break;
        
      case 'Escape':
        if (InlineEditingManager.isEditing()) {
          e.preventDefault();
          InlineEditingManager.finishEditing(false);
        }
        break;
    }
  }
}
```

### Visual Feedback

```css
/* Inline editing styles */
.component-title {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.component-title:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.component-title.selected {
  background-color: rgba(0, 123, 255, 0.2);
  border: 1px dashed #007bff;
}

.inline-text-editor {
  border: 2px solid #007bff;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: inherit;
  font-size: inherit;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;
}

.inline-text-editor:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Edit mode indicator */
.component-wrapper.editing::before {
  content: '✏️';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 10;
}
```

## Multi-Page Form Wizard System

### Overview

The Form Builder supports multi-page form creation with intelligent wizard navigation. Forms begin as single-page layouts and can be expanded into multi-page wizards with dynamic navigation controls that adapt based on the current page position.

### Page Management Architecture

```typescript
/**
 * Multi-page form structure with wizard navigation
 */
interface FormPageStructure {
  pages: FormPage[];
  currentPageIndex: number;
  totalPages: number;
  navigationMode: 'single' | 'wizard';
}

interface FormPage {
  id: string;
  title: string;
  description?: string;
  components: FormComponentData[];
  validationRules?: PageValidationRule[];
  navigationSettings: PageNavigationSettings;
}

interface PageNavigationSettings {
  showPrevious: boolean;
  showNext: boolean;
  showSubmit: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
}
```

### Page Creation Logic

The system automatically determines navigation button visibility based on page position:

```typescript
/**
 * Page creation and navigation logic
 */
class PageNavigationLogic {
  static createInitialPage(): FormPage {
    return {
      id: generateUniqueId(),
      title: 'Page 1',
      components: [],
      navigationSettings: {
        showPrevious: false,    // First page = no previous button
        showNext: false,        // Single page = no next button
        showSubmit: true,       // Always show submit on single page
        submitLabel: 'Submit'
      }
    };
  }
  
  static addNewPage(currentPages: FormPage[], insertIndex?: number): FormPage[] {
    const newPage: FormPage = {
      id: generateUniqueId(),
      title: `Page ${currentPages.length + 1}`,
      components: [],
      navigationSettings: this.calculateNavigationSettings(currentPages.length, currentPages.length + 1)
    };
    
    const updatedPages = [...currentPages, newPage];
    
    // Recalculate navigation for all pages
    return updatedPages.map((page, index) => ({
      ...page,
      navigationSettings: this.calculateNavigationSettings(index, updatedPages.length)
    }));
  }
  
  static calculateNavigationSettings(pageIndex: number, totalPages: number): PageNavigationSettings {
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === totalPages - 1;
    const isSinglePage = totalPages === 1;
    
    if (isSinglePage) {
      // Single page: only submit button
      return {
        showPrevious: false,
        showNext: false,
        showSubmit: true,
        submitLabel: 'Submit'
      };
    }
    
    if (isFirstPage) {
      // First page: next button only
      return {
        showPrevious: false,
        showNext: true,
        showSubmit: false,
        nextLabel: 'Next'
      };
    }
    
    if (isLastPage) {
      // Last page: previous and submit buttons
      return {
        showPrevious: true,
        showNext: false,
        showSubmit: true,
        previousLabel: 'Previous',
        submitLabel: 'Submit'
      };
    }
    
    // Middle pages: previous and next buttons
    return {
      showPrevious: true,
      showNext: true,
      showSubmit: false,
      previousLabel: 'Previous',
      nextLabel: 'Next'
    };
  }
}
```

### Wizard Navigation States

The system adapts navigation buttons based on form structure:

#### Single Page Form
```typescript
/**
 * Form with one page
 * Navigation: [Submit]
 */
const singlePageNavigation = {
  showPrevious: false,
  showNext: false,
  showSubmit: true,
  submitLabel: 'Submit'
};

// Rendered as:
// [ Submit ]
```

#### Two Page Form
```typescript
/**
 * Page 1 of 2
 * Navigation: [Next]
 */
const firstPageNavigation = {
  showPrevious: false,
  showNext: true,
  showSubmit: false,
  nextLabel: 'Next'
};

/**
 * Page 2 of 2 (Final)
 * Navigation: [Previous] [Submit]
 */
const secondPageNavigation = {
  showPrevious: true,
  showNext: false,
  showSubmit: true,
  previousLabel: 'Previous',
  submitLabel: 'Submit'
};

// Rendered as:
// Page 1: [ Next ]
// Page 2: [ Previous ] [ Submit ]
```

#### Multi-Page Form (3+ Pages)
```typescript
/**
 * Page 1 of N
 * Navigation: [Next]
 */
const firstPageNav = {
  showPrevious: false,
  showNext: true,
  showSubmit: false
};

/**
 * Page 2 to N-1 (Middle pages)
 * Navigation: [Previous] [Next]
 */
const middlePageNav = {
  showPrevious: true,
  showNext: true,
  showSubmit: false
};

/**
 * Page N (Final)
 * Navigation: [Previous] [Submit]
 */
const finalPageNav = {
  showPrevious: true,
  showNext: false,
  showSubmit: true
};

// Rendered as:
// Page 1: [ Next ]
// Page 2: [ Previous ] [ Next ]
// Page 3: [ Previous ] [ Next ]
// Page N: [ Previous ] [ Submit ]
```

### Page Navigation Implementation

```typescript
/**
 * React component for wizard navigation
 */
const WizardNavigation: React.FC<{
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  navigationSettings: PageNavigationSettings;
  isValid: boolean;
}> = ({ currentPage, totalPages, onPrevious, onNext, onSubmit, navigationSettings, isValid }) => {
  
  return (
    <div className="wizard-navigation">
      {/* Page indicator */}
      <div className="page-indicator">
        Page {currentPage + 1} of {totalPages}
      </div>
      
      {/* Navigation buttons */}
      <div className="navigation-buttons">
        {navigationSettings.showPrevious && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onPrevious}
          >
            {navigationSettings.previousLabel || 'Previous'}
          </button>
        )}
        
        {navigationSettings.showNext && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={!isValid}
          >
            {navigationSettings.nextLabel || 'Next'}
          </button>
        )}
        
        {navigationSettings.showSubmit && (
          <button
            type="submit"
            className="btn btn-success"
            onClick={onSubmit}
            disabled={!isValid}
          >
            {navigationSettings.submitLabel || 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};
```

### Page Validation Logic

Each page implements validation before navigation:

```typescript
/**
 * Page validation system
 */
interface PageValidationRule {
  type: 'required_fields' | 'custom_validation' | 'conditional_logic';
  fields?: string[];           // Field IDs to validate
  validator?: (pageData: any) => ValidationResult;
  message?: string;
}

class PageValidator {
  static validatePage(page: FormPage, formData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validate required fields
    page.components.forEach(component => {
      if (component.required) {
        const fieldValue = formData[component.fieldId];
        if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
          errors.push(`${component.label} is required`);
        }
      }
    });
    
    // Run custom validation rules
    if (page.validationRules) {
      page.validationRules.forEach(rule => {
        if (rule.validator) {
          const result = rule.validator(formData);
          if (!result.isValid) {
            errors.push(result.message || 'Validation failed');
          }
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      message: errors.join(', ')
    };
  }
  
  static canNavigateToNext(page: FormPage, formData: any): boolean {
    const validation = this.validatePage(page, formData);
    return validation.isValid;
  }
}
```

### Form Builder Integration

```typescript
/**
 * Multi-page form builder hook integration
 */
class MultiPageFormBuilder {
  static addPage(formState: FormState): FormState {
    const newPages = PageNavigationLogic.addNewPage(formState.pages);
    
    return {
      ...formState,
      pages: newPages,
      currentPageIndex: newPages.length - 1,  // Switch to new page
      navigationMode: 'wizard'
    };
  }
  
  static removePage(formState: FormState, pageIndex: number): FormState {
    if (formState.pages.length <= 1) {
      throw new Error('Cannot remove the last page');
    }
    
    const updatedPages = formState.pages.filter((_, index) => index !== pageIndex);
    
    // Recalculate navigation for remaining pages
    const pagesWithNavigation = updatedPages.map((page, index) => ({
      ...page,
      navigationSettings: PageNavigationLogic.calculateNavigationSettings(index, updatedPages.length)
    }));
    
    // Adjust current page index if necessary
    let newCurrentIndex = formState.currentPageIndex;
    if (pageIndex <= formState.currentPageIndex && formState.currentPageIndex > 0) {
      newCurrentIndex = formState.currentPageIndex - 1;
    }
    
    return {
      ...formState,
      pages: pagesWithNavigation,
      currentPageIndex: Math.min(newCurrentIndex, pagesWithNavigation.length - 1),
      navigationMode: pagesWithNavigation.length === 1 ? 'single' : 'wizard'
    };
  }
  
  static navigateToPage(formState: FormState, targetPageIndex: number): FormState {
    if (targetPageIndex < 0 || targetPageIndex >= formState.pages.length) {
      throw new Error('Invalid page index');
    }
    
    return {
      ...formState,
      currentPageIndex: targetPageIndex
    };
  }
}
```

### Page Management UI

```typescript
/**
 * Page management interface in form builder
 */
const PageManager: React.FC<{
  pages: FormPage[];
  currentPageIndex: number;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
  onSelectPage: (index: number) => void;
  onRenamePage: (index: number, newTitle: string) => void;
}> = ({ pages, currentPageIndex, onAddPage, onRemovePage, onSelectPage, onRenamePage }) => {
  
  return (
    <div className="page-manager">
      <div className="page-tabs">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`page-tab ${index === currentPageIndex ? 'active' : ''}`}
            onClick={() => onSelectPage(index)}
          >
            <span className="page-title">
              {page.title}
            </span>
            
            {pages.length > 1 && (
              <button
                className="remove-page-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePage(index);
                }}
                title="Remove page"
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        <button
          className="add-page-btn"
          onClick={onAddPage}
          title="Add new page"
        >
          + Add Page
        </button>
      </div>
      
      {/* Page settings */}
      <div className="page-settings">
        <input
          type="text"
          value={pages[currentPageIndex]?.title || ''}
          onChange={(e) => onRenamePage(currentPageIndex, e.target.value)}
          placeholder="Page title"
          className="page-title-input"
        />
      </div>
    </div>
  );
};
```

### Navigation Flow Examples

#### Example 1: Single Page Form
```json
{
  "pages": [
    {
      "id": "page-1",
      "title": "Contact Information",
      "components": [...],
      "navigationSettings": {
        "showPrevious": false,
        "showNext": false,
        "showSubmit": true,
        "submitLabel": "Submit"
      }
    }
  ],
  "navigationMode": "single"
}
```

#### Example 2: Three-Page Wizard
```json
{
  "pages": [
    {
      "id": "page-1",
      "title": "Personal Information",
      "navigationSettings": {
        "showPrevious": false,
        "showNext": true,
        "showSubmit": false,
        "nextLabel": "Next"
      }
    },
    {
      "id": "page-2",
      "title": "Contact Details",
      "navigationSettings": {
        "showPrevious": true,
        "showNext": true,
        "showSubmit": false,
        "previousLabel": "Previous",
        "nextLabel": "Next"
      }
    },
    {
      "id": "page-3",
      "title": "Preferences",
      "navigationSettings": {
        "showPrevious": true,
        "showNext": false,
        "showSubmit": true,
        "previousLabel": "Previous",
        "submitLabel": "Submit"
      }
    }
  ],
  "navigationMode": "wizard"
}
```

### Advanced Navigation Features

#### Conditional Page Navigation
```typescript
/**
 * Advanced navigation with conditional logic
 */
interface ConditionalNavigationRule {
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: any;
  };
  action: 'skip_page' | 'show_page' | 'jump_to_page';
  targetPageId?: string;
}

class ConditionalNavigationEngine {
  static evaluateNavigation(
    currentPageIndex: number,
    formData: any,
    pages: FormPage[]
  ): number {
    const currentPage = pages[currentPageIndex];
    
    // Check for conditional navigation rules
    if (currentPage.conditionalNavigation) {
      for (const rule of currentPage.conditionalNavigation) {
        if (this.evaluateCondition(rule.condition, formData)) {
          switch (rule.action) {
            case 'skip_page':
              return this.findNextValidPage(currentPageIndex + 1, formData, pages);
            case 'jump_to_page':
              return pages.findIndex(page => page.id === rule.targetPageId);
          }
        }
      }
    }
    
    // Default: next page
    return currentPageIndex + 1;
  }
}
```

This multi-page wizard system provides:

✅ **Automatic Navigation Logic**: Buttons appear/disappear based on page position  
✅ **Single Page Simplicity**: Single forms show only submit button  
✅ **Multi-Page Wizards**: First page (Next), middle pages (Previous + Next), last page (Previous + Submit)  
✅ **Page Management**: Add, remove, rename, and reorder pages  
✅ **Validation Integration**: Pages validate before allowing navigation  
✅ **Conditional Navigation**: Advanced logic for skipping or jumping to specific pages  
✅ **Responsive UI**: Page tabs and navigation adapt to screen size

## Preview Modal Wizard System

### Overview

The Preview Modal provides a fully functional wizard interface that simulates the actual form-filling experience. When users click the "Preview" button, a modal opens displaying the complete multi-page form with working navigation, allowing users to test the form flow and validate user experience before deployment.

### Modal Preview Architecture

```typescript
/**
 * Preview modal system for form testing
 */
interface PreviewModalState {
  isOpen: boolean;
  currentPageIndex: number;
  formData: Record<string, any>;
  validationErrors: Record<string, string[]>;
  isSubmitting: boolean;
  mode: 'preview' | 'test';
}

interface PreviewModalProps {
  formSchema: FormSchema;           // Complete form structure
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: Record<string, any>;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  formSchema,
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [previewState, setPreviewState] = useState<PreviewModalState>({
    isOpen,
    currentPageIndex: 0,
    formData: initialData || {},
    validationErrors: {},
    isSubmitting: false,
    mode: 'preview'
  });
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      className="form-preview-modal"
    >
      <div className="preview-wizard-container">
        <PreviewWizard
          formSchema={formSchema}
          state={previewState}
          onStateChange={setPreviewState}
          onSubmit={onSubmit}
        />
      </div>
    </Modal>
  );
};
```

### Preview Wizard Implementation

```typescript
/**
 * Full wizard implementation within preview modal
 */
const PreviewWizard: React.FC<{
  formSchema: FormSchema;
  state: PreviewModalState;
  onStateChange: (state: PreviewModalState) => void;
  onSubmit: (formData: any) => void;
}> = ({ formSchema, state, onStateChange, onSubmit }) => {
  
  const currentPage = formSchema.pages[state.currentPageIndex];
  const isLastPage = state.currentPageIndex === formSchema.pages.length - 1;
  const isFirstPage = state.currentPageIndex === 0;
  
  const handleNext = () => {
    // Validate current page
    const validation = validatePage(currentPage, state.formData);
    if (!validation.isValid) {
      onStateChange({
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [currentPage.id]: validation.errors
        }
      });
      return;
    }
    
    // Navigate to next page
    onStateChange({
      ...state,
      currentPageIndex: state.currentPageIndex + 1,
      validationErrors: {
        ...state.validationErrors,
        [currentPage.id]: []
      }
    });
  };
  
  const handlePrevious = () => {
    onStateChange({
      ...state,
      currentPageIndex: Math.max(0, state.currentPageIndex - 1)
    });
  };
  
  const handleSubmit = async () => {
    // Final validation of all pages
    const allValidation = validateAllPages(formSchema.pages, state.formData);
    if (!allValidation.isValid) {
      onStateChange({
        ...state,
        validationErrors: allValidation.pageErrors
      });
      return;
    }
    
    // Submit form data
    onStateChange({ ...state, isSubmitting: true });
    try {
      await onSubmit(state.formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      onStateChange({ ...state, isSubmitting: false });
    }
  };
  
  return (
    <div className="preview-wizard">
      {/* Page Header */}
      <div className="wizard-header">
        <h2>{currentPage.title}</h2>
        {currentPage.description && (
          <p className="page-description">{currentPage.description}</p>
        )}
        <div className="progress-indicator">
          <span>Page {state.currentPageIndex + 1} of {formSchema.pages.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((state.currentPageIndex + 1) / formSchema.pages.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Current Page Content */}
      <div className="wizard-content">
        <PreviewPageRenderer
          page={currentPage}
          formData={state.formData}
          validationErrors={state.validationErrors[currentPage.id] || []}
          onChange={(fieldId, value) => {
            onStateChange({
              ...state,
              formData: {
                ...state.formData,
                [fieldId]: value
              }
            });
          }}
        />
      </div>
      
      {/* Navigation Footer */}
      <div className="wizard-footer">
        <div className="navigation-buttons">
          {!isFirstPage && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          
          {!isLastPage && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
            </button>
          )}
          
          {isLastPage && (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Page Rendering in Preview

```typescript
/**
 * Renders individual page components in preview mode
 */
const PreviewPageRenderer: React.FC<{
  page: FormPage;
  formData: Record<string, any>;
  validationErrors: string[];
  onChange: (fieldId: string, value: any) => void;
}> = ({ page, formData, validationErrors, onChange }) => {
  
  return (
    <div className="preview-page">
      {page.components.map(component => (
        <PreviewComponentRenderer
          key={component.id}
          component={component}
          value={formData[component.fieldId]}
          error={validationErrors.find(error => error.includes(component.label))}
          onChange={(value) => onChange(component.fieldId, value)}
        />
      ))}
    </div>
  );
};

const PreviewComponentRenderer: React.FC<{
  component: FormComponentData;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}> = ({ component, value, error, onChange }) => {
  
  const renderComponent = () => {
    switch (component.type) {
      case 'text_input':
        return (
          <input
            type="text"
            value={value || ''}
            placeholder={component.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`form-control ${error ? 'error' : ''}`}
            required={component.required}
          />
        );
        
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`form-control ${error ? 'error' : ''}`}
            required={component.required}
          >
            <option value="">{component.placeholder || 'Select an option'}</option>
            {component.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={component.required}
            />
            <span className="checkmark"></span>
            {component.label}
          </label>
        );
        
      // Add more component types as needed
      default:
        return <div>Unsupported component: {component.type}</div>;
    }
  };
  
  return (
    <div className="form-field">
      {component.type !== 'checkbox' && (
        <label className="field-label">
          {component.label}
          {component.required && <span className="required">*</span>}
        </label>
      )}
      
      {renderComponent()}
      
      {error && (
        <div className="field-error">{error}</div>
      )}
    </div>
  );
};
```

### Preview Modal Features

#### Full Form Testing
```typescript
/**
 * Complete form testing capabilities
 */
interface PreviewTestingFeatures {
  // Navigation testing
  testPageNavigation: boolean;           // Test prev/next buttons
  testValidation: boolean;               // Test field validation
  testConditionalLogic: boolean;         // Test show/hide logic
  
  // Data testing
  prefillData: Record<string, any>;      // Pre-populate fields for testing
  exportTestData: boolean;               // Export filled data as JSON
  resetForm: boolean;                    // Reset to empty state
  
  // User experience testing
  mobilePreview: boolean;                // Test mobile responsiveness
  accessibilityTest: boolean;            // Test keyboard navigation
  performanceMetrics: boolean;           // Measure load times
}

class PreviewTestingEngine {
  static async runFullTest(formSchema: FormSchema): Promise<TestResults> {
    const testResults: TestResults = {
      navigation: await this.testNavigation(formSchema),
      validation: await this.testValidation(formSchema),
      dataFlow: await this.testDataFlow(formSchema),
      performance: await this.testPerformance(formSchema)
    };
    
    return testResults;
  }
  
  static async testNavigation(formSchema: FormSchema): Promise<NavigationTestResult> {
    // Test all page transitions
    // Verify button states
    // Check page validation blocks
    return {
      passed: true,
      issues: [],
      coverage: '100%'
    };
  }
}
```

## Dual JSON Schema Architecture

### Overview

The Form Builder operates on a dual JSON schema system that separates form structure (template) from form data (submissions). This architecture enables clean separation of concerns, efficient data processing, and flexible form management.

### Schema Types

#### Type 1: Form Schema JSON (Template Structure)
The Form Schema defines the complete form structure, layout, validation rules, and metadata:

```typescript
/**
 * FORM SCHEMA JSON - Defines form structure and behavior
 * Purpose: Template definition, form building, layout management
 * Usage: Form builder, form renderer, validation engine
 */
interface FormSchema {
  // Metadata
  templateName: string;
  templateId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // Form structure
  pages: FormPage[];
  settings: FormSettings;
  theme: FormTheme;
  
  // Validation and logic
  globalValidationRules: ValidationRule[];
  dependencyRules: DependencyRule[];
  conditionalLogic: ConditionalLogicRule[];
}

interface FormPage {
  id: string;
  title: string;
  description?: string;
  components: FormComponentData[];
  validationRules: PageValidationRule[];
  navigationSettings: PageNavigationSettings;
  
  // Layout configuration
  layoutConfig: {
    columns: number;
    spacing: string;
    alignment: 'left' | 'center' | 'right';
  };
}

interface FormComponentData {
  // Core properties
  id: string;
  type: ComponentType;
  fieldId: string;                    // Unique field identifier for data mapping
  label: string;
  placeholder?: string;
  required: boolean;
  
  // Validation
  validationRules: ValidationRule[];
  
  // Component-specific properties
  options?: Array<{label: string; value: string}>;  // For select, radio, checkbox
  minLength?: number;                 // For text inputs
  maxLength?: number;                 // For text inputs
  pattern?: string;                   // Regex validation
  
  // Layout properties
  width?: string;                     // CSS width
  height?: string;                    // CSS height
  position: {
    x: number;
    y: number;
    row?: number;
    column?: number;
  };
  
  // Conditional display
  conditionalDisplay: {
    showWhen?: ConditionalRule;
    hideWhen?: ConditionalRule;
  };
  
  // Styling
  styling: {
    className?: string;
    customCSS?: string;
    theme?: string;
  };
}
```

#### Type 2: Data JSON (Form Submission Data)
The Data JSON contains actual user input and submission information:

```typescript
/**
 * DATA JSON - Contains form submission data
 * Purpose: Data storage, processing, analysis
 * Usage: Form submissions, data export, analytics
 */
interface FormDataJSON {
  // Submission metadata
  submissionId: string;
  templateId: string;                 // References the Form Schema
  templateVersion: string;
  submittedAt: string;
  submittedBy?: {
    userId: string;
    email: string;
    name: string;
  };
  
  // Form data organized by pages
  pageData: Array<{
    pageId: string;
    pageTitle: string;
    fields: Record<string, FormFieldData>;
  }>;
  
  // Flattened field data for easy access
  flatData: Record<string, any>;      // fieldId -> value mapping
  
  // Submission state
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  validationResults: ValidationResults;
  
  // Analytics data
  analytics: {
    timeSpent: number;                // Total time in milliseconds
    pageViews: Array<{
      pageId: string;
      viewTime: number;
      visitCount: number;
    }>;
    errors: Array<{
      fieldId: string;
      errorType: string;
      timestamp: string;
    }>;
  };
}

interface FormFieldData {
  fieldId: string;
  fieldType: ComponentType;
  label: string;
  value: any;                         // Actual user input
  
  // Validation state
  isValid: boolean;
  validationErrors: string[];
  
  // Input metadata
  inputMethod: 'typed' | 'selected' | 'uploaded' | 'auto-filled';
  lastModified: string;
  previousValues: any[];              // History of changes
}
```

### Schema Relationship and Mapping

```typescript
/**
 * Schema relationship and data mapping
 */
class SchemaMapper {
  /**
   * Create empty data JSON from form schema
   */
  static createEmptyDataFromSchema(formSchema: FormSchema): FormDataJSON {
    const emptyData: FormDataJSON = {
      submissionId: generateUniqueId(),
      templateId: formSchema.templateId,
      templateVersion: formSchema.version,
      submittedAt: new Date().toISOString(),
      pageData: [],
      flatData: {},
      status: 'draft',
      validationResults: { isValid: true, errors: [] },
      analytics: {
        timeSpent: 0,
        pageViews: [],
        errors: []
      }
    };
    
    // Initialize page data structure
    formSchema.pages.forEach(page => {
      const pageFields: Record<string, FormFieldData> = {};
      
      page.components.forEach(component => {
        pageFields[component.fieldId] = {
          fieldId: component.fieldId,
          fieldType: component.type,
          label: component.label,
          value: this.getDefaultValue(component),
          isValid: !component.required, // Required fields start invalid
          validationErrors: [],
          inputMethod: 'typed',
          lastModified: new Date().toISOString(),
          previousValues: []
        };
        
        // Add to flat data
        emptyData.flatData[component.fieldId] = this.getDefaultValue(component);
      });
      
      emptyData.pageData.push({
        pageId: page.id,
        pageTitle: page.title,
        fields: pageFields
      });
    });
    
    return emptyData;
  }
  
  /**
   * Validate data JSON against form schema
   */
  static validateDataAgainstSchema(
    dataJSON: FormDataJSON, 
    formSchema: FormSchema
  ): ValidationResults {
    const errors: string[] = [];
    
    // Check template compatibility
    if (dataJSON.templateId !== formSchema.templateId) {
      errors.push('Template ID mismatch');
    }
    
    // Validate each field
    formSchema.pages.forEach(page => {
      page.components.forEach(component => {
        const fieldData = dataJSON.flatData[component.fieldId];
        
        // Check required fields
        if (component.required && !fieldData) {
          errors.push(`Required field missing: ${component.label}`);
        }
        
        // Type validation
        if (fieldData && !this.validateFieldType(fieldData, component.type)) {
          errors.push(`Invalid data type for field: ${component.label}`);
        }
        
        // Custom validation rules
        component.validationRules.forEach(rule => {
          if (!this.validateRule(fieldData, rule)) {
            errors.push(`Validation failed for ${component.label}: ${rule.message}`);
          }
        });
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors: this.groupErrorsByField(errors)
    };
  }
  
  private static getDefaultValue(component: FormComponentData): any {
    switch (component.type) {
      case 'text_input':
      case 'email_input':
      case 'textarea':
        return '';
      case 'number_input':
        return null;
      case 'checkbox':
        return false;
      case 'select':
      case 'radio_group':
        return null;
      case 'multi_select':
        return [];
      case 'date_picker':
        return null;
      case 'file_upload':
        return null;
      default:
        return null;
    }
  }
}
```

### JSON Schema Examples

#### Example 1: Form Schema JSON
```json
{
  "templateName": "Contact Form",
  "templateId": "contact-form-v1",
  "version": "1.0.0",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  
  "pages": [
    {
      "id": "page-1",
      "title": "Contact Information",
      "components": [
        {
          "id": "comp-1",
          "type": "text_input",
          "fieldId": "fullName",
          "label": "Full Name",
          "placeholder": "Enter your full name",
          "required": true,
          "validationRules": [
            {
              "type": "minLength",
              "value": 2,
              "message": "Name must be at least 2 characters"
            }
          ],
          "position": { "x": 0, "y": 0 },
          "conditionalDisplay": {},
          "styling": { "width": "100%" }
        },
        {
          "id": "comp-2",
          "type": "email_input",
          "fieldId": "email",
          "label": "Email Address",
          "placeholder": "Enter your email",
          "required": true,
          "validationRules": [
            {
              "type": "email",
              "message": "Please enter a valid email address"
            }
          ],
          "position": { "x": 0, "y": 1 }
        }
      ],
      "navigationSettings": {
        "showPrevious": false,
        "showNext": false,
        "showSubmit": true,
        "submitLabel": "Submit"
      }
    }
  ],
  
  "settings": {
    "allowSaveDraft": true,
    "showProgressBar": true,
    "enableAnalytics": true
  },
  
  "theme": {
    "primaryColor": "#007bff",
    "fontFamily": "Arial, sans-serif",
    "borderRadius": "4px"
  }
}
```

#### Example 2: Data JSON (Submission)
```json
{
  "submissionId": "sub-12345",
  "templateId": "contact-form-v1",
  "templateVersion": "1.0.0",
  "submittedAt": "2024-01-20T14:30:00Z",
  "submittedBy": {
    "userId": "user-789",
    "email": "user@example.com",
    "name": "John Doe"
  },
  
  "pageData": [
    {
      "pageId": "page-1",
      "pageTitle": "Contact Information",
      "fields": {
        "fullName": {
          "fieldId": "fullName",
          "fieldType": "text_input",
          "label": "Full Name",
          "value": "John Doe",
          "isValid": true,
          "validationErrors": [],
          "inputMethod": "typed",
          "lastModified": "2024-01-20T14:28:00Z",
          "previousValues": ["John", "John D"]
        },
        "email": {
          "fieldId": "email",
          "fieldType": "email_input",
          "label": "Email Address",
          "value": "john.doe@example.com",
          "isValid": true,
          "validationErrors": [],
          "inputMethod": "typed",
          "lastModified": "2024-01-20T14:29:00Z",
          "previousValues": ["john.doe@", "john.doe@example"]
        }
      }
    }
  ],
  
  "flatData": {
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  
  "status": "submitted",
  "validationResults": {
    "isValid": true,
    "errors": [],
    "fieldErrors": {}
  },
  
  "analytics": {
    "timeSpent": 125000,
    "pageViews": [
      {
        "pageId": "page-1",
        "viewTime": 125000,
        "visitCount": 1
      }
    ],
    "errors": []
  }
}
```

### Marshal/Unmarshal Operations

```typescript
/**
 * Marshal and unmarshal operations between schema types
 */
class JSONSchemaOperations {
  /**
   * Convert form builder state to Form Schema JSON
   */
  static marshalFormSchema(
    formBuilderState: FormBuilderState
  ): FormSchema {
    return {
      templateName: formBuilderState.templateName,
      templateId: formBuilderState.templateId || generateUniqueId(),
      version: formBuilderState.version || '1.0.0',
      createdAt: formBuilderState.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      pages: formBuilderState.pages.map(page => ({
        ...page,
        components: page.components.map(component => ({
          ...component,
          validationRules: this.extractValidationRules(component),
          conditionalDisplay: this.extractConditionalRules(component)
        }))
      })),
      
      settings: formBuilderState.settings || this.getDefaultSettings(),
      theme: formBuilderState.theme || this.getDefaultTheme(),
      globalValidationRules: formBuilderState.globalValidationRules || [],
      dependencyRules: formBuilderState.dependencyRules || [],
      conditionalLogic: formBuilderState.conditionalLogic || []
    };
  }
  
  /**
   * Convert Form Schema JSON to form builder state
   */
  static unmarshalFormSchema(
    formSchema: FormSchema
  ): FormBuilderState {
    return {
      templateName: formSchema.templateName,
      templateId: formSchema.templateId,
      version: formSchema.version,
      createdAt: formSchema.createdAt,
      updatedAt: formSchema.updatedAt,
      
      pages: formSchema.pages.map(page => ({
        ...page,
        components: page.components.map(component => 
          this.convertSchemaComponentToBuilderComponent(component)
        )
      })),
      
      settings: formSchema.settings,
      theme: formSchema.theme,
      globalValidationRules: formSchema.globalValidationRules,
      dependencyRules: formSchema.dependencyRules,
      conditionalLogic: formSchema.conditionalLogic,
      
      // Builder-specific state
      selectedComponentId: null,
      currentPageIndex: 0,
      isDirty: false,
      history: []
    };
  }
  
  /**
   * Convert user input to Data JSON
   */
  static marshalFormData(
    userInput: Record<string, any>,
    formSchema: FormSchema,
    submissionMetadata: SubmissionMetadata
  ): FormDataJSON {
    const dataJSON: FormDataJSON = {
      ...submissionMetadata,
      templateId: formSchema.templateId,
      templateVersion: formSchema.version,
      pageData: [],
      flatData: { ...userInput },
      status: 'submitted',
      validationResults: this.validateUserInput(userInput, formSchema),
      analytics: submissionMetadata.analytics || {
        timeSpent: 0,
        pageViews: [],
        errors: []
      }
    };
    
    // Organize data by pages
    formSchema.pages.forEach(page => {
      const pageFields: Record<string, FormFieldData> = {};
      
      page.components.forEach(component => {
        const value = userInput[component.fieldId];
        pageFields[component.fieldId] = {
          fieldId: component.fieldId,
          fieldType: component.type,
          label: component.label,
          value: value,
          isValid: this.validateFieldValue(value, component),
          validationErrors: this.getFieldValidationErrors(value, component),
          inputMethod: 'typed', // Could be inferred from input tracking
          lastModified: new Date().toISOString(),
          previousValues: [] // Would come from change tracking
        };
      });
      
      dataJSON.pageData.push({
        pageId: page.id,
        pageTitle: page.title,
        fields: pageFields
      });
    });
    
    return dataJSON;
  }
  
  /**
   * Convert Data JSON back to simple key-value pairs
   */
  static unmarshalFormData(dataJSON: FormDataJSON): Record<string, any> {
    return dataJSON.flatData;
  }
  
  /**
   * Export operations for different formats
   */
  static exportFormSchema(formSchema: FormSchema, format: 'json' | 'yaml' | 'xml'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(formSchema, null, 2);
      case 'yaml':
        return this.convertToYAML(formSchema);
      case 'xml':
        return this.convertToXML(formSchema);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  static exportFormData(dataJSON: FormDataJSON, format: 'json' | 'csv' | 'xlsx'): string | Buffer {
    switch (format) {
      case 'json':
        return JSON.stringify(dataJSON, null, 2);
      case 'csv':
        return this.convertToCSV(dataJSON);
      case 'xlsx':
        return this.convertToExcel(dataJSON);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
```

### Schema Usage Examples

#### Loading and Editing Forms
```typescript
// Load form from Form Schema JSON
const formSchema = await loadFormSchema('contact-form-v1');
const builderState = JSONSchemaOperations.unmarshalFormSchema(formSchema);

// Edit form in builder
const updatedBuilderState = FormBuilder.addComponent(builderState, 'text_input');

// Save back to Form Schema JSON
const updatedSchema = JSONSchemaOperations.marshalFormSchema(updatedBuilderState);
await saveFormSchema(updatedSchema);
```

#### Processing Form Submissions
```typescript
// User submits form
const userInput = {
  fullName: 'Jane Smith',
  email: 'jane@example.com'
};

// Convert to Data JSON
const dataJSON = JSONSchemaOperations.marshalFormData(
  userInput, 
  formSchema, 
  {
    submissionId: 'sub-67890',
    submittedAt: new Date().toISOString(),
    submittedBy: { userId: 'user-456' }
  }
);

// Store submission
await saveFormSubmission(dataJSON);

// Later: retrieve and process
const submissions = await getFormSubmissions('contact-form-v1');
submissions.forEach(submission => {
  const simpleData = JSONSchemaOperations.unmarshalFormData(submission);
  console.log('User data:', simpleData);
});
```

This dual schema system provides:

✅ **Clean Separation**: Form structure separate from form data  
✅ **Type Safety**: Strongly typed interfaces for both schema types  
✅ **Efficient Processing**: Optimized data structures for different use cases  
✅ **Version Management**: Template versioning and compatibility checking  
✅ **Analytics Support**: Built-in tracking and analysis capabilities  
✅ **Multiple Export Formats**: JSON, CSV, XLSX support for data  
✅ **Validation Integration**: Schema-driven validation of submissions  
✅ **Preview Integration**: Seamless preview modal with real data flow

## Survey Data Collection & Analytics System

### Overview

The Form Builder extends beyond individual form submissions to support comprehensive survey data collection and analytics. The system distinguishes between **Individual Form Submissions** (single responses) and **Survey Data Collections** (aggregated responses for analysis and visualization).

### Data Collection Types

#### Type A: Individual Form Submission JSON
Used for single form submissions with immediate processing:

```typescript
/**
 * INDIVIDUAL FORM SUBMISSION - Single response data
 * Purpose: Individual form submission processing
 * Usage: Contact forms, registration forms, single-use forms
 */
interface IndividualSubmissionJSON {
  // Single submission metadata
  submissionId: string;
  templateId: string;
  templateVersion: string;
  submittedAt: string;
  submittedBy: UserInfo;
  
  // Form response data
  formData: Record<string, any>;        // Simple field -> value mapping
  
  // Processing status
  status: 'submitted' | 'processed' | 'archived';
  processingResults?: {
    notifications: NotificationResult[];
    integrations: IntegrationResult[];
    workflows: WorkflowResult[];
  };
  
  // Single submission analytics
  analytics: {
    timeSpent: number;
    pageViews: PageViewData[];
    errorCount: number;
  };
}
```

#### Type B: Survey Data Collection JSON
Used for aggregated survey responses with analytical capabilities:

```typescript
/**
 * SURVEY DATA COLLECTION - Aggregated response dataset
 * Purpose: Survey analysis, reporting, chart generation
 * Usage: Research surveys, feedback forms, polls, market research
 */
interface SurveyDataCollectionJSON {
  // Collection metadata
  collectionId: string;
  surveyName: string;
  templateId: string;
  templateVersion: string;
  
  // Collection period
  collectionPeriod: {
    startDate: string;
    endDate: string;
    totalResponses: number;
    targetResponses?: number;
  };
  
  // Aggregated responses
  responses: SurveyResponse[];
  
  // Statistical summary
  statistics: SurveyStatistics;
  
  // Response analysis
  analysis: {
    responseRate: number;              // Completion percentage
    averageCompletionTime: number;     // In milliseconds
    dropoffAnalysis: DropoffAnalysis;  // Where users quit
    qualityMetrics: QualityMetrics;    // Data quality indicators
  };
  
  // Data for visualization
  visualizationData: {
    charts: ChartDataset[];
    graphs: GraphDataset[];
    tables: TableDataset[];
  };
  
  // Export configurations
  exportConfig: {
    availableFormats: string[];        // pdf, xlsx, csv, json
    reportTemplate: string;
    chartStyles: ChartStyleConfig;
  };
}

interface SurveyResponse {
  responseId: string;
  submittedAt: string;
  submittedBy?: UserInfo;
  
  // Response data organized by field
  fieldResponses: Record<string, FieldResponse>;
  
  // Response metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    completionTime: number;
    isComplete: boolean;
  };
}

interface FieldResponse {
  fieldId: string;
  fieldType: ComponentType;
  question: string;                    // The field label/question
  answer: any;                        // User's response
  answerDisplay: string;              // Human-readable answer
  
  // Response context
  responseTime: number;               // Time spent on this field
  attemptCount: number;               // Number of tries/edits
  confidence?: number;                // User confidence (if collected)
}
```

### Survey Statistics Engine

```typescript
/**
 * Statistical analysis engine for survey data
 */
interface SurveyStatistics {
  // Overall metrics
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number;
  
  // Field-level statistics
  fieldStatistics: Record<string, FieldStatistics>;
  
  // Demographic breakdowns (if demographic fields exist)
  demographics?: DemographicBreakdown;
  
  // Time-based analysis
  timeAnalysis: {
    averageCompletionTime: number;
    medianCompletionTime: number;
    responsesByTimeOfDay: TimeDistribution[];
    responsesByDayOfWeek: DayDistribution[];
  };
  
  // Quality indicators
  dataQuality: {
    consistencyScore: number;          // 0-100, higher = more consistent
    completenessScore: number;         // 0-100, higher = more complete
    validityScore: number;             // 0-100, higher = more valid responses
    suspiciousResponses: string[];     // IDs of potentially fake responses
  };
}

interface FieldStatistics {
  fieldId: string;
  fieldType: ComponentType;
  question: string;
  
  // Response metrics
  totalResponses: number;
  validResponses: number;
  skipRate: number;                    // Percentage who skipped this field
  
  // Type-specific statistics
  textStatistics?: {
    averageLength: number;
    wordCount: number;
    commonWords: Array<{word: string; count: number}>;
    sentimentScore?: number;           // If sentiment analysis is enabled
  };
  
  numericStatistics?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    distribution: Array<{range: string; count: number}>;
  };
  
  choiceStatistics?: {
    options: Array<{
      value: string;
      label: string;
      count: number;
      percentage: number;
    }>;
    topChoice: string;
    choiceDistribution: number[];
  };
  
  dateStatistics?: {
    earliestDate: string;
    latestDate: string;
    mostCommonDate: string;
    dateRangeDistribution: Array<{range: string; count: number}>;
  };
}

class SurveyStatisticsEngine {
  static generateStatistics(responses: SurveyResponse[], formSchema: FormSchema): SurveyStatistics {
    const stats: SurveyStatistics = {
      totalResponses: responses.length,
      completeResponses: responses.filter(r => r.metadata.isComplete).length,
      partialResponses: responses.filter(r => !r.metadata.isComplete).length,
      responseRate: 0, // Would need target number
      fieldStatistics: {},
      timeAnalysis: this.analyzeTimingData(responses),
      dataQuality: this.assessDataQuality(responses, formSchema)
    };
    
    // Generate field-level statistics
    formSchema.pages.forEach(page => {
      page.components.forEach(component => {
        stats.fieldStatistics[component.fieldId] = this.generateFieldStatistics(
          component,
          responses
        );
      });
    });
    
    return stats;
  }
  
  static generateFieldStatistics(component: FormComponentData, responses: SurveyResponse[]): FieldStatistics {
    const fieldResponses = responses.map(r => r.fieldResponses[component.fieldId]).filter(Boolean);
    
    const baseStats: FieldStatistics = {
      fieldId: component.fieldId,
      fieldType: component.type,
      question: component.label,
      totalResponses: responses.length,
      validResponses: fieldResponses.length,
      skipRate: ((responses.length - fieldResponses.length) / responses.length) * 100
    };
    
    // Add type-specific statistics
    switch (component.type) {
      case 'text_input':
      case 'textarea':
        baseStats.textStatistics = this.analyzeTextResponses(fieldResponses);
        break;
        
      case 'number_input':
        baseStats.numericStatistics = this.analyzeNumericResponses(fieldResponses);
        break;
        
      case 'select':
      case 'radio_group':
      case 'checkbox':
      case 'multi_select':
        baseStats.choiceStatistics = this.analyzeChoiceResponses(fieldResponses, component.options);
        break;
        
      case 'date_picker':
        baseStats.dateStatistics = this.analyzeDateResponses(fieldResponses);
        break;
    }
    
    return baseStats;
  }
  
  private static analyzeTextResponses(responses: FieldResponse[]): any {
    const texts = responses.map(r => r.answer).filter(Boolean);
    
    return {
      averageLength: texts.reduce((sum, text) => sum + text.length, 0) / texts.length,
      wordCount: texts.reduce((sum, text) => sum + text.split(/\s+/).length, 0),
      commonWords: this.extractCommonWords(texts),
      sentimentScore: this.analyzeSentiment(texts)
    };
  }
  
  private static analyzeChoiceResponses(responses: FieldResponse[], options?: Array<{label: string; value: string}>): any {
    const choices = responses.map(r => r.answer).filter(Boolean);
    const choiceCounts = new Map<string, number>();
    
    choices.forEach(choice => {
      if (Array.isArray(choice)) {
        // Multi-select
        choice.forEach(c => {
          choiceCounts.set(c, (choiceCounts.get(c) || 0) + 1);
        });
      } else {
        // Single choice
        choiceCounts.set(choice, (choiceCounts.get(choice) || 0) + 1);
      }
    });
    
    const sortedChoices = Array.from(choiceCounts.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return {
      options: sortedChoices.map(([value, count]) => ({
        value,
        label: options?.find(opt => opt.value === value)?.label || value,
        count,
        percentage: (count / responses.length) * 100
      })),
      topChoice: sortedChoices[0]?.[0],
      choiceDistribution: sortedChoices.map(([, count]) => count)
    };
  }
}
```

### Data Collection Workflow

```typescript
/**
 * Survey data collection and aggregation workflow
 */
class SurveyDataCollector {
  static async createSurveyCollection(
    templateId: string,
    surveyName: string,
    targetResponses?: number
  ): Promise<SurveyDataCollectionJSON> {
    
    const collection: SurveyDataCollectionJSON = {
      collectionId: generateUniqueId(),
      surveyName,
      templateId,
      templateVersion: await this.getTemplateVersion(templateId),
      collectionPeriod: {
        startDate: new Date().toISOString(),
        endDate: '', // Open-ended initially
        totalResponses: 0,
        targetResponses
      },
      responses: [],
      statistics: this.getEmptyStatistics(),
      analysis: this.getEmptyAnalysis(),
      visualizationData: { charts: [], graphs: [], tables: [] },
      exportConfig: this.getDefaultExportConfig()
    };
    
    return collection;
  }
  
  static async addResponseToCollection(
    collectionId: string,
    submissionData: IndividualSubmissionJSON
  ): Promise<void> {
    // Convert individual submission to survey response
    const surveyResponse: SurveyResponse = this.convertSubmissionToResponse(submissionData);
    
    // Add to collection
    const collection = await this.loadCollection(collectionId);
    collection.responses.push(surveyResponse);
    collection.collectionPeriod.totalResponses = collection.responses.length;
    
    // Recalculate statistics
    const formSchema = await this.loadFormSchema(collection.templateId);
    collection.statistics = SurveyStatisticsEngine.generateStatistics(
      collection.responses,
      formSchema
    );
    
    // Update analysis
    collection.analysis = this.updateAnalysis(collection);
    
    // Regenerate visualization data
    collection.visualizationData = await this.generateVisualizationData(collection);
    
    // Save updated collection
    await this.saveCollection(collection);
  }
  
  private static convertSubmissionToResponse(submission: IndividualSubmissionJSON): SurveyResponse {
    const fieldResponses: Record<string, FieldResponse> = {};
    
    // Convert simple form data to structured field responses
    Object.entries(submission.formData).forEach(([fieldId, answer]) => {
      fieldResponses[fieldId] = {
        fieldId,
        fieldType: this.getFieldType(fieldId, submission.templateId),
        question: this.getFieldLabel(fieldId, submission.templateId),
        answer,
        answerDisplay: this.formatAnswerForDisplay(answer),
        responseTime: submission.analytics.timeSpent / Object.keys(submission.formData).length, // Rough estimate
        attemptCount: 1 // Default
      };
    });
    
    return {
      responseId: submission.submissionId,
      submittedAt: submission.submittedAt,
      submittedBy: submission.submittedBy,
      fieldResponses,
      metadata: {
        completionTime: submission.analytics.timeSpent,
        isComplete: submission.status === 'submitted'
      }
    };
  }
}
```

## Visual Analytics & Chart Generation

### Overview

The Survey Data Collection system automatically generates visual representations of collected data through charts, graphs, and tables. The visualization engine supports multiple chart types and provides interactive analytics dashboards.

### Chart Generation Engine

```typescript
/**
 * Chart and visualization generation system
 */
interface ChartDataset {
  chartId: string;
  chartType: ChartType;
  title: string;
  description: string;
  fieldId: string;                     // Source field
  
  // Chart data
  data: ChartData;
  
  // Chart configuration
  config: ChartConfig;
  
  // Export options
  exportOptions: {
    formats: string[];                 // png, svg, pdf
    sizes: Array<{width: number; height: number}>;
  };
}

type ChartType = 
  | 'bar_chart'
  | 'pie_chart' 
  | 'line_chart'
  | 'doughnut_chart'
  | 'histogram'
  | 'scatter_plot'
  | 'area_chart'
  | 'radar_chart'
  | 'word_cloud'
  | 'heatmap';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
  
  // Additional data for complex charts
  metadata?: {
    totalResponses: number;
    averageValue?: number;
    trendData?: Array<{date: string; value: number}>;
  };
}

interface ChartConfig {
  responsive: boolean;
  plugins: {
    title: {
      display: boolean;
      text: string;
    };
    legend: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip: {
      enabled: boolean;
      format: string;
    };
  };
  
  // Chart-specific options
  scales?: any;
  elements?: any;
  animation?: any;
}

class ChartGenerationEngine {
  static generateChartsForSurvey(
    collection: SurveyDataCollectionJSON,
    formSchema: FormSchema
  ): ChartDataset[] {
    const charts: ChartDataset[] = [];
    
    formSchema.pages.forEach(page => {
      page.components.forEach(component => {
        const fieldStats = collection.statistics.fieldStatistics[component.fieldId];
        if (!fieldStats || fieldStats.validResponses === 0) return;
        
        // Generate appropriate chart based on field type
        const chart = this.generateChartForField(component, fieldStats, collection);
        if (chart) {
          charts.push(chart);
        }
      });
    });
    
    // Generate overview charts
    charts.push(...this.generateOverviewCharts(collection));
    
    return charts;
  }
  
  static generateChartForField(
    component: FormComponentData,
    fieldStats: FieldStatistics,
    collection: SurveyDataCollectionJSON
  ): ChartDataset | null {
    
    switch (component.type) {
      case 'select':
      case 'radio_group':
        return this.generatePieChart(component, fieldStats);
        
      case 'multi_select':
      case 'checkbox':
        return this.generateBarChart(component, fieldStats);
        
      case 'number_input':
        return this.generateHistogram(component, fieldStats);
        
      case 'date_picker':
        return this.generateTimelineChart(component, fieldStats);
        
      case 'text_input':
      case 'textarea':
        if (fieldStats.textStatistics?.commonWords) {
          return this.generateWordCloud(component, fieldStats);
        }
        break;
        
      default:
        return null;
    }
    
    return null;
  }
  
  private static generatePieChart(
    component: FormComponentData,
    fieldStats: FieldStatistics
  ): ChartDataset {
    const choiceStats = fieldStats.choiceStatistics!;
    
    return {
      chartId: `pie_${component.fieldId}`,
      chartType: 'pie_chart',
      title: component.label,
      description: `Distribution of responses for "${component.label}"`,
      fieldId: component.fieldId,
      
      data: {
        labels: choiceStats.options.map(opt => opt.label),
        datasets: [{
          label: 'Responses',
          data: choiceStats.options.map(opt => opt.count),
          backgroundColor: this.generateColors(choiceStats.options.length),
          borderWidth: 1
        }],
        metadata: {
          totalResponses: fieldStats.validResponses
        }
      },
      
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: component.label
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            enabled: true,
            format: 'percentage'
          }
        }
      },
      
      exportOptions: {
        formats: ['png', 'svg', 'pdf'],
        sizes: [
          {width: 400, height: 400},
          {width: 800, height: 600}
        ]
      }
    };
  }
  
  private static generateBarChart(
    component: FormComponentData,
    fieldStats: FieldStatistics
  ): ChartDataset {
    const choiceStats = fieldStats.choiceStatistics!;
    
    return {
      chartId: `bar_${component.fieldId}`,
      chartType: 'bar_chart',
      title: component.label,
      description: `Response counts for "${component.label}"`,
      fieldId: component.fieldId,
      
      data: {
        labels: choiceStats.options.map(opt => opt.label),
        datasets: [{
          label: 'Count',
          data: choiceStats.options.map(opt => opt.count),
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 1
        }],
        metadata: {
          totalResponses: fieldStats.validResponses
        }
      },
      
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: component.label
          },
          legend: {
            display: false,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            format: 'count'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      },
      
      exportOptions: {
        formats: ['png', 'svg', 'pdf'],
        sizes: [
          {width: 600, height: 400},
          {width: 1000, height: 600}
        ]
      }
    };
  }
  
  private static generateHistogram(
    component: FormComponentData,
    fieldStats: FieldStatistics
  ): ChartDataset {
    const numStats = fieldStats.numericStatistics!;
    
    return {
      chartId: `histogram_${component.fieldId}`,
      chartType: 'histogram',
      title: `${component.label} - Distribution`,
      description: `Distribution of numeric values for "${component.label}"`,
      fieldId: component.fieldId,
      
      data: {
        labels: numStats.distribution.map(d => d.range),
        datasets: [{
          label: 'Frequency',
          data: numStats.distribution.map(d => d.count),
          backgroundColor: '#28a745',
          borderColor: '#1e7e34',
          borderWidth: 1
        }],
        metadata: {
          totalResponses: fieldStats.validResponses,
          averageValue: numStats.mean
        }
      },
      
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${component.label} - Distribution`
          },
          legend: {
            display: false,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            format: 'frequency'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: component.label
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequency'
            },
            beginAtZero: true
          }
        }
      },
      
      exportOptions: {
        formats: ['png', 'svg', 'pdf'],
        sizes: [
          {width: 600, height: 400},
          {width: 1000, height: 600}
        ]
      }
    };
  }
  
  private static generateOverviewCharts(collection: SurveyDataCollectionJSON): ChartDataset[] {
    const overviewCharts: ChartDataset[] = [];
    
    // Response completion chart
    overviewCharts.push({
      chartId: 'completion_overview',
      chartType: 'doughnut_chart',
      title: 'Response Completion Status',
      description: 'Overview of complete vs partial responses',
      fieldId: '_completion_status',
      
      data: {
        labels: ['Complete', 'Partial'],
        datasets: [{
          label: 'Responses',
          data: [
            collection.statistics.completeResponses,
            collection.statistics.partialResponses
          ],
          backgroundColor: ['#28a745', '#ffc107'],
          borderWidth: 2
        }],
        metadata: {
          totalResponses: collection.statistics.totalResponses
        }
      },
      
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Response Completion Status'
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            enabled: true,
            format: 'percentage'
          }
        }
      },
      
      exportOptions: {
        formats: ['png', 'svg', 'pdf'],
        sizes: [{width: 400, height: 400}]
      }
    });
    
    // Response timeline chart
    if (collection.responses.length > 1) {
      overviewCharts.push(this.generateResponseTimelineChart(collection));
    }
    
    return overviewCharts;
  }
  
  private static generateResponseTimelineChart(collection: SurveyDataCollectionJSON): ChartDataset {
    // Group responses by date
    const responsesByDate = new Map<string, number>();
    
    collection.responses.forEach(response => {
      const date = new Date(response.submittedAt).toISOString().split('T')[0];
      responsesByDate.set(date, (responsesByDate.get(date) || 0) + 1);
    });
    
    const sortedDates = Array.from(responsesByDate.keys()).sort();
    
    return {
      chartId: 'response_timeline',
      chartType: 'line_chart',
      title: 'Responses Over Time',
      description: 'Timeline showing when responses were submitted',
      fieldId: '_response_timeline',
      
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Daily Responses',
          data: sortedDates.map(date => responsesByDate.get(date) || 0),
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderColor: '#007bff',
          borderWidth: 2,
          fill: true
        }],
        metadata: {
          totalResponses: collection.statistics.totalResponses
        }
      },
      
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Responses Over Time'
          },
          legend: {
            display: false,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            format: 'date_count'
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Responses'
            }
          }
        }
      },
      
      exportOptions: {
        formats: ['png', 'svg', 'pdf'],
        sizes: [{width: 800, height: 400}]
      }
    };
  }
  
  private static generateColors(count: number): string[] {
    const colors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6f42c1'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }
}
```

### Interactive Analytics Dashboard

```typescript
/**
 * Interactive dashboard for survey analytics
 */
interface AnalyticsDashboard {
  dashboardId: string;
  collectionId: string;
  title: string;
  
  // Dashboard layout
  layout: DashboardLayout;
  
  // Interactive features
  filters: DashboardFilter[];
  drilldowns: DrilldownConfig[];
  
  // Real-time updates
  realTimeEnabled: boolean;
  lastUpdated: string;
}

interface DashboardLayout {
  sections: Array<{
    sectionId: string;
    title: string;
    type: 'charts' | 'tables' | 'metrics' | 'text';
    span: number;                      // Grid span (1-12)
    items: DashboardItem[];
  }>;
}

interface DashboardItem {
  itemId: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  chartId?: string;                    // Reference to ChartDataset
  content?: any;                       // Content for non-chart items
}

class AnalyticsDashboardEngine {
  static generateDashboard(collection: SurveyDataCollectionJSON): AnalyticsDashboard {
    return {
      dashboardId: `dashboard_${collection.collectionId}`,
      collectionId: collection.collectionId,
      title: `${collection.surveyName} - Analytics Dashboard`,
      
      layout: {
        sections: [
          {
            sectionId: 'overview',
            title: 'Overview',
            type: 'metrics',
            span: 12,
            items: this.generateOverviewMetrics(collection)
          },
          {
            sectionId: 'completion',
            title: 'Response Status',
            type: 'charts',
            span: 6,
            items: [{
              itemId: 'completion_chart',
              type: 'chart',
              chartId: 'completion_overview'
            }]
          },
          {
            sectionId: 'timeline',
            title: 'Response Timeline',
            type: 'charts',
            span: 6,
            items: [{
              itemId: 'timeline_chart',
              type: 'chart',
              chartId: 'response_timeline'
            }]
          },
          {
            sectionId: 'field_analysis',
            title: 'Field Analysis',
            type: 'charts',
            span: 12,
            items: this.generateFieldChartItems(collection)
          }
        ]
      },
      
      filters: this.generateDashboardFilters(collection),
      drilldowns: this.generateDrilldownConfigs(collection),
      realTimeEnabled: true,
      lastUpdated: new Date().toISOString()
    };
  }
  
  private static generateOverviewMetrics(collection: SurveyDataCollectionJSON): DashboardItem[] {
    const stats = collection.statistics;
    
    return [
      {
        itemId: 'total_responses',
        type: 'metric',
        content: {
          title: 'Total Responses',
          value: stats.totalResponses,
          format: 'number'
        }
      },
      {
        itemId: 'completion_rate',
        type: 'metric',
        content: {
          title: 'Completion Rate',
          value: (stats.completeResponses / stats.totalResponses) * 100,
          format: 'percentage'
        }
      },
      {
        itemId: 'avg_time',
        type: 'metric',
        content: {
          title: 'Avg. Completion Time',
          value: stats.timeAnalysis.averageCompletionTime / 1000 / 60, // Convert to minutes
          format: 'minutes'
        }
      },
      {
        itemId: 'data_quality',
        type: 'metric',
        content: {
          title: 'Data Quality Score',
          value: stats.dataQuality.consistencyScore,
          format: 'score'
        }
      }
    ];
  }
}
```

## PDF Export & Report Generation

### Overview

The system provides comprehensive PDF export capabilities for both individual submissions and aggregated survey data. Reports can include form data, charts, analytics, and custom branding.

### PDF Export Engine

```typescript
/**
 * PDF generation and export system
 */
interface PDFExportConfig {
  exportId: string;
  templateType: 'individual' | 'survey_report' | 'custom';
  
  // Content configuration
  content: {
    includeFormData: boolean;
    includeCharts: boolean;
    includeStatistics: boolean;
    includeRawData: boolean;
    customSections?: PDFSection[];
  };
  
  // Styling and branding
  styling: {
    template: 'professional' | 'minimal' | 'branded' | 'academic';
    colorScheme: string;
    logo?: string;                     // Base64 or URL
    headerText?: string;
    footerText?: string;
    pageNumbers: boolean;
  };
  
  // Format options
  format: {
    pageSize: 'A4' | 'Letter' | 'Legal' | 'A3';
    orientation: 'portrait' | 'landscape';
    margins: {top: number; right: number; bottom: number; left: number};
  };
  
  // Export options
  options: {
    filename: string;
    compression: boolean;
    watermark?: string;
    password?: string;                 // PDF password protection
  };
}

interface PDFSection {
  sectionId: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'form_data' | 'statistics';
  content: any;
  pageBreakBefore?: boolean;
}

class PDFExportEngine {
  /**
   * Generate PDF for individual form submission
   */
  static async generateIndividualSubmissionPDF(
    submission: IndividualSubmissionJSON,
    formSchema: FormSchema,
    config?: Partial<PDFExportConfig>
  ): Promise<Buffer> {
    
    const pdfConfig: PDFExportConfig = {
      exportId: `pdf_${submission.submissionId}`,
      templateType: 'individual',
      
      content: {
        includeFormData: true,
        includeCharts: false,
        includeStatistics: false,
        includeRawData: false
      },
      
      styling: {
        template: 'professional',
        colorScheme: '#007bff',
        pageNumbers: true,
        headerText: formSchema.templateName,
        footerText: `Generated on ${new Date().toLocaleDateString()}`
      },
      
      format: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: {top: 50, right: 50, bottom: 50, left: 50}
      },
      
      options: {
        filename: `${formSchema.templateName}_${submission.submissionId}.pdf`,
        compression: true
      },
      
      ...config
    };
    
    const pdfDoc = new PDFDocument({
      size: pdfConfig.format.pageSize,
      layout: pdfConfig.format.orientation,
      margins: pdfConfig.format.margins
    });
    
    // Generate PDF content
    await this.addHeaderSection(pdfDoc, pdfConfig, formSchema);
    await this.addSubmissionDetails(pdfDoc, submission);
    await this.addFormDataSection(pdfDoc, submission, formSchema);
    await this.addFooterSection(pdfDoc, pdfConfig);
    
    return this.finalizePDF(pdfDoc, pdfConfig);
  }
  
  /**
   * Generate comprehensive survey report PDF
   */
  static async generateSurveyReportPDF(
    collection: SurveyDataCollectionJSON,
    formSchema: FormSchema,
    config?: Partial<PDFExportConfig>
  ): Promise<Buffer> {
    
    const pdfConfig: PDFExportConfig = {
      exportId: `survey_report_${collection.collectionId}`,
      templateType: 'survey_report',
      
      content: {
        includeFormData: true,
        includeCharts: true,
        includeStatistics: true,
        includeRawData: false
      },
      
      styling: {
        template: 'professional',
        colorScheme: '#007bff',
        pageNumbers: true,
        headerText: `${collection.surveyName} - Survey Report`,
        footerText: `Generated on ${new Date().toLocaleDateString()}`
      },
      
      format: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: {top: 50, right: 50, bottom: 50, left: 50}
      },
      
      options: {
        filename: `${collection.surveyName}_Report.pdf`,
        compression: true
      },
      
      ...config
    };
    
    const pdfDoc = new PDFDocument({
      size: pdfConfig.format.pageSize,
      layout: pdfConfig.format.orientation,
      margins: pdfConfig.format.margins
    });
    
    // Generate comprehensive report
    await this.addReportCoverPage(pdfDoc, pdfConfig, collection);
    await this.addExecutiveSummary(pdfDoc, collection);
    await this.addMethodologySection(pdfDoc, formSchema, collection);
    await this.addStatisticsSection(pdfDoc, collection);
    await this.addChartsSection(pdfDoc, collection);
    
    if (pdfConfig.content.includeRawData) {
      await this.addRawDataSection(pdfDoc, collection);
    }
    
    await this.addAppendices(pdfDoc, collection, formSchema);
    
    return this.finalizePDF(pdfDoc, pdfConfig);
  }
  
  private static async addReportCoverPage(
    pdfDoc: PDFKit.PDFDocument,
    config: PDFExportConfig,
    collection: SurveyDataCollectionJSON
  ): Promise<void> {
    
    // Title
    pdfDoc.fontSize(24).font('Helvetica-Bold')
          .text(collection.surveyName, 50, 150, {align: 'center'});
    
    // Subtitle
    pdfDoc.fontSize(16).font('Helvetica')
          .text('Survey Analysis Report', 50, 200, {align: 'center'});
    
    // Report details
    pdfDoc.fontSize(12).font('Helvetica')
          .text(`Report Period: ${collection.collectionPeriod.startDate} to ${collection.collectionPeriod.endDate || 'Present'}`, 50, 300)
          .text(`Total Responses: ${collection.statistics.totalResponses}`, 50, 320)
          .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 340);
    
    // Add logo if provided
    if (config.styling.logo) {
      pdfDoc.image(config.styling.logo, 50, 50, {width: 100});
    }
    
    pdfDoc.addPage();
  }
  
  private static async addExecutiveSummary(
    pdfDoc: PDFKit.PDFDocument,
    collection: SurveyDataCollectionJSON
  ): Promise<void> {
    
    pdfDoc.fontSize(18).font('Helvetica-Bold')
          .text('Executive Summary', 50, 50);
    
    const stats = collection.statistics;
    
    pdfDoc.fontSize(12).font('Helvetica')
          .text(`This report analyzes ${stats.totalResponses} responses collected for the "${collection.surveyName}" survey.`, 50, 90, {width: 500})
          .text(`Key findings include:`, 50, 130)
          .text(`• Response rate: ${((stats.completeResponses / stats.totalResponses) * 100).toFixed(1)}% completion`, 70, 150)
          .text(`• Average completion time: ${(stats.timeAnalysis.averageCompletionTime / 1000 / 60).toFixed(1)} minutes`, 70, 170)
          .text(`• Data quality score: ${stats.dataQuality.consistencyScore}/100`, 70, 190);
    
    // Add key insights
    const insights = this.generateKeyInsights(collection);
    if (insights.length > 0) {
      pdfDoc.text('Key Insights:', 50, 230);
      insights.forEach((insight, index) => {
        pdfDoc.text(`• ${insight}`, 70, 250 + (index * 20));
      });
    }
  }
  
  private static async addChartsSection(
    pdfDoc: PDFKit.PDFDocument,
    collection: SurveyDataCollectionJSON
  ): Promise<void> {
    
    pdfDoc.addPage()
          .fontSize(18).font('Helvetica-Bold')
          .text('Survey Results - Visual Analysis', 50, 50);
    
    let yPosition = 100;
    
    // Add each chart
    for (const chart of collection.visualizationData.charts) {
      if (yPosition > 650) {
        pdfDoc.addPage();
        yPosition = 50;
      }
      
      // Chart title
      pdfDoc.fontSize(14).font('Helvetica-Bold')
            .text(chart.title, 50, yPosition);
      
      yPosition += 30;
      
      // Generate and embed chart image
      const chartImage = await this.generateChartImage(chart);
      pdfDoc.image(chartImage, 50, yPosition, {width: 400});
      
      yPosition += 250; // Chart height + margin
      
      // Chart description
      if (chart.description) {
        pdfDoc.fontSize(10).font('Helvetica')
              .text(chart.description, 50, yPosition, {width: 500});
        yPosition += 40;
      }
    }
  }
  
  private static async addStatisticsSection(
    pdfDoc: PDFKit.PDFDocument,
    collection: SurveyDataCollectionJSON
  ): Promise<void> {
    
    pdfDoc.addPage()
          .fontSize(18).font('Helvetica-Bold')
          .text('Statistical Analysis', 50, 50);
    
    const stats = collection.statistics;
    let yPosition = 100;
    
    // Overall statistics
    pdfDoc.fontSize(14).font('Helvetica-Bold')
          .text('Overall Statistics', 50, yPosition);
    
    yPosition += 30;
    
    const overallStats = [
      [`Total Responses`, stats.totalResponses.toString()],
      [`Complete Responses`, `${stats.completeResponses} (${((stats.completeResponses / stats.totalResponses) * 100).toFixed(1)}%)`],
      [`Partial Responses`, `${stats.partialResponses} (${((stats.partialResponses / stats.totalResponses) * 100).toFixed(1)}%)`],
      [`Average Completion Time`, `${(stats.timeAnalysis.averageCompletionTime / 1000 / 60).toFixed(1)} minutes`],
      [`Data Quality Score`, `${stats.dataQuality.consistencyScore}/100`]
    ];
    
    // Create statistics table
    await this.addTable(pdfDoc, overallStats, 50, yPosition, {
      headers: ['Metric', 'Value'],
      columnWidths: [200, 150]
    });
    
    yPosition += overallStats.length * 25 + 60;
    
    // Field-level statistics
    if (yPosition > 600) {
      pdfDoc.addPage();
      yPosition = 50;
    }
    
    pdfDoc.fontSize(14).font('Helvetica-Bold')
          .text('Field-Level Statistics', 50, yPosition);
    
    yPosition += 30;
    
    // Add field statistics table
    const fieldData: string[][] = [];
    Object.values(stats.fieldStatistics).forEach(fieldStat => {
      fieldData.push([
        fieldStat.question,
        fieldStat.validResponses.toString(),
        `${fieldStat.skipRate.toFixed(1)}%`,
        this.getFieldSummary(fieldStat)
      ]);
    });
    
    if (fieldData.length > 0) {
      await this.addTable(pdfDoc, fieldData, 50, yPosition, {
        headers: ['Question', 'Responses', 'Skip Rate', 'Summary'],
        columnWidths: [200, 80, 80, 150]
      });
    }
  }
  
  private static async addTable(
    pdfDoc: PDFKit.PDFDocument,
    data: string[][],
    x: number,
    y: number,
    options: {
      headers: string[];
      columnWidths: number[];
      rowHeight?: number;
      headerColor?: string;
    }
  ): Promise<void> {
    
    const rowHeight = options.rowHeight || 25;
    const headerColor = options.headerColor || '#f8f9fa';
    
    let currentY = y;
    
    // Draw headers
    pdfDoc.rect(x, currentY, options.columnWidths.reduce((a, b) => a + b, 0), rowHeight)
          .fillAndStroke(headerColor, '#000000');
    
    let currentX = x;
    options.headers.forEach((header, index) => {
      pdfDoc.fillColor('#000000')
            .fontSize(10).font('Helvetica-Bold')
            .text(header, currentX + 5, currentY + 7, {
              width: options.columnWidths[index] - 10,
              height: rowHeight - 10
            });
      currentX += options.columnWidths[index];
    });
    
    currentY += rowHeight;
    
    // Draw data rows
    data.forEach((row, rowIndex) => {
      const fillColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa';
      
      pdfDoc.rect(x, currentY, options.columnWidths.reduce((a, b) => a + b, 0), rowHeight)
            .fillAndStroke(fillColor, '#cccccc');
      
      currentX = x;
      row.forEach((cell, colIndex) => {
        pdfDoc.fillColor('#000000')
              .fontSize(9).font('Helvetica')
              .text(cell, currentX + 5, currentY + 7, {
                width: options.columnWidths[colIndex] - 10,
                height: rowHeight - 10
              });
        currentX += options.columnWidths[colIndex];
      });
      
      currentY += rowHeight;
    });
  }
  
  private static async generateChartImage(chart: ChartDataset): Promise<Buffer> {
    // Implementation would use Chart.js with node-canvas or similar
    // to generate chart images server-side
    
    // Placeholder implementation
    return Buffer.from('chart-image-data');
  }
  
  private static generateKeyInsights(collection: SurveyDataCollectionJSON): string[] {
    const insights: string[] = [];
    const stats = collection.statistics;
    
    // Generate insights based on data
    if (stats.completeResponses / stats.totalResponses > 0.8) {
      insights.push('High completion rate indicates good survey design and user engagement');
    }
    
    if (stats.timeAnalysis.averageCompletionTime < 300000) { // Less than 5 minutes
      insights.push('Quick completion time suggests survey is appropriately sized');
    }
    
    if (stats.dataQuality.consistencyScore > 85) {
      insights.push('High data quality score indicates reliable responses');
    }
    
    return insights;
  }
  
  private static getFieldSummary(fieldStat: FieldStatistics): string {
    if (fieldStat.choiceStatistics) {
      const topChoice = fieldStat.choiceStatistics.topChoice;
      return `Top: ${topChoice}`;
    }
    
    if (fieldStat.numericStatistics) {
      return `Avg: ${fieldStat.numericStatistics.mean.toFixed(2)}`;
    }
    
    if (fieldStat.textStatistics) {
      return `Avg length: ${fieldStat.textStatistics.averageLength.toFixed(0)} chars`;
    }
    
    return 'N/A';
  }
  
  private static async finalizePDF(
    pdfDoc: PDFKit.PDFDocument,
    config: PDFExportConfig
  ): Promise<Buffer> {
    
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      
      pdfDoc.on('data', buffers.push.bind(buffers));
      pdfDoc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        
        // Apply password protection if specified
        if (config.options.password) {
          // Implementation would encrypt PDF with password
        }
        
        resolve(pdfData);
      });
      pdfDoc.on('error', reject);
      
      pdfDoc.end();
    });
  }
}

/**
 * Export service integration
 */
class SurveyExportService {
  static async exportSurveyData(
    collectionId: string,
    format: 'pdf' | 'xlsx' | 'csv' | 'json',
    config?: any
  ): Promise<{data: Buffer; filename: string; contentType: string}> {
    
    const collection = await this.loadCollection(collectionId);
    const formSchema = await this.loadFormSchema(collection.templateId);
    
    switch (format) {
      case 'pdf':
        const pdfData = await PDFExportEngine.generateSurveyReportPDF(collection, formSchema, config);
        return {
          data: pdfData,
          filename: `${collection.surveyName}_Report.pdf`,
          contentType: 'application/pdf'
        };
        
      case 'xlsx':
        const xlsxData = await this.generateExcelReport(collection, formSchema);
        return {
          data: xlsxData,
          filename: `${collection.surveyName}_Data.xlsx`,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        
      case 'csv':
        const csvData = await this.generateCSVReport(collection);
        return {
          data: Buffer.from(csvData),
          filename: `${collection.surveyName}_Data.csv`,
          contentType: 'text/csv'
        };
        
      case 'json':
        const jsonData = JSON.stringify(collection, null, 2);
        return {
          data: Buffer.from(jsonData),
          filename: `${collection.surveyName}_Collection.json`,
          contentType: 'application/json'
        };
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
```

This comprehensive system provides:

✅ **Dual Data Types**: Individual submissions vs survey collections  
✅ **Statistical Analysis**: Comprehensive statistics generation for all field types  
✅ **Visual Analytics**: Automatic chart generation (pie, bar, histogram, timeline, word clouds)  
✅ **Interactive Dashboards**: Real-time analytics with filters and drilldowns  
✅ **PDF Export Engine**: Professional reports with charts, statistics, and custom branding  
✅ **Multiple Export Formats**: PDF, XLSX, CSV, JSON support  
✅ **Chart Image Generation**: Server-side chart rendering for PDF inclusion  
✅ **Report Templates**: Professional, minimal, branded, and academic templates  
✅ **Data Quality Analysis**: Consistency scoring and suspicious response detection  
✅ **Survey Insights**: Automatic insight generation from collected data

## Headless JSON Schema

### Core Data Structures

The form builder operates on a headless JSON schema that separates data structure from visual presentation.

#### FormComponentData Interface
```typescript
interface FormComponentData {
  id: string;                    // Unique identifier
  type: ComponentType;           // Component type enum
  label: string;                 // Display label
  fieldId: string;              // Form field identifier
  required: boolean;            // Validation requirement
  placeholder?: string;         // Input placeholder
  defaultValue?: any;           // Default field value
  options?: string[];           // For select/radio components
  children?: FormComponentData[]; // For layout containers
  
  // Type-specific properties
  min?: number;                 // Number inputs
  max?: number;                 // Number inputs
  rows?: number;                // Textarea
  acceptedFileTypes?: string;   // File upload
  buttonType?: 'primary' | 'secondary'; // Buttons
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Headings
}
```

#### Supported Component Types
```typescript
type ComponentType = 
  // Input Components
  | 'text_input' | 'email_input' | 'password_input' | 'number_input'
  | 'textarea' | 'rich_text'
  
  // Selection Components  
  | 'select' | 'multi_select' | 'checkbox' | 'radio_group'
  
  // Special Components
  | 'date_picker' | 'file_upload' | 'signature'
  
  // Layout Components
  | 'horizontal_layout' | 'vertical_layout'
  
  // UI Components
  | 'section_divider' | 'button' | 'heading' | 'card';
```

#### Form Page Structure
```typescript
interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  metadata?: {
    description?: string;
    order: number;
    isComplete?: boolean;
  };
}
```

#### Complete Form Schema
```typescript
interface FormSchema {
  templateName: string;
  pages: FormPage[];
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
  settings?: {
    theme?: 'light' | 'dark';
    submitAction?: 'email' | 'webhook' | 'database';
    notifications?: boolean;
  };
}
```

### Schema Validation Rules

```typescript
const SCHEMA_CONSTRAINTS = {
  templateName: {
    maxLength: 100,
    required: true,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  componentId: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    unique: true
  },
  fieldId: {
    pattern: /^field_\d+$/,
    unique: true
  },
  componentHierarchy: {
    maxDepth: 5,
    allowedNesting: {
      'horizontal_layout': ['*'], // Can contain any component
      'card': ['*'],
      'section_divider': [] // Cannot contain children
    }
  }
};
```

## JSON Marshal/Unmarshal Operations

### Import/Export Architecture

The form builder supports bidirectional JSON conversion with validation and error handling.

#### JSON Export (Marshal)

```typescript
class JSONExportService {
  /**
   * Export complete form schema to JSON
   */
  static exportFormSchema(formState: FormState): string {
    const schema: FormSchema = {
      templateName: formState.name || 'Untitled Form',
      pages: formState.pages.map(this.serializePage),
      metadata: {
        version: '1.0.0',
        createdAt: formState.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: formState.author
      },
      settings: formState.settings
    };
    
    // Validate schema before export
    this.validateSchema(schema);
    
    return JSON.stringify(schema, null, 2);
  }
  
  /**
   * Export lightweight template JSON (for form data collection)
   */
  static exportTemplateLayout(formState: FormState): string {
    const template = {
      templateName: formState.name,
      pages: formState.pages.map(page => ({
        id: page.id,
        title: page.title,
        components: page.components.map(this.serializeComponentForTemplate)
      }))
    };
    
    return JSON.stringify(template, null, 2);
  }
  
  private static serializePage(page: FormPage): FormPage {
    return {
      id: page.id,
      title: page.title,
      components: page.components.map(this.serializeComponent),
      metadata: {
        ...page.metadata,
        componentCount: page.components.length
      }
    };
  }
  
  private static serializeComponent(component: FormComponentData): FormComponentData {
    const baseComponent = {
      id: component.id,
      type: component.type,
      label: component.label,
      fieldId: component.fieldId,
      required: component.required
    };
    
    // Add optional properties if they exist
    const optionalProps = [
      'placeholder', 'defaultValue', 'options', 'min', 'max', 
      'rows', 'acceptedFileTypes', 'buttonType', 'level'
    ];
    
    optionalProps.forEach(prop => {
      if (component[prop] !== undefined) {
        baseComponent[prop] = component[prop];
      }
    });
    
    // Handle nested components (layouts)
    if (component.children) {
      baseComponent.children = component.children.map(this.serializeComponent);
    }
    
    return baseComponent;
  }
  
  private static serializeComponentForTemplate(component: FormComponentData) {
    // Lightweight version for template JSON
    return {
      type: component.type,
      label: component.label,
      fieldId: component.fieldId,
      required: component.required,
      ...(component.options && { options: component.options }),
      ...(component.children && { 
        children: component.children.map(this.serializeComponentForTemplate) 
      })
    };
  }
}
```

#### JSON Import (Unmarshal)

```typescript
class JSONImportService {
  /**
   * Import and validate JSON schema
   */
  static async importFormSchema(jsonString: string): Promise<FormState> {
    try {
      const rawData = JSON.parse(jsonString);
      
      // Validate JSON structure
      await this.validateImportSchema(rawData);
      
      // Transform to internal format
      const formState: FormState = {
        name: rawData.templateName || 'Imported Form',
        pages: rawData.pages.map(this.deserializePage),
        currentPageId: rawData.pages[0]?.id || generateId(),
        selectedComponentId: null,
        history: [],
        createdAt: rawData.metadata?.createdAt || new Date().toISOString(),
        author: rawData.metadata?.author,
        settings: rawData.settings || {}
      };
      
      // Post-import validation
      this.validateFormState(formState);
      
      return formState;
    } catch (error) {
      throw new JSONImportError(`Invalid JSON format: ${error.message}`, {
        originalError: error,
        jsonPreview: jsonString.substring(0, 200) + '...'
      });
    }
  }
  
  private static deserializePage(pageData: any): FormPage {
    if (!pageData.id || !pageData.title) {
      throw new ValidationError('Page missing required fields: id, title');
    }
    
    return {
      id: pageData.id,
      title: pageData.title,
      components: (pageData.components || []).map(this.deserializeComponent),
      metadata: {
        order: pageData.metadata?.order || 0,
        isComplete: pageData.metadata?.isComplete || false,
        ...pageData.metadata
      }
    };
  }
  
  private static deserializeComponent(componentData: any): FormComponentData {
    // Validate required fields
    const requiredFields = ['id', 'type', 'label', 'fieldId'];
    requiredFields.forEach(field => {
      if (!componentData[field]) {
        throw new ValidationError(`Component missing required field: ${field}`);
      }
    });
    
    // Validate component type
    if (!this.isValidComponentType(componentData.type)) {
      throw new ValidationError(`Invalid component type: ${componentData.type}`);
    }
    
    const component: FormComponentData = {
      id: componentData.id,
      type: componentData.type,
      label: componentData.label,
      fieldId: componentData.fieldId,
      required: componentData.required || false
    };
    
    // Add optional properties with type checking
    this.addOptionalProperty(component, componentData, 'placeholder', 'string');
    this.addOptionalProperty(component, componentData, 'defaultValue', 'any');
    this.addOptionalProperty(component, componentData, 'options', 'array');
    this.addOptionalProperty(component, componentData, 'min', 'number');
    this.addOptionalProperty(component, componentData, 'max', 'number');
    this.addOptionalProperty(component, componentData, 'rows', 'number');
    
    // Handle nested components
    if (componentData.children) {
      if (!Array.isArray(componentData.children)) {
        throw new ValidationError('Component children must be an array');
      }
      component.children = componentData.children.map(this.deserializeComponent);
    }
    
    return component;
  }
  
  private static validateImportSchema(data: any): void {
    const requiredTopLevel = ['templateName', 'pages'];
    requiredTopLevel.forEach(field => {
      if (!data[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    });
    
    if (!Array.isArray(data.pages) || data.pages.length === 0) {
      throw new ValidationError('Form must have at least one page');
    }
  }
  
  private static isValidComponentType(type: string): boolean {
    const validTypes = [
      'text_input', 'email_input', 'password_input', 'number_input',
      'textarea', 'rich_text', 'select', 'multi_select', 'checkbox',
      'radio_group', 'date_picker', 'file_upload', 'signature',
      'horizontal_layout', 'vertical_layout', 'section_divider',
      'button', 'heading', 'card'
    ];
    return validTypes.includes(type);
  }
}
```

### Error Handling

```typescript
class JSONImportError extends Error {
  constructor(message: string, public details: {
    originalError: Error;
    jsonPreview: string;
  }) {
    super(message);
    this.name = 'JSONImportError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Form Layout and Field Loading

### Dynamic Form Rendering

The form builder supports dynamic form rendering from JSON with lazy loading and performance optimization.

```typescript
class FormLayoutLoader {
  /**
   * Load form from JSON and render components
   */
  static async loadFormLayout(jsonData: FormSchema): Promise<ReactElement> {
    const formState = await JSONImportService.importFormSchema(JSON.stringify(jsonData));
    
    return (
      <FormRenderer
        pages={formState.pages}
        currentPageId={formState.currentPageId}
        onFieldChange={this.handleFieldChange}
        onValidation={this.handleValidation}
      />
    );
  }
  
  /**
   * Progressive loading for large forms
   */
  static async loadFormWithPagination(
    jsonData: FormSchema, 
    pageSize: number = 10
  ): Promise<PaginatedForm> {
    const totalPages = jsonData.pages.length;
    const chunks = Math.ceil(totalPages / pageSize);
    
    return {
      totalChunks: chunks,
      loadChunk: async (chunkIndex: number) => {
        const startIndex = chunkIndex * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalPages);
        
        return jsonData.pages.slice(startIndex, endIndex);
      }
    };
  }
}
```

### Component Field Mapping

```typescript
interface FieldMapping {
  [fieldId: string]: {
    component: FormComponentData;
    value: any;
    errors: ValidationError[];
    dependencies: string[]; // Other fieldIds this depends on
  };
}

class FieldMapper {
  static createFieldMapping(pages: FormPage[]): FieldMapping {
    const mapping: FieldMapping = {};
    
    pages.forEach(page => {
      this.traverseComponents(page.components, (component) => {
        if (component.fieldId) {
          mapping[component.fieldId] = {
            component,
            value: component.defaultValue || null,
            errors: [],
            dependencies: this.extractDependencies(component)
          };
        }
      });
    });
    
    return mapping;
  }
  
  private static traverseComponents(
    components: FormComponentData[], 
    callback: (component: FormComponentData) => void
  ) {
    components.forEach(component => {
      callback(component);
      if (component.children) {
        this.traverseComponents(component.children, callback);
      }
    });
  }
}
```

## JSON Export System

### Two-Tier Export Architecture

The form builder provides two export formats optimized for different use cases.

#### Export Format 1: Template Layout JSON
```typescript
interface TemplateLayoutExport {
  templateName: string;
  pages: {
    id: string;
    title: string;
    components: ComponentLayoutInfo[];
  }[];
}

interface ComponentLayoutInfo {
  type: ComponentType;
  label: string;
  fieldId: string;
  required: boolean;
  options?: string[];
  children?: ComponentLayoutInfo[];
}
```

**Use Case**: Form data collection and validation
**File Extension**: `*_template.json`
**Features**:
- Lightweight schema
- Only essential form structure
- No visual styling information
- Optimized for form submission systems

#### Export Format 2: Advanced Layout Schema
```typescript
interface AdvancedLayoutExport {
  templateName: string;
  pages: FormPage[];
  metadata: FormMetadata;
  layoutConfiguration: {
    responsive: boolean;
    breakpoints: ResponsiveBreakpoints;
    theme: ThemeConfiguration;
  };
  styling: {
    customCSS?: string;
    componentStyles: ComponentStyleMap;
  };
  functionality: {
    validation: ValidationRules;
    dependencies: DependencyGraph;
    calculations: FormulaDefinitions;
  };
}
```

**Use Case**: Advanced form rendering with styling and layout
**File Extension**: `*_schema.json`
**Features**:
- Complete form definition
- Visual styling information
- Layout positioning
- Advanced functionality definitions

### Export Implementation

```typescript
class AdvancedExportService {
  static exportAdvancedSchema(formState: FormState): string {
    const advancedSchema: AdvancedLayoutExport = {
      templateName: formState.name,
      pages: formState.pages,
      metadata: this.buildMetadata(formState),
      layoutConfiguration: this.extractLayoutConfig(formState),
      styling: this.extractStyling(formState),
      functionality: this.extractFunctionality(formState)
    };
    
    return JSON.stringify(advancedSchema, null, 2);
  }
  
  private static buildMetadata(formState: FormState): FormMetadata {
    return {
      version: '1.0.0',
      createdAt: formState.createdAt,
      updatedAt: new Date().toISOString(),
      author: formState.author,
      formStatistics: {
        totalPages: formState.pages.length,
        totalComponents: this.countComponents(formState.pages),
        componentTypes: this.getComponentTypeDistribution(formState.pages)
      }
    };
  }
  
  private static extractLayoutConfig(formState: FormState): any {
    return {
      responsive: true,
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
      },
      theme: {
        primaryColor: '#3b82f6',
        fontFamily: 'Inter, sans-serif',
        spacing: '8px'
      }
    };
  }
}
```

## Form Validation Engine

### Multi-Layer Validation System

The form builder implements a comprehensive validation system with client-side and server-side capabilities.

#### Validation Rule Definitions

```typescript
interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'number' | 'pattern' | 'custom';
  message: string;
  params?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    customValidator?: (value: any) => boolean | Promise<boolean>;
  };
}

interface ComponentValidation {
  [fieldId: string]: ValidationRule[];
}
```

#### Built-in Validation Rules

```typescript
class ValidationEngine {
  private static readonly BUILTIN_RULES: Record<string, ValidationRule> = {
    required: {
      type: 'required',
      message: 'This field is required',
      params: {}
    },
    email: {
      type: 'email',
      message: 'Please enter a valid email address',
      params: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },
    url: {
      type: 'url',
      message: 'Please enter a valid URL',
      params: {
        pattern: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/
      }
    },
    number: {
      type: 'number',
      message: 'Please enter a valid number',
      params: {
        pattern: /^-?\d+(\.\d+)?$/
      }
    }
  };
  
  /**
   * Validate single field value
   */
  static validateField(
    fieldId: string, 
    value: any, 
    rules: ValidationRule[], 
    formData?: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = this.applyRule(rule, value, formData);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }
    
    return {
      fieldId,
      isValid: errors.length === 0,
      errors,
      value
    };
  }
  
  /**
   * Validate entire form
   */
  static async validateForm(
    formData: Record<string, any>,
    validationRules: ComponentValidation
  ): Promise<FormValidationResult> {
    const fieldResults: ValidationResult[] = [];
    const asyncValidations: Promise<ValidationResult>[] = [];
    
    Object.entries(validationRules).forEach(([fieldId, rules]) => {
      const value = formData[fieldId];
      
      // Check for async validations
      const asyncRules = rules.filter(rule => rule.params?.customValidator);
      if (asyncRules.length > 0) {
        asyncValidations.push(this.validateFieldAsync(fieldId, value, asyncRules, formData));
      }
      
      // Sync validations
      const syncRules = rules.filter(rule => !rule.params?.customValidator);
      if (syncRules.length > 0) {
        fieldResults.push(this.validateField(fieldId, value, syncRules, formData));
      }
    });
    
    // Wait for async validations
    const asyncResults = await Promise.all(asyncValidations);
    fieldResults.push(...asyncResults);
    
    const hasErrors = fieldResults.some(result => !result.isValid);
    
    return {
      isValid: !hasErrors,
      fieldResults,
      summary: this.generateValidationSummary(fieldResults)
    };
  }
  
  private static applyRule(
    rule: ValidationRule, 
    value: any, 
    formData?: Record<string, any>
  ): { isValid: boolean; message: string } {
    switch (rule.type) {
      case 'required':
        return {
          isValid: value !== null && value !== undefined && value !== '',
          message: rule.message
        };
        
      case 'email':
        return {
          isValid: !value || rule.params!.pattern!.test(value),
          message: rule.message
        };
        
      case 'pattern':
        return {
          isValid: !value || rule.params!.pattern!.test(value),
          message: rule.message
        };
        
      case 'number':
        const num = parseFloat(value);
        const isValidNumber = !isNaN(num);
        const isInRange = (!rule.params?.min || num >= rule.params.min) &&
                         (!rule.params?.max || num <= rule.params.max);
        return {
          isValid: !value || (isValidNumber && isInRange),
          message: rule.message
        };
        
      default:
        return { isValid: true, message: '' };
    }
  }
}
```

#### Dynamic Validation Rules

```typescript
class DynamicValidationBuilder {
  /**
   * Build validation rules from component configuration
   */
  static buildValidationRules(component: FormComponentData): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    // Required field validation
    if (component.required) {
      rules.push(ValidationEngine.getBuiltinRule('required'));
    }
    
    // Type-specific validations
    switch (component.type) {
      case 'email_input':
        rules.push(ValidationEngine.getBuiltinRule('email'));
        break;
        
      case 'number_input':
        rules.push({
          type: 'number',
          message: 'Please enter a valid number',
          params: {
            min: component.min,
            max: component.max
          }
        });
        break;
        
      case 'textarea':
        if (component.maxLength) {
          rules.push({
            type: 'custom',
            message: `Maximum ${component.maxLength} characters allowed`,
            params: {
              customValidator: (value: string) => !value || value.length <= component.maxLength!
            }
          });
        }
        break;
    }
    
    return rules;
  }
}
```

## Dependency Logic

### Cross-Field Dependencies

The form builder supports complex field dependencies with conditional logic and real-time updates.

#### Dependency Graph Structure

```typescript
interface DependencyNode {
  fieldId: string;
  dependsOn: string[];        // Fields this node depends on
  affects: string[];          // Fields affected by this node
  conditions: DependencyCondition[];
}

interface DependencyCondition {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'validate' | 'calculate';
  trigger: {
    fieldId: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'isEmpty';
    value: any;
  };
  action: {
    targetFieldId: string;
    operation: string;
    value?: any;
  };
}

interface DependencyGraph {
  nodes: DependencyNode[];
  edges: { from: string; to: string; condition: DependencyCondition }[];
}
```

#### Dependency Engine Implementation

```typescript
class DependencyEngine {
  private static dependencyGraph: DependencyGraph = { nodes: [], edges: [] };
  private static fieldValues: Record<string, any> = {};
  
  /**
   * Register field dependencies
   */
  static registerDependency(dependency: DependencyCondition): void {
    const edge = {
      from: dependency.trigger.fieldId,
      to: dependency.action.targetFieldId,
      condition: dependency
    };
    
    this.dependencyGraph.edges.push(edge);
    this.updateDependencyNodes();
  }
  
  /**
   * Process field value change and trigger dependencies
   */
  static processFieldChange(fieldId: string, value: any): DependencyEffect[] {
    this.fieldValues[fieldId] = value;
    const effects: DependencyEffect[] = [];
    
    // Find all edges where this field is the trigger
    const dependentEdges = this.dependencyGraph.edges.filter(edge => edge.from === fieldId);
    
    for (const edge of dependentEdges) {
      const conditionMet = this.evaluateCondition(edge.condition.trigger, value);
      
      if (conditionMet) {
        const effect = this.executeAction(edge.condition.action);
        effects.push(effect);
      }
    }
    
    return effects;
  }
  
  private static evaluateCondition(trigger: DependencyCondition['trigger'], value: any): boolean {
    switch (trigger.operator) {
      case 'equals':
        return value === trigger.value;
      case 'notEquals':
        return value !== trigger.value;
      case 'greaterThan':
        return parseFloat(value) > parseFloat(trigger.value);
      case 'lessThan':
        return parseFloat(value) < parseFloat(trigger.value);
      case 'contains':
        return String(value).toLowerCase().includes(String(trigger.value).toLowerCase());
      case 'isEmpty':
        return !value || value.length === 0;
      default:
        return false;
    }
  }
  
  private static executeAction(action: DependencyCondition['action']): DependencyEffect {
    switch (action.operation) {
      case 'show':
        return { type: 'visibility', fieldId: action.targetFieldId, visible: true };
      case 'hide':
        return { type: 'visibility', fieldId: action.targetFieldId, visible: false };
      case 'enable':
        return { type: 'enabled', fieldId: action.targetFieldId, enabled: true };
      case 'disable':
        return { type: 'enabled', fieldId: action.targetFieldId, enabled: false };
      case 'calculate':
        const calculatedValue = this.executeCalculation(action.targetFieldId, action.value);
        return { type: 'value', fieldId: action.targetFieldId, value: calculatedValue };
      default:
        return { type: 'none', fieldId: action.targetFieldId };
    }
  }
  
  /**
   * Advanced calculation engine for field values
   */
  private static executeCalculation(fieldId: string, formula: string): any {
    // Simple formula evaluation - in production, use a proper expression parser
    const variables = this.extractVariables(formula);
    let evaluatedFormula = formula;
    
    variables.forEach(variable => {
      const fieldValue = this.fieldValues[variable] || 0;
      evaluatedFormula = evaluatedFormula.replace(new RegExp(`\\$${variable}`, 'g'), String(fieldValue));
    });
    
    try {
      // Note: In production, use a safe expression evaluator
      return Function(`"use strict"; return (${evaluatedFormula})`)();
    } catch (error) {
      console.error(`Calculation error for field ${fieldId}:`, error);
      return 0;
    }
  }
  
  private static extractVariables(formula: string): string[] {
    const variablePattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const matches = [];
    let match;
    
    while ((match = variablePattern.exec(formula)) !== null) {
      matches.push(match[1]);
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }
}
```

#### Real-Time Dependency Updates

```typescript
class DependencyReactor {
  /**
   * React hook for handling dependencies in real-time
   */
  static useDependencyUpdates(fieldId: string, initialValue: any) {
    const [value, setValue] = useState(initialValue);
    const [isVisible, setIsVisible] = useState(true);
    const [isEnabled, setIsEnabled] = useState(true);
    
    const handleValueChange = useCallback((newValue: any) => {
      setValue(newValue);
      
      // Process dependencies
      const effects = DependencyEngine.processFieldChange(fieldId, newValue);
      
      effects.forEach(effect => {
        switch (effect.type) {
          case 'visibility':
            if (effect.fieldId === fieldId) {
              setIsVisible(effect.visible!);
            }
            break;
          case 'enabled':
            if (effect.fieldId === fieldId) {
              setIsEnabled(effect.enabled!);
            }
            break;
          case 'value':
            if (effect.fieldId === fieldId) {
              setValue(effect.value);
            }
            break;
        }
      });
    }, [fieldId]);
    
    return {
      value,
      setValue: handleValueChange,
      isVisible,
      isEnabled
    };
  }
}
```

### Common Dependency Patterns

```typescript
const COMMON_DEPENDENCY_PATTERNS = {
  conditionalFields: {
    description: 'Show/hide fields based on other field values',
    example: {
      trigger: { fieldId: 'employment_status', operator: 'equals', value: 'employed' },
      action: { targetFieldId: 'company_name', operation: 'show' }
    }
  },
  calculations: {
    description: 'Calculate field values based on other fields',
    example: {
      trigger: { fieldId: 'quantity', operator: 'greaterThan', value: 0 },
      action: { targetFieldId: 'total_price', operation: 'calculate', value: '$quantity * $unit_price' }
    }
  },
  validation: {
    description: 'Dynamic validation based on other field values',
    example: {
      trigger: { fieldId: 'age', operator: 'lessThan', value: 18 },
      action: { targetFieldId: 'parent_consent', operation: 'validate' }
    }
  }
};
```

## Technical Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Form Builder                           │
├─────────────────────────────────────────────────────────────────┤
│  User Interface Layer                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Component       │ │ Canvas          │ │ Properties      │   │
│  │ Palette         │ │ Area            │ │ Panel           │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Form State      │ │ Validation      │ │ Dependency      │   │
│  │ Engine          │ │ Engine          │ │ Engine          │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ JSON Schema     │ │ Component       │ │ Template        │   │
│  │ Manager         │ │ Engine          │ │ Service         │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. FormStateEngine (Single Source of Truth)
```typescript
class FormStateEngine {
  private static state: FormState;
  
  static executeAction(action: FormAction): FormState {
    switch (action.type) {
      case 'ADD_COMPONENT':
        return this.addComponent(action.payload);
      case 'UPDATE_COMPONENT':
        return this.updateComponent(action.payload);
      case 'DELETE_COMPONENT':
        return this.deleteComponent(action.payload);
      case 'REORDER_COMPONENTS':
        return this.reorderComponents(action.payload);
      default:
        return this.state;
    }
  }
}
```

#### 2. ComponentEngine (Component Operations)
```typescript
class ComponentEngine {
  static createComponent(type: ComponentType): FormComponentData {
    return {
      id: generateId(),
      type,
      label: this.getDefaultLabel(type),
      fieldId: `field_${Date.now()}`,
      required: false,
      ...this.getTypeSpecificDefaults(type)
    };
  }
  
  static validateComponent(component: FormComponentData): ValidationResult {
    return DynamicValidationBuilder.buildValidationRules(component);
  }
}
```

#### 3. Drag-Drop System Integration
```typescript
const DRAG_DROP_FLOW = {
  1: 'User starts drag from palette',
  2: 'Canvas detects mouse position',
  3: 'Smart drop zones activate',
  4: 'Position detection (25% horizontal, 30% vertical)',
  5: 'Visual feedback shows drop position',
  6: 'Drop handler processes position',
  7: 'FormStateEngine executes appropriate action',
  8: 'Component tree updates',
  9: 'Canvas re-renders with new layout'
};
```

### Performance Optimizations

```typescript
const PERFORMANCE_STRATEGIES = {
  rendering: {
    'React.memo': 'Prevent unnecessary component re-renders',
    'useMemo': 'Memoize expensive calculations',
    'useCallback': 'Stable function references for props'
  },
  dragDrop: {
    'throttling': 'Limit position calculation frequency',
    'virtualizing': 'Only render visible drop zones',
    'batching': 'Group state updates together'
  },
  validation: {
    'debouncing': 'Delay validation until typing stops',
    'async_validation': 'Non-blocking server validations',
    'field_isolation': 'Validate only changed fields'
  }
};
```

### Error Handling Strategy

```typescript
class ErrorHandler {
  static handleDragDropError(error: Error, context: DragDropContext): void {
    console.error('Drag-drop operation failed:', error);
    
    // Revert to previous state
    FormStateEngine.revertToLastValidState();
    
    // Show user-friendly message
    NotificationService.showError('Unable to move component. Please try again.');
  }
  
  static handleValidationError(error: ValidationError, fieldId: string): void {
    // Highlight problematic field
    FormStateEngine.executeAction({
      type: 'SET_FIELD_ERROR',
      payload: { fieldId, error: error.message }
    });
  }
}
```

---

## Summary

This comprehensive form builder architecture provides:

✅ **Intuitive Drag-Drop Interface** with smart position detection  
✅ **Headless JSON Schema** for flexible data management  
✅ **Robust Marshal/Unmarshal** operations with validation  
✅ **Dynamic Form Loading** with lazy loading support  
✅ **Two-Tier Export System** for different use cases  
✅ **Multi-Layer Validation** with real-time feedback  
✅ **Advanced Dependency Logic** with conditional field behavior  
✅ **Performance Optimized** architecture with error handling  

The system is designed to be extensible, maintainable, and production-ready for complex form building scenarios.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive form builder documentation covering drag-drop logic", "status": "completed", "activeForm": "Creating comprehensive form builder documentation covering drag-drop logic"}, {"content": "Document headless JSON schema and type system", "status": "completed", "activeForm": "Documenting headless JSON schema and type system"}, {"content": "Document JSON marshal/unmarshal operations", "status": "completed", "activeForm": "Documenting JSON marshal/unmarshal operations"}, {"content": "Document form validation and dependency logic", "status": "completed", "activeForm": "Documenting form validation and dependency logic"}]</parameter>
</invoke>

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive form builder documentation covering drag-drop logic", "status": "completed", "activeForm": "Creating comprehensive form builder documentation covering drag-drop logic"}, {"content": "Document headless JSON schema and type system", "status": "completed", "activeForm": "Documenting headless JSON schema and type system"}, {"content": "Document JSON marshal/unmarshal operations", "status": "completed", "activeForm": "Documenting JSON marshal/unmarshal operations"}, {"content": "Document form validation and dependency logic", "status": "completed", "activeForm": "Documenting form validation and dependency logic"}]</parameter>
</invoke>

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive form builder documentation covering drag-drop logic", "status": "completed", "activeForm": "Creating comprehensive form builder documentation covering drag-drop logic"}, {"content": "Document headless JSON schema and type system", "status": "completed", "activeForm": "Documenting headless JSON schema and type system"}, {"content": "Document JSON marshal/unmarshal operations", "status": "completed", "activeForm": "Documenting JSON marshal/unmarshal operations"}, {"content": "Document form validation and dependency logic", "status": "in_progress", "activeForm": "Documenting form validation and dependency logic"}]

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive form builder documentation covering drag-drop logic", "status": "completed", "activeForm": "Creating comprehensive form builder documentation covering drag-drop logic"}, {"content": "Document headless JSON schema and type system", "status": "completed", "activeForm": "Documenting headless JSON schema and type system"}, {"content": "Document JSON marshal/unmarshal operations", "status": "in_progress", "activeForm": "Documenting JSON marshal/unmarshal operations"}, {"content": "Document form validation and dependency logic", "status": "pending", "activeForm": "Documenting form validation and dependency logic"}]

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive form builder documentation covering drag-drop logic", "status": "completed", "activeForm": "Creating comprehensive form builder documentation covering drag-drop logic"}, {"content": "Document headless JSON schema and type system", "status": "in_progress", "activeForm": "Documenting headless JSON schema and type system"}, {"content": "Document JSON marshal/unmarshal operations", "status": "pending", "activeForm": "Documenting JSON marshal/unmarshal operations"}, {"content": "Document form validation and dependency logic", "status": "pending", "activeForm": "Documenting form validation and dependency logic"}]