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
  - Template list view (`TemplateListView`) 
  - Form builder view with drag-and-drop canvas
- **State Management**: Custom hooks with reducer pattern, undo/redo support via `useFormBuilder`

### Canvas System Architecture
The drag-and-drop canvas uses a modular, rule-based architecture:

**Core Components:**
- `SmartCanvas` (`src/components/Canvas/components/SmartCanvas.tsx`) - Main canvas with drop handling
- `CanvasStateManager` (`src/components/Canvas/core/CanvasStateManager.ts`) - Single source of truth implementing drag-drop rules
- `DragDropRules` - Implements exact JSON specification for drag behavior

**Key Rules Implemented:**
- `source_left_panel` → `create_new_item` → increase canvas collection by 1
- `source_canvas` horizontal: `intent_left/right` → insert left/right (create RowLayout if none)  
- `source_canvas` vertical: `intent_before/after` → insert above/below target
- `rowlayout_rules`: `max_one_row = true`, `dissolve_if_one_left = true`
- `remove_item`: drag out → remove from canvas → update schema

**Canvas Strategy:**
- Uses `react-dnd` with HTML5Backend for drag-and-drop
- Intent-based positioning system (`getDropIntent`)
- Automatic RowLayout management for horizontal arrangements
- Component reordering within canvas

### Component System

**Component Types** (`src/components/types/component.ts`):
```typescript
"text_input" | "email" | "password" | "number_input" | "textarea" | 
"rich_text" | "select" | "multi_select" | "checkbox" | "radio_group" | 
"date_picker" | "file_upload" | "section_divider" | "signature" | 
"horizontal_layout" | "vertical_layout"
```

**Component Properties:**
- Standard props: `id`, `type`, `label`, `placeholder`, `required`, `fieldId`
- Type-specific props: `options[]`, `min/max`, `acceptedFileTypes`, `rows`, `content`
- Layout props: `children[]` for container components

**Property Editing System:**
- `PropertyEditorRegistry` (`src/components/Properties/PropertyEditorRegistry.tsx`) maps component types to editors
- Modular property editors for each component type
- Real-time property updates with change handlers

### Form Builder Hook (`src/hooks/useFormBuilder.ts`)

**Core State Management:**
- Multi-page form support with `FormPage[]` 
- Component operations via specialized operation hooks:
  - `useComponentOperations` - Add, update, delete, move components
  - `useLayoutOperations` - Handle container/layout logic  
  - `usePageOperations` - Manage form pages
- Undo/redo system with 50-action history
- JSON schema export via `SchemaGenerator`

**Key Methods:**
- `addComponent(type, pageId, index?)` - Add component at specific position
- `updateComponent(id, updates)` - Update component properties
- `moveComponent(dragIndex, hoverIndex, pageId)` - Reorder components
- `loadFromJSON(jsonString)` - Import form template

### Schema Generation (`src/services/schemaGenerator.ts`)

**Features:**
- Converts form components to JSON Schema format
- Type-specific schema generation (string, number, boolean, array)
- Validation rules (required fields, format validation, custom patterns)
- Component validation with error messages
- Form instance validation against schema

### Template System

**Template Management:**
- Template storage in localStorage with migration support
- Multi-page template support with `FormPage[]` structure
- Template metadata: `templateId`, `name`, `pages[]`, creation/modification dates
- Export/import via JSON files

## Testing

**Framework**: Vitest with @testing-library/react
**Setup**: `src/test/setup.ts` configures jsdom environment
**Test Types**: 
- Component rendering tests
- Drag-drop behavior tests (`src/test/drag-drop/DragDropBehavior.test.tsx`)
- Hook functionality tests

## Styling System

**CSS Architecture** (see `src/styles/README.md`):
- Modular CSS with custom properties (CSS variables)
- Component-based styling with BEM-like naming
- Responsive design (mobile-first, breakpoints at 768px, 1024px)  
- Design tokens for colors, spacing, typography, shadows
- Drag-and-drop visual feedback states

**Key Style Files:**
- `src/styles/main.css` - Main entry point
- `src/styles/components.css` - Reusable UI components
- `src/styles/layout.css` - Application layout structure

## Key Development Patterns

**Error Handling:**
- Form validation with user-friendly error messages
- Graceful degradation for missing components/pages
- Safe array operations with null checks

**Performance:**
- Memoized computations in hooks (`useMemo`, `useCallback`)
- Efficient drag-drop with position detection
- Lazy loading of property editors

**Type Safety:**
- Strict TypeScript configuration
- Comprehensive interface definitions
- Type guards for component validation

## Important Development Notes

- Always run `npm run lint` before committing - zero warnings policy
- Use existing component creation pattern in `useFormBuilder.ts:createNewComponent()`
- Follow the Canvas state management rules - never directly mutate component arrays
- Property editors must be registered in `PropertyEditorRegistry` 
- New component types require updates to: component types, property editors, schema generator, and component renderer
- Multi-page templates require careful state synchronization between pages
- Drag-drop logic follows strict intent-based rules - consult `CanvasStateManager` before modifications