/**
 * SINGLE SOURCE OF TRUTH for ALL form state operations
 * Convergence: All state management in ONE place
 * Business Logic: Exactly what the requirements need
 */

import type { FormComponentData, FormPage } from '../types';
import { ComponentEngine } from './ComponentEngine';
import { DragDropService } from '../features/drag-drop';

export class FormStateEngine {
  
  /**
   * SINGLE method to handle ALL form state changes
   * Replaces: useFormBuilder, reducers, scattered state logic
   */
  static executeAction(
    currentState: { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null },
    action: FormStateAction
  ): { pages: FormPage[]; currentPageId: string; selectedComponentId: string | null } {
    
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
      
      case 'INSERT_COMPONENT_AT_INDEX':
        return this.insertComponentAtIndex(currentState, action.payload);
      
      case 'INSERT_COMPONENT_WITH_POSITION':
        return this.insertComponentWithPosition(currentState, action.payload);
      
      case 'INSERT_HORIZONTAL_LAYOUT':
        return this.insertHorizontalLayout(currentState, action.payload);
      
      default:
        console.warn('❌ Unknown action type:', (action as any).type);
        return currentState;
    }
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
  static validateFormState(pages: FormPage[]): { valid: boolean; errors: string[] } {
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
        const componentValidation = ComponentEngine.validateComponent(component);
        if (!componentValidation.valid) {
          errors.push(`Page ${pageIndex + 1}, Component "${component.label}": ${componentValidation.errors.join(', ')}`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Private action handlers - all in ONE place
  private static addComponent(
    state: any, 
    payload: { componentType: string; pageId: string; position?: { index: number } }
  ) {
    const newComponent = ComponentEngine.createComponent(payload.componentType as any);
    
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
      const updatedComponents = ComponentEngine.updateComponent(
        page.components, 
        payload.componentId, 
        payload.updates
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
      const updatedComponents = ComponentEngine.removeComponent(
        page.components, 
        payload.componentId
      );
      
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
      ComponentEngine.createComponent
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
      components: []
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
        components: []
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

  private static insertComponentAtIndex(state: any, payload: { componentType: string; insertIndex: number }) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;

    const newComponent = ComponentEngine.createComponent(payload.componentType as any);
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
      ComponentEngine.createComponent
    );

    const updatedPages = state.pages.map((page: FormPage) => {
      if (page.id === state.currentPageId) {
        return { ...page, components: updatedComponents };
      }
      return page;
    });

    return { ...state, pages: updatedPages };
  }

  private static insertHorizontalLayout(state: any, payload: { componentType: string; targetId: string }) {
    const currentPage = state.pages.find((page: FormPage) => page.id === state.currentPageId);
    if (!currentPage) return state;

    const targetIndex = currentPage.components.findIndex(c => c.id === payload.targetId);
    if (targetIndex === -1) return state;

    const targetComponent = currentPage.components[targetIndex];
    const newComponent = ComponentEngine.createComponent(payload.componentType as any);
    
    // Create horizontal layout containing both components
    const horizontalLayout = ComponentEngine.createComponent('horizontal_layout');
    horizontalLayout.children = [targetComponent, newComponent];

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
  | { type: 'SWITCH_PAGE'; payload: { pageId: string } }
  | { type: 'INSERT_COMPONENT_AT_INDEX'; payload: { componentType: string; insertIndex: number } }
  | { type: 'INSERT_COMPONENT_WITH_POSITION'; payload: { componentType: string; targetId: string; position: string } }
  | { type: 'INSERT_HORIZONTAL_LAYOUT'; payload: { componentType: string; targetId: string } };