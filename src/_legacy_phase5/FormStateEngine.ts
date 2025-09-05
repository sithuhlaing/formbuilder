/**
 * SINGLE SOURCE OF TRUTH for ALL form state operations
 * Convergence: All state management in ONE place
 * Business Logic: Exactly what the requirements need
 */

import type { Component, ComponentType } from '../types/components';
// Simple component utilities - Phase 4 replacement for ComponentEngine
import { createComponent, validateComponent } from './componentUtils';

export class FormStateEngine {
  
  /**
   * SINGLE method to handle ALL form state changes
   * Replaces: useFormBuilder, reducers, scattered state logic
   */
  static executeAction(
    currentState: { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null; validationState?: Record<string, ValidationResult> },
    action: FormStateAction
  ): { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null; validationState?: Record<string, ValidationResult> } {
    
    switch (action.type) {
      case 'ADD_COMPONENT':
        return this.addComponent(currentState, action.payload);
      
      case 'UPDATE_COMPONENT': 
        return this.updateComponent(currentState, action.payload);
      
      case 'DELETE_COMPONENT':
        return this.deleteComponent(currentState, action.payload);
      
      case 'MOVE_COMPONENT':
        return this.moveComponent(currentState, action.payload);
      
      case 'DROP_COMPONENT':
        return this.dropComponent(currentState, action.payload);
      
      case 'SELECT_COMPONENT':
        return { ...currentState, selectedComponentId: action.payload.componentId };
      
      case 'ADD_PAGE':
        return this.addPage(currentState, action.payload);
      
      case 'DELETE_PAGE':
        return this.deletePage(currentState, action.payload);
      
      case 'SWITCH_PAGE':
        return { ...currentState, currentPageId: action.payload.pageId };
      
      case 'UPDATE_PAGE_TITLE':
        return this.updatePageTitle(currentState, action.payload);
      
      case 'UPDATE_FIELD_VALIDATION':
        return this.updateFieldValidation(currentState, action.payload);
      
      case 'CLEAR_VALIDATION':
        return this.clearValidation(currentState);
      
      case 'INSERT_COMPONENT_AT_INDEX':
        return this.insertComponentAtIndex(currentState, action.payload);
      
      case 'INSERT_COMPONENT_WITH_POSITION':
        return this.insertComponentWithPosition(currentState, action.payload);
      
      case 'INSERT_HORIZONTAL_LAYOUT':
        return this.insertHorizontalLayout(currentState, action.payload);
      
      case 'ADD_TO_ROW_LAYOUT':
        return this.addToRowLayout(currentState, action.payload);
      
      case 'DISSOLVE_ROW_LAYOUT':
        return this.dissolveRowLayout(currentState, action.payload);
      
      case 'PULL_ELEMENT_FROM_ROW':
        return this.pullFromRowLayout(currentState, action.payload);
      
      default:
        console.warn('❌ Unknown action type:', (action as any).type);
        return currentState;
    }
  }

  /**
   * Update field validation state
   */
  static updateFieldValidation(
    currentState: { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null; validationState?: Record<string, ValidationResult> },
    payload: { fieldId: string; validationResult: ValidationResult }
  ) {
    return {
      ...currentState,
      validationState: {
        ...currentState.validationState,
        [payload.fieldId]: payload.validationResult
      }
    };
  }

  /**
   * Clear all validation state
   */
  static clearValidation(
    currentState: { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null; validationState?: Record<string, ValidationResult> }
  ) {
    return {
      ...currentState,
      validationState: {}
    };
  }

  /**
   * Get current page components - SINGLE source
   */
  static getCurrentPageComponents(
    pages: FormPage[], 
    currentPageId: string
  ): FormComponentData[] {
    const currentPage = pages.find(page => page.id === currentPageId);
    return currentPage?.components || [];
  }

