/**
 * SOLID PRINCIPLE REFACTORING - Single Responsibility & Dependency Inversion
 * FormStateManager focuses ONLY on state coordination
 * Delegates operations to specialized services
 */

import type { IFormState, IFormAction, IFormStateEngine, FormAction } from './interfaces/StateInterfaces';
import type { FormPage } from './interfaces/StateInterfaces';
import { ComponentEngine } from './ComponentEngine';

// Concrete implementation of FormState
export class FormState implements IFormState {
  public currentPageIndex: number;
  public pages: FormPage[];
  public selectedComponentId: string | null;

  constructor(
    currentPageIndex: number = 0,
    pages: FormPage[] = [],
    selectedComponentId: string | null = null
  ) {
    this.currentPageIndex = currentPageIndex;
    this.pages = pages;
    this.selectedComponentId = selectedComponentId;
  }

  get isMultiPage(): boolean {
    return this.pages.length > 1;
  }
}

// History management following Single Responsibility
class HistoryManager {
  private history: IFormAction[] = [];
  private currentIndex: number = -1;
  private readonly maxHistorySize = 50;

  addAction(action: IFormAction): void {
    // Remove any actions after current index (when we're in the middle of history)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new action
    this.history.push(action);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): IFormAction | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex + 1];
    }
    return null;
  }

  redo(): IFormAction | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  getHistory(): IFormAction[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

// Action executor following Single Responsibility
class ActionExecutor {
  static execute(state: IFormState, action: FormAction): IFormState {
    const newState = new FormState(
      state.currentPageIndex,
      [...state.pages],
      state.selectedComponentId
    );

    switch (action.type) {
      case 'ADD_COMPONENT':
        return this.executeAddComponent(newState, action);
      
      case 'UPDATE_COMPONENT':
        return this.executeUpdateComponent(newState, action);
      
      case 'DELETE_COMPONENT':
        return this.executeDeleteComponent(newState, action);
      
      case 'SELECT_COMPONENT':
        return this.executeSelectComponent(newState, action);
      
      case 'MOVE_COMPONENT':
        return this.executeMoveComponent(newState, action);
      
      case 'ADD_PAGE':
        return this.executeAddPage(newState, action);
      
      case 'REMOVE_PAGE':
        return this.executeRemovePage(newState, action);
      
      case 'NAVIGATE_TO_PAGE':
        return this.executeNavigateToPage(newState, action);
      
      case 'CLEAR_ALL':
        return this.executeClearAll(newState, action);
      
      case 'LOAD_FROM_JSON':
        return this.executeLoadFromJSON(newState, action);
      
      default:
        console.warn('Unknown action type:', (action as any).type);
        return state;
    }
  }

  private static executeAddComponent(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'ADD_COMPONENT') return state;
    
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) return state;

     
    const newComponent = ComponentEngine.createComponent(action.payload.componentType as any);
    const updatedComponents = [...currentPage.components];

    if (action.payload.targetId && action.payload.position) {
      // Insert with specific position logic
      const targetIndex = updatedComponents.findIndex(c => c.id === action.payload.targetId);
      if (targetIndex !== -1) {
        switch (action.payload.position) {
          case 'before':
            updatedComponents.splice(targetIndex, 0, newComponent);
            break;
          case 'after':
            updatedComponents.splice(targetIndex + 1, 0, newComponent);
            break;
          case 'inside':
            const targetComponent = updatedComponents[targetIndex];
            if ('children' in targetComponent && Array.isArray(targetComponent.children)) {
              targetComponent.children.push(newComponent);
            }
            break;
          default:
            updatedComponents.push(newComponent);
        }
      } else {
        updatedComponents.push(newComponent);
      }
    } else {
      updatedComponents.push(newComponent);
    }

    const updatedPages = [...state.pages];
    updatedPages[state.currentPageIndex] = {
      ...currentPage,
      components: updatedComponents
    };

    return new FormState(
      state.currentPageIndex,
      updatedPages,
      newComponent.id
    );
  }

  private static executeUpdateComponent(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'UPDATE_COMPONENT') return state;

    const updatedPages = state.pages.map(page => ({
      ...page,
      components: ComponentEngine.updateComponent(
        page.components,
        action.payload.componentId,
        action.payload.updates
      )
    }));

    return new FormState(
      state.currentPageIndex,
      updatedPages,
      state.selectedComponentId
    );
  }

  private static executeDeleteComponent(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'DELETE_COMPONENT') return state;

    const updatedPages = state.pages.map(page => ({
      ...page,
      components: ComponentEngine.removeComponent(
        page.components,
        action.payload.componentId
      )
    }));

    return new FormState(
      state.currentPageIndex,
      updatedPages,
      state.selectedComponentId === action.payload.componentId ? null : state.selectedComponentId
    );
  }

  private static executeSelectComponent(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'SELECT_COMPONENT') return state;

    return new FormState(
      state.currentPageIndex,
      state.pages,
      action.payload.componentId
    );
  }

  private static executeMoveComponent(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'MOVE_COMPONENT') return state;
    
    // Implementation would handle component movement logic
    // For now, return current state
    return state;
  }

  private static executeAddPage(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'ADD_PAGE') return state;

    const newPage: FormPage = {
      id: `page_${Date.now()}`,
      title: action.payload.title || `Page ${state.pages.length + 1}`,
      components: []
    };

    return new FormState(
      state.currentPageIndex,
      [...state.pages, newPage],
      state.selectedComponentId
    );
  }

  private static executeRemovePage(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'REMOVE_PAGE') return state;

    const updatedPages = state.pages.filter(page => page.id !== action.payload.pageId);
    
    return new FormState(
      Math.min(state.currentPageIndex, updatedPages.length - 1),
      updatedPages,
      state.selectedComponentId
    );
  }

  private static executeNavigateToPage(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'NAVIGATE_TO_PAGE') return state;

    const newPageIndex = Math.max(0, Math.min(action.payload.pageIndex, state.pages.length - 1));
    
    return new FormState(
      newPageIndex,
      state.pages,
      null // Clear selection when navigating
    );
  }

  private static executeClearAll(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'CLEAR_ALL') return state;

    const defaultPage: FormPage = {
      id: `page_${Date.now()}`,
      title: 'Page 1',
      components: []
    };

    return new FormState(0, [defaultPage], null);
  }

  private static executeLoadFromJSON(state: IFormState, action: FormAction): IFormState {
    if (action.type !== 'LOAD_FROM_JSON') return state;

    try {
      const { pages } = action.payload.jsonData;
      
      if (Array.isArray(pages) && pages.length > 0) {
        return new FormState(0, pages, null);
      }
    } catch (error) {
      console.error('Failed to load from JSON:', error);
    }

    return state;
  }
}

