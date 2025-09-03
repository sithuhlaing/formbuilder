/**
 * Clean Form Builder Hook - Form Builder Feature
 * Single purpose: Manage form building state and operations
 */

import { useState, useCallback, useRef } from 'react';
import { FormStateEngine } from '../../../core';
import type { FormPage, ComponentType, FormComponentData } from '../../../types';

export interface FormBuilderState {
  pages: FormPage[];
  currentPageId: string;
  selectedComponentId: string | null;
  templateName: string;
  templateId: string | null; // Track if we're editing an existing template
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
    templateName: 'Untitled Form',
    templateId: null
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
    setFormState(currentState => {
      const newState = FormStateEngine.executeAction(currentState, action);
      saveToHistory(currentState); // Save current state before changing
      return {
        ...currentState,
        ...newState
      };
    });
  }, [saveToHistory]);

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

  // Additional methods for comprehensive drag-drop support - defined first
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

  const insertHorizontalToComponent = useCallback((componentType: ComponentType, targetId: string, side?: 'left' | 'right') => {
    executeAction({
      type: 'INSERT_HORIZONTAL_LAYOUT',
      payload: { componentType, targetId, side }
    });
  }, [executeAction]);

  const handleDrop = useCallback((
    componentType: ComponentType,
    targetId: string,
    position: 'before' | 'after' | 'left' | 'right' | 'inside'
  ) => {
    // Handle empty canvas case
    if (targetId === 'empty-canvas') {
      addComponent(componentType);
      return;
    }
    
    // Handle between-element insertion (from BetweenElementsDropZone)
    if (targetId.startsWith('index-') && position === 'before') {
      const insertIndex = parseInt(targetId.replace('index-', ''), 10);
      insertBetweenComponents(componentType, insertIndex);
      return;
    }
    
    // Handle different drop positions for comprehensive drag-drop
    if (position === 'left' || position === 'right') {
      // Create horizontal layout with the component
      insertHorizontalToComponent(componentType, targetId, position);
    } else if (position === 'inside') {
      // Add to container (row layout)
      insertComponentWithPosition(componentType, targetId, 'inside');
    } else {
      // Regular before/after positioning
      executeAction({
        type: 'DROP_COMPONENT',
        payload: { componentType, targetId, position }
      });
    }
  }, [executeAction, addComponent, insertHorizontalToComponent, insertComponentWithPosition, insertBetweenComponents]);

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    executeAction({
      type: 'MOVE_COMPONENT',
      payload: { 
        pageId: formState.currentPageId,
        fromIndex: dragIndex, 
        toIndex: hoverIndex 
      }
    });
  }, [executeAction, formState.currentPageId]);

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

  const handleFormSubmit = useCallback((formData?: Record<string, any>) => {
    // Import ValidationEngine for form validation
    const { ValidationEngine } = require('../../core/ValidationEngine');
    
    // Validate all components in all pages
    const validationResults: Record<string, any> = {};
    let hasErrors = false;

    for (const page of formState.pages) {
      for (const component of page.components) {
        const fieldValue = formData?.[component.fieldId];
        const result = ValidationEngine.validateComponent(component, fieldValue);
        
        if (!result.isValid) {
          validationResults[component.fieldId] = result;
          hasErrors = true;
        }
      }
    }

    // If validation fails, return validation results
    if (hasErrors) {
      console.warn('Form validation failed:', validationResults);
      return { success: false, validationResults };
    }

    // Basic validation - check if form has components
    if (currentComponents.length === 0) {
      console.warn('Cannot submit empty form');
      return { success: false, error: 'Form is empty' };
    }

    // Create submission data
    const submissionData = {
      templateName: formState.templateName,
      pages: formState.pages,
      formData: formData || {},
      submittedAt: new Date().toISOString(),
      totalPages: formState.pages.length,
      totalComponents: formState.pages.reduce((total, page) => total + page.components.length, 0),
      validationResults
    };

    console.log('Form submitted successfully:', submissionData);
    
    // Here you would typically send to an API
    // For now, we'll just log and return success
    return { success: true, submissionData };
  }, [formState, currentComponents]);

  const updatePageTitle = useCallback((pageId: string, title: string) => {
    executeAction({
      type: 'UPDATE_PAGE_TITLE',
      payload: { pageId, title }
    });
  }, [executeAction]);

  const loadFromJSON = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.templateName && parsed.pages) {
        saveToHistory(formState);
        setFormState(prev => ({
          ...prev,
          templateName: parsed.templateName,
          pages: parsed.pages,
          currentPageId: parsed.pages[0]?.id || 'page1',
          selectedComponentId: null,
          templateId: null
        }));
      }
    } catch (error) {
      console.error('Failed to load JSON:', error);
    }
  }, [formState, saveToHistory]);

  const loadTemplate = useCallback((template: any) => {
    console.log('Template updated:', template);
    if (!template || !template.pages || template.pages.length === 0) {
      console.error('Invalid template structure:', template);
      return;
    }
    
    saveToHistory(formState);
    setFormState(prev => ({
      ...prev,
      templateName: template.name || 'Untitled Form',
      pages: template.pages,
      currentPageId: template.pages[0]?.id || 'page1',
      selectedComponentId: null,
      templateId: template.id || template.templateId
    }));
  }, [formState, saveToHistory]);

  const selectedComponent = currentComponents.find(
    c => c.id === formState.selectedComponentId
  ) || null;

  // Page navigation functions
  const getCurrentPageIndex = useCallback(() => {
    return formState.pages.findIndex(page => page.id === formState.currentPageId);
  }, [formState.pages, formState.currentPageId]);

  const navigateToNextPage = useCallback(() => {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex < formState.pages.length - 1) {
      const nextPage = formState.pages[currentIndex + 1];
      executeAction({
        type: 'SWITCH_PAGE',
        payload: { pageId: nextPage.id }
      });
    }
  }, [getCurrentPageIndex, formState.pages, executeAction]);

  const navigateToPreviousPage = useCallback(() => {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex > 0) {
      const previousPage = formState.pages[currentIndex - 1];
      executeAction({
        type: 'SWITCH_PAGE',
        payload: { pageId: previousPage.id }
      });
    }
  }, [getCurrentPageIndex, formState.pages, executeAction]);

  const addNewPage = useCallback(() => {
    executeAction({
      type: 'ADD_PAGE',
      payload: { title: `Page ${formState.pages.length + 1}` }
    });
  }, [formState.pages.length, executeAction]);

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
    loadFromJSON,
    loadTemplate,
    updatePageTitle,
    // Page navigation
    getCurrentPageIndex,
    navigateToNextPage,
    navigateToPreviousPage,
    addNewPage,
    handleFormSubmit
  };
};