# Sequence Diagrams - User Interaction Flows

## 🔄 Core User Workflows

This document illustrates the key user interaction flows in the form builder system using sequence diagrams.

## 📊 Sequence Diagrams (Mermaid)

### **1. Form Building - Adding Components from Palette**

```mermaid
sequenceDiagram
    participant U as User
    participant P as SimpleComponentPalette
    participant C as SimpleCanvas
    participant H as useSimpleFormBuilder
    participant S as TemplateService
    participant LS as localStorage

    Note over U,LS: User drags component from palette to canvas

    U->>P: Drag "Text Input" component
    P->>P: Create drag item with componentType
    P->>C: Start drag operation (React DnD)
    
    Note over C: Canvas shows inline preview during drag
    C->>C: Create preview component
    C->>C: Render ghost component at drop position
    
    U->>C: Drop component on canvas
    C->>H: Call addComponent(componentType, index)
    H->>H: Generate unique component ID
    H->>H: Create component with default properties
    H->>H: Update components array in state
    
    Note over H: Auto-save triggered (1-second debounce)
    H->>S: updateTemplate(templateId, templateData)
    S->>LS: Save updated template to localStorage
    
    H-->>C: State update triggers re-render
    C-->>U: New component appears in canvas
```

### **2. Template Management - Saving and Loading**

```mermaid
sequenceDiagram
    participant U as User
    participant FB as SimpleFormBuilder
    participant App as App
    participant H as useSimpleFormBuilder
    participant S as TemplateService
    participant TL as TemplateListView
    participant LS as localStorage

    Note over U,LS: User creates form and saves as template

    U->>FB: Click "💾 Save" button
    FB->>App: Call onSave()
    App->>App: handleSave()
    
    App->>H: Get current state (templateName, components)
    App->>S: saveTemplate(templateData)
    S->>S: Generate unique templateId
    S->>S: Create FormTemplate object
    S->>LS: Store template in localStorage['formTemplates']
    S-->>App: Return saved template
    
    App->>App: Switch to edit mode
    App->>App: Show success modal
    
    Note over U,LS: User later loads the template
    
    U->>TL: Click template card "Edit" button  
    TL->>App: Call onTemplateSelect(template)
    App->>App: handleTemplateSelect()
    
    App->>H: importJSON(templateData)
    H->>H: Parse JSON and update state
    H->>H: Set templateName and components
    H->>H: Set mode to 'edit'
    
    H-->>FB: State change triggers re-render
    FB-->>U: Form builder shows loaded template
```

### **3. Component Reordering Within Canvas**

```mermaid
sequenceDiagram
    participant U as User
    participant DC as SimpleDraggableComponent
    participant C as SimpleCanvas  
    participant H as useSimpleFormBuilder
    participant S as TemplateService
    participant LS as localStorage

    Note over U,LS: User reorders components by dragging within canvas

    U->>DC: Drag existing component (fromIndex: 0)
    DC->>DC: Create drag item with component data
    DC->>C: Start internal drag operation
    
    U->>DC: Drop on target component (toIndex: 2)
    DC->>H: Call moveComponent(fromIndex: 0, toIndex: 2)
    
    H->>H: Remove component from index 0
    H->>H: Insert component at index 2
    H->>H: Update components array
    
    Note over H: Auto-save triggered
    H->>S: updateTemplate(templateId, updatedData)
    S->>LS: Persist reordered components
    
    H-->>C: State update triggers re-render
    C-->>U: Components appear in new order
```

### **4. Form Preview Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant FB as SimpleFormBuilder
    participant App as App
    participant AS as useAppState
    participant PM as PreviewModal
    participant PF as PreviewForm
    participant SR as SimpleRenderer

    Note over U,SR: User previews their form

    U->>FB: Click "👁️ Preview" button
    FB->>App: Call onPreview()
    App->>AS: togglePreview(true)
    AS->>AS: Set showPreview = true
    
    AS-->>App: State change triggers re-render
    App->>PM: Render PreviewModal (isOpen=true)
    PM->>PF: Render PreviewForm with components
    
    PF->>PF: Initialize form data state
    PF->>SR: Render each component
    SR->>SR: Generate interactive form elements
    SR-->>PF: Return rendered components
    PF-->>PM: Display interactive form
    PM-->>U: Show modal with form preview

    Note over U,SR: User interacts with preview form
    
    U->>PF: Fill out form fields
    PF->>PF: Update form data state
    PF->>PF: Run validation on fields
    
    U->>PF: Click "Submit" button
    PF->>PM: Show submission results modal
    
    U->>PM: Click "Close" or X button
    PM->>App: Call onClose()
    App->>AS: togglePreview(false)
    AS-->>App: Hide modal
