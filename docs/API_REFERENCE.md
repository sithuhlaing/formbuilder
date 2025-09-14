# API Reference - Hooks & Utilities

## 🔧 Custom Hooks API

### **useSimpleFormBuilder**
**Purpose**: Core form building state management and operations

#### **Hook Signature**
```typescript
function useSimpleFormBuilder(): FormState & FormActions
```

#### **Returned State**
```typescript
interface FormState {
  // Component Management
  components: Component[];           // Array of form components
  selectedId: string | null;        // Currently selected component ID
  templateName: string;             // Form/template name
  
  // Mode Management  
  mode: 'create' | 'edit';          // Current editing mode
  editingTemplateId?: string;       // Template ID when in edit mode
  
  // History Management
  history: FormState[];             // Undo/redo history
  historyIndex: number;             // Current position in history
  canUndo: boolean;                 // Can perform undo operation
  canRedo: boolean;                 // Can perform redo operation
  
  // Preview Mode
  previewMode: boolean;             // Form preview state
}
```

#### **Returned Actions**
```typescript
interface FormActions {
  // Component Operations
  addComponent: (type: ComponentType, index?: number) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  
  // Template Operations
  setTemplateName: (name: string) => void;
  clearAll: () => void;
  
  // Import/Export
  importJSON: (jsonString: string) => void;
  exportJSON: () => string;
  
  // History Operations
  undo: () => void;
  redo: () => void;
  
  // Mode Management
  setEditMode: (templateId: string) => void;
  setCreateMode: () => void;
  
  // Preview
  togglePreview: (show?: boolean) => void;
}
```

#### **Usage Example**
```typescript
const MyFormBuilder = () => {
  const {
    components,
    selectedId,
    templateName,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    setTemplateName,
    exportJSON,
    undo,
    redo,
    canUndo,
    canRedo
  } = useSimpleFormBuilder();

  const handleAddTextInput = () => {
    addComponent('text_input');
  };

  const handleComponentUpdate = (id: string, updates: Partial<Component>) => {
    updateComponent(id, updates);
  };

  return (
    <div>
      <input 
        value={templateName} 
        onChange={(e) => setTemplateName(e.target.value)} 
      />
      <button onClick={handleAddTextInput}>Add Text Input</button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      {/* Component rendering */}
    </div>
  );
};
```

#### **Auto-Save Behavior**
- **Trigger**: Any change to `templateName` or `components`
- **Debounce**: 1-second delay to batch multiple changes
- **Condition**: Only in edit mode (`mode === 'edit'`)
- **Comparison**: Checks if changes differ from last saved state
- **Operation**: Silent save without user notification

---

### **useAppState**
**Purpose**: Global application state management

#### **Hook Signature**
```typescript
function useAppState(): { state: AppState; actions: AppActions }
```

#### **State Structure**
```typescript
interface AppState {
  currentView: 'templates' | 'builder';
  showPreview: boolean;
  successModal: {
    isOpen: boolean;
    title: string;
    message: string;
  };
  errorModal: {
    isOpen: boolean;
    title: string;
    message: string;
  };
}
```

#### **Actions**
```typescript
interface AppActions {
  // View Management
  setView: (view: 'templates' | 'builder') => void;
  
  // Preview Control
  togglePreview: (show?: boolean) => void;
  
  // Modal Management
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  closeSuccess: () => void;
  closeError: () => void;
}
```

#### **Usage Example**
```typescript
const MyApp = () => {
  const { state, actions } = useAppState();

  const handleSaveSuccess = () => {
    actions.showSuccess(
      'Template Saved',
      'Your form template has been saved successfully.'
    );
  };

  const handleError = (error: Error) => {
    actions.showError(
      'Operation Failed',
      error.message || 'An unexpected error occurred.'
    );
  };

  return (
    <div>
      {state.currentView === 'templates' ? (
        <TemplateList onEdit={() => actions.setView('builder')} />
      ) : (
        <FormBuilder onBack={() => actions.setView('templates')} />
      )}
      
      <PreviewModal 
        isOpen={state.showPreview}
        onClose={() => actions.togglePreview(false)}
      />
    </div>
  );
};
```

