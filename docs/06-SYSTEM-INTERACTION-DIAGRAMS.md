# System Interaction Diagrams

## Overview

This document provides comprehensive diagrams showing how all classes, business logic, hooks, and systems interact to create the complex form builder functionality.

## Class Interaction Diagram

```mermaid
classDiagram
    %% Core Business Logic Classes
    class ComponentEngine {
        <<Static>>
        +createComponent(type) FormComponent
        +updateComponent(component, updates) FormComponent
        +deleteComponent(components, id) FormComponent[]
        +validateComponent(component) ValidationResult
        +findComponent(components, id) FormComponent
        +getAllComponentTypes() ComponentType[]
    }

    class FormStateEngine {
        <<Static>>
        +executeAction(state, action) FormState
        +validateFormState(state) ValidationResult
        +getCurrentPageComponents(pages, pageId) FormComponent[]
        -addComponent(state, payload) FormState
        -updateComponent(state, payload) FormState
        -deleteComponent(state, payload) FormState
        -createHorizontalLayout(state, payload) FormState
    }

    class DragDropLogic {
        +handleDrop(components, position, createComponent) FormComponent[]
        +repositionComponent(components, position) FormComponent[]
        +insertHorizontal(components, targetId, component, side) FormComponent[]
        +insertBefore(components, targetId, component) FormComponent[]
        +insertAfter(components, targetId, component) FormComponent[]
        +calculateDropPosition(element, mouseX, mouseY) DropPosition
        +validateDrop(components, position) ValidationResult
    }

    class CanvasManager {
        -state: CanvasState
        -config: CanvasManagerConfig
        -listeners: Set~Function~
        +addComponent(type, position?) void
        +updateComponent(id, updates) void
        +deleteComponent(id) void
        +onDrop(type, targetId, position) void
        +selectComponent(id) void
        +subscribe(listener) Function
    }

    %% React Hook
    class useFormBuilder {
        <<Hook>>
        -formState: FormState
        -history: FormState[]
        -historyIndex: number
        +addComponent(type) void
        +updateComponent(id, updates) void
        +deleteComponent(id) void
        +handleDrop(type, targetId, position) void
        +undo() void
        +redo() void
        +exportToJSON() string
        +loadFromJSON(json) void
    }

    %% UI Components
    class FormBuilder {
        +formState: FormState
        +onAddComponent: Function
        +onUpdateComponent: Function
        +onDeleteComponent: Function
        +onSelectComponent: Function
    }

    class Canvas {
        +components: FormComponent[]
        +onDrop: Function
        +selectedComponentId: string
        +onSelectComponent: Function
    }

    class ComponentPalette {
        +onAddComponent: Function
        +availableComponents: ComponentType[]
    }

    class PropertiesPanel {
        +selectedComponent: FormComponent
        +onUpdateComponent: Function
    }

    %% Services
    class DragDropService {
        <<Static>>
        +handleDrop(components, position, createComponent) FormComponent[]
        +handleExistingItemDrop(components, draggedId, targetId, position) FormComponent[]
        +canDrop(targetId, componentType) boolean
    }

    %% Relationships - Core Logic Interactions
    FormStateEngine --> ComponentEngine : uses for CRUD operations
    useFormBuilder --> FormStateEngine : executes actions through
    useFormBuilder --> CanvasManager : coordinates state with
    
    %% Hook to UI Component Interactions
    FormBuilder --> useFormBuilder : consumes state and actions from
    Canvas --> useFormBuilder : calls handleDrop on
    ComponentPalette --> useFormBuilder : calls addComponent on
    PropertiesPanel --> useFormBuilder : calls updateComponent on
    
    %% Canvas Manager Interactions
    CanvasManager --> DragDropService : delegates drag operations to
    CanvasManager --> ComponentEngine : uses for component creation
    
    %% Drag Drop Logic Chain
    DragDropService --> DragDropLogic : uses for complex positioning
    DragDropLogic --> ComponentEngine : uses for component operations
    
    %% UI Component Relationships
    FormBuilder *-- Canvas : contains
    FormBuilder *-- ComponentPalette : contains
    FormBuilder *-- PropertiesPanel : contains
```

