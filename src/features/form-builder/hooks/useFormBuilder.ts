/**
 * Clean Form Builder Hook - Form Builder Feature
 * Single purpose: Manage form building state and operations
 */

import { useState, useCallback, useRef } from 'react';
import { ComponentEngine, FormStateEngine } from '../../../core';
import type { FormPage, ComponentType, FormComponentData } from '../../../types';

export interface FormBuilderState {
  pages: FormPage[];
  currentPageId: string;
  selectedComponentId: string | null;
  templateName: string;
}

export const useFormBuilder = () => {
  const [formState, setFormState] = useState<FormBuilderState>({
    pages: [{ 
      id: 'page1', 
      title: 'Page 1', 
      components: [],
      layout: {} 
    }],
    currentPageId: 'page1',
    selectedComponentId: null,
    templateName: 'Untitled Form'
  });

  // Undo/Redo functionality
  const history = useRef<FormBuilderState[]>([formState]);
  const historyIndex = useRef(0);

  const saveToHistory = useCallback((newState: FormBuilderState) => {
    // Remove any history after current index
    history.current = history.current.slice(0, historyIndex.current + 1);
    // Add new state
    history.current.push(newState);
    // Keep only last 50 states
    if (history.current.length > 50) {
      history.current = history.current.slice(-50);
    }
    historyIndex.current = history.current.length - 1;
  }, []);

  // Single action handler using FormStateEngine
  const executeAction = useCallback((action: any) => {
    const newState = FormStateEngine.executeAction(formState, action);
    saveToHistory(formState); // Save current state before changing
    setFormState(newState);
  }, [formState, saveToHistory]);

  // Clean operations using single sources of truth
  const addComponent = useCallback((componentType: ComponentType) => {
    executeAction({
      type: 'ADD_COMPONENT',
      payload: { componentType, pageId: formState.currentPageId }
    });
  }, [executeAction, formState.currentPageId]);

  const updateComponent = useCallback((componentId: string, updates: Partial<FormComponentData>) => {
    executeAction({
      type: 'UPDATE_COMPONENT',
      payload: { componentId, updates }
    });
  }, [executeAction]);

  const deleteComponent = useCallback((componentId: string) => {
    executeAction({
      type: 'DELETE_COMPONENT',
      payload: { componentId }
    });
  }, [executeAction]);

  const selectComponent = useCallback((componentId: string | null) => {
    setFormState(prev => ({ ...prev, selectedComponentId: componentId }));
  }, []);

  const handleDrop = useCallback((
    componentType: ComponentType,
    targetId: string,
    position: 'before' | 'after'
  ) => {
    // Handle empty canvas case
    if (targetId === 'empty-canvas') {
      addComponent(componentType);
      return;
    }
    
    executeAction({
      type: 'DROP_COMPONENT',
      payload: { componentType, targetId, position }
    });
  }, [executeAction, addComponent]);

  // Additional methods for comprehensive drag-drop support
  const insertBetweenComponents = useCallback((componentType: ComponentType, insertIndex: number) => {
    executeAction({
      type: 'INSERT_COMPONENT_AT_INDEX',
      payload: { componentType, insertIndex }
    });
  }, [executeAction]);

  const insertComponentWithPosition = useCallback((
    componentType: ComponentType, 
    targetId: string, 
    position: 'before' | 'after' | 'inside'
  ) => {
    executeAction({
      type: 'INSERT_COMPONENT_WITH_POSITION',
      payload: { componentType, targetId, position }
    });
  }, [executeAction]);

  const insertHorizontalToComponent = useCallback((componentType: ComponentType, targetId: string) => {
    executeAction({
      type: 'INSERT_HORIZONTAL_LAYOUT',
      payload: { componentType, targetId }
    });
  }, [executeAction]);

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    executeAction({
      type: 'MOVE_COMPONENT',
      payload: { dragIndex, hoverIndex }
    });
  }, [executeAction]);

  // Get current page data using FormStateEngine
  const currentComponents = FormStateEngine.getCurrentPageComponents(
    formState.pages,
    formState.currentPageId
  );

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      setFormState(history.current[historyIndex.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      setFormState(history.current[historyIndex.current]);
    }
  }, []);

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  // Clear all components
  const clearAll = useCallback(() => {
    saveToHistory(formState);
    setFormState(prev => ({
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        components: []
      })),
      selectedComponentId: null
    }));
  }, [formState, saveToHistory]);

  // Load from JSON
  const loadFromJSON = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.pages && Array.isArray(data.pages)) {
        saveToHistory(formState);
        setFormState(prev => ({
          ...prev,
          pages: data.pages,
          templateName: data.templateName || 'Loaded Form',
          selectedComponentId: null
        }));
      }
    } catch (error) {
      console.error('Failed to load JSON:', error);
    }
  }, [formState, saveToHistory]);

  const selectedComponent = currentComponents.find(
    c => c.id === formState.selectedComponentId
  ) || null;

  return {
    formState,
    currentComponents,
    selectedComponent,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    handleDrop,
    // Advanced drag-drop methods
    insertBetweenComponents,
    insertComponentWithPosition,
    insertHorizontalToComponent,
    moveComponent,
    setTemplateName: (name: string) => 
      setFormState(prev => ({ ...prev, templateName: name })),
    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    // Other actions
    clearAll,
    loadFromJSON
  };
};