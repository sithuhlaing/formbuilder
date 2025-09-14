/**
 * SIMPLIFIED FORM BUILDER HOOK
 * Replaces: FormStateEngine.ts (547 lines) + FormStateManager.ts (372 lines) + useFormBuilder.ts (468 lines)
 * Total replacement: ~1,400 lines → ~150 lines (89% reduction)
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Component, ComponentType } from '../types/components';
import type { Page } from '../types/template';
import { templateService } from '../features/template-management/services/templateService';
import { 
  createComponent, 
  updateComponent as updateComponentInTree, 
  deleteComponent as deleteComponentFromTree,
  findComponent
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

interface FormState {
  pages: FormPage[];
  currentPageId: string;
  selectedId: string | null;
  templateName: string;
  history: FormState[];
  historyIndex: number;
  previewMode?: boolean;
  mode: 'create' | 'edit';     // Track whether we're creating new or editing existing
  editingTemplateId?: string;  // ID of template being edited (null for create mode)
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
  setEditMode: (templateId: string) => void;  // Switch to edit mode for specific template
  setCreateMode: () => void;                  // Switch to create mode
  
  // Page management actions
  addPage: () => void;
  deletePage: (pageId: string) => void;
  switchToPage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  movePageUp: (pageId: string) => void;
  movePageDown: (pageId: string) => void;
  getCurrentPage: () => FormPage | null;
  components: Component[]; // Current page components for backwards compatibility
}

const createInitialPage = (): FormPage => ({
  id: `page-${uuidv4()}`,
  title: 'Page 1',
  components: [],
  layout: {},
  order: 0
});

const INITIAL_STATE: FormState = {
  pages: [createInitialPage()],
  currentPageId: 'page-1',
  selectedId: null,
  templateName: 'Untitled Form',
  history: [],
  historyIndex: -1,
  previewMode: false,
  mode: 'create',
  editingTemplateId: undefined
};

const MAX_HISTORY = 50; // Prevent memory issues

export function useSimpleFormBuilder(): FormState & FormActions {
  const [state, setState] = useState<FormState>(() => {
  const initialState = { ...INITIAL_STATE };
  // Initialize history with initial state
  initialState.history = [{ ...initialState }];
  initialState.historyIndex = 0;
  return initialState;
});

  // Helper function to get current page
  const getCurrentPage = useCallback((): FormPage => {
    const page = state.pages.find(p => p.id === state.currentPageId);
    if (!page) {
      // If current page not found, return first page or create a new one
      return state.pages[0] || createInitialPage();
    }
    return page;
  }, [state.pages, state.currentPageId]);

  // Helper function to get current page components
  const getCurrentPageComponents = useCallback((): Component[] => {
    const currentPage = getCurrentPage();
    return currentPage ? currentPage.components : [];
  }, [getCurrentPage]);

  // Simple history management - replacing complex HistoryManager
  const saveToHistory = useCallback(() => {
    setState(prev => {
      // Create a deep copy of the current state without the history fields
      const stateToSave: FormState = {
        pages: prev.pages.map(page => ({
          ...page,
          components: page.components.map(comp => ({ ...comp }))
        })),
        currentPageId: prev.currentPageId,
        selectedId: prev.selectedId,
        templateName: prev.templateName,
        history: [],  // Will be set below
        historyIndex: -1,  // Will be set below
        previewMode: prev.previewMode,
        mode: prev.mode,
        editingTemplateId: prev.editingTemplateId
      };
      
      // If we're in the middle of the history, truncate the future history
      const historySlice = prev.historyIndex < prev.history.length - 1 
        ? prev.history.slice(0, prev.historyIndex + 1)
        : prev.history;
      
      // Create new history array with current state
      const newHistory = [...historySlice, stateToSave].slice(-MAX_HISTORY);
      
      return {
        ...stateToSave,  // This includes all the page/component data
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  // Component operations - replacing complex ComponentEngine
  const addComponent = useCallback((type: ComponentType, index?: number) => {
    // Validate component type before creating
    if (!type) {
      console.error('Cannot add component: Invalid type provided');
      return;
    }
    
    saveToHistory();
    const newComponent = createComponent(type);
    
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === prev.currentPageId 
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
      ),
      selectedId: newComponent.id
    }));
  }, [saveToHistory]);

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    saveToHistory();
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === prev.currentPageId 
          ? {
              ...page,
              components: updateComponentInTree(page.components, id, updates)
            }
          : page
      )
    }));
  }, [saveToHistory]);

  const deleteComponent = useCallback((id: string) => {
    saveToHistory();
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === prev.currentPageId 
          ? {
              ...page,
              components: deleteComponentFromTree(page.components, id)
            }
          : page
      ),
      selectedId: prev.selectedId === id ? null : prev.selectedId
    }));
  }, [saveToHistory]);

  const selectComponent = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedId: id
    }));
  }, []);

  const moveComponent = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    saveToHistory();
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === prev.currentPageId 
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
      )
    }));
  }, [saveToHistory]);

  // History operations - simple undo/redo
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev; // Nothing to undo
      
      const newIndex = prev.historyIndex - 1;
      const previousState = prev.history[newIndex];
      
      return {
        ...previousState,
        history: [...prev.history],
        historyIndex: newIndex
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev; // Nothing to redo
      
      const newIndex = prev.historyIndex + 1;
      const nextState = prev.history[newIndex];
      
      return {
        ...nextState,
        history: [...prev.history],
        historyIndex: newIndex
      };
    });
  }, []);

  const canUndo = useCallback(() => {
    return state.historyIndex > 0;
  }, [state.historyIndex]);

  const canRedo = useCallback(() => {
    return state.historyIndex < state.history.length - 1;
  }, [state.historyIndex, state.history.length]);

  // Form operations
  const setTemplateName = useCallback((name: string) => {
    setState(prev => {
      // Create a new history entry
      const newHistory = [...prev.history];
      
      // Add current state to history before updating
      newHistory.push({
        ...prev,
        history: [...prev.history],
        historyIndex: prev.historyIndex
      });
      
      // Ensure we don't exceed history limit
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      // Create updated state with new name
      const updatedState: FormState = {
        ...prev,
        templateName: name,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };

      // If we're editing an existing template, update it in localStorage
      if (prev.editingTemplateId) {
        try {
          // Format pages structure for template service
          const pagesForService = prev.pages.map(page => ({
            title: page.title,
            components: page.components
          }));
          
          // Update template with just the name and pages as per the templateService type definition
          const updatedTemplate = templateService.updateTemplate(prev.editingTemplateId, { 
            name,
            pages: pagesForService
          });
          
          if (!updatedTemplate) {
            console.error('Failed to update template name');
            return prev;
          }
        } catch (error) {
          console.error('Error updating template:', error);
          return prev;

const deletePage = useCallback((pageId: string) => {
  // Don't allow deleting the last page
  if (state.pages.length <= 1) {
    return;
  }
  
  saveToHistory();
  setState(prev => {
    const newPages = prev.pages.filter(page => page.id !== pageId);
    const wasCurrentPage = prev.currentPageId === pageId;
    
    return {
      ...prev,
      pages: newPages,
      currentPageId: wasCurrentPage ? newPages[0]?.id || 'page-1' : prev.currentPageId,
      selectedId: wasCurrentPage ? null : prev.selectedId
    };
  });

saveToHistory();
setState(prev => {
  const newPages = prev.pages.filter(page => page.id !== pageId);
  const wasCurrentPage = prev.currentPageId === pageId;
  
  return {
    ...prev,
    pages: newPages,
    currentPageId: wasCurrentPage ? newPages[0].id : prev.currentPageId,
    selectedId: wasCurrentPage ? null : prev.selectedId
  };
});
}, [state.pages.length, saveToHistory]);

const switchToPage = useCallback((pageId: string) => {
setState(prev => ({
  ...prev,
  currentPageId: pageId,
  selectedId: null // Clear selection when switching pages
}));
}, []);

const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
if (fromIndex === toIndex) return;
  
saveToHistory();
setState(prev => {
  const newPages = [...prev.pages];
  const [movedPage] = newPages.splice(fromIndex, 1);
  newPages.splice(toIndex, 0, movedPage);
  
  return {
    ...prev,
    pages: newPages
  };
});
}, [saveToHistory]);

const movePageUp = useCallback((pageId: string) => {
setState(prev => {
  const pageIndex = prev.pages.findIndex(page => page.id === pageId);
  if (pageIndex <= 0) return prev; // Already at top or not found
  
  const newPages = [...prev.pages];
  const [movedPage] = newPages.splice(pageIndex, 1);
  newPages.splice(pageIndex - 1, 0, movedPage);
  
  return {
    ...prev,
    pages: newPages
  };
});
}, []);

const movePageDown = useCallback((pageId: string) => {
setState(prev => {
  const pageIndex = prev.pages.findIndex(page => page.id === pageId);
  if (pageIndex < 0 || pageIndex >= prev.pages.length - 1) return prev; // At bottom or not found
  
  const newPages = [...prev.pages];
  const [movedPage] = newPages.splice(pageIndex, 1);
  newPages.splice(pageIndex + 1, 0, movedPage);
  
  return {
    ...prev,
    pages: newPages
  };
});
}, []);

const togglePreview = useCallback(() => {
setState(prev => ({
  ...prev,
  previewMode: !prev.previewMode,
  selectedId: prev.previewMode ? prev.selectedId : null // Clear selection in preview
}));
}, []);

// Import/Export - simple JSON handling
const exportJSON = useCallback(() => {
return JSON.stringify({
  templateName: state.templateName,
  pages: state.pages,
  version: '2.1-multipage'
}, null, 2);
}, [state.templateName, state.pages]);

const importJSON = useCallback((jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.pages || !Array.isArray(data.pages)) {
      throw new Error('Invalid template format: missing pages array');
    }
    
    saveToHistory();
    
    const importedPages = data.pages.map((page: any) => ({
      id: page.id || `page-${uuidv4()}`,
      title: page.title || 'Untitled Page',
      components: page.components || [],
      layout: page.layout || {},
      description: page.description || '',
      order: page.order || 0
    }));
    
    setState(prev => ({
      ...prev,
      pages: importedPages,
      currentPageId: importedPages[0]?.id || 'page-1',
      templateName: data.templateName || 'Imported Form',
      selectedId: null
    }));
    
    return true;
  
  // Handle new multi-page format
  if (data.pages && Array.isArray(data.pages)) {
    setState(prev => ({
      ...prev,
      pages: data.pages,
      currentPageId: data.pages.length > 0 ? data.pages[0].id : 'page-1',
      templateName: data.templateName || 'Imported Form',
      selectedId: null
    }));
  } 
  // Handle old single-page format for backward compatibility
  else if (data.components && Array.isArray(data.components)) {
    setState(prev => ({
      ...prev,
      pages: [{
        id: 'page-1',
      return {
        ...prev,
        pages: newPages,
        currentPageId: wasCurrentPage ? newPages[0].id : prev.currentPageId,
        selectedId: wasCurrentPage ? null : prev.selectedId
      };
    });
  }, [state.pages.length, saveToHistory]);

  const switchToPage = useCallback((pageId: string) => {
    setState(prev => ({
      ...prev,
      currentPageId: pageId,
      selectedId: null // Clear selection when switching pages
    }));
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    saveToHistory();
    setState(prev => {
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      
      return {
        ...prev,
        pages: newPages
      };
    });
  }, [saveToHistory]);

  const movePageUp = useCallback((pageId: string) => {
    setState(prev => {
      const pageIndex = prev.pages.findIndex(page => page.id === pageId);
      if (pageIndex <= 0) return prev; // Already at top or not found
      
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(pageIndex, 1);
      newPages.splice(pageIndex - 1, 0, movedPage);
      
      return {
        ...prev,
        pages: newPages
      };
    });
  }, []);

  const movePageDown = useCallback((pageId: string) => {
    setState(prev => {
      const pageIndex = prev.pages.findIndex(page => page.id === pageId);
      if (pageIndex < 0 || pageIndex >= prev.pages.length - 1) return prev; // At bottom or not found
      
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(pageIndex, 1);
      newPages.splice(pageIndex + 1, 0, movedPage);
      
      return {
        ...prev,
        pages: newPages
      };
    });
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      previewMode: !prev.previewMode,
      selectedId: prev.previewMode ? prev.selectedId : null // Clear selection in preview
    }));
  }, []);

  // Import/Export - simple JSON handling
  const exportJSON = useCallback(() => {
    return JSON.stringify({
      templateName: state.templateName,
      pages: state.pages,
      version: '2.1-multipage'
    }, null, 2);
  }, [state.templateName, state.pages]);

  const importJSON = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      saveToHistory();
      
      // Handle new multi-page format
      if (data.pages && Array.isArray(data.pages)) {
        setState(prev => ({
          ...prev,
          pages: data.pages,
          currentPageId: data.pages.length > 0 ? data.pages[0].id : 'page-1',
          templateName: data.templateName || 'Imported Form',
          selectedId: null
        }));
      } 
      // Handle old single-page format for backward compatibility
      else if (data.components && Array.isArray(data.components)) {
        setState(prev => ({
          ...prev,
          pages: [{
            id: 'page-1',
            title: 'Page 1',
            components: data.components
          }],
          currentPageId: 'page-1',
          templateName: data.templateName || 'Imported Form',
          selectedId: null
        }));
      }
      else {
        throw new Error('Invalid JSON structure - no pages or components found');
      }
    } catch (error) {
      console.error('Failed to import JSON:', error);
      // In a real app, you'd show user-friendly error message
      alert('Failed to import form. Please check the JSON format.');
    }
  }, [saveToHistory]);

  // Mode management functions
  const setEditMode = useCallback((templateId: string) => {
    setState(prev => ({
      ...prev,
      mode: 'edit',
      editingTemplateId: templateId
    }));
  }, []);

  const setCreateMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'create',
      editingTemplateId: undefined
    }));
  }, []);

  return {
    // State
    ...state,
    components: getCurrentPageComponents(), // For backward compatibility
    
    // Actions
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    setTemplateName,
    clearAll,
    togglePreview,
    exportJSON,
    importJSON,
    setEditMode,
    setCreateMode,
    
    // Page management
    addPage,
    deletePage,
    switchToPage,
    reorderPages,
    movePageUp,
    movePageDown,
    getCurrentPage
  };
}

// Helper functions moved to componentUtils.ts for reusability

// Hook for getting selected component
export function useSelectedComponent(formState: FormState & { components: Component[] }): Component | null {
  if (!formState.selectedId) return null;
  
  return findComponent(formState.components, formState.selectedId);
}

// Export FormPage type for external use
export type { FormPage };