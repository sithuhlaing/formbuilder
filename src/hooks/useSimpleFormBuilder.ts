/**
 * SIMPLIFIED FORM BUILDER HOOK (RE-ENGINEERED 10/10 REDUCER PATTERN)
 * Encapsulates state mutations into a pure reducer and wraps history tracking.
 */

import { useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Component, ComponentType } from '../types/components';
import type { Page } from '../types/template';
import { templateService } from '../features/template-management/services/templateService';
import { 
  createComponent, 
  updateComponent as updateComponentInTree, 
  deleteComponent as deleteComponentFromTree,
} from '../core/componentUtils';

// FormPage type combining Page with our custom fields
type FormPage = Omit<Page, 'components'> & {
  id: string;
  title: string;
  components: Component[];
  layout?: Record<string, unknown>;
  description?: string;
  order?: number;
  [key: string]: unknown; // Allow additional properties
};

// Helper function to create a new page
const createInitialPage = (title = 'New Page'): FormPage => ({
  id: `page-${uuidv4()}`,
  title,
  components: [],
  layout: {},
  order: 0
});

interface FormState {
  pages: FormPage[];
  currentPageId: string;
  selectedId: string | null;
  templateName: string;
  history: Omit<FormState, 'history' | 'historyIndex'>[];
  historyIndex: number;
  previewMode: boolean;
  mode: 'create' | 'edit';
  editingTemplateId?: string;
}

interface FormActions {
  addComponent: (type: ComponentType, index?: number) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setTemplateName: (name: string) => void;
  clearAll: () => void;
  togglePreview: () => void;
  exportJSON: () => string;
  importJSON: (jsonString: string) => void;
  setEditMode: (templateId: string) => void;
  setCreateMode: () => void;

  // Page management actions
  addPage: () => void;
  deletePage: (pageId: string) => void;
  switchToPage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  movePageUp: (pageId: string) => void;
  movePageDown: (pageId: string) => void;
  getCurrentPage: () => FormPage | null;
  components: Component[]; // Current page components for backwards compatibility

  // Missing functions that tests and components expect
  getCurrentPageIndex: () => number;
  navigateToNextPage: () => void;
  navigateToPreviousPage: () => void;
  addNewPage: () => void;
  handleDrop: (componentType: ComponentType, position?: { index: number }) => void;
  handleSave: () => void;
  loadExistingTemplate: (templateId: string) => void;
}

// Initialize first page and state
const initialPage = createInitialPage('Page 1');
export const INITIAL_STATE: FormState = {
  pages: [initialPage],
  currentPageId: initialPage.id,
  selectedId: null,
  templateName: 'Untitled Form',
  history: [],
  historyIndex: -1,
  previewMode: false,
  mode: 'create',
  editingTemplateId: undefined
};

const MAX_HISTORY = 50;

function createHistorySnapshot(state: FormState): Omit<FormState, 'history' | 'historyIndex'> {
  return {
    pages: state.pages.map(page => ({
      ...page,
      components: (page.components || []).map(comp => ({ ...comp }))
    })),
    currentPageId: state.currentPageId,
    selectedId: state.selectedId,
    templateName: state.templateName,
    previewMode: state.previewMode,
    mode: state.mode,
    editingTemplateId: state.editingTemplateId
  };
}