## Simple Drop Position State Flow

```mermaid
stateDiagram-v2
    [*] --> ColumnLayout : App Initialization (Canvas Always Column)

    ColumnLayout --> ColumnLayout : Drop Top/Bottom (Column Positioning)
    ColumnLayout --> ColumnWithRows : Drop Left/Right (Create Row Container)
    
    ColumnWithRows --> ColumnWithRows : Drop Top/Bottom (Column Positioning)
    ColumnWithRows --> ColumnWithRows : Drop Left/Right (Expand/Create Row)
    ColumnWithRows --> ColumnLayout : Row Auto-Dissolves (≤1 Child)
    
    note right of ColumnLayout
        Canvas is always column layout
        Contains standalone components
        Drop position determines behavior
    end note
    
    note right of ColumnWithRows
        Column layout containing:
        - Standalone components 
        - Row containers (auto-managed)
        - Row containers dissolve when ≤1 child
    end note
```

## Drag-Drop Operation Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant ComponentPalette
    participant Canvas
    participant useFormBuilder
    participant CanvasManager
    participant DragDropService
    participant DragDropLogic
    participant FormStateEngine
    participant ComponentEngine
    
    User->>ComponentPalette: Start dragging component
    ComponentPalette->>ComponentPalette: Set drag data (componentType, dragType: 'new-item')
    
    User->>Canvas: Drop on target position
    Canvas->>Canvas: Calculate mouse position
    Canvas->>useFormBuilder: handleDrop(type, targetId, position, dragType: 'new-item')
    
    useFormBuilder->>CanvasManager: onDrop(type, targetId, position)
    CanvasManager->>DragDropService: handleDrop(components, position, createComponent)
    
    DragDropService->>DragDropLogic: handleDrop(components, position, createComponent)
    DragDropLogic->>ComponentEngine: createComponent(type)
    ComponentEngine-->>DragDropLogic: newComponent
    
    alt Position is "left" or "right"
        DragDropLogic->>DragDropLogic: insertHorizontal(components, targetId, newComponent, side)
        DragDropLogic->>DragDropLogic: Check if target in existing horizontal layout
        
        alt Target already in horizontal layout
            DragDropLogic->>DragDropLogic: Add to existing layout children
        else Target is standalone
            DragDropLogic->>ComponentEngine: Create horizontal_layout container
            ComponentEngine-->>DragDropLogic: horizontalLayoutComponent
            DragDropLogic->>DragDropLogic: Set children = [targetComponent, newComponent]
        end
    else Position is "before" or "after"
        DragDropLogic->>DragDropLogic: insertBefore/insertAfter(components, targetId, newComponent)
    end
    
    DragDropLogic-->>DragDropService: updatedComponents
    DragDropService-->>CanvasManager: updatedComponents
    CanvasManager->>CanvasManager: updateState({components: updatedComponents})
    CanvasManager->>useFormBuilder: State change notification
    
    useFormBuilder->>FormStateEngine: executeAction(state, {type: 'ADD_COMPONENT', payload})
    FormStateEngine-->>useFormBuilder: newFormState
    
    useFormBuilder->>useFormBuilder: saveToHistory(previousState)
    useFormBuilder->>useFormBuilder: setState(newFormState)
    useFormBuilder-->>Canvas: Re-render with new state
    
    Canvas-->>User: Visual update with new component
