/**
 * SOLID PRINCIPLE REFACTORING - Dependency Inversion Principle
 * Abstract interfaces for state management - depend on abstractions, not concretions
 */

import type { FormComponentData } from './ComponentInterfaces';

// Base state interface - what all form states must have
export interface IFormState {
  currentPageIndex: number;
  pages: FormPage[];
  selectedComponentId: string | null;
  readonly isMultiPage: boolean;
}

// Page structure interface
export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
}

// Action interface - what all actions must implement
export interface IFormAction {
  readonly type: string;
  readonly payload?: Record<string, unknown>;
  readonly timestamp: number;
}

// State engine interface - what all state engines must implement
export interface IFormStateEngine {
  getCurrentState(): IFormState;
  executeAction(action: IFormAction): IFormState;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): IFormState;
  redo(): IFormState;
  getHistory(): IFormAction[];
}

// Query interface - read-only operations
export interface IFormQueries {
  getCurrentPage(): FormPage;
  getAllComponents(): FormComponentData[];
  findComponent(id: string): FormComponentData | null;
  getSelectedComponent(): FormComponentData | null;
  getComponentPath(id: string): string[];
  isValidForm(): boolean;
}

// Command interface - write operations  
export interface IFormCommands {
  addComponent(type: string, targetId?: string, position?: string): void;
  updateComponent(id: string, updates: Partial<FormComponentData>): void;
  deleteComponent(id: string): void;
  selectComponent(id: string): void;
  moveComponent(fromId: string, toId: string, position: string): void;
  addPage(title: string): void;
  removePage(pageId: string): void;
  navigateToPage(pageIndex: number): void;
}

// Specific action types following Single Responsibility
export interface AddComponentAction extends IFormAction {
  type: 'ADD_COMPONENT';
  payload: {
    componentType: string;
    targetId?: string;
    position?: 'before' | 'after' | 'inside' | 'left' | 'right';
  };
}

export interface UpdateComponentAction extends IFormAction {
  type: 'UPDATE_COMPONENT';
  payload: {
    componentId: string;
    updates: Partial<FormComponentData>;
  };
}

export interface DeleteComponentAction extends IFormAction {
  type: 'DELETE_COMPONENT';
  payload: {
    componentId: string;
  };
}

export interface SelectComponentAction extends IFormAction {
  type: 'SELECT_COMPONENT';
  payload: {
    componentId: string | null;
  };
}

export interface MoveComponentAction extends IFormAction {
  type: 'MOVE_COMPONENT';
  payload: {
    fromId: string;
    toId: string;
    position: 'before' | 'after' | 'inside' | 'left' | 'right';
  };
}

export interface AddPageAction extends IFormAction {
  type: 'ADD_PAGE';
  payload: {
    title: string;
  };
}

export interface RemovePageAction extends IFormAction {
  type: 'REMOVE_PAGE';
  payload: {
    pageId: string;
  };
}

export interface NavigateToPageAction extends IFormAction {
  type: 'NAVIGATE_TO_PAGE';
  payload: {
    pageIndex: number;
  };
}

export interface ClearAllAction extends IFormAction {
  type: 'CLEAR_ALL';
  payload: {};
}

export interface LoadFromJSONAction extends IFormAction {
  type: 'LOAD_FROM_JSON';
  payload: {
    jsonData: Record<string, unknown>;
  };
}

// Union type of all possible actions
export type FormAction = 
  | AddComponentAction 
  | UpdateComponentAction 
  | DeleteComponentAction 
  | SelectComponentAction 
  | MoveComponentAction 
  | AddPageAction 
  | RemovePageAction 
  | NavigateToPageAction 
  | ClearAllAction 
  | LoadFromJSONAction;

// Validation interface
export interface IFormValidator {
  validateState(state: IFormState): { isValid: boolean; errors: string[] };
  validateComponent(component: FormComponentData): { isValid: boolean; errors: string[] };
  validatePage(page: FormPage): { isValid: boolean; errors: string[] };
}