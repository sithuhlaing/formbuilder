# Page Management System Documentation

## Overview

The page management system is a sophisticated, scrollable interface that allows users to create, organize, and navigate between multiple pages in their form builder. It features drag-and-drop reordering, keyboard navigation, and a beautiful centered design.

## Architecture

### Core Components

#### 1. useSimpleFormBuilder Hook - Page Management Functions
```typescript
interface FormPage {
  id: string;
  title: string;
  components: Component[];
}

interface FormState {
  pages: FormPage[];
  currentPageId: string;
  // ... other state properties
}
```

#### 2. Page Management Actions
- `addPage()` - Creates new pages with auto-incrementing names
- `deletePage(pageId)` - Removes pages with safety checks
- `switchToPage(pageId)` - Changes active page and clears canvas
- `reorderPages(fromIndex, toIndex)` - Drag-and-drop reordering
- `movePageUp(pageId)` - Keyboard/button navigation up
- `movePageDown(pageId)` - Keyboard/button navigation down

### Visual Design System

#### 1. Container Layout
```css
.page-management-bar {
  /* Gradient background with centered blue accent bar */
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #e9ecef 100%);
  padding: 2.5rem 2rem;
  position: relative;
}

.page-management-bar::before {
  /* Centered decorative accent */
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #0056b3);
}
```

#### 2. Scrollable List Design
```css
.page-list {
  /* Beautiful scrollable container */
  max-height: 240px;
  overflow-y: auto;
  max-width: 700px;
  margin: 0 auto; /* Perfect centering */
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.12),
    inset 0 1px 0 rgba(255,255,255,0.5);
}
```

#### 3. Page Item Cards
```css
.page-item {
  /* Glass-morphism inspired design */
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## User Interactions

### 1. Drag and Drop
- **Visual Indicator**: ⋮⋮ drag handle with blue accent background
- **Drag State**: Item rotates 2° and becomes semi-transparent
- **Drop Zone**: Blue border highlight on valid drop targets
- **Real-time**: Live reordering during drag operations

### 2. Keyboard Navigation
- **Arrow Up/Down**: Move pages in list order
- **Enter/Space**: Switch to selected page
- **Delete**: Remove focused page (with confirmation)
- **Tab**: Navigate between page items
- **Focus Indicators**: Blue outline for accessibility

### 3. Button Controls
- **↑ Move Up**: Disabled when at top position
- **↓ Move Down**: Disabled when at bottom position
- **✖ Delete**: Always enabled (except for last remaining page)
- **Visual States**: Disabled buttons show 30% opacity

## State Management Logic

### Page Creation Logic
```javascript
const addPage = useCallback(() => {
  saveToHistory();
  setState(prev => {
    const pageNumber = prev.pages.length + 1;
    const newPage: FormPage = {
      id: `page-${pageNumber}`,
      title: `Page ${pageNumber}`,
      components: []
    };
    
    return {
      ...prev,
      pages: [...prev.pages, newPage],
      currentPageId: newPage.id, // Auto-switch to new page
      selectedId: null // Clear component selection
    };
  });
}, [saveToHistory]);
```

### Page Deletion Logic
```javascript
const deletePage = useCallback((pageId: string) => {
  // Safety check: Don't allow deleting the last page
  if (state.pages.length <= 1) {
    return;
  }

  saveToHistory();
  setState(prev => {
    const newPages = prev.pages.filter(page => page.id !== pageId);
    const wasCurrentPage = prev.currentPageId === pageId;
    
    return {
      ...prev,
      pages: newPages,
      currentPageId: wasCurrentPage ? newPages[0].id : prev.currentPageId,
      selectedId: wasCurrentPage ? null : prev.selectedId
    };
  });
}, [state.pages.length, saveToHistory]);
```

### Page Switching Logic
```javascript
const switchToPage = useCallback((pageId: string) => {
  setState(prev => ({
    ...prev,
    currentPageId: pageId,
    selectedId: null // Clear selection when switching pages
  }));
}, []);
```

## Responsive Design

### Desktop (> 768px)
- **Container**: 700px max-width, perfectly centered
- **List Height**: 240px with custom gradient scrollbar
- **Page Items**: 70px min-height with full spacing

### Tablet (768px)
- **Container**: 100% width with reduced padding
- **List Height**: 180px for better mobile experience
- **Page Items**: 50px min-height, smaller buttons

### Mobile (480px)
- **Container**: Full width with minimal padding
- **List Height**: 160px for optimal touch interaction
- **Buttons**: 22px size for touch-friendly interaction

## Accessibility Features

### ARIA Support
```jsx
<div
  role="button"
  aria-label={`Page ${page.title}, ${page.components.length} components`}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

### Keyboard Navigation
- **Tab Order**: Logical flow through page items
- **Focus Management**: Clear visual indicators
- **Screen Reader**: Descriptive aria-labels for all actions

### Color Contrast
- **Active States**: High contrast blue (#007bff) on light backgrounds
- **Text**: Dark colors (#2c3e50) for optimal readability
- **Disabled States**: 30% opacity maintains visibility

## Performance Optimizations

### React Optimizations
- **useCallback**: All event handlers memoized
- **Drag Operations**: Minimal re-renders during drag
- **State Updates**: Batched for smooth animations

### CSS Performance
- **Transform-based**: All animations use transform/opacity
- **Hardware Acceleration**: GPU-accelerated properties
- **Efficient Selectors**: Class-based styling for performance

## Integration Points

### Form Builder Integration
```jsx
const {
  pages,
  currentPageId,
  addPage,
  deletePage,
  switchToPage,
  reorderPages,
  movePageUp,
  movePageDown
} = formBuilderHook;
```

### Canvas Integration
- **Page Switching**: Canvas clears and loads new page components
- **Component State**: Each page maintains independent component state
- **Selection Management**: Component selection clears on page switch

## Future Enhancements

### Planned Features
1. **Page Renaming**: Inline editing of page titles
2. **Page Templates**: Pre-defined page layouts
3. **Page Duplication**: Copy page with all components
4. **Conditional Pages**: Show/hide pages based on form logic
5. **Page Validation**: Ensure required fields per page

### Technical Improvements
1. **Virtual Scrolling**: For forms with 100+ pages
2. **Page Thumbnails**: Visual preview of page content
3. **Bulk Operations**: Select multiple pages for operations
4. **Page Search**: Filter pages by name or content

## Best Practices

### Development Guidelines
1. **State Management**: Always use saveToHistory() before modifications
2. **Error Handling**: Check for edge cases (empty arrays, null values)
3. **Performance**: Batch state updates when possible
4. **Accessibility**: Test with keyboard navigation and screen readers

### Design Guidelines
1. **Consistency**: Maintain visual hierarchy and spacing
2. **Feedback**: Provide clear visual feedback for all interactions
3. **Responsiveness**: Test across all device sizes
4. **Animation**: Use smooth transitions for professional feel

## Troubleshooting

### Common Issues
1. **Drag not working**: Check if react-dnd providers are properly configured
2. **Pages not centering**: Verify `margin: 0 auto` and max-width settings
3. **Keyboard nav broken**: Ensure tabIndex and onKeyDown handlers are set
4. **Performance issues**: Check for unnecessary re-renders in page list

### Debug Tips
1. **State Inspection**: Use React DevTools to monitor page state
2. **CSS Debugging**: Inspect computed styles for centering issues
3. **Event Debugging**: Console.log drag/keyboard events
4. **Performance Profiling**: Use React Profiler for optimization