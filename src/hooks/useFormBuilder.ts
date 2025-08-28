
import { useState, useMemo, useCallback, useReducer } from 'react';
import { useComponentOperations } from './operations/componentOperations';
import { useLayoutOperations } from './operations/layoutOperations';
import { usePageOperations } from './operations/pageOperations';

import type { FormComponentData, ComponentType, FormPage } from "../types";

interface ModalFunctions {
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'info' | 'success' | 'warning' | 'error' | 'danger'
  ) => void;
  showNotification: (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

interface UseFormBuilderProps {
  showConfirmation?: (title: string, message: string, onConfirm: () => void, type?: 'info' | 'success' | 'warning' | 'error' | 'danger') => void;
  showNotification?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const noop = () => {};

// Reducer for handling form builder state changes
const formBuilderReducer = (state: { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null }, action: any) => {
  switch (action.type) {
    case 'ADD_COMPONENT':
      const { pageId, component, index } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === pageId
            ? {
                ...page,
                components: index !== undefined
                  ? [...page.components.slice(0, index), component, ...page.components.slice(index)]
                  : [...page.components, component]
              }
            : page
        )
      };
    case 'UPDATE_COMPONENT':
      const { componentId, updates } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === state.currentPageId
            ? {
                ...page,
                components: page.components.map(comp =>
                  comp.id === componentId ? { ...comp, ...updates } : comp
                )
              }
            : page
        )
      };
    case 'DELETE_COMPONENT':
      const { id } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === state.currentPageId
            ? {
                ...page,
                components: page.components.filter(comp => comp.id !== id)
              }
            : page
        ),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
      };
    case 'MOVE_COMPONENT': {
      const { dragIndex, hoverIndex, pageId: movePageId } = action.payload;
      const page = state.pages.find(p => p.id === movePageId);
      if (!page) return state;

      const dragItem = page.components[dragIndex];
      const newComponents = [...page.components];
      newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, dragItem);

      return {
        ...state,
        pages: state.pages.map(p => (p.id === movePageId ? { ...p, components: newComponents } : p)),
      };
    }
    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponentId: action.payload.componentId
      };
    case 'CREATE_COMPONENT':
      const { type, pageId: newPageId } = action.payload;
      const newComponent = createNewComponent(type);
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === newPageId
            ? {
                ...page,
                components: [...page.components, newComponent]
              }
            : page
        )
      };
    case 'ADD_PAGE':
      const { newPage } = action.payload;
      return {
        ...state,
        pages: [...state.pages, newPage],
        currentPageId: newPage.id
      };
    case 'DELETE_PAGE':
      const { pageIdToDelete } = action.payload;
      const remainingPages = state.pages.filter(page => page.id !== pageIdToDelete);
      const newCurrentPageId = remainingPages.length > 0 ? remainingPages[0].id : '';
      return {
        ...state,
        pages: remainingPages,
        currentPageId: newCurrentPageId
      };
    case 'UPDATE_PAGE_TITLE':
      const { pageId: updatePageId, title } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === updatePageId ? { ...page, title } : page
        )
      };
    case 'SWITCH_TO_PAGE':
      return {
        ...state,
        currentPageId: action.payload.pageId
      };
    case 'CLEAR_PAGE':
      const { clearPageId } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === clearPageId ? { ...page, components: [] } : page
        )
      };
    case 'SET_TEMPLATE_NAME':
      return {
        ...state,
        templateName: action.payload.name
      };
    case 'UPDATE_COMPONENT_PROPERTIES': {
      const { componentId, properties } = action.payload;
      return {
        ...state,
        pages: state.pages.map(page =>
          page.id === state.currentPageId
            ? {
                ...page,
                components: page.components.map(comp =>
                  comp.id === componentId ? { ...comp, ...properties } : comp
                )
              }
            : page
        )
      };
    }
    default:
      return state;
  }
};

const createNewComponent = (type: ComponentType): FormComponentData => {
  const baseComponent: FormComponentData = {
    id: Date.now().toString(),
    type,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
    required: false,
    placeholder: '',
    options: [],
    value: '',
    width: '100%',
    height: 'auto',
    visible: true,
    disabled: false,
    readOnly: false,
    className: '',
    style: {},
    validations: [],
    customProperties: {}
  };

  switch (type) {
    case 'text':
      return {
        ...baseComponent,
        placeholder: 'Enter text here...',
        value: ''
      };
    case 'textarea':
      return {
        ...baseComponent,
        placeholder: 'Enter text here...',
        value: '',
        rows: 4
      };
    case 'select':
      return {
        ...baseComponent,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ],
        value: ''
      };
    case 'checkbox':
      return {
        ...baseComponent,
        checked: false
      };
    case 'radio':
      return {
        ...baseComponent,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ],
        value: ''
      };
    case 'date':
      return {
        ...baseComponent,
        value: ''
      };
    case 'number':
      return {
        ...baseComponent,
        value: '',
        min: 0,
        max: 100
      };
    case 'email':
      return {
        ...baseComponent,
        placeholder: 'Enter email address...',
        value: ''
      };
    case 'password':
      return {
        ...baseComponent,
        placeholder: 'Enter password...',
        value: ''
      };
    case 'file':
      return {
        ...baseComponent,
        accept: '*/*'
      };
    case 'button':
      return {
        ...baseComponent,
        text: 'Button',
        variant: 'primary'
      };
    case 'container':
      return {
        ...baseComponent,
        children: []
      };
    default:
      return baseComponent;
  }
};

