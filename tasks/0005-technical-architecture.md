# Visual Form Builder - Technical Architecture

**Version**: 1.0
**Date**: November 1, 2025
**Status**: Implementation-Ready

---

## 1. Technology Stack

### Frontend Stack
- **Framework**: React 18.2+
- **Language**: TypeScript 5.0+
- **State Management**: Zustand (lightweight, Redux-free, excellent for form state)
- **UI Components**: Shadcn/ui (built on Radix UI, headless, accessible)
- **Styling**: Tailwind CSS + CSS Modules for component isolation
- **Drag & Drop**: React Beautiful DnD or custom implementation (DnD logic is complex, custom recommended)
- **Build Tool**: Vite (faster than Create React App)
- **Testing**: Vitest + React Testing Library

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (structured data, excellent for JSON schemas)
- **ORM**: Prisma (type-safe, great DX)
- **Authentication**: JWT (stateless, scalable)
- **Validation**: Zod (TypeScript-first schema validation)

### DevOps & Infrastructure
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Hosting**: AWS (EC2 + RDS) or Vercel (Frontend) + AWS Lambda (Backend)
- **Monitoring**: Sentry (error tracking)

---

## 2. Project Structure

```
formbuilder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Builder/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── ComponentPalette.tsx
│   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── DragDrop/
│   │   │   │   ├── DragDropContext.tsx
│   │   │   │   ├── DropZone.tsx
│   │   │   │   └── DropIndicator.tsx
│   │   │   ├── Templates/
│   │   │   │   ├── TemplateLibrary.tsx
│   │   │   │   ├── TemplatePreview.tsx
│   │   │   │   └── TemplateSaveModal.tsx
│   │   │   └── Common/
│   │   │       ├── Modal.tsx
│   │   │       ├── Notification.tsx
│   │   │       └── Spinner.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Builder.tsx
│   │   │   ├── TemplateLibrary.tsx
│   │   │   └── NotFound.tsx
│   │   ├── store/
│   │   │   ├── formStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── historyStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── templateService.ts
│   │   │   └── exportService.ts
│   │   ├── hooks/
│   │   │   ├── useDragDrop.ts
│   │   │   ├── useFormState.ts
│   │   │   ├── useHistory.ts
│   │   │   └── useTemplates.ts
│   │   ├── types/
│   │   │   ├── form.ts
│   │   │   ├── component.ts
│   │   │   ├── layout.ts
│   │   │   └── template.ts
│   │   ├── utils/
│   │   │   ├── dropPosition.ts
│   │   │   ├── layoutEngine.ts
│   │   │   ├── validation.ts
│   │   │   └── componentFactory.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── templates.ts
│   │   │   ├── forms.ts
│   │   │   └── auth.ts
│   │   ├── controllers/
│   │   │   ├── templateController.ts
│   │   │   ├── formController.ts
│   │   │   └── authController.ts
│   │   ├── services/
│   │   │   ├── templateService.ts
│   │   │   ├── formService.ts
│   │   │   └── authService.ts
│   │   ├── models/
│   │   │   ├── Template.ts
│   │   │   ├── Form.ts
│   │   │   ├── User.ts
│   │   │   └── FormSubmission.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── database/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── tasks/ (documentation)
```

---

## 3. State Management with Zustand

### Store Structure

```typescript
// formStore.ts - Form/Canvas State
interface FormState {
  // Current form
  formId: string;
  domain: 'forms' | 'surveys' | 'workflows';
  pages: Page[];
  currentPageIndex: number;

  // History
  history: FormAction[];
  historyIndex: number;

  // UI State
  selectedComponentId: string | null;

  // Actions
  addComponent: (component: FormComponentData, position?: DropPosition) => void;
  deleteComponent: (componentId: string) => void;
  moveComponent: (componentId: string, targetId: string, position: DropPosition) => void;
  updateComponent: (componentId: string, updates: Partial<FormComponentData>) => void;
  undo: () => void;
  redo: () => void;
  selectComponent: (componentId: string) => void;
}

// uiStore.ts - UI/UX State
interface UIState {
  // Drag state
  isDragging: boolean;
  draggedComponent: FormComponentData | null;
  dropIndicator: DropIndicator | null;

  // Modals
  isTemplateSaveModalOpen: boolean;
  isPreviewModalOpen: boolean;

  // Notifications
  notification: Notification | null;

  // Sidebar state
  isPaletteCollapsed: boolean;

  // Actions
  setDragging: (isDragging: boolean, component?: FormComponentData) => void;
  showDropIndicator: (indicator: DropIndicator) => void;
  hideDropIndicator: () => void;
  showNotification: (notification: Notification) => void;
  hideNotification: () => void;
}

// historyStore.ts - Undo/Redo History
interface HistoryStore {
  stack: FormAction[];
  index: number;
  maxSize: number;

  // Actions
  push: (action: FormAction) => void;
  undo: () => FormAction | null;
  redo: () => FormAction | null;
  clear: () => void;
}
```

