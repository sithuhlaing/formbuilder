# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (Vite on port 5173)
- `npm run build` - Production build with TypeScript compilation
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview production build
- `npm test` - Run Vitest test suite

### GitHub Pages Deployment  
- `npm run build:github` - Production build for GitHub Pages
- `npm run deploy` - Build and deploy to GitHub Pages via gh-pages

### Testing Commands
- `npm test` - Run all tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- --ui` - Run tests with Vitest UI

## Architecture Overview

### Main Application Structure
- **Entry Point**: `src/main.tsx` renders `App.tsx` in React StrictMode
- **App Component**: `src/App.tsx` manages two main views:
  - Template list view (built-in, no separate component)
  - Form builder view with drag-and-drop canvas
- **Architecture**: Feature-based with Single Sources of Truth pattern

### Feature-Based Architecture
The application uses a clean feature-based structure with convergent architecture:

**Core Engines (Single Sources of Truth):**
- `ComponentEngine` (`src/core/ComponentEngine.ts`) - ALL component operations (CRUD, validation)
- `FormStateEngine` (`src/core/FormStateEngine.ts`) - ALL state management (actions, queries, validation)  
- `ComponentRenderer` (`src/core/ComponentRenderer.ts`) - ALL rendering logic (builder mode, preview mode)

**Feature Modules:**
- `src/features/form-builder/` - Canvas, ComponentPalette, PropertiesPanel, useFormBuilder hook
- `src/features/template-management/` - Template saving/loading services
- `src/features/drag-drop/` - DragDropService for drop operations
- `src/shared/` - Reusable components and utilities

### Drag-and-Drop System
The drag-and-drop system uses:

**Core Components:**
- `Canvas` (`src/features/form-builder/components/Canvas.tsx`) - Main canvas with React DnD drop handling
- `DragDropService` (`src/features/drag-drop/services/DragDropService.ts`) - Handles all drop operations
- React DnD with HTML5Backend for drag-and-drop functionality

**Drop Operations:**
- `before` - Insert component before target
- `after` - Insert component after target  
- `left/right` - Create horizontal layout with components side-by-side
- `inside` - Insert into container components

### Component System

**Component Types** (`src/types/component.ts`):
```typescript
"text_input" | "email_input" | "password_input" | "number_input" | "textarea" | 
"rich_text" | "select" | "multi_select" | "checkbox" | "radio_group" | 
"date_picker" | "file_upload" | "section_divider" | "signature" | 
"horizontal_layout" | "vertical_layout"
```

**Component Properties:**
- Standard props: `id`, `type`, `label`, `placeholder`, `required`, `fieldId`
- Type-specific props: `options[]`, `min/max`, `acceptedFileTypes`, `rows`
- Layout props: `children[]` for container components

**Component Operations:**
- All component operations handled by `ComponentEngine` (single source of truth)
- Create, update, delete, validate, and find operations
- Type-specific default values and validation rules

### Form Builder Hook (`src/features/form-builder/hooks/useFormBuilder.ts`)

**Core State Management:**
- Multi-page form support with `FormPage[]` 
- State management via `FormStateEngine` actions
- Undo/redo system with history tracking (50-action limit)
- JSON import/export functionality
**Key Methods:**
- `addComponent(type)` - Add component to current page
- `updateComponent(id, updates)` - Update component properties  
- `deleteComponent(id)` - Remove component
- `selectComponent(id)` - Select component for editing
- `handleDrop(type, targetId, position)` - Handle drag-drop operations
- `undo()` / `redo()` - Undo/redo functionality
- `clearAll()` - Clear all components
- `loadFromJSON(jsonString)` - Import form template

### Export System

**Two Export Types:**
1. **Export JSON** - Template layout JSON (headless JSON schema for form data)
   - Contains: `templateName`, `pages[]` with components
   - Used for: Form data structure and validation
   - Filename: `{template_name}_template.json`

2. **Export Schema** - Advanced layout schema with positioning/styling  
   - Contains: Template data + metadata, layout config, styling theme
   - Used for: Advanced form rendering with layout and styling
   - Filename: `{template_name}_schema.json`

### Template Management

**Template Storage:**
- Handled by `templateService` (`src/features/template-management/services/templateService.ts`)
- localStorage-based storage
- Template metadata with creation/modification dates

## Testing

**Framework**: Vitest with @testing-library/react
**Test Structure**: 
- `src/__tests__/convergent-architecture.test.tsx` - Tests for core engines (ComponentEngine, FormStateEngine, ComponentRenderer)
- `src/__tests__/business-logic.test.tsx` - Comprehensive business logic tests covering user workflows
- Component-specific tests in feature folders

**Key Test Categories:**
- Core engine functionality (CRUD operations, state management, rendering)
- Business logic workflows (form building, undo/redo, JSON import/export)
- Drag-drop operations and positioning
- Form validation and error handling
- End-to-end user scenarios

## Styling System

**CSS Architecture**:
- Modular CSS with feature-based organization
- Component-based styling with clean naming conventions
- Responsive design for desktop and mobile
- Drag-and-drop visual feedback states

**Key Style Files:**
- `src/styles/main.css` - Main entry point with imports
- `src/styles/components.css` - Reusable UI component styles
- `src/styles/drag-drop.css` - Drag-and-drop specific styles  
- `src/styles/features/form-builder.css` - Form builder feature styles

## Key Development Patterns

**Single Sources of Truth:**
- `ComponentEngine` - ALL component operations (create, update, delete, validate, find)
- `FormStateEngine` - ALL state management (actions, reducers, queries)  
- `ComponentRenderer` - ALL rendering logic (builder and preview modes)

**Error Handling:**
- Form validation with user-friendly error messages
- Graceful degradation for missing components
- JSON import/export error handling

**Performance:**
- React DnD for efficient drag-drop operations
- Undo/redo with optimized history management
- Clean feature separation for better code splitting

**Type Safety:**
- Strict TypeScript configuration  
- Comprehensive interface definitions in `src/types/component.ts`
- Type-safe action system in FormStateEngine

## Important Development Notes

- Always run `npm run lint` before committing - zero warnings policy
- Use `ComponentEngine.createComponent(type)` for creating new components
- All state changes must go through `FormStateEngine.executeAction()`
- New component types require updates to: `ComponentEngine` creation logic, type definitions, and rendering logic
- Drag-drop operations handled by `DragDropService` with clear position types
- Undo/redo automatically tracks all FormStateEngine actions
- JSON export supports both template layout and advanced schema formats