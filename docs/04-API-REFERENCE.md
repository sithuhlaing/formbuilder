# API Reference

## Core Engines API

### ComponentEngine

#### `createComponent(type: ComponentType): FormComponent`
Creates a new component with default properties.
```typescript
const textInput = ComponentEngine.createComponent('text_input');
// Returns: { id: 'comp-123', type: 'text_input', label: '', required: false, ... }
```

#### `updateComponent(component: FormComponent, updates: Partial<FormComponent>): FormComponent`
Updates component properties and returns new component.
```typescript
const updated = ComponentEngine.updateComponent(component, { 
  label: 'Email Address', 
  required: true 
});
```

#### `deleteComponent(components: FormComponent[], componentId: string): FormComponent[]`
Removes component and handles cleanup.
```typescript
const remaining = ComponentEngine.deleteComponent(formComponents, 'comp-123');
```

#### `validateComponent(component: FormComponent): ValidationResult`
Validates single component against business rules.
```typescript
const result = ComponentEngine.validateComponent(component);
// Returns: { valid: boolean, errors: string[], message: string }
```

#### `findComponent(components: FormComponent[], id: string): FormComponent | null`
Finds component by ID in nested structure.
```typescript
const found = ComponentEngine.findComponent(formComponents, 'comp-123');
```

### FormStateEngine

#### `executeAction(state: FormState, action: FormAction): FormState`
Executes state change actions and returns new state.
```typescript
const newState = FormStateEngine.executeAction(currentState, {
  type: 'ADD_COMPONENT',
  payload: { componentType: 'text_input', pageId: 'page-1' }
});
```

#### Action Types
```typescript
type FormAction = 
  | { type: 'ADD_COMPONENT'; payload: { componentType: ComponentType; pageId: string } }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<FormComponent> } }
  | { type: 'DELETE_COMPONENT'; payload: { id: string } }
  | { type: 'SELECT_COMPONENT'; payload: { id: string | null } }
  | { type: 'ADD_PAGE'; payload: { name: string } }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'SET_CURRENT_PAGE'; payload: { pageId: string } }
  | { type: 'CLEAR_FORM'; payload: {} }
  | { type: 'LOAD_FORM'; payload: { template: FormTemplate } };
```

#### `validateFormState(state: FormState): ValidationResult`
Validates entire form state.
```typescript
const validation = FormStateEngine.validateFormState(formState);
if (!validation.valid) {
  console.error('Form errors:', validation.errors);
}
```

### ComponentRenderer

#### `renderComponent(component: FormComponent, mode: 'builder' | 'preview'): ReactElement`
Renders component in specified mode.
```typescript
const element = ComponentRenderer.renderComponent(component, 'builder');
```

## Form Builder Hook

### `useFormBuilder(): FormBuilderAPI`
Main hook for form building functionality.

```typescript
const {
  // State
  formState,
  selectedComponent,
  
  // Actions
  addComponent,
  updateComponent,
  deleteComponent,
  selectComponent,
  handleDrop,
  
  // History
  undo,
  redo,
  canUndo,
  canRedo,
  
  // Pages
  addPage,
  deletePage,
  setCurrentPage,
  
  // Utils
  clearAll,
  exportToJSON,
  loadFromJSON
} = useFormBuilder();
```

### Methods

#### `addComponent(componentType: ComponentType): void`
Adds component to current page.
```typescript
addComponent('text_input');
```

#### `updateComponent(id: string, updates: Partial<FormComponent>): void`  
Updates component properties.
```typescript
updateComponent('comp-123', { label: 'New Label', required: true });
```

#### `handleDrop(componentType: ComponentType, targetId: string, position: DropPosition): void`
Handles drag-drop operations.
```typescript
handleDrop('email_input', 'comp-123', 'after');
```

#### `exportToJSON(): string`
Exports form as JSON template.
```typescript
const jsonTemplate = exportToJSON();
```

#### `loadFromJSON(jsonString: string): void`
Loads form from JSON template.
```typescript
loadFromJSON(templateJson);
```

## Types Reference

### Component Types (Left Panel Groupings)
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

### Form Component Interface
```typescript
interface FormComponent {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  required: boolean;
  fieldId: string;
  
  // Type-specific properties
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  rows?: number;
  acceptedFileTypes?: string;
  
  // Layout properties
  children?: FormComponent[];
}
```

### Form State Interface
```typescript
interface FormState {
  pages: FormPage[];
  currentPageId: string;
  selectedComponentId: string | null;
  templateName: string;
}

interface FormPage {
  id: string;
  name: string;
  components: FormComponent[];
}
```

### Drop Positions
```typescript
type DropPosition = 'before' | 'after' | 'left' | 'right' | 'inside';
```

### Validation Result
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  message: string;
}
```

## Template Service API

### `saveTemplate(template: FormTemplate): void`
Saves template to localStorage.
```typescript
templateService.saveTemplate({
  id: 'template-123',
  name: 'Contact Form',
  pages: formState.pages,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### `loadTemplate(id: string): FormTemplate | null`
Loads template by ID.
```typescript
const template = templateService.loadTemplate('template-123');
```

### `getAllTemplates(): FormTemplate[]`
Gets all saved templates.
```typescript
const templates = templateService.getAllTemplates();
```

### `deleteTemplate(id: string): void`
Deletes template from storage.
```typescript
templateService.deleteTemplate('template-123');
```

## Drag-Drop Service API

### `handleDrop(draggedType: ComponentType, targetId: string, position: DropPosition, formState: FormState): FormState`
Processes drag-drop operations.
```typescript
const newState = DragDropService.handleDrop(
  'text_input', 
  'target-component-id', 
  'after', 
  currentFormState
);
```

## Performance Components

### LazyFormRenderer Props
```typescript
interface LazyFormRendererProps {
  components: FormComponent[];
  renderComponent: (component: FormComponent) => ReactElement;
  chunkSize?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}
```

### VirtualizedList Props  
```typescript
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactElement;
  itemHeight: number;
  height: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}
```