---
name: formbuilder-maintainer
description: Maintain, extend, test, and package the Form-Builder workspace and reusable library component.
---

# Form-Builder Workspace Skill

This skill provides guides, commands, and architectural constraints for maintaining and developing the Form-Builder application and library.

---

## 📂 Codebase Reference Directory

- **Reusable Library Component:** [`src/features/form-builder/components/FormBuilder.tsx`](file:///Users/sithuhlaing/Projects/formbuilder/src/features/form-builder/components/FormBuilder.tsx) (self-contained main builder workspace editor).
- **Core Canvas Element:** [`src/app/components/canvas.tsx`](file:///Users/sithuhlaing/Projects/formbuilder/src/app/components/canvas.tsx) (central drag-and-drop workspace container).
- **Interactive File Uploader:** [`src/app/components/renderers/FileUploadRenderer.tsx`](file:///Users/sithuhlaing/Projects/formbuilder/src/app/components/renderers/FileUploadRenderer.tsx) (handles drag-and-drop file inputs, sizes, and cancellations).
- **State Hook:** [`src/hooks/useSimpleFormBuilder.ts`](file:///Users/sithuhlaing/Projects/formbuilder/src/hooks/useSimpleFormBuilder.ts) (manages page arrays, state reducer, and historical stack snapshots).
- **Layout engine:** [`src/core/layoutEngine.ts`](file:///Users/sithuhlaing/Projects/formbuilder/src/core/layoutEngine.ts) (processes layout boundary escapes and column insertions).

---

## 🛠️ CLI Development Commands

- **Start Dev Server:** `npm run dev`
- **Execute Vitest Tests:** `npm run test` (or `npm run test:coverage` for full coverage report)
- **Compile Production Bundle:** `npm run build` (runs `tsc && vite build`)

---

## 📐 Core Architectural Principles

### 1. Selection State (Single Source of Truth)
- Selection must always be derived directly from the active component reference (`selectedComponent?.nodeId`) rather than duplicating it in local `useState` variables in child elements. This avoids selection race conditions and lag.

### 2. Native HTML5 Drag and Drop
- Drag-and-drop interactions must use standard native browser APIs (`draggable`, `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`). Do not introduce external libraries like `react-dnd`.
- *Constraint:* Touch-screen mobile interactions (Safari, mobile Chrome) are not supported by the core browser specification without polyfills. The builder is desktop-scoped.

### 3. Horizontal Row Layouts
- Elements inside row layouts must sit side-by-side using Flexbox layout (`flex-flow: row nowrap`) and horizontal scroll capabilities (`overflow-x: auto`), preventing component wrapping or column squishing on narrow viewports.

### 4. Edit vs Preview Mode Interface Guards
- Renderers of interactive widgets (FileUpload, SignaturePad, DatePicker, DateTimePicker) must receive `previewMode?: boolean` as a prop.
- **In Edit Mode (`previewMode === false`):** Click and drag/drop handlers on interactive widgets must be bypassed to prevent opening file explorer popups, triggering signature drawings, or toggling calendar dropdowns. Cursors should render as `cursor-default` or `cursor-grab`.
- **In Preview Mode (`previewMode === true`):** Custom popup selectors, drawing loops, and file inputs must be fully unlocked for testing user interaction. Cursors should render as `cursor-pointer` or `cursor-crosshair`.

---

## 🧪 Testing Guidelines

- **Test Location:** All unit and integration test files must reside strictly under the [`src/__tests__/`](file:///Users/sithuhlaing/Projects/formbuilder/src/__tests__/) directory.
- **Coverage standard:** Maintain at least **95%** statement coverage. Run `npm run test:coverage` to confirm metrics.