---

## 4. Component System Architecture

### Component Type System

```typescript
// types/component.ts
type ComponentType =
  // Input
  | 'text_input'
  | 'email_input'
  | 'password_input'
  | 'number_input'
  | 'textarea'
  | 'rich_text'
  // Selection
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'radio_group'
  // Special
  | 'date_picker'
  | 'file_upload'
  | 'signature'
  // Layout
  | 'horizontal_layout'
  // UI
  | 'section_divider'
  | 'button'
  | 'heading'
  | 'card';

interface FormComponentData {
  type: ComponentType;
  id: string;
  fieldId: string;
  label: string;
  required: boolean;
  validation: ValidationRules;
  properties: Record<string, any>;
  children?: FormComponentData[]; // For horizontal_layout
}

interface HorizontalLayoutComponent extends FormComponentData {
  type: 'horizontal_layout';
  children: FormComponentData[];
  layoutConfig: {
    distribution: 'equal' | 'auto' | 'custom';
    spacing: 'tight' | 'normal' | 'loose';
    alignment: 'top' | 'center' | 'bottom';
  };
}
```

### Component Factory Pattern

```typescript
// utils/componentFactory.ts
class ComponentFactory {
  static create(type: ComponentType): FormComponentData {
    const baseComponent: FormComponentData = {
      id: generateUniqueId(type),
      type,
      fieldId: `${type}_${Date.now()}`,
      label: this.getDefaultLabel(type),
      required: false,
      validation: {},
      properties: this.getDefaultProperties(type)
    };

    return baseComponent;
  }

  private static getDefaultLabel(type: ComponentType): string {
    // Map type to human-readable label
  }

  private static getDefaultProperties(type: ComponentType): Record<string, any> {
    // Return component-specific default properties
  }
}
```

---

## 5. Drag & Drop Implementation Strategy

### Custom Drag-Drop Handler (Recommended over React Beautiful DnD)

**Why Custom?**
- Complex layout rules (horizontal vs vertical, row constraints)
- Edge cases (corner drops, row interior blocking)
- Special row handling (as single unit)
- Full control over behavior

**Key Components:**
- `useDragDrop()` hook - Manages drag state
- `DropPosition` detector - Calculates zone
- `LayoutEngine` - Executes transformations
- `ValidationEngine` - Enforces constraints

```typescript
// hooks/useDragDrop.ts
function useDragDrop() {
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

  const handleDragStart = (component, source) => {
    // Set drag data based on source
  };

  const handleDragOver = (event, targetElement) => {
    const position = calculateDropPosition(event, targetElement);
    setDropPosition(position);
  };

  const handleDrop = async (event) => {
    // Execute layout operation via store
  };

  return { dragData, dropPosition, handleDragStart, handleDragOver, handleDrop };
}
```

---

## 6. Layout Engine Architecture

### Core Operations

```typescript
// utils/layoutEngine.ts
class LayoutEngine {
  // Main operations
  static createHorizontalLayout(context: HorizontalLayoutCreationContext): FormComponentData[] { }
  static insertInColumnLayout(components, newComponent, target, position): FormComponentData[] { }
  static moveRowLayout(row, target, position, components): FormComponentData[] { }
  static checkAndDissolveRowContainer(context): FormComponentData[] { }

  // Utilities
  static calculateDropPosition(mouseX, mouseY, targetElement, targetComponent): DropPosition | null { }
  static findComponentWithContext(target, components): ComponentContext { }
  static validateLayoutOperation(operation, context): ValidationResult { }
}
```

---

## 7. Data Persistence

### Templates Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(50) NOT NULL, -- 'forms', 'surveys', 'workflows'
  category VARCHAR(100),
  tags JSONB, -- Array of tags
  form_structure JSONB NOT NULL, -- Complete form definition
  thumbnail_url VARCHAR(255),
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_domain (user_id, domain)
);

-- Template Library Metadata
CREATE TABLE template_metadata (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES templates(id),
  component_count INT,
  required_fields_count INT,
  page_count INT,
  horizontal_layouts_count INT,
  estimated_completion_time INT, -- in minutes
  use_count INT DEFAULT 0, -- Track template popularity
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);
```

---

## 8. API Endpoints (Basic)

```typescript
// Backend Routes