export const useFormBuilder = ({ showConfirmation, showNotification }: UseFormBuilderProps = {}) => {
  // Core state
  const [pages, setPages] = useState<FormPage[]>([{
    id: '1',
    title: 'Page 1',
    components: [],
    layout: {}
  }]);

  const [currentPageId, setCurrentPageId] = useState<string>('1');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>("Untitled Form");

  // Undo/Redo state
  const [history, setHistory] = useState<FormPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Safe pages array to prevent null/undefined issues
  const safePagesArray = useMemo(() => {
    return pages.filter(page => page != null);
  }, [pages]);

  // Current page and components
  const currentPage = useMemo(() => {
    return safePagesArray.find(page => page.id === currentPageId) || safePagesArray[0];
  }, [safePagesArray, currentPageId]);

  const components = useMemo(() => {
    return currentPage?.components || [];
  }, [currentPage]);

  const selectedComponent = useMemo(() => {
    return components.find(c => c.id === selectedComponentId) || null;
  }, [components, selectedComponentId]);

  // Generate unique ID
  const generateId = useCallback(() => Date.now().toString(), []);

  // Update pages with history tracking
  const updatePages = useCallback((newPages: FormPage[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(pages)));

      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setHistoryIndex(prev => Math.min(prev + 1, 49));
    setPages(newPages);
  }, [pages, historyIndex]);

  // Update current page components
  const updateCurrentPageComponents = useCallback((validComponents: FormComponentData[]) => {
    console.log('🔄 updateCurrentPageComponents called with:', {
      componentCount: validComponents.length,
      currentPageId,
      components: validComponents.map(c => ({ id: c.id, label: c.label }))
    });

    const updatedPages = safePagesArray.map(page =>
      page && page.id === currentPageId
        ? ({ ...page, components: validComponents } as FormPage)
        : page
    );

    updatePages(updatedPages);
  }, [safePagesArray, currentPageId, updatePages]);

  const {
    addComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    selectComponent,
    createComponent,
  } = useComponentOperations(
    safePagesArray,
    currentPageId,
    updateCurrentPageComponents,
    selectedComponentId,
    setSelectedComponentId
  );

  const {
    insertComponentWithPosition,
    insertHorizontalToComponent,
    addComponentToContainer,
    removeFromContainer,
  } = useLayoutOperations(
    components,
    updateCurrentPageComponents,
    setSelectedComponentId,
    { showNotification: showNotification || noop, showConfirmation: showConfirmation || noop }
  );

  // Page operations
  const {
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
    onClearPage,
  } = usePageOperations({
    pages: safePagesArray,
    currentPageId,
    updatePages,
    setCurrentPageId,
    setSelectedComponentId,
    generateId,
    showNotification,
    showConfirmation,
  });

  const clearAll = useCallback(() => {
    const performClearAll = () => {
      const clearedPages = safePagesArray.map(page => ({
        ...page,
        components: []
      }));
      updatePages(clearedPages);
      setSelectedComponentId(null);
    };

    if (showConfirmation) {
      showConfirmation(
        'Clear All Components',
        'Are you sure you want to clear all components from all pages?\n\nYou can undo this action with Ctrl+Z.',
        performClearAll,
        'warning'
      );
    } else {
      if (window.confirm('Are you sure you want to clear all components from all pages? You can undo this action with Ctrl+Z.')) {
        performClearAll();
      }
    }
  }, [safePagesArray, updatePages, showConfirmation]);

  const clearAllSilent = useCallback(() => {
    const clearedPages = safePagesArray.map(page => ({
      ...page,
      components: []
    }));
    updatePages(clearedPages);
    setSelectedComponentId(null);
  }, [safePagesArray, updatePages]);

  const loadFromJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.pages)) {
        setPages(parsed.pages);
        setCurrentPageId(parsed.currentPageId || parsed.pages[0]?.id || '1');
        setSelectedComponentId(null);
        setTemplateName(parsed.templateName || "Untitled Form");
      }
    } catch (error) {
      console.error("Failed to load form from JSON:", error);
      if (showNotification) {
        showNotification('Error Loading Form', 'Failed to load form from JSON file.', 'error');
      }
    }
  }, [showNotification]);

  const undo = useCallback(() => {
    if (historyIndex < 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setPages(history[newIndex]);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setPages(history[newIndex]);
  }, [history, historyIndex]);

  const canUndo = useMemo(() => historyIndex >= 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex]);

  // Additional layout operations
  const insertBetweenComponents = useCallback((type: ComponentType, sourceId: string, targetId: string) => {
    console.log('↔️ Inserting component between two items', { type, sourceId, targetId });
    // dispatch({ type: 'INSERT_BETWEEN', payload: { type, sourceId, targetId } });
  }, []);

  const handleDropInContainer = useCallback((
    type: ComponentType,
    containerId: string,
    position?: 'left' | 'right'
  ) => {
    console.log('📥 Handling drop in container', { type, containerId, position });
    // dispatch({ type: 'DROP_IN_CONTAINER', payload: { type, containerId, position } });
  }, []);

  // Use the original addComponent from useComponentOperations instead of custom reducer

  // Use the original updateComponent from operations hooks

  return {
    pages: safePagesArray,
    currentPage,
    currentPageId,
    components,
    selectedComponent,
    selectedComponentId,
    templateName,
    setTemplateName,
    addComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    createComponent,
    clearAll,
    clearAllSilent,
    loadFromJSON,
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
    undo,
    redo,
    canUndo,
    canRedo,
    updateCurrentPageComponents,
    insertComponentWithPosition,
    insertHorizontalToComponent,
    addComponentToContainer,
    removeFromContainer,
    insertBetweenComponents,
    handleDropInContainer,
  };
};
