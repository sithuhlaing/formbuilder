# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests  
npm test

# Build for production
npm run build

# Check code quality
npm run lint
```

## Development Commands

### Core Development
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Production build with TypeScript compilation
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (must pass with zero warnings)

### Testing
- `npm test` - Run all tests with Vitest
- `npm test -- --watch` - Watch mode for development
- `npm test -- --ui` - Visual test interface
- `npm test -- --coverage` - Generate coverage report

### Deployment
- `npm run build:github` - Build for GitHub Pages
- `npm run deploy` - Deploy to GitHub Pages

## Code Organization

### Adding New Components

1. **Define Type** in `src/types/component.ts` (organized by category):
```typescript
export type ComponentType = 
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
  | 'section_divider' | 'button' | 'heading' | 'card'
  | 'new_component_type'; // Add new types to appropriate category
```

2. **Add Creation Logic** in `ComponentEngine.ts`:
```typescript
case 'new_component_type':
  return {
    id: generateId(),
    type: 'new_component_type',
    label: 'New Component',
    // ... other defaults
  };
```

3. **Add Rendering** in `ComponentRenderer.ts`:
```typescript
case 'new_component_type':
  return <NewComponent {...componentProps} />;
```

### State Management Pattern

**All state changes must go through FormStateEngine**:

```typescript
// ✅ Correct
const newState = FormStateEngine.executeAction(currentState, {
  type: 'UPDATE_COMPONENT',
  payload: { id: 'comp-1', updates: { label: 'New Label' } }
});

// ❌ Incorrect - Direct state mutation
component.label = 'New Label';
```

### Testing Strategy

#### Test Structure
```
src/__tests__/
├── core-engines-comprehensive.test.ts     # Core business logic
├── form-builder-comprehensive.test.tsx    # UI components  
├── drag-drop-comprehensive.test.ts        # Drag-drop operations
└── validation-state-comprehensive.test.ts # Validation logic
```

#### Writing Tests
```typescript
import { ComponentEngine } from '../core/ComponentEngine';

describe('Component Creation', () => {
  it('should create text input with defaults', () => {
    const component = ComponentEngine.createComponent('text_input');
    expect(component.type).toBe('text_input');
    expect(component.required).toBe(false);
  });
});
```

## Development Patterns

### Single Sources of Truth
- **ComponentEngine**: ALL component operations (create, update, delete, validate)
- **FormStateEngine**: ALL state management (actions, queries, history)
- **ComponentRenderer**: ALL rendering logic (builder/preview modes)

### Error Handling
```typescript
// Validation with user-friendly errors
const result = ComponentValidationEngine.validateComponent(component);
if (!result.valid) {
  showError(result.message);
}

// Graceful degradation
const component = ComponentEngine.findComponent(id);
if (!component) {
  console.warn(`Component ${id} not found`);
  return <div>Component not found</div>;
}
```

### Performance Best Practices

#### Use Memoization
```typescript
const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.id === next.id && prev.label === next.label;
});
```

#### Lazy Loading
```typescript
const LazyFormRenderer = React.lazy(() => import('./LazyFormRenderer'));
```

#### Virtual Scrolling
```typescript
<VirtualizedList
  items={components}
  renderItem={renderComponent}
  itemHeight={50}
  height={600}
/>
```

## File Structure Guidelines

```
src/
├── core/                   # Business logic engines
├── features/
│   ├── form-builder/      # Main builder feature
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   └── services/      # Business services
│   ├── template-management/
│   └── drag-drop/
├── shared/                # Reusable components
├── types/                 # TypeScript definitions
└── __tests__/             # Test files
```

## CSS Organization

### Modular CSS Structure
```
src/styles/
├── main.css              # Main entry point
├── components.css        # Reusable UI components  
├── drag-drop.css         # Drag-drop specific styles
└── features/
    └── form-builder.css  # Feature-specific styles
```

### CSS Naming Convention
```css
/* Component-based naming */
.canvas { }
.canvas__drop-zone { }  
.canvas__component { }
.canvas__component--selected { }

/* State-based modifiers */
.component--dragging { }
.drop-zone--active { }
.form-field--error { }
```

## Common Development Tasks

### Adding a New Component Type
1. Update `ComponentType` union type
2. Add creation logic to `ComponentEngine`  
3. Add rendering logic to `ComponentRenderer`
4. Create component UI in `shared/components`
5. Add validation rules if needed
6. Write tests for new component

### Adding New State Actions
1. Define action type in `FormStateEngine`
2. Implement action handler
3. Update TypeScript types
4. Add to history tracking
5. Write comprehensive tests

### Debugging Tips

#### State Issues
- Use React DevTools to inspect FormStateEngine state
- Check action history in undo/redo system
- Validate state consistency with validation engine

#### Drag-Drop Issues  
- Check drop zone hierarchy (component → container → canvas)
- Verify position calculations in DragDropService
- Test with different component arrangements

#### Performance Issues
- Use React Profiler to identify slow components
- Check for unnecessary re-renders with React DevTools
- Monitor memory usage during long sessions