```

## Canvas Rearrangement Sequence Diagram (Existing Component Movement)

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant useFormBuilder
    participant CanvasManager
    participant DragDropService
    participant DragDropLogic
    participant FormStateEngine
    
    User->>Canvas: Start dragging existing component
    Canvas->>Canvas: Set drag data (sourceId, dragType: 'existing-item')
    
    User->>Canvas: Drop on new target position
    Canvas->>Canvas: Calculate mouse position
    Canvas->>useFormBuilder: handleDrop(sourceId, targetId, position, dragType: 'existing-item')
    
    useFormBuilder->>CanvasManager: onExistingItemDrop(sourceId, targetId, position)
    CanvasManager->>DragDropService: handleExistingItemDrop(components, sourceId, targetId, position)
    
    DragDropService->>DragDropLogic: repositionComponent(components, position)
    
    alt Component moved from row container
        DragDropLogic->>DragDropLogic: findAndRemoveComponent(sourceId)
        DragDropLogic->>DragDropLogic: Check source container for dissolution
        
        alt Source row container ≤ 1 child remaining
            DragDropLogic->>DragDropLogic: dissolveRowContainer(sourceContainer)
            Note over DragDropLogic: Auto-dissolve empty/single-child container
        end
    end
    
    DragDropLogic->>DragDropLogic: insertComponentAtPosition(existingComponent, targetId, position)
    
    alt Dropping left/right creates new row
        DragDropLogic->>DragDropLogic: createRowContainer([targetComponent, movedComponent])
    end
    
    DragDropLogic-->>DragDropService: updatedComponents (same component, new position)
    DragDropService-->>CanvasManager: updatedComponents
    CanvasManager->>CanvasManager: updateState({components: updatedComponents})
    
    CanvasManager->>useFormBuilder: State change notification
    useFormBuilder->>FormStateEngine: executeAction(state, {type: 'MOVE_COMPONENT', payload})
    FormStateEngine-->>useFormBuilder: newFormState
    
    useFormBuilder->>useFormBuilder: saveToHistory(previousState)
    useFormBuilder->>useFormBuilder: setState(newFormState)
    useFormBuilder-->>Canvas: Re-render with rearranged components
    
    Canvas-->>User: Visual update showing component in new position
```

## Hook Integration Flow Chart

```mermaid
flowchart TD
    A[useFormBuilder Hook Initialization] --> B{Load Initial State}
    B --> C[Initialize FormState]
    B --> D[Initialize History Array]
    B --> E[Initialize CanvasManager]
    
    C --> F[Subscribe to CanvasManager]
    D --> F
    E --> F
    
    F --> G[Return Hook API]
    G --> H[formState]
    G --> I[selectedComponent]
    G --> J[Action Functions]
    G --> K[History Functions]
    
    J --> L[addComponent]
    J --> M[updateComponent] 
    J --> N[deleteComponent]
    J --> O[handleDrop]
    J --> P[selectComponent]
    
    K --> Q[undo]
    K --> R[redo]
    K --> S[clearHistory]
    
    L --> T[User Action Triggered]
    M --> T
    N --> T
    O --> T
    P --> T
    
    T --> U{Action Type?}
    
    U -->|Add Component| V[CanvasManager.addComponent]
    U -->|Update Component| W[CanvasManager.updateComponent]
    U -->|Delete Component| X[CanvasManager.deleteComponent]
    U -->|Handle Drop| Y[CanvasManager.onDrop]
    U -->|Select Component| Z[CanvasManager.selectComponent]
    
    V --> AA[FormStateEngine.executeAction]
    W --> AA
    X --> AA
    Y --> BB[DragDropService.handleDrop]
    Z --> CC[Update Selection State]
    
    BB --> AA
    CC --> DD[Notify Subscribers]
    
    AA --> EE[Generate New State]
    EE --> FF[Save Previous State to History]
    FF --> GG[Update Current State]
    GG --> DD
    
    DD --> HH[Re-render Components]
    HH --> II[Update UI]
    
    Q --> JJ[Restore Previous State]
    R --> KK[Restore Next State]
    JJ --> DD
    KK --> DD
```

## Component Lifecycle Flow

