# Form Builder Core Architecture

## Overview

The Form Builder core architecture consists of four main engines that work together to provide a complete form building and management system. Each engine has a single responsibility and communicates through well-defined interfaces.

## Core Architecture Class Diagram

```mermaid
classDiagram
    %% Core Engine Classes
    class ComponentEngine {
        <<Static Class>>
        +createComponent(type: ComponentType) FormComponentData
        +updateComponent(components: FormComponentData[], id: string, updates: Partial) FormComponentData[]
        +removeComponent(components: FormComponentData[], id: string) FormComponentData[]
        +findComponent(components: FormComponentData[], id: string) FormComponentData | null
        +validateComponent(component: FormComponentData) ValidationResult
        +getAllComponentTypes() ComponentType[]
        +getDefaultLabel(type: ComponentType) string
        -getDefaultPlaceholder(type: ComponentType) string
    }

    class ComponentRenderer {
        <<Static Class>>
        +renderComponent(component: FormComponentData, mode: 'builder' | 'preview') string
        +renderForm(components: FormComponentData[], options: RenderOptions) string
        +getComponentInfo(type: string) ComponentInfo
        -renderBuilderMode(component: FormComponentData) string
        -renderPreviewMode(component: FormComponentData) string
        -renderComponentContent(component: FormComponentData) string
    }

    class FormStateEngine {
        <<Static Class>>
        +executeAction(state: FormState, action: FormStateAction) FormState
        +getCurrentPageComponents(pages: FormPage[], pageId: string) FormComponentData[]
        +validateFormState(pages: FormPage[]) ValidationResult
        -addComponent(state: FormState, payload: AddComponentPayload) FormState
        -updateComponent(state: FormState, payload: UpdateComponentPayload) FormState
        -deleteComponent(state: FormState, payload: DeleteComponentPayload) FormState
        -moveComponent(state: FormState, payload: MoveComponentPayload) FormState
        -dropComponent(state: FormState, payload: DropComponentPayload) FormState
        -insertHorizontalLayout(state: FormState, payload: HorizontalLayoutPayload) FormState
    }

    class ValidationEngine {
        <<Static Class>>
        +validateComponent(component: FormComponentData, value?: any) ValidationResult
        +validatePage(page: FormPage, pageData: any) ValidationResult
        +validateForm(schema: FormSchema, formData: any) ValidationResult
        +validateDataStructure(data: any, expectedStructure: any) ValidationResult
        +createRequiredRule(message?: string) ValidationRule
        +createMinLengthRule(minLength: number, message?: string) ValidationRule
        +createMaxLengthRule(maxLength: number, message?: string) ValidationRule
        +createEmailRule(message?: string) ValidationRule
        +createPatternRule(pattern: string, message?: string) ValidationRule
        -validateRule(rule: ValidationRule, value: any, component: FormComponentData | null) ValidationResult
        -extractPageData(page: FormPage, formData: any) any
    }

    %% Data Types
    class FormComponentData {
        +id: string
        +type: ComponentType
        +fieldId: string
        +label: string
        +required: boolean
        +placeholder?: string
        +defaultValue?: string | number | boolean
        +validationRules?: ValidationRule[]
        +options?: OptionData[]
        +children?: FormComponentData[]
        +conditionalDisplay?: ConditionalDisplay
        +position?: Position
        +styling?: Styling
    }

    class FormPage {
        +id: string
        +title: string
        +components: FormComponentData[]
        +layout: 'horizontal' | 'vertical'
        +validationRules?: ValidationRule[]
    }

    class FormSchema {
        +id: string
        +title: string
        +description?: string
        +pages: FormPage[]
        +globalValidationRules?: ValidationRule[]
        +metadata?: any
    }

    class ValidationResult {
        +isValid: boolean
        +errors?: string[]
        +message?: string
    }

    class ValidationRule {
        +type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
        +value?: any
        +message: string
        +validator?: (value: any) => ValidationResult
    }

    %% Action Types
    class FormStateAction {
        <<Union Type>>
        ADD_COMPONENT
        UPDATE_COMPONENT
        DELETE_COMPONENT
        MOVE_COMPONENT
        DROP_COMPONENT
        SELECT_COMPONENT
        ADD_PAGE
        DELETE_PAGE
        SWITCH_PAGE
        UPDATE_PAGE_TITLE
        INSERT_COMPONENT_AT_INDEX
        INSERT_COMPONENT_WITH_POSITION
        INSERT_HORIZONTAL_LAYOUT
    }

    %% External Services
    class DragDropService {
        +handleDrop(components: FormComponentData[], position: DropPosition, createComponent: Function) FormComponentData[]
    }

    %% Relationships
    FormStateEngine --> ComponentEngine : uses for CRUD operations
    FormStateEngine --> ValidationEngine : uses for validation
    FormStateEngine --> DragDropService : uses for drag-drop logic
    ComponentRenderer --> ComponentEngine : uses for component info
    ValidationEngine --> FormComponentData : validates
    ValidationEngine --> FormPage : validates
    ValidationEngine --> FormSchema : validates
    FormStateEngine --> FormStateAction : processes
    ComponentEngine --> FormComponentData : creates/manages
    FormPage --> FormComponentData : contains
    FormSchema --> FormPage : contains
    FormComponentData --> ValidationRule : has
    FormPage --> ValidationRule : has
    FormSchema --> ValidationRule : has
```