function commitState(state: FormState, nextStateWithoutHistory: any): FormState {
  const snapshot = createHistorySnapshot(nextStateWithoutHistory);
  const historySlice = state.historyIndex < state.history.length - 1
    ? state.history.slice(0, state.historyIndex + 1)
    : state.history;
  const newHistory = [...historySlice, snapshot].slice(-MAX_HISTORY);
  return {
    ...nextStateWithoutHistory,
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
}

export function formBuilderReducer(state: FormState, action: any): FormState {
  switch (action.type) {
    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const previousState = state.history[newIndex];
      return {
        ...state,
        ...previousState,
        historyIndex: newIndex
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const nextState = state.history[newIndex];
      return {
        ...state,
        ...nextState,
        historyIndex: newIndex
      };
    }

    case 'ADD_COMPONENT': {
      const { type, index } = action.payload;
      if (!type) {
        console.error('Cannot add component: Invalid type provided');
        return state;
      }
      const newComponent = createComponent(type);

      const newPages = state.pages.map(page =>
        page.id === state.currentPageId
          ? {
              ...page,
              components: index !== undefined
                ? [
                    ...page.components.slice(0, index),
                    newComponent,
                    ...page.components.slice(index)
                  ]
                : [...page.components, newComponent]
            }
          : page
      );

      const nextState = {
        ...state,
        pages: newPages,
        selectedId: newComponent.id
      };
      return commitState(state, nextState);
    }

    case 'UPDATE_COMPONENT': {
      const { id, updates } = action.payload;

      const newPages = state.pages.map(page =>
        page.id === state.currentPageId
          ? {
              ...page,
              components: updateComponentInTree(page.components, id, updates)
            }
          : page
      );

      const nextState = {
        ...state,
        pages: newPages
      };
      return commitState(state, nextState);
    }

    case 'UPDATE_COMPONENTS': {
      const { components } = action.payload;

      const newPages = state.pages.map(page =>
        page.id === state.currentPageId
          ? {
              ...page,
              components
            }
          : page
      );

      const nextState = {
        ...state,
        pages: newPages
      };
      return commitState(state, nextState);
    }

    case 'DELETE_COMPONENT': {
      const { id } = action.payload;

      const updatedPages = state.pages.map(page =>
        page.id === state.currentPageId
          ? {
              ...page,
              components: deleteComponentFromTree(page.components, id)
            }
          : page
      );

      const activePage = updatedPages.find(p => p.id === state.currentPageId);
      const isEmpty = activePage ? activePage.components.length === 0 : false;
      
      let nextPages = updatedPages;
      let nextCurrentPageId = state.currentPageId;
      let nextSelectedId = state.selectedId === id ? null : state.selectedId;

      if (isEmpty && updatedPages.length > 1) {
        const filtered = updatedPages.filter(p => p.id !== state.currentPageId);
        nextPages = filtered.map((page, idx) => ({
          ...page,
          title: `Page ${idx + 1}`
        }));
        
        const deletedPageIndex = updatedPages.findIndex(p => p.id === state.currentPageId);
        const newPageIndex = Math.max(0, deletedPageIndex - 1);
        nextCurrentPageId = nextPages[newPageIndex]?.id || nextPages[0].id;
        nextSelectedId = null;
      }

      const nextState = {
        ...state,
        pages: nextPages,
        currentPageId: nextCurrentPageId,
        selectedId: nextSelectedId
      };
      return commitState(state, nextState);
    }

    case 'SELECT_COMPONENT': {
      return {
        ...state,
        selectedId: action.payload.id
      };
    }

    case 'MOVE_COMPONENT': {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex === toIndex) return state;

      const newPages = state.pages.map(page => 
        page.id === state.currentPageId 
          ? {
              ...page,
              components: (() => {
                const newComponents = [...page.components];
                const [movedComponent] = newComponents.splice(fromIndex, 1);
                newComponents.splice(toIndex, 0, movedComponent);
                return newComponents;
              })()
            }
          : page
      );

      const nextState = {
        ...state,
        pages: newPages
      };
      return commitState(state, nextState);
    }

    case 'SET_TEMPLATE_NAME': {
      const { name } = action.payload;

      if (state.editingTemplateId) {
        try {
          const pagesForService = state.pages.map(page => ({
            title: page.title,
            components: page.components
          }));
          templateService.updateTemplate(state.editingTemplateId, { 
            name,
            pages: pagesForService
          });
        } catch (error) {
          console.error('Error updating template:', error);
        }
      }

      const nextState = {
        ...state,
        templateName: name
      };
      return commitState(state, nextState);
    }

    case 'CLEAR_ALL': {
      const newPage = createInitialPage('Page 1');
      const nextState = {
        ...INITIAL_STATE,
        pages: [newPage],
        currentPageId: newPage.id
      };
      return commitState(state, nextState);
    }

    case 'TOGGLE_PREVIEW': {
      return {
        ...state,
        previewMode: !state.previewMode,
        selectedId: state.previewMode ? state.selectedId : null
      };
    }

    case 'IMPORT_JSON': {
      const { jsonString } = action.payload;
      try {
        const data = JSON.parse(jsonString);

        if (data.pages && Array.isArray(data.pages)) {
          const nextState = {
            ...state,
            pages: data.pages,
            currentPageId: data.pages.length > 0 ? data.pages[0].id : 'page-1',
            templateName: data.templateName || 'Imported Form',
            selectedId: null
          };
          return commitState(state, nextState);
        } else if (data.components && Array.isArray(data.components)) {
          const nextState = {
            ...state,
            pages: [{
              id: 'page-1',
              title: 'Page 1',
              components: data.components
            }],
            currentPageId: 'page-1',
            templateName: data.templateName || 'Imported Form',
            selectedId: null
          };
          return commitState(state, nextState);
        } else {
          throw new Error('Invalid JSON structure - no pages or components found');
        }
      } catch (error) {
        console.error('Failed to import JSON:', error);
        alert('Failed to import form. Please check the JSON format.');
        return state;
      }
    }

    case 'SET_EDIT_MODE': {
      return {
        ...state,
        mode: 'edit',
        editingTemplateId: action.payload.templateId
      };
    }

    case 'SET_CREATE_MODE': {
      const newPage = createInitialPage('Page 1');
      const nextState = {
        ...INITIAL_STATE,
        pages: [newPage],
        currentPageId: newPage.id
      };
      // Reset history to contain only the clean initial state
      return {
        ...nextState,
        history: [createHistorySnapshot(nextState)],
        historyIndex: 0
      };
    }

    case 'ADD_PAGE': {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      if (currentPage && currentPage.components.length === 0) {
        return state;
      }

      const newPage = createInitialPage(`Page ${state.pages.length + 1}`);
      const nextState = {
        ...state,
        pages: [...state.pages, newPage],
        currentPageId: newPage.id,
        selectedId: null
      };
      return commitState(state, nextState);
    }

    case 'DELETE_PAGE': {
      const { pageId } = action.payload;
      if (state.pages.length <= 1) {
        return state;
      }

      const filtered = state.pages.filter(page => page.id !== pageId);
      const reindexedPages = filtered.map((page, index) => ({
        ...page,
        title: `Page ${index + 1}`
      }));
      const wasCurrentPage = state.currentPageId === pageId;

      const nextState = {
        ...state,
        pages: reindexedPages,
        currentPageId: wasCurrentPage ? reindexedPages[0].id : state.currentPageId,
        selectedId: wasCurrentPage ? null : state.selectedId
      };
      return commitState(state, nextState);
    }

    case 'SWITCH_TO_PAGE': {
      return {
        ...state,
        currentPageId: action.payload.pageId,
        selectedId: null
      };
    }

    case 'REORDER_PAGES': {
      const { fromIndex, toIndex } = action.payload;
      const newPages = [...state.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);

      const nextState = {
        ...state,
        pages: newPages.map((page, index) => ({
          ...page,
          order: index
        }))
      };
      return commitState(state, nextState);
    }

    case 'MOVE_PAGE_UP': {
      const { pageId } = action.payload;
      const index = state.pages.findIndex(p => p.id === pageId);
      if (index <= 0) return state;

      const newPages = [...state.pages];
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];

      const nextState = {
        ...state,
        pages: newPages.map((page, i) => ({
          ...page,
          order: i
        }))
      };
      return commitState(state, nextState);
    }

    case 'MOVE_PAGE_DOWN': {
      const { pageId } = action.payload;
      const index = state.pages.findIndex(p => p.id === pageId);
      if (index === -1 || index >= state.pages.length - 1) return state;

      const newPages = [...state.pages];
      [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];

      const nextState = {
        ...state,
        pages: newPages.map((page, i) => ({
          ...page,
          order: i
        }))
      };
      return commitState(state, nextState);
    }

    case 'SAVE_TEMPLATE': {
      const pagesForService = state.pages.map(page => ({
        title: page.title,
        components: page.components
      }));
      
      if (state.mode === 'edit' && state.editingTemplateId) {
        templateService.updateTemplate(state.editingTemplateId, {
          name: state.templateName,
          pages: pagesForService
        });
        return state;
      } else {
        const saved = templateService.saveTemplate({
          name: state.templateName,
          pages: pagesForService
        });
        if (saved && saved.templateId) {
          return {
            ...state,
            mode: 'edit',
            editingTemplateId: saved.templateId
          };
        }
      }
      return state;
    }

    case 'LOAD_TEMPLATE': {
      const { templateId } = action.payload;
      const template = templateService.loadTemplate(templateId);
      if (template) {
        const hydratedPages = template.pages.map((p: any) => ({
          id: p.id || `p-${uuidv4()}`,
          title: p.title || p.name || 'Untitled Page',
          components: p.components || p.items || []
        }));
        const nextState = {
          ...state,
          mode: 'edit',
          editingTemplateId: templateId,
          templateName: template.name,
          pages: hydratedPages.length > 0 ? hydratedPages : [createInitialPage('Page 1')],
          currentPageId: hydratedPages[0]?.id || state.currentPageId
        };
        // Reset history to start from the newly loaded template state
        return {
          ...nextState,
          history: [createHistorySnapshot(nextState)],
          historyIndex: 0
        };
      }
      return state;
    }

    default:
      return state;
  }
}

