/**
 * FormState - Consolidated Data Layer
 * Centralized state management for the simplified architecture
 */

import type { FormComponentData, ComponentType } from '../types/component';

export interface FormStateData {
  id: string;
  title: string;
  description?: string;
  components: FormComponentData[];
  pages: FormPage[];
  currentPageId: string;
  metadata: FormMetadata;
  settings: FormSettings;
}

export interface FormPage {
  id: string;
  title: string;
  components: FormComponentData[];
  order: number;
}

export interface FormMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author?: string;
  tags: string[];
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  showProgressBar: boolean;
  theme: 'light' | 'dark' | 'auto';
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
}

export interface FormStateConfig {
  enableMultiPage: boolean;
  enableVersioning: boolean;
  enablePersistence: boolean;
  autoSave: boolean;
  maxHistorySize: number;
}

export interface StateChangeEvent {
  type: 'component_added' | 'component_updated' | 'component_deleted' | 'component_moved' | 
        'page_added' | 'page_deleted' | 'title_changed' | 'settings_updated';
  payload: any;
  timestamp: Date;
}

export class FormState {
  private data: FormStateData;
  private config: FormStateConfig;
  private history: FormStateData[] = [];
  private historyIndex: number = -1;
  private listeners: Set<(event: StateChangeEvent) => void> = new Set();
  private changeListeners: Set<(state: FormStateData) => void> = new Set();

  constructor(
    initialData?: Partial<FormStateData>,
    config: Partial<FormStateConfig> = {}
  ) {
    this.config = {
      enableMultiPage: true,
      enableVersioning: true,
      enablePersistence: true,
      autoSave: true,
      maxHistorySize: 50,
      ...config
    };

    this.data = {
      id: initialData?.id || `form_${Date.now()}`,
      title: initialData?.title || 'Untitled Form',
      description: initialData?.description || '',
      components: initialData?.components || [],
      pages: initialData?.pages || [this.createDefaultPage()],
      currentPageId: initialData?.currentPageId || 'page_1',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: undefined,
        tags: [],
        ...initialData?.metadata
      },
      settings: {
        allowMultipleSubmissions: false,
        requireAuthentication: false,
        showProgressBar: true,
        theme: 'light',
        submitButtonText: 'Submit',
        successMessage: 'Form submitted successfully!',
        errorMessage: 'Please fix the errors below.',
        ...initialData?.settings
      }
    };