---

## 🛠️ Utility Functions

### **Component Creation Utilities**

#### **createComponent**
**Purpose**: Factory function for creating new components

```typescript
function createComponent(type: ComponentType): Component
```

**Parameters**:
- `type: ComponentType` - The type of component to create

**Returns**: `Component` - New component with default properties

**Example**:
```typescript
const textInput = createComponent('text_input');
// Returns:
// {
//   id: 'comp_abc123',
//   type: 'text_input',
//   label: 'Text Input',
//   required: false,
//   placeholder: 'Enter text here...',
//   validation: {}
// }
```

#### **cloneComponent**  
**Purpose**: Deep clone a component with new ID

```typescript
function cloneComponent(component: Component): Component
```

**Parameters**:
- `component: Component` - Component to clone

**Returns**: `Component` - Cloned component with new unique ID

**Example**:
```typescript
const original = createComponent('email_input');
const clone = cloneComponent(original);
// clone.id !== original.id (new unique ID)
// All other properties are identical
```

#### **generateComponentId**
**Purpose**: Generate unique component identifiers

```typescript
function generateComponentId(prefix: string = 'comp'): string
```

**Parameters**:
- `prefix: string` - ID prefix (default: 'comp')

**Returns**: `string` - Unique ID in format `${prefix}_${randomString}`

**Example**:
```typescript
const id1 = generateComponentId();        // 'comp_abc123xyz'
const id2 = generateComponentId('field'); // 'field_def456uvw'
```

### **Component Type Utilities**

#### **canHaveChildren**
**Purpose**: Check if component type supports nested components

```typescript
function canHaveChildren(componentType: ComponentType): boolean
```

**Returns**: `true` for layout components, `false` for others

**Example**:
```typescript
canHaveChildren('horizontal_layout'); // true
canHaveChildren('vertical_layout');   // true
canHaveChildren('text_input');        // false
```

#### **isFormField**
**Purpose**: Check if component is a form input field

```typescript  
function isFormField(componentType: ComponentType): boolean
```

**Returns**: `true` for input and selection components

**Example**:
```typescript
isFormField('text_input');      // true
isFormField('select');          // true
isFormField('horizontal_layout'); // false
```

#### **getComponentCategory**
**Purpose**: Get the category of a component type

```typescript
function getComponentCategory(componentType: ComponentType): string
```

**Returns**: `'INPUT' | 'SELECTION' | 'LAYOUT' | 'CONTENT' | 'UNKNOWN'`

**Example**:
```typescript
getComponentCategory('text_input');      // 'INPUT'
getComponentCategory('radio_group');     // 'SELECTION'
getComponentCategory('horizontal_layout'); // 'LAYOUT'
```

### **Validation Utilities**

#### **validateComponent**
**Purpose**: Validate component against its validation rules

```typescript
function validateComponent(component: Component, value: any): ValidationResult
```

**Parameters**:
- `component: Component` - Component with validation rules
- `value: any` - Value to validate

**Returns**:
```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}
```

**Example**:
```typescript
const emailComponent = createComponent('email_input');
emailComponent.validation = {
  required: true,
  pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$'
};

const result = validateComponent(emailComponent, 'invalid-email');
// Returns: { isValid: false, message: 'Invalid email format', errors: ['pattern'] }
```

#### **validateForm**
**Purpose**: Validate entire form data against components

```typescript
function validateForm(components: Component[], formData: Record<string, any>): FormValidationResult
```

**Returns**:
```typescript
interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  globalErrors: string[];
}
```

---

## 🏪 Template Service API

### **TemplateService Class**

#### **getAllTemplates()**
```typescript
getAllTemplates(): FormTemplate[]
```
**Purpose**: Retrieve all saved templates from localStorage
**Returns**: Array of FormTemplate objects
**Error Handling**: Returns empty array if storage corrupted