```mermaid
flowchart TD
    A[Component Creation Request] --> B[ComponentEngine.createComponent]
    B --> C{Component Type Valid?}
    
    C -->|No| D[Throw Error: Invalid Type]
    C -->|Yes| E[Generate Unique ID]
    
    E --> F[Apply Default Properties]
    F --> G[Set Type-Specific Defaults]
    G --> H{Layout Component?}
    
    H -->|Yes| I[Initialize Children Array]
    H -->|No| J[Set Standard Properties]
    
    I --> K[Component Created]
    J --> K
    
    K --> L[Add to Form State]
    L --> M[FormStateEngine.executeAction]
    M --> N[Validate Component]
    N --> O{Validation Passes?}
    
    O -->|No| P[Return Error State]
    O -->|Yes| Q[Update Form Structure]
    
    Q --> R{Drop Position Specified?}
    
    R -->|No| S[Append to End]
    R -->|Yes| T[DragDropService.handleDrop]
    
    T --> U{Position Type?}
    U -->|before/after| V[Insert at Index]
    U -->|left/right| W[Create/Update Horizontal Layout]
    U -->|inside| X[Add to Container Children]
    
    V --> Y[Update Component Array]
    W --> Z[Container Management Logic]
    X --> AA[Update Container]
    
    Z --> BB{Target in Existing Layout?}
    BB -->|Yes| CC[Add to Existing Layout]
    BB -->|No| DD[Create New Horizontal Layout]
    
    CC --> EE[Check Layout Capacity]
    DD --> FF[Set Layout Properties]
    
    EE --> GG{Under Capacity Limit?}
    GG -->|No| HH[Return Error: Layout Full]
    GG -->|Yes| II[Insert Component]
    
    FF --> II
    II --> Y
    AA --> Y
    
    Y --> JJ[Trigger State Update]
    S --> JJ
    
    JJ --> KK[Save to History]
    KK --> LL[Notify Subscribers]
    LL --> MM[Re-render UI]
    
    P --> NN[Show Error Message]
    HH --> NN
    D --> NN
```

## Complex Layout Transformation Flow

```mermaid
flowchart TD
    A[Layout Transformation Trigger] --> B{Current Layout State?}
    
    B -->|Empty Canvas| C[Create First Component]
    B -->|Single Component| D[Two-Element Choice Point]
    B -->|Two Components| E[Expansion Decision]
    B -->|Complex Layout| F[Advanced Transformation]
    
    C --> G[Place in Column Layout]
    G --> H[Set Available Drop Zones: Top/Bottom]
    
    D --> I{Drop Position?}
    I -->|Top/Bottom| J[Maintain Column Layout]
    I -->|Left/Right| K[Create Horizontal Layout]
    
    J --> L[Add Component to Array]
    L --> M[Two Vertical Components]
    
    K --> N[ComponentEngine.createComponent(horizontal_layout)]
    N --> O[Set Children = [targetComponent, newComponent]]
    O --> P[Replace Target with Layout Container]
    P --> Q[Two Horizontal Components in Container]
    
    E --> R{Expansion Type?}
    R -->|Add to Column| S[Three Vertical Components]
    R -->|Add to Row| T[Three Horizontal Components]
    R -->|Create Mixed| U[Mixed Layout State]
    
    S --> V[Update Drop Zones: All Top/Bottom]
    T --> W[Update Drop Zones: Row Left/Right, Container Top/Bottom]
    U --> X[Context-Dependent Drop Zones]
    
    F --> Y{Complex Operation?}
    Y -->|Extract from Row| Z[Element Extraction Logic]
    Y -->|Dissolve Container| AA[Container Dissolution Logic]
    Y -->|Reorder Elements| BB[Element Reordering Logic]
    
    Z --> CC{Row Size After Extraction?}
    CC -->|Size = 1| DD[Dissolve Row Container]
    CC -->|Size ≥ 2| EE[Preserve Row Container]
    
    DD --> FF[Move Remaining Child to Canvas Level]
    DD --> GG[Delete Empty Container]
    FF --> HH[Two Standalone Components]
    
    EE --> II[Mixed Layout: Standalone + Row]
    
    AA --> JJ[Extract All Children]
    JJ --> KK[Delete Container]
    KK --> LL[Convert to Column Layout]
    
    BB --> MM[Update Array Positions]
    MM --> NN[Maintain Container Structure]
    
    H --> OO[Update Form State]
    M --> OO
    Q --> OO
    V --> OO
    W --> OO
    X --> OO
    HH --> OO
    II --> OO
    LL --> OO
    NN --> OO
    
    OO --> PP[Save State to History]
    PP --> QQ[Trigger Re-render]
    QQ --> RR[Update UI Visually]
```

