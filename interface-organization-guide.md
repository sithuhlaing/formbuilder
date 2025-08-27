# TypeScript Interface Organization Guide

## 🏆 Recommended Approach: Domain-Driven Distribution

### 📁 Ideal File Structure

```
src/
├── types/
│   ├── index.ts                 // Central re-export hub
│   ├── core.ts                  // App-wide shared types
│   └── api.ts                   // API/service types
├── features/
│   ├── canvas/
│   │   ├── types.ts            // Canvas domain types
│   │   ├── components/
│   │   └── hooks/
│   ├── palette/
│   │   ├── types.ts            // Palette domain types
│   │   └── components/
│   └── shared/
│       └── types.ts            // Cross-feature shared types
```

## 🎯 Organization Rules

### ✅ **Keep Local (Component-Level)**
- Component Props interfaces
- Component-specific state types
- Internal event handler types
- Local utility types

```typescript
// ✅ Good - Keep in component file
interface AccordionItemProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ ... }) => {
  // Component implementation
};
```

### 🏠 **Keep in Domain Types (Feature-Level)**
- Business logic interfaces
- Domain-specific data models
- Feature-specific configurations
- Cross-component types within the feature

```typescript
// ✅ Good - Keep in feature/types.ts
export interface CanvasActions {
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

export interface DragItem {
  type: ComponentType;
  id?: string;
  index?: number;
}
```

### 🌐 **Keep in Core Types (App-Level)**
- Core domain entities (FormComponentData, ComponentType)
- Cross-feature shared types
- API response/request types
- Global configuration types

```typescript
// ✅ Good - Keep in types/core.ts
export type ComponentType = 
  | 'text_input'
  | 'number_input'
  | 'select'
  // ... other types

export interface FormComponentData {
  id: string;
  type: ComponentType;
  label?: string;
  // ... other properties
}
```

## 🔄 Import Strategy

### Central Re-export Hub (types/index.ts)
```typescript
// Re-export all domain types
export * from './core';
export * from './api';
export * from '../features/canvas/types';
export * from '../features/palette/types';
export * from '../features/shared/types';
```

### Clean Imports in Components
```typescript
// ✅ Clean imports
import type { ComponentType, FormComponentData } from '@/types';
import type { CanvasActions, DragItem } from '@/features/canvas/types';
```

## 📊 Comparison Matrix

| Aspect | Domain Distribution | Single File | Component-Level Only |
|--------|-------------------|-------------|---------------------|
| **Readability** | 🟢 Excellent | 🟡 Poor (large files) | 🟡 Hard to find |
| **Maintainability** | 🟢 Excellent | 🔴 Poor (conflicts) | 🟡 Scattered |
| **Discoverability** | 🟢 Easy to find | 🟡 Search required | 🔴 Very difficult |
| **Performance** | 🟢 Fast compilation | 🟡 Slow on large files | 🟢 Fast |
| **Team Collaboration** | 🟢 No conflicts | 🔴 Many conflicts | 🟢 No conflicts |
| **Refactoring** | 🟢 Easy to move | 🔴 Affects everything | 🟡 Find & replace |

## 🛠️ Migration Strategy

If you want to reorganize your current interfaces:

### Step 1: Create Domain Type Files
```bash
mkdir -p src/features/canvas/types
mkdir -p src/features/palette/types
mkdir -p src/features/shared/types
```

### Step 2: Move Domain-Specific Types
- Move Canvas-related interfaces to `features/canvas/types.ts`
- Move Palette-related interfaces to `features/palette/types.ts`
- Keep core types in `types/core.ts`

### Step 3: Update Central Index
```typescript
// types/index.ts
export * from './core';
export * from '../features/canvas/types';
export * from '../features/palette/types';
```

### Step 4: Update Imports Gradually
Replace direct imports with centralized ones:
```typescript
// Before
import { CanvasActions } from '../Canvas/types';

// After  
import type { CanvasActions } from '@/types';
```

## 💡 Pro Tips

1. **Use Path Aliases** - Set up `@/types` aliases for cleaner imports
2. **Export Strategy** - Always re-export from central index
3. **Naming Conventions** - Use descriptive names with domain prefix when needed
4. **Documentation** - Add JSDoc comments for complex interfaces
5. **Regular Cleanup** - Remove unused interfaces regularly

## 🎯 Current State Assessment

Your project is already well-organized with domain-specific type files! The current structure is actually following best practices:

✅ `components/Canvas/types.ts` - Canvas-specific types  
✅ `components/ComponentPalette/types.ts` - Palette-specific types  
✅ `types.ts` - Core application types  

**Recommendation: Keep your current structure! It's already optimal.** 🏆