```

### **5. Template List Management**

```mermaid
sequenceDiagram
    participant U as User
    participant TL as TemplateListView
    participant S as TemplateService
    participant App as App
    participant LS as localStorage

    Note over U,LS: User manages saved templates

    U->>TL: Navigate to template list view
    TL->>S: getAllTemplates()
    S->>LS: Retrieve templates from localStorage['formTemplates']
    S-->>TL: Return template array
    TL->>TL: Render template cards
    TL-->>U: Display template list

    Note over U,LS: Real-time refresh every 2 seconds
    
    loop Every 2 seconds
        TL->>S: getAllTemplates()
        S->>LS: Check for updated templates
        S-->>TL: Return current templates
        TL->>TL: Update display if changed
    end

    Note over U,LS: User edits a template
    
    U->>TL: Click "Edit" on template card
    TL->>App: onTemplateSelect(selectedTemplate)
    App->>App: Load template and switch to builder view
    
    Note over U,LS: User deletes a template
    
    U->>TL: Click "Delete" on template card  
    TL->>TL: Show confirmation dialog
    U->>TL: Confirm deletion
    TL->>S: deleteTemplate(templateId)
    S->>LS: Remove template from localStorage
    S-->>TL: Return success
    TL->>TL: Remove template from display
    TL-->>U: Updated template list
```

### **6. Auto-Save Mechanism**

```mermaid
sequenceDiagram
    participant U as User
    participant H as useSimpleFormBuilder
    participant App as App
    participant S as TemplateService
    participant LS as localStorage

    Note over U,LS: Auto-save triggers on form changes

    U->>H: Make changes (add/edit/delete components)
    H->>H: Update state (components, templateName)
    
    Note over H: useEffect detects state change
    H->>H: Set 1-second timeout
    
    Note over H: If no more changes in 1 second...
    H->>App: Trigger autoSave()
    App->>App: Check if in edit mode
    App->>App: Compare with last saved state
    
    alt Changes detected
        App->>S: updateTemplate(templateId, currentData)
        S->>LS: Save updated template
        S-->>App: Return success
        App->>App: Update lastSaved reference
        
        Note over App: Silent save (no user notification)
    else No changes
        App->>App: Skip save operation
    end
```

### **7. Error Handling Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant App as App
    participant AS as useAppState
    participant EB as ErrorBoundary

    Note over U,EB: Error handling across the application

    U->>C: Perform action (save, load, etc.)
    C->>C: Operation fails
    
    alt Component-level error
        C->>App: Call error callback
        App->>AS: showError(title, message)
        AS->>AS: Set error modal state
        AS-->>App: Trigger error modal display
        App-->>U: Show error modal with message
        
    else Application-level error
        C->>EB: Unhandled error thrown
        EB->>EB: Catch error and log
        EB->>EB: Display fallback UI
        EB-->>U: Show error boundary screen
        
    else localStorage error
        C->>S: saveTemplate() fails
        S->>S: Catch localStorage exception
        S->>App: Return null/error result
        App->>AS: showError("Storage Error", details)
        AS-->>U: Display storage error modal
    end
```

## 🎯 Key Interaction Patterns

### **1. Unidirectional Data Flow**
- All state changes flow down from hooks to components
- User actions flow up through callback props
- No direct component-to-component communication

### **2. Event-Driven Architecture**  
- User interactions trigger state changes
- State changes trigger re-renders
- Side effects (auto-save) triggered by state changes

### **3. Optimistic Updates**
- UI updates immediately on user actions
- Background persistence handles failures gracefully
- Rollback mechanisms for failed operations

### **4. Debounced Operations**
- Auto-save waits 1 second for additional changes
- Search operations debounced for performance
- Batch multiple rapid state updates

### **5. Error Boundaries**
- Component-level error handling with user feedback
- Application-level error boundaries for stability
- Graceful degradation when operations fail

---

*These sequence diagrams illustrate the clean, predictable flow of data and user interactions throughout the simplified form builder architecture.*