#### **saveTemplate()**
```typescript
saveTemplate(template: Pick<FormTemplate, 'name' | 'pages'>): FormTemplate
```
**Purpose**: Save new template to localStorage
**Parameters**: Template data (name and pages)
**Returns**: Complete FormTemplate with generated ID and timestamps
**Throws**: Error if localStorage operation fails

#### **updateTemplate()**
```typescript
updateTemplate(templateId: string, updates: Partial<Pick<FormTemplate, 'name' | 'pages'>>): FormTemplate | null
```
**Purpose**: Update existing template
**Parameters**: Template ID and updates object
**Returns**: Updated template or null if not found
**Side Effects**: Updates modifiedDate timestamp

#### **deleteTemplate()**
```typescript
deleteTemplate(templateId: string): boolean
```
**Purpose**: Delete template by ID
**Parameters**: Template ID to delete
**Returns**: true if deleted, false if not found
**Side Effects**: Removes from localStorage immediately

#### **getTemplate()**
```typescript
getTemplate(templateId: string): FormTemplate | null  
```
**Purpose**: Retrieve single template by ID
**Parameters**: Template ID
**Returns**: FormTemplate or null if not found

### **Usage Example**
```typescript
import { templateService } from './features/template-management/services/templateService';

// Save new template
const newTemplate = await templateService.saveTemplate({
  name: 'Contact Form',
  pages: [{
    id: 'page-1',
    title: 'Page 1', 
    components: [/* components array */]
  }]
});

// Load template for editing
const template = templateService.getTemplate('template_123456');
if (template) {
  // Load into form builder
  importJSON(JSON.stringify({
    templateName: template.name,
    components: template.pages[0].components
  }));
}

// Update template
const updated = templateService.updateTemplate('template_123456', {
  name: 'Updated Contact Form'
});

// Delete template  
const deleted = templateService.deleteTemplate('template_123456');
```

---

## 🎨 Rendering API

### **SimpleRenderer Functions**

#### **renderSimpleComponent()**
```typescript
function renderSimpleComponent(component: Component): JSX.Element
```
**Purpose**: Main rendering function for all component types
**Parameters**: Component object to render
**Returns**: JSX element representing the component
**Behavior**: Type-based switching to appropriate render function

#### **Component-Specific Renderers**
```typescript
// Input components
function renderTextInput(component: Component): JSX.Element
function renderEmailInput(component: Component): JSX.Element  
function renderNumberInput(component: Component): JSX.Element
function renderTextarea(component: Component): JSX.Element
function renderDatePicker(component: Component): JSX.Element
function renderFileUpload(component: Component): JSX.Element

// Selection components
function renderSelect(component: Component): JSX.Element
function renderRadioGroup(component: Component): JSX.Element
function renderCheckbox(component: Component): JSX.Element

// Layout components  
function renderHorizontalLayout(component: Component): JSX.Element
function renderVerticalLayout(component: Component): JSX.Element

// Content components
function renderHeading(component: Component): JSX.Element
function renderParagraph(component: Component): JSX.Element  
function renderButton(component: Component): JSX.Element
function renderDivider(component: Component): JSX.Element
```

### **Rendering Props Mapping**
Each renderer maps Component properties to HTML attributes:

```typescript
// Example for text input
{
  id: component.id,
  name: component.fieldId || component.id,
  type: 'text',
  placeholder: component.placeholder,
  defaultValue: component.defaultValue,
  required: component.required,
  disabled: component.disabled,
  readOnly: component.readOnly,
  style: component.style,
  className: component.className
}
```

---

## 🔄 Event Handling Patterns

### **Standard Event Props**
Most components accept these standard event handlers:

```typescript
interface ComponentEventProps {
  onSelect?: (id: string | null) => void;
  onUpdate?: (id: string, updates: Partial<Component>) => void;
  onDelete?: (id: string) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
}
```

### **Drag-Drop Event Props**
For drag-drop enabled components:

```typescript
interface DragDropEventProps {
  onDrop?: (componentType: ComponentType, position?: { index: number }) => void;
  onDragStart?: (component: Component) => void;
  onDragEnd?: () => void;
}
```

---

*This API reference covers all public interfaces for extending and integrating with the form builder system.*