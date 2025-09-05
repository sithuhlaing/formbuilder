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

## 🛡️ Regression Prevention Guide

### ⚠️ The Problem
When adding new features or making changes, existing functionality can break if the full system context isn't considered. This section provides strategies to prevent regressions.

### 🎯 Best Practices for Safe Changes

#### 1. **Specify Scope and Constraints**

❌ **Avoid vague requests:**
```
"Add a delete button to components"
```

✅ **Use specific, constrained requests:**
```
"Add a delete button to components that:
- Appears on hover in the properties panel
- Maintains existing drag-drop functionality
- Preserves component selection state
- Includes confirmation dialog
- Updates the canvas immediately after deletion"
```

#### 2. **Reference Existing Tests**

❌ **Don't ignore existing tests:**
```
"Change the component rendering logic"
```

✅ **Acknowledge test constraints:**
```
"Change the component rendering logic while ensuring all existing tests in 
form-wizard-pagination.test.tsx and component-selection-properties.test.tsx 
continue to pass"
```

#### 3. **Specify Integration Points**

❌ **Ignore system integration:**
```
"Update the properties panel"
```

✅ **Consider full integration:**
```
"Update the properties panel ensuring:
- FormBuilder component integration remains intact
- Canvas selection synchronization works
- Multi-page navigation is unaffected
- Drag-drop from ComponentPalette still functions"
```

### 🔧 Command Templates for Safe Changes

#### For UI Changes
```
"Modify [COMPONENT] to [CHANGE] while:
- Maintaining existing [FUNCTIONALITY_1]
- Preserving [FUNCTIONALITY_2] 
- Ensuring [TEST_SUITE] continues to pass
- Keeping [INTEGRATION_POINT] working"
```

#### For New Features
```
"Add [FEATURE] that:
- Integrates with existing [SYSTEM_PART]
- Does not affect [CRITICAL_FUNCTIONALITY]
- Follows the same patterns as [EXISTING_SIMILAR_FEATURE]
- Includes comprehensive test coverage"
```

#### For Bug Fixes
```
"Fix [BUG] by [SOLUTION] ensuring:
- No regression in [RELATED_FUNCTIONALITY]
- All existing tests continue to pass
- [SPECIFIC_WORKFLOW] remains functional"
```

### 📋 Pre-Change Checklist

Before making changes:

#### ✅ **Documentation Review**
- [ ] Read relevant documentation sections
- [ ] Understand current architecture
- [ ] Identify affected components

#### ✅ **Test Coverage Check**
- [ ] Review existing test files
- [ ] Identify tests that might be affected
- [ ] Plan for new test coverage

#### ✅ **Integration Points**
- [ ] Map component dependencies
- [ ] Identify data flow impacts
- [ ] Consider state management effects

### 📊 Current Test Coverage Map

#### Core Functionality Tests
- **form-wizard-pagination.test.tsx** - Multi-page navigation
- **component-selection-properties.test.tsx** - Component selection & properties
- **form-title-editing.test.tsx** - Form title functionality
- **integration-comprehensive.test.tsx** - End-to-end workflows
- **DragDropBehavior.test.tsx** - Drag-drop functionality

#### When Changing These Areas, Reference These Tests:
- **FormBuilder.tsx** → All integration tests
- **ComponentPalette.tsx** → DragDropBehavior.test.tsx
- **Canvas.tsx** → component-selection-properties.test.tsx
- **FormWizardNavigation.tsx** → form-wizard-pagination.test.tsx

### 🚨 High-Risk Change Areas

#### Changes That Often Cause Regressions:
1. **State Management** (useFormBuilder hook)
2. **Drag-Drop Logic** (react-dnd integration)
3. **Component Rendering** (Canvas/ComponentRenderer)
4. **Navigation Logic** (page switching)
5. **Properties Panel** (component selection)

#### For These Areas, Always:
- Run full test suite before and after
- Test manual workflows
- Verify integration points
- Check error handling

### 🔍 Verification Commands

#### After Implementation
```
"Verify that this change:
- Doesn't break existing drag-drop functionality
- Maintains form wizard navigation
- Preserves component selection behavior
- Keeps properties panel integration working
- Passes all existing tests"
```

#### For Complex Changes
```
"Run the integration-comprehensive.test.tsx suite and confirm all tests pass 
after implementing this change."
```

### 🎯 Summary Commands for Any Change

#### Before Making Changes:
```
"Implement [CHANGE] while ensuring:
1. All existing tests continue to pass
2. No regression in core functionality
3. Integration points remain intact
4. New functionality includes test coverage
5. Documentation is updated if needed"
```

#### After Implementation:
```
"Verify:
- Run npm test and confirm all tests pass
- Test the complete form building workflow manually
- Verify drag-drop from palette to canvas works
- Check multi-page navigation functions
- Confirm component selection and properties editing works"
```

This approach ensures that changes consider the full system context and maintain existing functionality while adding new features.

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