## Architecture Principles

### Single Responsibility Principle
- **ComponentEngine**: Handles all component CRUD operations and basic validation
- **ComponentRenderer**: Handles all component rendering (builder and preview modes)
- **FormStateEngine**: Manages all form state changes and orchestrates operations
- **ValidationEngine**: Handles multi-level validation (field, page, form, schema)

### Data Flow

```mermaid
flowchart TD
    A[User Action] --> B[FormStateEngine.executeAction]
    B --> C{Action Type}
    
    C -->|Component CRUD| D[ComponentEngine]
    C -->|Validation| E[ValidationEngine]
    C -->|Drag & Drop| F[DragDropService]
    
    D --> G[Update FormComponentData]
    E --> H[Return ValidationResult]
    F --> I[Update Component Layout]
    
    G --> J[New Form State]
    H --> J
    I --> J
    
    J --> K[UI Re-render]
    K --> L[ComponentRenderer.renderComponent]
```

## Component Type Architecture

### Layout Components
- **horizontal_layout**: Data model for horizontal layouts
- **vertical_layout**: Data model for vertical layouts

### UI Components  
- **RowLayout**: React component that renders horizontal_layout data with `data-testid="row-layout"`
- **VerticalLayout**: React component that renders vertical_layout data
- **HorizontalLayout**: Generic React component for horizontal layouts

**Note**: `horizontal_layout` and `row_layout` are the same concept - `horizontal_layout` is the data type, `RowLayout` is the React component that renders it. Similarly, `vertical_layout` and `column_layout` refer to the same concept.

## Integration Points

### State Management
```typescript
// FormStateEngine orchestrates all operations
const newState = FormStateEngine.executeAction(currentState, {
  type: 'ADD_COMPONENT',
  payload: { componentType: 'text_input', pageId: 'page1' }
});
```

### Component Operations
```typescript
// ComponentEngine handles component lifecycle
const component = ComponentEngine.createComponent('text_input');
const updated = ComponentEngine.updateComponent(components, id, updates);
const validation = ComponentEngine.validateComponent(component);
```

### Rendering
```typescript
// ComponentRenderer handles all rendering
const builderHTML = ComponentRenderer.renderComponent(component, 'builder');
const previewHTML = ComponentRenderer.renderComponent(component, 'preview');
```

### Validation
```typescript
// ValidationEngine handles multi-level validation
const fieldResult = ValidationEngine.validateComponent(component, value);
const pageResult = ValidationEngine.validatePage(page, pageData);
const formResult = ValidationEngine.validateForm(schema, formData);
```

## Key Features

1. **Centralized Operations**: All component operations go through single engines
2. **Type Safety**: Strong TypeScript interfaces for all data structures
3. **Multi-Level Validation**: Field → Page → Form → Schema validation levels
4. **Immutable State**: All operations return new state objects
5. **Separation of Concerns**: Clear boundaries between engines
6. **Extensible**: Easy to add new component types and validation rules
7. **Test-Friendly**: Static methods make testing straightforward
