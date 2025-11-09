import { vi } from 'vitest';
import type { Component } from '../../types/components';

export interface MockFormBuilderState {
  pages: Array<{
    id: string;
    title: string;
    components: Component[];
    layout?: Record<string, unknown>;
    order?: number;
  }>;
  currentPageId: string;
  selectedId: string | null;
  templateName: string;
  history: any[];
  historyIndex: number;
  previewMode?: boolean;
  mode: 'create' | 'edit';
  editingTemplateId?: string;
  components: Component[];
  addComponent: ReturnType<typeof vi.fn>;
  updateComponent: ReturnType<typeof vi.fn>;
  deleteComponent: ReturnType<typeof vi.fn>;
  selectComponent: ReturnType<typeof vi.fn>;
  moveComponent: ReturnType<typeof vi.fn>;
  setTemplateName: ReturnType<typeof vi.fn>;
  getCurrentPageIndex: ReturnType<typeof vi.fn>;
  navigateToNextPage: ReturnType<typeof vi.fn>;
  navigateToPreviousPage: ReturnType<typeof vi.fn>;
  addNewPage: ReturnType<typeof vi.fn>;
  clearAll: ReturnType<typeof vi.fn>;
  importJSON: ReturnType<typeof vi.fn>;
  exportJSON: ReturnType<typeof vi.fn>;
  undo: ReturnType<typeof vi.fn>;
  redo: ReturnType<typeof vi.fn>;
  canUndo: ReturnType<typeof vi.fn>;
  canRedo: ReturnType<typeof vi.fn>;
  togglePreview: ReturnType<typeof vi.fn>;
}

export function createMockFormBuilderState(overrides: Partial<MockFormBuilderState> = {}): MockFormBuilderState {
  const defaultState: MockFormBuilderState = {
    pages: [{
      id: 'page1',
      title: 'Page 1',
      components: [],
      layout: { type: 'vertical', direction: 'column' },
      order: 0
    }],
    currentPageId: 'page1',
    selectedId: null,
    templateName: 'Untitled Form',
    history: [],
    historyIndex: 0,
    previewMode: false,
    mode: 'create' as const,
    editingTemplateId: undefined,
    components: [],
    addComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    selectComponent: vi.fn(),
    moveComponent: vi.fn(),
    setTemplateName: vi.fn(),
    getCurrentPageIndex: vi.fn(() => 0),
    navigateToNextPage: vi.fn(),
    navigateToPreviousPage: vi.fn(),
    addNewPage: vi.fn(),
    clearAll: vi.fn(),
    importJSON: vi.fn(),
    exportJSON: vi.fn(() => JSON.stringify({ templateName: 'Test Template', pages: [] })),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    togglePreview: vi.fn(),
  };

  return { ...defaultState, ...overrides };
}

export const mockUseFormBuilder = vi.fn();