export function useSimpleFormBuilder(): FormState & FormActions {
  const [state, dispatch] = useReducer(formBuilderReducer, INITIAL_STATE, (initial) => {
    const stateWithHistory = { ...initial };
    stateWithHistory.history = [createHistorySnapshot(initial)];
    stateWithHistory.historyIndex = 0;
    return stateWithHistory;
  });

  // Helper function to get current page
  const getCurrentPage = useCallback((): FormPage => {
    const page = state.pages.find(p => p.id === state.currentPageId);
    return page || state.pages[0] || createInitialPage();
  }, [state.pages, state.currentPageId]);

  // Helper function to get current page components
  const getCurrentPageComponents = useCallback((): Component[] => {
    const currentPage = getCurrentPage();
    return currentPage ? currentPage.components : [];
  }, [getCurrentPage]);

  return {
    // State
    ...state,
    components: getCurrentPageComponents(),

    // Actions
    addComponent: useCallback((type: ComponentType, index?: number) => {
      dispatch({ type: 'ADD_COMPONENT', payload: { type, index } });
    }, []),
    updateComponent: useCallback((id: string, updates: Partial<Component>) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } });
    }, []),
    updateComponents: useCallback((components: Component[]) => {
      dispatch({ type: 'UPDATE_COMPONENTS', payload: { components } });
    }, []),
    deleteComponent: useCallback((id: string) => {
      dispatch({ type: 'DELETE_COMPONENT', payload: { id } });
    }, []),
    selectComponent: useCallback((id: string | null) => {
      dispatch({ type: 'SELECT_COMPONENT', payload: { id } });
    }, []),
    moveComponent: useCallback((fromIndex: number, toIndex: number) => {
      dispatch({ type: 'MOVE_COMPONENT', payload: { fromIndex, toIndex } });
    }, []),
    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
    }, []),
    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
    }, []),
    canUndo: useCallback(() => state.historyIndex > 0, [state.historyIndex]),
    canRedo: useCallback(() => state.historyIndex < state.history.length - 1, [state.historyIndex, state.history.length]),
    setTemplateName: useCallback((name: string) => {
      dispatch({ type: 'SET_TEMPLATE_NAME', payload: { name } });
    }, []),
    clearAll: useCallback(() => {
      dispatch({ type: 'CLEAR_ALL' });
    }, []),
    togglePreview: useCallback(() => {
      dispatch({ type: 'TOGGLE_PREVIEW' });
    }, []),
    exportJSON: useCallback(() => {
      return JSON.stringify({
        templateName: state.templateName,
        pages: state.pages.map(page => ({
          id: page.id,
          title: page.title,
          components: page.components,
          layout: page.layout,
          description: page.description,
          order: page.order
        })),
        version: '2.1-multipage'
      }, null, 2);
    }, [state.templateName, state.pages]),
    importJSON: useCallback((jsonString: string) => {
      dispatch({ type: 'IMPORT_JSON', payload: { jsonString } });
    }, []),
    setEditMode: useCallback((templateId: string) => {
      dispatch({ type: 'SET_EDIT_MODE', payload: { templateId } });
    }, []),
    setCreateMode: useCallback(() => {
      dispatch({ type: 'SET_CREATE_MODE' });
    }, []),
    addPage: useCallback(() => {
      dispatch({ type: 'ADD_PAGE' });
    }, []),
    deletePage: useCallback((pageId: string) => {
      dispatch({ type: 'DELETE_PAGE', payload: { pageId } });
    }, []),
    switchToPage: useCallback((pageId: string) => {
      dispatch({ type: 'SWITCH_TO_PAGE', payload: { pageId } });
    }, []),
    reorderPages: useCallback((fromIndex: number, toIndex: number) => {
      dispatch({ type: 'REORDER_PAGES', payload: { fromIndex, toIndex } });
    }, []),
    movePageUp: useCallback((pageId: string) => {
      dispatch({ type: 'MOVE_PAGE_UP', payload: { pageId } });
    }, []),
    movePageDown: useCallback((pageId: string) => {
      dispatch({ type: 'MOVE_PAGE_DOWN', payload: { pageId } });
    }, []),
    getCurrentPage,
    getCurrentPageComponents,
    getCurrentPageIndex: useCallback(() => {
      return state.pages.findIndex(page => page.id === state.currentPageId);
    }, [state.pages, state.currentPageId]),
    navigateToNextPage: useCallback(() => {
      const currentIndex = state.pages.findIndex(page => page.id === state.currentPageId);
      if (currentIndex < state.pages.length - 1) {
        dispatch({ type: 'SWITCH_TO_PAGE', payload: { pageId: state.pages[currentIndex + 1].id } });
      }
    }, [state.pages, state.currentPageId]),
    navigateToPreviousPage: useCallback(() => {
      const currentIndex = state.pages.findIndex(page => page.id === state.currentPageId);
      if (currentIndex > 0) {
        dispatch({ type: 'SWITCH_TO_PAGE', payload: { pageId: state.pages[currentIndex - 1].id } });
      }
    }, [state.pages, state.currentPageId]),
    addNewPage: useCallback(() => {
      dispatch({ type: 'ADD_PAGE' });
    }, []),
    handleDrop: useCallback((componentType: ComponentType, position?: { index: number }) => {
      dispatch({ type: 'ADD_COMPONENT', payload: { type: componentType, index: position?.index } });
    }, []),
    handleSave: useCallback(() => {
      dispatch({ type: 'SAVE_TEMPLATE' });
    }, []),
    loadExistingTemplate: useCallback((templateId: string) => {
      dispatch({ type: 'LOAD_TEMPLATE', payload: { templateId } });
    })
  };
}

// Export FormPage type for external use
export type { FormPage };