## Error Handling & Validation Flow

```mermaid
flowchart TD
    A[User Action] --> B[Action Validation Layer]
    B --> C{Action Valid?}
    
    C -->|No| D[Return Validation Error]
    C -->|Yes| E[Execute Business Logic]
    
    E --> F{Business Logic Success?}
    F -->|No| G[Handle Business Logic Error]
    F -->|Yes| H[State Update]
    
    H --> I[ComponentEngine.validateComponent]
    I --> J{Component Valid?}
    
    J -->|No| K[Component Validation Error]
    J -->|Yes| L[FormStateEngine.validateFormState]
    
    L --> M{Form State Valid?}
    
    M -->|No| N[Form State Validation Error]
    M -->|Yes| O[Success Path]
    
    D --> P[Error State Management]
    G --> P
    K --> P
    N --> P
    
    P --> Q[Log Error Details]
    Q --> R[Determine Error Severity]
    R --> S{Error Severity?}
    
    S -->|Critical| T[Rollback to Previous State]
    S -->|Warning| U[Show Warning, Continue]
    S -->|Info| V[Show Info Message]
    
    T --> W[Restore from History]
    W --> X[Notify User of Rollback]
    
    U --> Y[Display Warning Toast]
    V --> Z[Display Info Toast]
    
    O --> AA[Commit State Changes]
    AA --> BB[Update UI Successfully]
    
    X --> CC[Error Recovery Complete]
    Y --> CC
    Z --> CC
    BB --> DD[Operation Complete]
    CC --> DD
```

## Performance Optimization Integration

```mermaid
flowchart TD
    A[Performance-Critical Operation] --> B[usePerformanceMonitor Hook]
    B --> C[Start Performance Tracking]
    
    C --> D{Operation Type?}
    D -->|Large Form Render| E[LazyFormRenderer]
    D -->|Long List Display| F[VirtualizedList]
    D -->|Component Re-render| G[React.memo Optimization]
    
    E --> H[Component Chunking Logic]
    H --> I[Intersection Observer Setup]
    I --> J[Progressive Loading]
    J --> K[Render Only Visible Chunks]
    
    F --> L[Calculate Visible Items]
    L --> M[Render with Virtual Scrolling]
    M --> N[Update Scroll Position]
    
    G --> O[Component Comparison Function]
    O --> P{Props Changed?}
    P -->|No| Q[Skip Re-render]
    P -->|Yes| R[Allow Re-render]
    
    K --> S[Monitor Render Performance]
    N --> S
    Q --> S
    R --> S
    
    S --> T[Collect Performance Metrics]
    T --> U[Memory Usage Check]
    U --> V{Performance Threshold Exceeded?}
    
    V -->|Yes| W[Performance Warning]
    V -->|No| X[Continue Normal Operation]
    
    W --> Y[Suggest Optimizations]
    Y --> Z[Log Performance Issue]
    
    X --> AA[Update Performance Dashboard]
    Z --> AA
    
    AA --> BB[Performance Monitoring Complete]
```

These diagrams show exactly how all the complex systems work together, from the initial user action through the complete business logic flow to the final UI update.