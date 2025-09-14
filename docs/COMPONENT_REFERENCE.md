# Component Reference Guide

## 📚 Comprehensive Component Documentation

This guide provides detailed documentation for all components in the simplified form builder architecture.

## 🎯 Core Application Components

### **App.tsx**
**Purpose**: Root application component managing global state and routing

**Key Responsibilities**:
- Global state management via `useAppState`
- Form builder state management via `useSimpleFormBuilder` 
- Template operations (save, load, export)
- Modal management (success, error, preview)
- View switching between template list and form builder

**Props**: None (root component)

**State Management**:
```typescript
const { state, actions } = useAppState();
const formBuilderHook = useSimpleFormBuilder();
```

**Key Methods**:
- `handleSave()` - Saves current form as template
- `handleExportJSON()` - Exports form structure as JSON
- `handleTemplateSelect()` - Loads selected template for editing

---

## 🎨 Form Builder Components

### **SimpleFormBuilder.tsx**
**Purpose**: Main form building interface container

**Props**:
```typescript
interface SimpleFormBuilderProps {
  formBuilderHook: ReturnType<typeof useSimpleFormBuilder>;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  showPreview?: boolean;
  onClosePreview?: () => void;
}
```

**Key Features**:
- Form title input with auto-save
- Action buttons (Preview, Export, Save)
- Layout management for palette and canvas
- Drag-and-drop provider setup

**Layout Structure**:
```
SimpleFormBuilder
├── Header (title + actions)
├── SimpleComponentPalette (left)
└── SimpleCanvas (center)
```

### **SimpleCanvas.tsx**
**Purpose**: Main form building canvas with drag-drop capabilities

**Props**:
```typescript
interface SimpleCanvasProps {
  components: Component[];
  selectedId: string | null;
  onDrop: (componentType: ComponentType, position?: { index: number }) => void;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  mode?: 'builder' | 'preview';
  className?: string;
  emptyMessage?: string;
}
```

**Key Features**:
- Drop target for new components from palette
- Inline preview during drag operations
- Component reordering within canvas
- Empty state with helpful instructions
- Visual feedback for different drag types

**Drag-Drop Behavior**:
- **Palette → Canvas**: Shows inline component preview
- **Canvas Reordering**: Shows reorder indicators
- **Visual Feedback**: Different colors for different operations

### **SimpleComponentPalette.tsx**
**Purpose**: Component library with drag-and-drop functionality

**Props**:
```typescript
interface SimpleComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
  className?: string;
}
```

**Key Features**:
- 13 component types organized in 4 categories
- Search functionality across all components
- Collapsible category sections
- Click or drag to add components
- Component count indicators

**Component Categories**:
```typescript
INPUT: ['text_input', 'email_input', 'number_input', 'textarea', 'date_picker', 'file_upload']
SELECTION: ['select', 'radio_group', 'checkbox'] 
LAYOUT: ['horizontal_layout', 'vertical_layout']
CONTENT: ['heading', 'paragraph', 'button', 'divider', 'section_divider']
```

### **SimpleDraggableComponent.tsx**
**Purpose**: Individual form component with editing capabilities

**Props**:
```typescript
interface SimpleDraggableComponentProps {
  component: Component;
  index: number;
  selected: boolean;
  mode: 'builder' | 'preview';
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}
```

**Key Features**:
- Selection highlighting with blue border
- Delete button when selected
- Drag handle for reordering
- Component type badge
- Drop target indicators
- Required field asterisk

**Visual States**:
- **Normal**: Transparent background, hover effects
- **Selected**: Blue border, visible controls
- **Dragging**: Reduced opacity, rotation effect
- **Drop Target**: Blue top border, animation

---

## 🛠️ Utility Components

### **SimpleRenderer.tsx**
**Purpose**: Centralized component rendering based on type

**Main Function**:
```typescript
renderSimpleComponent(component: Component): JSX.Element
```

**Supported Component Types**:
- **Input Components**: text_input, email_input, number_input, textarea, date_picker, file_upload
- **Selection Components**: select, radio_group, checkbox
- **Layout Components**: horizontal_layout, vertical_layout  
- **Content Components**: heading, paragraph, button, divider, section_divider

**Rendering Logic**:
- Type-based switching for appropriate HTML elements
- Props mapping from Component interface
- Styling application and validation attributes
- Nested rendering for layout components

### **LazyComponents.tsx**
**Purpose**: Code splitting and performance optimization

**Lazy Loaded Components**:
- `LazyTemplateListView` - Template management interface
- `LazyPreviewModal` - Form preview functionality
- `LazyCanvas` - Legacy canvas component
- `LazyComponentPalette` - Legacy palette component

**Benefits**:
- Reduced initial bundle size
- Faster application startup
- Dynamic loading of heavy components

---

## 🔧 State Management Hooks

### **useSimpleFormBuilder.ts**
**Purpose**: Core form building state and operations