// Auth
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout

// Templates
GET /api/templates
GET /api/templates/:id
POST /api/templates
PUT /api/templates/:id
DELETE /api/templates/:id
GET /api/templates/:id/preview

// Forms
POST /api/forms
GET /api/forms/:id
PUT /api/forms/:id
DELETE /api/forms/:id
POST /api/forms/:id/export

// Form Submissions (Out of Scope for MVP)
POST /api/forms/:id/submissions
GET /api/forms/:id/submissions
```

---

## 9. Accessibility Implementation Map

### ARIA Labels & Roles

```typescript
// Component Palette
<section role="region" aria-label="Component Palette">
  <div role="group" aria-labelledby="input-category">
    <h2 id="input-category">Input Components</h2>
    <button aria-describedby="text-input-help">Text Input</button>
    <span id="text-input-help" hidden>Drag to canvas to add text input field</span>
  </div>
</section>

// Canvas
<section role="main" aria-label="Form Canvas" aria-live="polite">
  {/* Components rendered here */}
</section>

// Properties Panel
<aside role="region" aria-label="Component Properties" aria-live="polite" aria-atomic="true">
  {/* Properties form */}
</aside>
```

### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| Tab | Focus next interactive element | Global |
| Shift+Tab | Focus previous element | Global |
| Enter | Activate button/select | Buttons, Dropdowns |
| Space | Activate drag on focused component | Component |
| Arrow Keys | Move component during keyboard drag | Drag Mode |
| Ctrl+Z | Undo | Global |
| Ctrl+Shift+Z | Redo | Global |
| Escape | Cancel drag/close modal | Drag/Modal Mode |

---

## 10. Performance Optimization Strategy

### Critical Rendering Paths

1. **Initial Load**
   - Load builder shell immediately (300ms target)
   - Lazy-load component palette (happens after)
   - Virtualize component list if >100 items

2. **Drag Operations**
   - Drop position detection: <16ms (60 FPS requirement)
   - Visual feedback update: immediate
   - State update debounced: 50ms

3. **Large Forms**
   - Virtualize canvas rendering (>100 components)
   - Memoize component cards
   - Lazy render off-screen components

### Optimization Techniques

```typescript
// Memoized component cards
const ComponentCard = memo(({ component, onSelect }) => {
  return <div onClick={() => onSelect(component.id)}>{component.label}</div>;
}, (prevProps, nextProps) =>
  prevProps.component.id === nextProps.component.id &&
  prevProps.component.label === nextProps.component.label
);

// Debounced property updates
const debouncedUpdateComponent = debounce(
  (componentId, updates) => formStore.updateComponent(componentId, updates),
  50
);

// Virtualized canvas
<VirtualScroller
  items={components}
  itemHeight={60}
  renderItem={(component) => <ComponentCard component={component} />}
/>
```

---

## 11. Testing Strategy

### Unit Tests
- Layout engine operations (creation, dissolution, movement)
- Drop position detection
- Component factory
- Validation rules

### Integration Tests
- Full drag-drop workflows
- Multi-step form building
- Template save/load
- Export functionality

### E2E Tests (Cypress)
- User journeys (create form from scratch, use template)
- Complex layout scenarios
- Template library operations
- Multi-page forms

---

## 12. Development Phases

### Phase 1: Foundation (Sprints 1-2)
- Project setup, tooling configuration
- Zustand store setup
- Basic canvas and component rendering
- Simple vertical layout

### Phase 2: Core Layout (Sprints 3-4)
- Horizontal layout creation and management
- Drop position detection
- Auto-dissolution logic
- Row layout dragging

### Phase 3: UI Components (Sprints 5-6)
- Component palette
- Properties panel
- Undo/redo system
- Multi-page support

### Phase 4: Advanced Features (Sprints 7-8)
- Template system
- JSON export
- Preview mode
- Domain-specific adaptations

### Phase 5: Polish & Integration (Sprints 9-10)
- Performance optimization
- Accessibility audit
- Error handling refinement
- Integration testing
- User acceptance testing

---

## 13. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Complex drag-drop implementation | High | High | Custom implementation with extensive testing |
| Performance with large forms | Medium | High | Implement virtualization early |
| State management complexity | Medium | Medium | Clear store architecture, good typing |
| Accessibility compliance | Medium | Medium | Audit with tools (axe, Lighthouse) |
| Template persistence issues | Low | High | Comprehensive database testing |

---

**This document is ready for development to begin.**
