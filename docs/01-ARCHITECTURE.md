# Form Builder Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Form Builder App                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                             │
│  ├─ Template List View                                      │
│  └─ Form Builder View                                       │
│     ├─ Component Palette (left)                            │
│     ├─ Canvas (center)                                      │
│     └─ Properties Panel (right)                            │
├─────────────────────────────────────────────────────────────┤
│  Core Engines (Single Sources of Truth)                    │
│  ├─ ComponentEngine - All component operations             │
│  ├─ FormStateEngine - All state management                 │
│  └─ ComponentRenderer - All rendering logic                │
├─────────────────────────────────────────────────────────────┤
│  Storage                                                    │
│  └─ localStorage - Template storage                        │
└─────────────────────────────────────────────────────────────┘
```

## Core Engines (Single Sources of Truth)

### 1. ComponentEngine (`src/core/ComponentEngine.ts`)
**Purpose**: ALL component operations
- Create components with defaults
- Update component properties  
- Delete components
- Validate components
- Find components in form structure

### 2. FormStateEngine (`src/core/FormStateEngine.ts`) 
**Purpose**: ALL state management
- Execute all state changes via actions
- Manage form pages and components
- Handle undo/redo history
- Validate entire form state

### 3. ComponentRenderer (`src/core/ComponentRenderer.ts`)
**Purpose**: ALL rendering logic  
- Render components in builder mode
- Render components in preview mode
- Handle component-specific rendering logic

## Feature Structure

```
src/
├── core/                    # Core engines (business logic)
├── features/
│   ├── form-builder/        # Main builder interface
│   ├── template-management/ # Save/load templates
│   └── drag-drop/          # Drag-drop operations
├── shared/                 # Reusable components
└── types/                  # TypeScript definitions
```

## Component Types (Left Panel Organization)

**Input Components**: `text_input`, `email_input`, `password_input`, `number_input`, `textarea`, `rich_text`
**Selection Components**: `select`, `multi_select`, `checkbox`, `radio_group`  
**Special Components**: `date_picker`, `file_upload`, `signature`
**Layout Components**: `horizontal_layout`, `vertical_layout`
**UI Components**: `section_divider`, `button`, `heading`, `card`

## State Flow

```
User Action → FormStateEngine → ComponentEngine → UI Update
     ↓
Undo/Redo History ← State Change ← Validation ← Business Logic
```

## Key Technologies

- **React 18** + **TypeScript** - Frontend framework
- **Vite** - Build tool and dev server  
- **React DnD** - Drag and drop functionality
- **Vitest** - Testing framework
- **ESLint** - Code quality
- **CSS Modules** - Styling system

## Performance Features

- **Lazy Loading**: Large forms load in chunks
- **Virtualization**: Handle thousands of components  
- **Memoization**: Prevent unnecessary re-renders
- **Optimized Drag-Drop**: Efficient position calculations

## Export Formats

1. **Template JSON**: Headless form structure for data collection
2. **Schema JSON**: Advanced layout with positioning and styling