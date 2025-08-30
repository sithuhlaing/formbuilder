# Form Wizard Pagination Business Logic Documentation

## Overview

The Form Builder now supports multi-page wizard functionality, allowing users to create complex forms that span multiple pages with intuitive navigation controls. This document outlines the complete business logic, architecture, and implementation details.

## Core Business Requirements

### 1. Multi-Page Form Creation
- Users can create forms with multiple pages (wizard-style)
- Each page represents a logical section of the form
- Pages can contain any combination of form components
- Drag-and-drop functionality works seamlessly across all pages

### 2. Page Navigation
- **Previous Button**: Navigate to the previous page (disabled on first page)
- **Next Button**: Navigate to the next page (hidden on last page)
- **Submit Button**: Only appears on the final page for form submission
- **Add Page Button**: Create new pages dynamically

### 3. Page Management
- **Page Titles**: Each page has an editable title
- **Progress Indicator**: Shows current page position (e.g., "Page 2 of 5")
- **Visual Progress Bar**: Displays completion percentage
- **Page Validation**: Ensures pages have content before submission

## Architecture Components

### 1. FormWizardNavigation Component

**Purpose**: Handles all wizard navigation UI and controls

**Key Features**:
- Page title display and editing
- Progress indicator with visual progress bar
- Navigation buttons (Previous, Next, Submit, Add Page)
- Conditional button rendering based on page position
- Proper disabled states for navigation controls

**Props Interface**:
```typescript
interface FormWizardNavigationProps {
  currentPageIndex: number;
  totalPages: number;
  currentPageTitle: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSubmit: () => void;
  onAddPage: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastPage: boolean;
}
```

### 2. FormStateEngine Updates

**New Actions Added**:
- `UPDATE_PAGE_TITLE`: Updates the title of a specific page
- Enhanced `ADD_PAGE`: Creates new pages with proper initialization
- Enhanced `SWITCH_PAGE`: Handles page navigation state changes

**Business Logic**:
```typescript
case 'UPDATE_PAGE_TITLE':
  return this.updatePageTitle(currentState, action.payload);

private static updatePageTitle(state: any, payload: { pageId: string; title: string }) {
  const updatedPages = state.pages.map((page: FormPage) => {
    if (page.id === payload.pageId) {
      return { ...page, title: payload.title };
    }
    return page;
  });
  
  return { ...state, pages: updatedPages };
}
```

### 3. useFormBuilder Hook Enhancements

**New Functions Added**:
- `getCurrentPageIndex()`: Returns current page index for navigation
- `navigateToNextPage()`: Moves to next page with validation
- `navigateToPreviousPage()`: Moves to previous page
- `addNewPage()`: Creates new wizard page
- `updatePageTitle()`: Updates page title
- `handleFormSubmit()`: Validates and submits complete form

**Navigation Logic**:
```typescript
const navigateToNextPage = useCallback(() => {
  const currentIndex = getCurrentPageIndex();
  if (currentIndex < formState.pages.length - 1) {
    const nextPage = formState.pages[currentIndex + 1];
    executeAction({
      type: 'SWITCH_PAGE',
      payload: { pageId: nextPage.id }
    });
  }
}, [getCurrentPageIndex, formState.pages, executeAction]);
```

**Form Submission Logic**:
```typescript
const handleFormSubmit = useCallback(() => {
  // Validate all pages before submission
  const hasEmptyPages = formState.pages.some(page => page.components.length === 0);
  
  if (hasEmptyPages) {
    console.warn('Some pages are empty. Please add components to all pages before submitting.');
    return false;
  }

  // Create submission data
  const submissionData = {
    templateName: formState.templateName,
    pages: formState.pages,
    submittedAt: new Date().toISOString(),
    totalPages: formState.pages.length,
    totalComponents: formState.pages.reduce((total, page) => total + page.components.length, 0)
  };

  console.log('Form submitted:', submissionData);
  return true;
}, [formState]);
```

## User Workflow

### 1. Form Creation Workflow
1. User starts with Page 1 (default)
2. Drags components from palette to canvas
3. Edits page title by clicking on title input
4. Clicks "Add Page" to create additional pages
5. Navigates between pages using Previous/Next buttons
6. Repeats component addition on each page
7. Submits form from the final page

### 2. Navigation Rules
- **First Page**: Previous button is disabled
- **Middle Pages**: Both Previous and Next buttons are enabled
- **Last Page**: Next button is hidden, Submit button appears
- **Any Page**: Add Page button is always available

