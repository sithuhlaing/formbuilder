# Optimized Clean Structure

**Based on real-world searchability and maintainability analysis**

## Core Principle: "Single Sources of Truth + Clear Feature Boundaries"

```
src/
├── core/                           # 🎯 ALL core business logic engines
│   ├── ComponentEngine.ts          # ALL component operations (create, update, validate)
│   ├── FormStateEngine.ts          # ALL state management (actions, reducers, queries)  
│   ├── ComponentRenderer.ts        # ALL rendering logic (builder, preview modes)
│   └── index.ts                    # Clean exports
├── features/                       # 🎯 Feature-based organization
│   ├── form-builder/              # Form building feature
│   │   ├── components/            # Canvas.tsx, ComponentPalette.tsx, PropertiesPanel.tsx
│   │   ├── hooks/                 # useFormBuilder.ts
│   │   └── index.ts              # Clean exports
│   ├── template-management/       # Template CRUD feature  
│   │   ├── services/             # templateService.ts
│   │   └── index.ts             # Clean exports
│   └── drag-drop/               # Drag-drop behavior feature
│       ├── services/            # DragDropService.ts
│       └── index.ts            # Clean exports
├── shared/                        # 🎯 ONLY truly shared utilities
│   ├── components/               # Button.tsx, Input.tsx (reusable UI)
│   ├── types/                   # Shared type definitions
│   ├── utils/                   # generateId, classNames, debounce
│   └── index.ts                # Clean exports
├── styles/                       # 🎯 Clean CSS organization
│   ├── features/               # Feature-specific styles
│   │   ├── form-builder.css   
│   │   └── template-management.css
│   ├── components.css         # Shared component styles
│   ├── variables.css          # Design tokens
│   └── main.css              # Entry point
├── types/                       # 🎯 Global type definitions
│   ├── component.ts           # Component interfaces  
│   ├── app.ts                # App-level types
│   └── index.ts              # Clean exports
├── __tests__/                  # 🎯 Test organization
│   ├── convergent-architecture.test.tsx  # Core engine tests
│   ├── features/             # Feature-specific tests
│   └── setup.ts             # Test configuration
├── assets/                    # 🎯 Static assets
│   └── react.svg
├── App.tsx                   # 🎯 Main app component
├── main.tsx                 # 🎯 Entry point
└── vite-env.d.ts           # 🎯 Type definitions
```

## Why This Structure is Superior

### ⚡ **Faster Code Search**
- **"Where's component creation logic?"** → `core/ComponentEngine.ts` (always)
- **"Where's state management?"** → `core/FormStateEngine.ts` (always)  
- **"Where's Canvas component?"** → `features/form-builder/components/Canvas.tsx`
- **"Where's template saving?"** → `features/template-management/services/templateService.ts`

### 🧠 **Clear Mental Model**
- `core/` = Single sources of truth for business logic
- `features/` = Feature-specific UI and behavior
- `shared/` = Truly reusable utilities and components

### 🔧 **Easy Maintenance**
- Add component operation → Extend `ComponentEngine` 
- Add state action → Extend `FormStateEngine`
- Add new feature → Create `features/new-feature/`
- Need shared utility → Add to `shared/utils/`

### 🚫 **Avoids Common Problems**
- ❌ No confusing `components/components/components` nesting
- ❌ No mixing of UI components with business components  
- ❌ No scattered state management across multiple folders
- ❌ No deep folder hierarchies for simple files

## Development Guidelines

### Single Sources of Truth
- **ComponentEngine**: ALL component operations (CRUD, validation)
- **FormStateEngine**: ALL state management (actions, queries, validation)  
- **ComponentRenderer**: ALL rendering logic (builder mode, preview mode)

### Feature Organization  
- Each feature is self-contained in `features/[feature-name]/`
- Features export clean interfaces via `index.ts`
- Features can depend on `core/` and `shared/` but not other features

### Shared Resources
- Only put truly reusable code in `shared/`
- Prefer composition over deep inheritance
- Keep shared components simple and focused

This structure optimizes for **developer productivity**, **code searchability**, and **long-term maintainability** based on real-world usage patterns.