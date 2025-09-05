# Template Management Business Logic

This document outlines the complete business logic for template management in the Form Builder application.

## Overview

The Form Builder application has two main operational modes for templates:
- **Create Mode**: Always creates new templates on save
- **Edit Mode**: Updates existing templates on save

## Business Logic Flow

### 1. Template List Page → Create New Template

**User Action**: Click "Create New Form" button

**System Behavior**:
```typescript
// 1. Clear all form state
clearAll() → {
  components: [],
  selectedId: null,
  templateName: 'Untitled Form',
  history: [],
  historyIndex: -1,
  previewMode: false,
  mode: 'create',              // ← KEY: Set to create mode
  editingTemplateId: undefined // ← No template being edited
}

// 2. Navigate to builder
actions.setView('builder')
```

**Result**: Builder opens with completely fresh state in CREATE mode.

### 2. Create Mode - Save Behavior

**User Action**: Click "Save" button while in create mode (first time)

**System Behavior**:
```typescript
// mode === 'create' → Creates new template and switches to edit mode
const newTemplate = templateService.saveTemplate({
  name: templateName || 'Untitled Form',
  pages: [{ id: 'page-1', title: 'Page 1', components: components }]
});

// Generate new templateId: `template_${Date.now()}`
// Add to localStorage templates array
// 🔑 KEY: Switch to edit mode for the newly created template
setEditMode(newTemplate.templateId);
// Show success: "Template Created"
```

**Critical Business Rule**: 
- ✅ **First save creates NEW template AND switches to edit mode**
- ✅ **Automatic mode switching** - from create → edit after first save
- ✅ **Subsequent saves update the SAME template** (edit mode)

### 3. Template List Page → Edit Existing Template

**User Action**: Click "Edit" or "Open Template" on existing template

**System Behavior**:
```typescript
// 1. Load template data into form builder
loadJSONData(JSON.stringify({
  templateName: template.name,
  components: template.pages[0].components
}));

// 2. Set edit mode with template ID
setEditMode(template.templateId) → {
  mode: 'edit',                    // ← KEY: Set to edit mode
  editingTemplateId: template.templateId // ← Track which template
}

// 3. Navigate to builder
actions.setView('builder')
```

**Result**: Builder opens with loaded template data in EDIT mode.

### 4. Edit Mode - Save Behavior

**User Action**: Click "Save" button while in edit mode (after first save or when editing existing)

**System Behavior**:
```typescript
// mode === 'edit' && editingTemplateId exists → Update existing template
const updatedTemplate = templateService.updateTemplate(editingTemplateId, {
  name: templateName || 'Untitled Form',
  pages: [{ id: 'page-1', title: 'Page 1', components: components }]
});

// Updates existing template in localStorage
// Updates modifiedDate timestamp
// Stays in edit mode
// Show success: "Template Updated"
```

**Critical Business Rule**:
- ✅ **Updates the SAME template** (identified by editingTemplateId)
- ✅ **Does NOT create new templates**
- ✅ **Preserves original templateId and createdDate**
- ✅ **All subsequent saves update the same template**

## State Management

### FormState Interface
```typescript
interface FormState {
  components: Component[];       // Form components
  selectedId: string | null;    // Selected component
  templateName: string;         // Template name
  history: FormState[];         // Undo/redo history
  historyIndex: number;         // History position
  previewMode?: boolean;        // Preview state
  mode: 'create' | 'edit';     // 🔑 OPERATION MODE
  editingTemplateId?: string;   // 🔑 TEMPLATE BEING EDITED
}
```

### Mode Transitions

| From State | User Action | To State | Business Logic |
|------------|-------------|----------|----------------|
| **Any** | "Create New Form" | `mode: 'create'`<br/>`editingTemplateId: undefined` | Fresh slate for new template |
| **Any** | "Edit Template" | `mode: 'edit'`<br/>`editingTemplateId: 'template_123'` | Load template, all saves update existing |
| **Create** | "Save" (1st time) | `mode: 'edit'`<br/>`editingTemplateId: newTemplate.id` | Creates new template, switches to edit mode |
| **Edit** | "Save" (any time) | `mode: 'edit'` (unchanged) | Updates existing template, stays in edit mode |

## Save Operation Logic