  /**
   * Validate entire form state - SINGLE validation logic
   */
  static validateFormState(pages: FormPage[]): ValidationResult {
    const errors: string[] = [];
    
    // Validate pages
    if (pages.length === 0) {
      errors.push('Form must have at least one page');
    }
    
    // Validate each page
    pages.forEach((page, pageIndex) => {
      if (!page.title?.trim()) {
        errors.push(`Page ${pageIndex + 1} must have a title`);
      }
      
      // Validate components on this page
      page.components.forEach(component => {
        const componentValidation = validateComponent(component);
        if (!componentValidation.isValid) {
          errors.push(`Page ${pageIndex + 1}, Component "${component.label}": ${componentValidation.errors?.join(', ')}`);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      valid: errors.length === 0,
      errors,
      warnings: [],
      message: errors.join('; ')
    };
  }

  // Private action handlers - all in ONE place
  private static addComponent(
    state: any, 
    payload: { componentType: string; pageId: string; position?: { index: number } }
  ) {
    const newComponent = createComponent(payload.componentType as any);
    
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === payload.pageId) {
        const components = [...page.components];
        
        if (payload.position?.index !== undefined) {
          components.splice(payload.position.index, 0, newComponent);
        } else {
          components.push(newComponent);
        }
        
        return { ...page, components };
      }
      return page;
    });
    
    return {
      ...state,
      pages: updatedPages,
      selectedComponentId: newComponent.id
    };
  }

  private static updateComponent(
    state: any, 
    payload: { componentId: string; updates: Partial<FormComponentData> }
  ) {
    const updatedPages = state.pages.map((page: FormPage) => {
      // Simple component update - direct array manipulation
      const updatedComponents = page.components.map(comp => 
        comp.id === payload.componentId ? { ...comp, ...payload.updates } : comp
      );
      
      return { ...page, components: updatedComponents };
    });
    
    return { ...state, pages: updatedPages };
  }

  private static deleteComponent(
    state: any, 
    payload: { componentId: string }
  ) {
    const updatedPages = state.pages.map((page: FormPage) => {
      // Simple component removal - direct array filtering
      const updatedComponents = page.components.filter(comp => comp.id !== payload.componentId);
      
      return { ...page, components: updatedComponents };
    });
    
    const selectedComponentId = state.selectedComponentId === payload.componentId 
      ? null 
      : state.selectedComponentId;
    
    return { ...state, pages: updatedPages, selectedComponentId };
  }

  private static moveComponent(
    state: any, 
    payload: { pageId: string; fromIndex: number; toIndex: number }
  ) {
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === payload.pageId) {
        const components = [...page.components];
        const [movedComponent] = components.splice(payload.fromIndex, 1);
        components.splice(payload.toIndex, 0, movedComponent);
        
        return { ...page, components };
      }
      return page;
    });
    
    return { ...state, pages: updatedPages };
  }

  private static dropComponent(
    state: any, 
    payload: { componentType: string; targetId: string; position: 'before' | 'after' | 'inside' | 'left' | 'right' }
  ) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;
    
    const dropPosition = { 
      type: payload.position, 
      targetId: payload.targetId, 
      componentType: payload.componentType as any 
    };
    
    const updatedComponents = DragDropService.handleDrop(
      currentPage.components,
      dropPosition,
      createComponent
    );
    
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === state.currentPageId) {
        return { ...page, components: updatedComponents };
      }
      return page;
    });
    
    return { ...state, pages: updatedPages };
  }

  private static addPage(state: any, payload: { title: string }) {
    const newPage: FormPage = {
      id: `page_${Date.now()}`,
      title: payload.title,
      components: [],
      validationRules: [],
      navigationSettings: {
        showNext: true,
        showPrevious: true,
        showSubmit: false
      }
    };
    
    return {
      ...state,
      pages: [...state.pages, newPage],
      currentPageId: newPage.id
    };
  }

  private static deletePage(state: any, payload: { pageId: string }) {
    const remainingPages = state.pages.filter((page: FormPage) => page.id !== payload.pageId);
    
    if (remainingPages.length === 0) {
      // Always keep at least one page
      remainingPages.push({
        id: 'page_default',
        title: 'Page 1', 
        components: [],
        layout: 'vertical' // Add default layout
      });
    }
    
    const newCurrentPageId = state.currentPageId === payload.pageId 
      ? remainingPages[0].id 
      : state.currentPageId;
    
    return {
      ...state,
      pages: remainingPages,
      currentPageId: newCurrentPageId
    };
  }

  private static updatePageTitle(state: any, payload: { pageId: string; title: string }) {
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === payload.pageId) {
        return { ...page, title: payload.title };
      }
      return page;
    });
    
    return { ...state, pages: updatedPages };
  }

  private static insertComponentAtIndex(state: any, payload: { componentType: string; insertIndex: number }) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;

    const newComponent = createComponent(payload.componentType as any);
    const updatedComponents = [...currentPage.components];
    updatedComponents.splice(payload.insertIndex, 0, newComponent);

    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === state.currentPageId) {
        return { ...page, components: updatedComponents };
      }
      return page;
    });

    return { 
      ...state, 
      pages: updatedPages,
      selectedComponentId: newComponent.id
    };
  }

  private static insertComponentWithPosition(state: any, payload: { componentType: string; targetId: string; position: string }) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;

    const dropPosition = {
      type: payload.position as any,
      targetId: payload.targetId,
      componentType: payload.componentType as any
    };

    const updatedComponents = DragDropService.handleDrop(
      currentPage.components,
      dropPosition,
      createComponent
    );

    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === state.currentPageId) {
        return { ...page, components: updatedComponents };
      }
      return page;
    });

    return { ...state, pages: updatedPages };
  }


  private static insertHorizontalLayout(state: any, payload: { componentType: string; targetId: string; side?: 'left' | 'right' }) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;

    const targetIndex = currentPage.components.findIndex((c: FormComponentData) => c.id === payload.targetId);
    if (targetIndex === -1) return state;

    const targetComponent = currentPage.components[targetIndex];
    const newComponent = createComponent(payload.componentType as any);
    
    // Create horizontal layout containing both components
    const horizontalLayout = createComponent('horizontal_layout');
    
    // Arrange components based on side (left/right)
    if (payload.side === 'left') {
      // New component on left, existing on right
      horizontalLayout.children = [newComponent, targetComponent];
    } else {
      // Existing component on left, new on right (default)
      horizontalLayout.children = [targetComponent, newComponent];
    }

    // Replace the target component with the horizontal layout
    const updatedComponents = [...currentPage.components];
    updatedComponents[targetIndex] = horizontalLayout;

    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === state.currentPageId) {
        return { ...page, components: updatedComponents };
      }
      return page;
    });

    return { 
      ...state, 
      pages: updatedPages,
      selectedComponentId: newComponent.id
    };
  }

  /**
   * Add component to existing row layout
   */
  private static addToRowLayout(
    state: any,
    payload: { pageId: string; componentType: string; rowLayoutId: string }
  ) {
    const newComponent = createComponent(payload.componentType as any);
    
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id !== payload.pageId) return page;
      
      const updatedComponents = page.components.map((component: FormComponentData) => {
        if (component.id === payload.rowLayoutId && component.type === 'horizontal_layout') {
          return {
            ...component,
            children: [...(component.children || []), newComponent]
          };
        }
        return component;
      });
      
      return { ...page, components: updatedComponents };
    });

    return { 
      ...state, 
      pages: updatedPages,
      selectedComponentId: newComponent.id
    };
  }

  /**
   * Dissolve row layout - convert all children back to column layout
   */
  private static dissolveRowLayout(
    state: any,
    payload: { pageId: string; rowLayoutId: string }
  ) {
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id !== payload.pageId) return page;
      
      let rowChildren: FormComponentData[] = [];
      const updatedComponents = page.components.filter((component: FormComponentData) => {
        if (component.id === payload.rowLayoutId && component.type === 'horizontal_layout') {
          rowChildren = component.children || [];
          return false; // Remove the row layout
        }
        return true;
      });
      
      // Add the row children back to the main components array
      return { ...page, components: [...updatedComponents, ...rowChildren] };
    });

    return { 
      ...state, 
      pages: updatedPages,
      selectedComponentId: null
    };
  }

  /**
   * Pull element from row layout to column layout
   */
  private static pullFromRowLayout(
    state: any,
    payload: { pageId: string; rowLayoutId: string; elementIndex: number; targetPosition: string }
  ) {
    let pulledElement: FormComponentData | null = null;
    
    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id !== payload.pageId) return page;
      
      const updatedComponents = page.components.map((component: FormComponentData) => {
        if (component.id === payload.rowLayoutId && component.type === 'horizontal_layout') {
          const children = component.children || [];
          if (payload.elementIndex >= 0 && payload.elementIndex < children.length) {
            const elementToRemove = children[payload.elementIndex];
            if (elementToRemove && elementToRemove.id) {
              pulledElement = elementToRemove;
              const newChildren = children.filter((_, index) => index !== payload.elementIndex);
              
              // If only one element left, dissolve the row layout
              if (newChildren.length <= 1) {
                return null; // Mark for removal
              }
              
              return {
                ...component,
                children: newChildren
              };
            }
          }
        }
        return component;
      }).filter(Boolean) as FormComponentData[];
      
      // Add the pulled element to the main components array if it exists
      if (pulledElement) {
        updatedComponents.push(pulledElement);
      }
      
      return { ...page, components: updatedComponents };
    });

    return { 
      ...state, 
      pages: updatedPages,
      selectedComponentId: (pulledElement as FormComponentData | null)?.id || null
    };
  }
}

