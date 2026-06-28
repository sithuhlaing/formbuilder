---
name: formbuilder-logic
description: Guides development and modifications to the Form Builder, detailing its Hierarchical Tree Model schema, Interval-Based Spatial Partition coordinate math, DND constraints, and test patterns.
---

# Form Builder Logic Skill Guide

This skill guides the design, development, and testing of the Drag-and-Drop Form Builder layout engine. Use it when implementing new builder features, customizing canvas reordering, adding spatial drop zones, or writing tests.

---

## 1. Core Schema Engine Architecture

The state mutation layer is implemented as a pure, immutable engine in [schemaEngine.ts](file:///Users/sithuhlaing/Projects/NovaTheme/src/core/schemaEngine.ts).

### 1.1 Pure State Transition Functions

```typescript
export interface BaseComponent {
  id: string;
  type: string;
  label: string;
  isTopLevel: boolean;
  options?: ChoiceOption[];
  [key: string]: any;
}

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface HLayout {
  id: string;
  type: 'row';
  isTopLevel: boolean;
  columns: Array<{ fields: BaseComponent[] }>;
}

export type ComponentNode = BaseComponent | HLayout;
export type Schema = ComponentNode[];

/**
 * Handles External Drag (instantiation from toolbox).
 */
export function handleExternalDrop(
  schema: Schema,
  targetParentId: string | 'root',
  targetIndex: number,
  type: string,
  options?: { label?: string; position?: 'left' | 'right'; targetColumnIndex?: number }
): Schema;

/**
 * Handles Internal Drag (reordering existing canvas nodes).
 */
export function handleInternalDrop(
  schema: Schema,
  nodeId: string,
  targetParentId: string | 'root',
  targetIndex: number,
  options?: { position?: 'left' | 'right'; targetColumnIndex?: number }
): Schema;

export function addOption(schema: Schema, id: string): Schema;
export function updateOption(schema: Schema, id: string, optionIndex: number, key: 'label' | 'value', newValue: string): Schema;
export function removeOption(schema: Schema, id: string, optionIndex: number): Schema;
```

### 1.2 Extraction and Reordering Index Shift
During an internal drag reorder within the same parent array, the insertion index must shift:
* If the item is dragged from a lower index to a higher index (`draggedIndex < targetIndex`), the targetIndex is decremented by 1 (`targetIndex--`) prior to splicing back into the extracted array to preserve visual relative positions.

---

## 2. Layout & Spatial Drop-Zone Logic

Continuous viewport coordinates are partitioned into discrete drop zones:

### 2.1 Spatial Evaluation Matrix
Every component on the canvas acts as a drop target divided into four spatial zones: Top, Bottom, Left, and Right.

* **Top / Bottom Drop (Vertical Logic)**:
  * Calculated as midpoints between adjacent canvas items: $\text{midpoint} = (A.\text{bottom} + B.\text{top}) / 2$.
  * Visual separation lines (e.g. `insert-between-i-j`) are rendered at the dropzone level.
  * Padding zones (outer 10% vertical margins) map directly to index `0` (topmost) and `array.length` (bottommost) edge drop zones.
* **Left / Right Drop (Horizontal Logic)**:
  * Target is standalone `BaseComponent`: Instantiates a new `HLayout` row wrapper, wrapping target and payload side-by-side (`columns: [[payload, target]]` if left; `[[target, payload]]` if right).
  * Target is inside `HLayout`: Splices payload into target's parent row container at index $J$ (left) or $J+1$ (right) relative to target's position.
* **Nested Spatial Resolution (Top/Bottom escape)**:
  * Hovering over the top 25% or bottom 25% of a nested component inside an `H-Layout` resolves to a root-level `BETWEEN` command above or below the parent `H-Layout` container, and highlights the parent `.horizontal-layout` container directly.
* **Scroll Offsets**: Add `scrollLeft` / `scrollTop` of scrollable containers to coordinate inputs to keep pointer math accurate when scrolled.

---

## 3. Mandatory Architectural Constraints

1. **Depth-Cap Guard (Non-Recursive Containment)**:
   * Block dropping row containers inside other rows at both the UI hover level and the schema engine level (`draggedItem.type === 'row' && targetParentId !== 'root'`).
2. **Twelve-Column Hard Stop**:
   * Rows are strictly capped at 12 columns.
   * If `row.columns.length >= 12`, reject drops and suppress visual indicators.
3. **Real Component Integrity & GC**:
   * Splicing, dragging out, or deleting nested fields must never leave behind empty columns (`{ fields: [] }`).
   * Filter out empty columns prior to evaluating row dissolution.
4. **Auto-Cleanup Dissolution Circuit Breaker**:
   * **Dissolution ($N = 1$)**: If an action leaves exactly one item inside the HLayout container, the container dissolves and the single remaining component promotes directly to the parent root vertical layout index.
   * **Destruction ($N = 0$)**: If an action removes the final item, the container is deleted entirely from the vertical root.
5. **Event Isolation (Bubble Prevention)**:
   * Child nodes must explicitly invoke `e.stopPropagation()` on drag-over and drop events to isolate coordinates evaluation and completely eliminate multi-layer (dual black/green) indicator overlays.

---

6. **Multi-Page Auto-Deletion Garbage Collection**:
   * If all components on an active page are deleted, and multiple pages exist, the empty page is automatically destroyed. The active page index shifts down (`activePageIndex - 1`), and all surviving pages are sequentially reindexed.
7. **Empty Page Insertion Guard**:
   * Blocking new page additions (disabling/ignoring `handleAddPage`) when the current active page contains `0` items.

---

## 4. Multi-Page & Layout Architecture

### 4.1 Schema Extension
The state tracks pages as:
```typescript
interface Page {
  id: string;
  title: string; // e.g., "Page 1"
  items: ComponentNode[];
}
```

### 4.2 Reindexing Logic
On page splice deletion, remaining pages are sequentially mapped and renamed to preserve the logical page sequence:
```typescript
const reindexedPages = nextPages.map((page, index) => ({
  ...page,
  title: `Page ${index + 1}`
}));
```

---

## 5. UI Layout & Properties Panel Overrides

1. **Full-Screen Vertical Stretch**:
   * Flexbox layouts stretch panels (`FieldToolbox`, `CanvasDropzone`, properties panel) vertically to fill the workspace bounds (`flexGrow: 1`).
2. **Form Settings View**:
   * When nothing is selected on the canvas, the right-hand panel renders a **Form Settings** view containing an input for the `Form Name` parameter. The `<LivePreview>` component is kept in the DOM but hidden via CSS (`display: 'none'`) to support integration tests.
3. **Properties Label Exclusions**:
   * `header1`, `header2`, `paragraph`, and `label` elements bypass the "Field Label" properties input, rendering only their specific content variables.

---

## 6. Test Case Matrix Verification

Every engine mutation, UI boundary constraint, and pagination state rule is validated through automated tests:
* [schemaEngine.test.ts](file:///Users/sithuhlaing/Projects/NovaTheme/src/__tests__/schemaEngine.test.ts): Unit tests verifying engine instantiation, reordering index shifts, dissolution ($N=1$), and destruction ($N=0$) rules.
* [17_multipage_auto_delete.test.tsx](file:///Users/sithuhlaing/Projects/NovaTheme/src/__tests__/17_multipage_auto_delete.test.tsx): Verifies empty page auto-deletion, page creation guards, and sequential page reindexing.
* [18_properties_panel_excludes.test.tsx](file:///Users/sithuhlaing/Projects/NovaTheme/src/__tests__/18_properties_panel_excludes.test.tsx): Verifies headers, paragraphs, and labels exclude the Field Label property, and verifies password inputs feature custom placeholders/required options.