```typescript
const handleSave = () => {
  const templateData = {
    name: templateName || 'Untitled Form',
    pages: [{ id: 'page-1', title: 'Page 1', components: components }]
  };

  if (mode === 'edit' && editingTemplateId) {
    // EDIT MODE: Update existing template
    const updatedTemplate = templateService.updateTemplate(editingTemplateId, templateData);
    showSuccess('Template Updated', `Template "${updatedTemplate.name}" updated`);
  } else {
    // CREATE MODE: Create new template and switch to edit mode
    const newTemplate = templateService.saveTemplate(templateData);
    setEditMode(newTemplate.templateId); // 🔑 Switch to edit mode
    showSuccess('Template Created', `New template "${newTemplate.name}" created`);
  }
};
```

## User Experience Scenarios

### Scenario 1: Creating New Template with Multiple Saves
```
1. User: "Create New Form" → System: CREATE mode, fresh state
2. User: Add components, change name to "Survey 1"
3. User: "Save" (1st time) → System: Creates "Survey 1" template, SWITCHES to EDIT mode
4. User: Add more components, modify existing ones  
5. User: "Save" (2nd time) → System: Updates SAME "Survey 1" template (edit mode)
6. User: "Save" (3rd time) → System: Updates SAME "Survey 1" template again
7. Result: One template "Survey 1" with all changes saved
```

### Scenario 2: Editing Existing Template
```
1. User: Click "Edit" on "Survey 1" → System: EDIT mode, loads "Survey 1" data
2. User: Modify components, change name to "Updated Survey 1"
3. User: "Save" → System: Updates existing "Survey 1" template
4. User: "Save" again → System: Updates same template again (no duplicates)
5. Result: "Survey 1" template is updated, no new templates created
```

### Scenario 3: Mode Switching
```
1. User: "Create New Form" → CREATE mode
2. User: "Back to Templates" → Return to list
3. User: "Edit" existing template → EDIT mode  
4. User: "Back to Templates" → Return to list
5. User: "Create New Form" → CREATE mode (fresh state)
```

## Error Handling

### Template Save Failures
- **Create Mode**: Show "Failed to create template" error
- **Edit Mode**: Show "Failed to update template" error
- **Recovery**: Allow user to retry save operation

### Invalid Template Data
- **Missing Components**: Save with empty components array
- **Invalid Template Name**: Use "Untitled Form" as fallback
- **Corrupted Data**: Clear localStorage and start fresh

### Mode Inconsistencies
- **Edit mode without templateId**: Fallback to create mode
- **Template not found**: Show error, switch to create mode
- **Storage failures**: Show error, maintain current state

## Implementation Files

### Core Files
- `src/hooks/useSimpleFormBuilder.ts` - State management and mode logic
- `src/App.tsx` - Save handlers and mode transitions
- `src/features/template-management/services/templateService.ts` - Template CRUD operations

### Key Functions
- `clearAll()` - Reset to create mode with fresh state
- `setEditMode(templateId)` - Switch to edit mode for specific template  
- `setCreateMode()` - Switch to create mode
- `handleSave()` - Mode-aware save logic
- `handleTemplateSelect()` - Load template and set edit mode

## Testing Scenarios

### Must Test
1. **Create → Save → Save**: Should create 1 template, then update same template
2. **Edit → Save → Save**: Should update same template twice  
3. **Create → Back → Create**: Should start fresh both times
4. **Edit → Back → Edit Different**: Should load correct template data
5. **Create → Back → Edit**: Should switch modes correctly

### Edge Cases
1. Save with empty template name
2. Save with no components
3. Edit non-existent template
4. Browser refresh during editing
5. localStorage corruption

## Business Rules Summary

| Rule | Description | Implementation |
|------|-------------|----------------|
| **Create Mode Always Creates** | Every save in create mode generates new template | `templateService.saveTemplate()` |
| **Edit Mode Always Updates** | Every save in edit mode updates same template | `templateService.updateTemplate()` |
| **No Automatic Mode Switch** | Mode only changes via explicit user actions | Manual `setEditMode()`/`setCreateMode()` |
| **Fresh State on Create** | "Create New" always starts with empty form | `clearAll()` resets everything |
| **Template Loading on Edit** | "Edit" loads complete template state | `loadJSONData()` + `setEditMode()` |

This business logic ensures predictable, user-friendly template management with clear separation between creating new templates and editing existing ones.