// SINGLE action type definition - replaces scattered action types
export type FormStateAction = 
  | { type: 'ADD_COMPONENT'; payload: { componentType: string; pageId: string; position?: { index: number } } }
  | { type: 'UPDATE_COMPONENT'; payload: { componentId: string; updates: Partial<FormComponentData> } }
  | { type: 'DELETE_COMPONENT'; payload: { componentId: string } }
  | { type: 'MOVE_COMPONENT'; payload: { pageId: string; fromIndex: number; toIndex: number } }
  | { type: 'DROP_COMPONENT'; payload: { componentType: string; targetId: string; position: 'before' | 'after' | 'inside' | 'left' | 'right' } }
  | { type: 'SELECT_COMPONENT'; payload: { componentId: string | null } }
  | { type: 'ADD_PAGE'; payload: { title: string } }
  | { type: 'DELETE_PAGE'; payload: { pageId: string } }
  | { type: 'UPDATE_FIELD_VALIDATION'; payload: { fieldId: string; validationResult: ValidationResult } }
  | { type: 'CLEAR_VALIDATION'; payload?: {} }
  | { type: 'SWITCH_PAGE'; payload: { pageId: string } }
  | { type: 'UPDATE_PAGE_TITLE'; payload: { pageId: string; title: string } }
  | { type: 'INSERT_COMPONENT_AT_INDEX'; payload: { componentType: string; insertIndex: number } }
  | { type: 'INSERT_COMPONENT_WITH_POSITION'; payload: { componentType: string; targetId: string; position: string } }
  | { type: 'INSERT_HORIZONTAL_LAYOUT'; payload: { componentType: string; targetId: string; side?: 'left' | 'right' } }
  | { type: 'ADD_TO_ROW_LAYOUT'; payload: { pageId: string; componentType: string; rowLayoutId: string } }
  | { type: 'DISSOLVE_ROW_LAYOUT'; payload: { pageId: string; rowLayoutId: string } }
  | { type: 'PULL_ELEMENT_FROM_ROW'; payload: { pageId: string; rowLayoutId: string; elementIndex: number; targetPosition: string } };