### 3. Validation Rules
- Pages can be empty during creation (no blocking validation)
- Form submission validates that at least one page has components
- Page titles are optional but recommended for better UX
- Navigation is always allowed regardless of page content

## Technical Implementation Details

### 1. State Management
- **Current Page Tracking**: `formState.currentPageId` tracks active page
- **Page Collection**: `formState.pages` array contains all pages
- **Component Isolation**: Each page maintains its own `components` array
- **Selection State**: `selectedComponentId` is page-independent

### 2. Component Integration
- **Canvas Component**: Updated to work with current page components
- **ComponentPalette**: Works seamlessly across all pages
- **Drag-Drop System**: Maintains functionality on all pages
- **Properties Panel**: Shows selected component regardless of page

### 3. Visual Design
- **Progress Bar**: Shows completion percentage with smooth transitions
- **Button States**: Clear visual feedback for enabled/disabled states
- **Page Titles**: Inline editing with focus states
- **Layout**: Responsive design that works on different screen sizes

## CSS Styling Architecture

### 1. Wizard Navigation Styles
```css
.form-wizard-navigation {
  background: white;
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  transition: width var(--transition-normal);
}
```

### 2. Button Styling System
- **Primary**: Next button (blue background)
- **Secondary**: Previous button (gray background)
- **Success**: Submit button (green background)
- **Outline**: Add Page button (transparent with border)

## Testing Strategy

### 1. Unit Tests Coverage
- Page navigation functionality
- Button state management
- Progress indicator calculations
- Form submission validation
- Page title editing
- Drag-drop integration across pages

### 2. Integration Tests
- Complete wizard workflow
- Multi-page form creation
- Navigation between pages with components
- Form submission with validation
- Error handling for edge cases

### 3. Test Data Structures
```typescript
const mockFormBuilderReturn = {
  formState: {
    pages: [
      { id: 'page1', title: 'Personal Information', components: [], layout: {} },
      { id: 'page2', title: 'Contact Details', components: [], layout: {} },
      { id: 'page3', title: 'Preferences', components: [], layout: {} }
    ],
    currentPageId: 'page1',
    selectedComponentId: null,
    templateName: 'Multi-Page Form',
    templateId: null
  }
};
```

## Performance Considerations

### 1. State Optimization
- Only current page components are rendered
- Lazy loading of page content
- Efficient state updates using callbacks
- Minimal re-renders during navigation

### 2. Memory Management
- Components are preserved when switching pages
- Form state history is limited to 50 entries
- Proper cleanup of event listeners
- Optimized CSS transitions

## Future Enhancements

### 1. Advanced Features
- **Conditional Logic**: Show/hide pages based on form responses
- **Page Templates**: Pre-built page layouts for common use cases
- **Branching Logic**: Dynamic page flow based on user inputs
- **Save & Resume**: Allow users to save progress and continue later

### 2. Accessibility Improvements
- **Keyboard Navigation**: Full keyboard support for wizard controls
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Focus Management**: Logical focus flow during navigation
- **High Contrast**: Support for high contrast themes

### 3. Mobile Optimization
- **Touch Gestures**: Swipe navigation between pages
- **Responsive Design**: Optimized layout for mobile devices
- **Touch Targets**: Larger buttons for touch interaction
- **Progressive Enhancement**: Works on all device types

## Error Handling

### 1. Navigation Errors
- Prevent navigation to non-existent pages
- Handle invalid page IDs gracefully
- Maintain state consistency during errors
- Provide user feedback for failed operations

### 2. Validation Errors
- Clear error messages for empty forms
- Visual indicators for validation failures
- Non-blocking validation during creation
- Helpful guidance for form completion

### 3. State Recovery
- Automatic recovery from corrupted state
- Fallback to default page structure
- Preserve user data when possible
- Graceful degradation of functionality

## API Integration Points

### 1. Form Submission
```typescript
interface FormSubmissionData {
  templateName: string;
  pages: FormPage[];
  submittedAt: string;
  totalPages: number;
  totalComponents: number;
}
```

### 2. Template Management
- Save multi-page forms as templates
- Load existing templates with page structure
- Export/import wizard configurations
- Version control for template changes

This documentation provides a comprehensive overview of the form wizard pagination business logic, covering all aspects from user requirements to technical implementation details.
