## Relevant Files

- `src/app/components/left-panel.tsx` - Component palette UI that will need domain-based filtering and drag sources.
- `src/app/components/canvas.tsx` - Core drag-and-drop canvas requiring advanced layout logic and multi-page awareness.
- `src/app/components/right-panel.tsx` - Properties panel for editing component metadata and validation rules.
- `src/state/builder-store.ts` - (to be created) Centralized state management for components, pages, and undo/redo history.
- `src/utils/exporters/jsonExporter.ts` - (to be created) Handles JSON export of form definitions with layout and metadata.
- `src/hooks/use-history.ts` - (to be created) Encapsulates undo/redo stack logic reusable across the builder.
- `src/hooks/use-domain-config.ts` - (to be created) Provides domain-specific terminology and component filters.
- `src/types/form.ts` - (to be created) Shared TypeScript definitions for form components, layouts, pages, and export schema.
- `src/__tests__/builder/canvas.test.tsx` - Tests for drag-drop layout rules and drop detection.
- `src/__tests__/builder/history.test.ts` - Tests for undo/redo functionality.
- `src/__tests__/export/jsonExporter.test.ts` - Tests ensuring exported JSON matches expected schema.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Implement Advanced Drag-and-Drop Layout Engine
  - [ ] 1.1 Review current `src/app/components/canvas.tsx` drag-drop logic and document gaps against FR-006 – FR-014
  - [ ] 1.2 Extend drop-position detection to support top/bottom/left/right/center zones with visual indicators
  - [ ] 1.3 Introduce horizontal row container data structures with capacity checks and automatic dissolution rules
  - [ ] 1.4 Add drag handles for row containers and enforce movement constraints (no nesting, vertical moves only)
  - [ ] 1.5 Update UI to surface error states (e.g., max 4 components per row) plus blocked-drop feedback
  - [ ] 1.6 Write canvas interaction tests covering new layout behaviors and error handling
- [ ] 2.0 Add Multi-Page Form Management System
  - [ ] 2.1 Define TypeScript types and store shape for pages, navigation state, and page-level validation
  - [ ] 2.2 Build UI controls for adding/removing/reordering pages and display page tabs within the builder
  - [ ] 2.3 Update canvas/render pipeline to scope rendered components to the active page
  - [ ] 2.4 Ensure export/import pipelines persist page hierarchy and page-level metadata
  - [ ] 2.5 Add tests verifying page switching, persistence, and validation triggers
- [ ] 3.0 Expand Template Library with Save, Load, and JSON Export
  - [ ] 3.1 Implement template metadata capture (name, description, domain, version, author/date)
  - [ ] 3.2 Build template library UI with search/filter, thumbnails, and domain categories
  - [ ] 3.3 Create JSON exporter/importer utilities that include layout, validation, and page configuration
  - [ ] 3.4 Persist templates (library and custom) via `TemplateManager`, including version bump and auditing
  - [ ] 3.5 Add tests to confirm exported JSON aligns with schema and imports round-trip successfully
- [ ] 4.0 Integrate Comprehensive Validation and Error Feedback
  - [ ] 4.1 Enhance properties panel to support all validation types (required, regex, ranges, file types, length)
  - [ ] 4.2 Surface real-time validation previews within the builder (e.g., inline error states)
  - [ ] 4.3 Generate end-user friendly error messages for export/runtime contexts
  - [ ] 4.4 Add unit tests covering validation rule configuration and preview feedback
- [ ] 5.0 Build Undo/Redo Action History Service
  - [ ] 5.1 Design centralized history store capturing component/layout/page mutations
  - [ ] 5.2 Wire undo/redo controls into builder UI with keyboard shortcuts support
  - [ ] 5.3 Enforce 50-action cap with FIFO trimming and test history traversal
- [ ] 6.0 Enable Domain-Specific Modes and Component Filtering
  - [ ] 6.1 Implement domain selector and propagate selection through global builder state
  - [ ] 6.2 Filter component palette and defaults per domain (forms, surveys, workflows)
  - [ ] 6.3 Update labels/terminology across panels based on domain context
  - [ ] 6.4 Seed domain-specific starter templates and ensure compatibility with template manager
  - [ ] 6.5 Add tests verifying palette filtering and terminology switching