    this.saveToHistory();
  }

  /**
   * Get current form state
   */
  getState(): FormStateData {
    return { ...this.data };
  }

  /**
   * Get current page components
   */
  getCurrentPageComponents(): FormComponentData[] {
    if (!this.config.enableMultiPage) {
      return this.data.components;
    }

    const currentPage = this.data.pages.find(page => page.id === this.data.currentPageId);
    return currentPage?.components || [];
  }

  /**
   * Set current page components
   */
  setCurrentPageComponents(components: FormComponentData[]): void {
    if (!this.config.enableMultiPage) {
      this.data.components = components;
    } else {
      const pageIndex = this.data.pages.findIndex(page => page.id === this.data.currentPageId);
      if (pageIndex !== -1) {
        this.data.pages[pageIndex].components = components;
      }
    }
    
    this.updateTimestamp();
    this.saveToHistory();
    this.notifyChange();
  }

  /**
   * Add component
   */
  addComponent(component: FormComponentData, pageId?: string): void {
    const targetPageId = pageId || this.data.currentPageId;
    
    if (!this.config.enableMultiPage) {
      this.data.components.push(component);
    } else {
      const pageIndex = this.data.pages.findIndex(page => page.id === targetPageId);
      if (pageIndex !== -1) {
        this.data.pages[pageIndex].components.push(component);
      }
    }

    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'component_added',
      payload: { component, pageId: targetPageId },
      timestamp: new Date()
    });
  }

  /**
   * Update component
   */
  updateComponent(componentId: string, updates: Partial<FormComponentData>): boolean {
    const updateInArray = (components: FormComponentData[]): boolean => {
      for (let i = 0; i < components.length; i++) {
        if (components[i].id === componentId) {
          components[i] = { ...components[i], ...updates };
          return true;
        }
        
        // Check nested components (horizontal layouts)
        if (components[i].type === 'horizontal_layout' && components[i].children) {
          if (updateInArray(components[i].children!)) {
            return true;
          }
        }
      }
      return false;
    };

    let updated = false;

    if (!this.config.enableMultiPage) {
      updated = updateInArray(this.data.components);
    } else {
      for (const page of this.data.pages) {
        if (updateInArray(page.components)) {
          updated = true;
          break;
        }
      }
    }

    if (updated) {
      this.updateTimestamp();
      this.saveToHistory();
      this.emitEvent({
        type: 'component_updated',
        payload: { componentId, updates },
        timestamp: new Date()
      });
    }

    return updated;
  }

  /**
   * Delete component
   */
  deleteComponent(componentId: string): boolean {
    const deleteFromArray = (components: FormComponentData[]): boolean => {
      for (let i = 0; i < components.length; i++) {
        if (components[i].id === componentId) {
          components.splice(i, 1);
          return true;
        }
        
        // Check nested components (horizontal layouts)
        if (components[i].type === 'horizontal_layout' && components[i].children) {
          if (deleteFromArray(components[i].children!)) {
            // Auto-dissolve layout if only one child remains
            if (components[i].children!.length === 1) {
              const remainingChild = components[i].children![0];
              components[i] = remainingChild;
            } else if (components[i].children!.length === 0) {
              components.splice(i, 1);
            }
            return true;
          }
        }
      }
      return false;
    };

    let deleted = false;

    if (!this.config.enableMultiPage) {
      deleted = deleteFromArray(this.data.components);
    } else {
      for (const page of this.data.pages) {
        if (deleteFromArray(page.components)) {
          deleted = true;
          break;
        }
      }
    }

    if (deleted) {
      this.updateTimestamp();
      this.saveToHistory();
      this.emitEvent({
        type: 'component_deleted',
        payload: { componentId },
        timestamp: new Date()
      });
    }

    return deleted;
  }

  /**
   * Find component by ID
   */
  findComponent(componentId: string): FormComponentData | null {
    const searchInArray = (components: FormComponentData[]): FormComponentData | null => {
      for (const component of components) {
        if (component.id === componentId) {
          return component;
        }
        
        if (component.type === 'horizontal_layout' && component.children) {
          const found = searchInArray(component.children);
          if (found) return found;
        }
      }
      return null;
    };

    if (!this.config.enableMultiPage) {
      return searchInArray(this.data.components);
    } else {
      for (const page of this.data.pages) {
        const found = searchInArray(page.components);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Move component
   */
  moveComponent(sourceId: string, targetId: string, position: 'before' | 'after' | 'inside'): boolean {
    // Implementation would be complex, delegating to DragDropLogic
    // This is a placeholder for the interface
    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'component_moved',
      payload: { sourceId, targetId, position },
      timestamp: new Date()
    });
    return true;
  }

  /**
   * Update form title
   */
  setTitle(title: string): void {
    this.data.title = title;
    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'title_changed',
      payload: { title },
      timestamp: new Date()
    });
  }

  /**
   * Update form settings
   */
  updateSettings(updates: Partial<FormSettings>): void {
    this.data.settings = { ...this.data.settings, ...updates };
    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'settings_updated',
      payload: { updates },
      timestamp: new Date()
    });
  }

  /**
   * Add new page
   */
  addPage(title: string = 'New Page'): FormPage {
    if (!this.config.enableMultiPage) {
      throw new Error('Multi-page is not enabled');
    }

    const newPage: FormPage = {
      id: `page_${Date.now()}`,
      title,
      components: [],
      order: this.data.pages.length + 1
    };

    this.data.pages.push(newPage);
    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'page_added',
      payload: { page: newPage },
      timestamp: new Date()
    });

    return newPage;
  }

  /**
   * Delete page
   */
  deletePage(pageId: string): boolean {
    if (!this.config.enableMultiPage || this.data.pages.length <= 1) {
      return false;
    }

    const pageIndex = this.data.pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) {
      return false;
    }

    this.data.pages.splice(pageIndex, 1);

    // Update current page if deleted
    if (this.data.currentPageId === pageId) {
      this.data.currentPageId = this.data.pages[0]?.id || '';
    }

    // Reorder remaining pages
    this.data.pages.forEach((page, index) => {
      page.order = index + 1;
    });

    this.updateTimestamp();
    this.saveToHistory();
    this.emitEvent({
      type: 'page_deleted',
      payload: { pageId },
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Set current page
   */
  setCurrentPage(pageId: string): boolean {
    if (!this.config.enableMultiPage) {
      return false;
    }

    const pageExists = this.data.pages.some(page => page.id === pageId);
    if (!pageExists) {
      return false;
    }

    this.data.currentPageId = pageId;
    this.notifyChange();
    return true;
  }

  /**
   * Get form statistics
   */
  getStats(): {
    totalComponents: number;
    totalPages: number;
    componentsByType: Record<ComponentType, number>;
    lastModified: Date;
  } {
    const allComponents = this.config.enableMultiPage
      ? this.data.pages.flatMap(page => page.components)
      : this.data.components;

    const componentsByType = allComponents.reduce((acc, component) => {
      acc[component.type] = (acc[component.type] || 0) + 1;
      return acc;
    }, {} as Record<ComponentType, number>);

    return {
      totalComponents: allComponents.length,
      totalPages: this.config.enableMultiPage ? this.data.pages.length : 1,
      componentsByType,
      lastModified: this.data.metadata.updatedAt
    };
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    if (!this.config.enableVersioning || this.historyIndex <= 0) {
      return false;
    }

    this.historyIndex--;
    this.data = { ...this.history[this.historyIndex] };
    this.notifyChange();
    return true;
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    if (!this.config.enableVersioning || this.historyIndex >= this.history.length - 1) {
      return false;
    }

    this.historyIndex++;
    this.data = { ...this.history[this.historyIndex] };
    this.notifyChange();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.config.enableVersioning && this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.config.enableVersioning && this.historyIndex < this.history.length - 1;
  }

  /**
   * Export form data
   */
  export(): FormStateData {
    return { ...this.data };
  }

  /**
   * Import form data
   */
  import(data: FormStateData): void {
    this.data = { ...data };
    this.updateTimestamp();
    this.saveToHistory();
    this.notifyChange();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: FormStateData) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Subscribe to events
   */
  addEventListener(listener: (event: StateChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get configuration
   */
  getConfig(): FormStateConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<FormStateConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Private: Create default page
   */
  private createDefaultPage(): FormPage {
    return {
      id: 'page_1',
      title: 'Page 1',
      components: [],
      order: 1
    };
  }

  /**
   * Private: Update timestamp
   */
  private updateTimestamp(): void {
    this.data.metadata.updatedAt = new Date();
  }

  /**
   * Private: Save to history
   */
  private saveToHistory(): void {
    if (!this.config.enableVersioning) return;

    // Remove any future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.history.push({ ...this.data });
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.config.maxHistorySize) {
      this.history = this.history.slice(-this.config.maxHistorySize);
      this.historyIndex = this.history.length - 1;
    }
  }

  /**
   * Private: Emit event
   */
  private emitEvent(event: StateChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
    this.notifyChange();
  }

  /**
   * Private: Notify state change
   */
  private notifyChange(): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(this.data);
      } catch (error) {
        console.error('Error in change listener:', error);
      }
    });
  }
}