// Main FormStateEngine implementing the interface
export class FormStateEngine implements IFormStateEngine {
  private currentState: IFormState;
  private historyManager: HistoryManager;

  constructor(initialState?: Partial<IFormState>) {
    const defaultPage: FormPage = {
      id: `page_${Date.now()}`,
      title: 'Page 1',
      components: []
    };

    this.currentState = new FormState(
      initialState?.currentPageIndex || 0,
      initialState?.pages || [defaultPage],
      initialState?.selectedComponentId || null
    );
    
    this.historyManager = new HistoryManager();
  }

  getCurrentState(): IFormState {
    return this.currentState;
  }

  executeAction(action: IFormAction): IFormState {
    const newState = ActionExecutor.execute(this.currentState, action as FormAction);
    
    if (newState !== this.currentState) {
      this.historyManager.addAction(action);
      this.currentState = newState;
    }

    return this.currentState;
  }

  canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  undo(): IFormState {
    const action = this.historyManager.undo();
    if (action) {
      // For simplicity, we'll implement undo by maintaining state snapshots
      // In a production app, you'd implement inverse operations
      console.log('Undo action:', action.type);
    }
    return this.currentState;
  }

  redo(): IFormState {
    const action = this.historyManager.redo();
    if (action) {
      console.log('Redo action:', action.type);
    }
    return this.currentState;
  }

  getHistory(): IFormAction[] {
    return this.historyManager.getHistory();
  }
}