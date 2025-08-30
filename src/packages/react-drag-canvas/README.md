# react-drag-canvas

A generic, reusable drag-drop canvas component for React with smart positioning and layout support.

## Features

- ✅ **Generic Item Support**: Works with any data structure via configurable `renderItem` function
- ✅ **Smart Drop Zones**: Configurable positioning (left/right for horizontal layouts, top/bottom for vertical)
- ✅ **Horizontal Layouts**: Automatic side-by-side arrangements
- ✅ **Drag & Drop Reordering**: Move items within canvas
- ✅ **Configurable CSS**: Custom CSS prefixes for styling flexibility
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Test-Friendly**: Proper test IDs and data attributes

## Installation

```bash
npm install react-drag-canvas react-dnd react-dnd-html5-backend
```

## Quick Start

```tsx
import React from 'react';
import { DragDropCanvas } from 'react-drag-canvas';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const MyApp = () => {
  const [items, setItems] = useState([
    { id: '1', type: 'text', data: { content: 'Hello World' } },
    { id: '2', type: 'image', data: { src: 'image.jpg' } }
  ]);

  const renderItem = (item, context) => {
    switch (item.type) {
      case 'text':
        return <div>{item.data.content}</div>;
      case 'image':
        return <img src={item.data.src} alt="" />;
      default:
        return <div>Unknown item</div>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropCanvas
        items={items}
        renderItem={renderItem}
        onItemMove={(from, to) => {
          // Handle reordering
          const newItems = [...items];
          const [moved] = newItems.splice(from, 1);
          newItems.splice(to, 0, moved);
          setItems(newItems);
        }}
        onLayoutCreate={(itemType, targetId, position) => {
          // Handle horizontal layout creation
          console.log('Create layout:', { itemType, targetId, position });
        }}
        onItemDelete={(itemId) => {
          // Handle item deletion
          setItems(items.filter(item => item.id !== itemId));
        }}
      />
    </DndProvider>
  );
};
```

## API Reference

### DragDropCanvas Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `CanvasItem[]` | ✅ | Array of items to render |
| `renderItem` | `(item: CanvasItem, context: RenderContext) => ReactNode` | ✅ | Function to render each item |
| `onItemMove` | `(fromIndex: number, toIndex: number) => void` | ✅ | Called when items are reordered |
| `onLayoutCreate` | `(itemType: string, targetId: string, position: 'left' \| 'right') => void` | ✅ | Called when horizontal layouts are created |
| `onItemDelete` | `(itemId: string) => void` | ✅ | Called when items are deleted |
| `onItemAdd` | `(itemType: string, position: DropPosition) => void` | ❌ | Called when new items are added |
| `selectedItemId` | `string` | ❌ | ID of currently selected item |
| `config` | `CanvasConfig` | ❌ | Configuration options |
| `className` | `string` | ❌ | Additional CSS class |

### Types

```tsx
interface CanvasItem {
  id: string;
  type: string;
  data: Record<string, any>;
  children?: CanvasItem[];
}

interface RenderContext {
  isSelected: boolean;
  isDragging: boolean;
  isHover: boolean;
  cssPrefix: string;
}

interface CanvasConfig {
  cssPrefix?: string; // Default: 'canvas'
  enableHorizontalLayouts?: boolean; // Default: true
  enableVerticalLayouts?: boolean; // Default: true
  dropZoneThresholds?: {
    horizontal: number; // Default: 0.25 (25% from sides)
    vertical: number;   // Default: 0.3 (30% from top/bottom)
  };
}
```

## Drop Zone Behavior

The canvas uses smart positioning to determine drop behavior:

- **Left 25%**: Creates horizontal layout with item on left
- **Right 25%**: Creates horizontal layout with item on right  
- **Top 30%**: Inserts item before target
- **Bottom 30%**: Inserts item after target
- **Center 40%**: Default drop behavior

These thresholds are configurable via the `config.dropZoneThresholds` prop.

## CSS Classes

The component generates CSS classes based on the `cssPrefix` (default: 'canvas'):

```css
.canvas                          /* Main canvas container */
.canvas__item                    /* Individual items */
.canvas__item--selected          /* Selected item */
.canvas__item--dragging          /* Item being dragged */
.canvas__item--hover             /* Item being hovered over */
.canvas__drop-indicator          /* Drop position indicator */
.canvas__drag-handle             /* Drag handle */
.canvas__delete-btn              /* Delete button */
.canvas__horizontal-layout       /* Horizontal layout container */
.canvas__layout-header           /* Layout header */
.canvas__layout-content          /* Layout content area */
.canvas__empty-state             /* Empty canvas state */
```

## Examples

### Form Builder Example

```tsx
import { DragDropCanvas } from 'react-drag-canvas';

const FormBuilder = () => {
  const renderFormField = (item, context) => {
    const field = item.data;
    return (
      <div className={`form-field ${context.isSelected ? 'selected' : ''}`}>
        <label>{field.label}</label>
        <input type={field.type} placeholder={field.placeholder} />
      </div>
    );
  };

  return (
    <DragDropCanvas
      items={formFields}
      renderItem={renderFormField}
      config={{
        cssPrefix: 'form-canvas',
        enableHorizontalLayouts: true,
      }}
      // ... other props
    />
  );
};
```

### Dashboard Widget Example

```tsx
const Dashboard = () => {
  const renderWidget = (item, context) => {
    const widget = item.data;
    return (
      <div className={`widget widget-${widget.type}`}>
        <h3>{widget.title}</h3>
        <div>{widget.content}</div>
      </div>
    );
  };

  return (
    <DragDropCanvas
      items={widgets}
      renderItem={renderWidget}
      config={{
        cssPrefix: 'dashboard',
        dropZoneThresholds: {
          horizontal: 0.3, // Larger horizontal zones
          vertical: 0.2    // Smaller vertical zones
        }
      }}
      // ... other props
    />
  );
};
```

## License

MIT