**State Structure**:
```typescript
interface FormState {
  components: Component[];
  selectedId: string | null;
  templateName: string;
  history: FormState[];
  historyIndex: number;
  previewMode: boolean;
  mode: 'create' | 'edit';
  editingTemplateId?: string;
}
```

**Key Operations**:
- `addComponent(type, index?)` - Add new component
- `updateComponent(id, updates)` - Modify existing component  
- `deleteComponent(id)` - Remove component
- `moveComponent(fromIndex, toIndex)` - Reorder components
- `selectComponent(id)` - Select component for editing
- `importJSON(jsonString)` - Load form from JSON
- `exportJSON()` - Export form to JSON
- `undo()` / `redo()` - History management

**Auto-Save Features**:
- 1-second debounce on changes
- Only in edit mode
- Compares with last saved state
- Silent operation (no user notification)

### **useAppState.ts**
**Purpose**: Global application state management

**State Structure**:
```typescript
interface AppState {
  currentView: 'templates' | 'builder';
  showPreview: boolean;
  successModal: { isOpen: boolean; title: string; message: string };
  errorModal: { isOpen: boolean; title: string; message: string };
}
```

**Actions**:
- `setView(view)` - Switch between views
- `togglePreview(show?)` - Control preview modal
- `showSuccess(title, message)` - Display success notification
- `showError(title, message)` - Display error notification
- `closeSuccess()` / `closeError()` - Dismiss modals

---

## 📝 Template Management Components

### **TemplateListView.tsx**
**Purpose**: Display and manage saved form templates

**Key Features**:
- Grid layout of template cards
- Real-time refresh (2-second interval)
- Template actions (Edit, Delete)
- Component count display
- Creation/modification dates
- Empty state for no templates

**Template Card Structure**:
- Template name as header
- Component count indicator
- Last modified timestamp
- Action buttons (Edit/Delete)
- Hover effects and animations

**Operations**:
- `onTemplateSelect(template)` - Load template for editing
- `onTemplateDelete(templateId)` - Delete template with confirmation
- `refreshTemplates()` - Update template list from storage

### **TemplateService.ts**
**Purpose**: Template persistence and management

**Storage Key**: `'formTemplates'` in localStorage

**Methods**:
```typescript
class TemplateService {
  getAllTemplates(): FormTemplate[]
  saveTemplate(template): FormTemplate
  updateTemplate(templateId, updates): FormTemplate | null  
  deleteTemplate(templateId): boolean
  getTemplate(templateId): FormTemplate | null
}
```

**Data Structure**:
```typescript
interface FormTemplate {
  templateId: string;        // "template_timestamp"
  name: string;             // User-provided name
  type: FormTemplateType;   // "assessment" | "survey" | etc.
  pages: FormPage[];        // Multi-page support
  fields: Component[];      // Legacy compatibility
  createdDate: string;      // ISO timestamp
  modifiedDate: string;     // ISO timestamp
  jsonSchema: Record<string, unknown>; // Legacy compatibility
}
```

---

## 🎭 Preview Components

### **PreviewModal.tsx**  
**Purpose**: Modal wrapper for form preview

**Props**:
```typescript
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components?: FormComponentData[];
  pages?: FormPage[];
}
```

**Features**:
- Full-screen modal display
- Form submission simulation
- Multi-page support (if applicable)
- Results display modal

### **PreviewForm.tsx**
**Purpose**: Interactive form preview with validation

**Key Capabilities**:
- Form data state management
- Real-time validation
- Component rendering via SimpleRenderer
- Form submission with results
- Error display and handling

**Validation Rules**:
- Required field validation
- Pattern matching (email, etc.)
- Length constraints (min/max)
- Numeric range validation
- Custom validation messages

---

## 🎨 Styling Architecture

### **CSS Organization**:
```
styles/
├── main.css              # Entry point, imports all others
├── variables.css         # CSS custom properties
├── base.css             # Reset and base styles
├── components.css       # Generic component styles
├── layout.css           # Layout utilities
├── drag-feedback.css    # Drag-drop visual feedback
├── simple-form-builder.css # Form builder specific
└── features/            # Feature-specific styles
    ├── form-builder.css
    └── template-management.css
```

### **CSS Custom Properties**:
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --border-radius: 4px;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

### **Responsive Breakpoints**:
- **Mobile**: `max-width: 768px`
- **Tablet**: `769px - 1024px`  
- **Desktop**: `min-width: 1025px`

---

## 🚀 Performance Optimizations

### **React Optimizations**:
- `React.memo()` for expensive components
- `useCallback()` for event handlers
- `useMemo()` for computed values
- Lazy loading with `React.lazy()`

### **Rendering Optimizations**:
- Minimal re-renders through proper state structure
- Debounced operations (auto-save, search)
- Virtual scrolling for large template lists
- Optimized drag operations

### **Bundle Optimizations**:
- Code splitting by route and feature
- Tree shaking of unused utilities
- CSS minification and optimization
- Asset optimization and compression

---

*This component reference provides the foundation for understanding and extending the form builder system.*