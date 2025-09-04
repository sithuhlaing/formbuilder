/**
 * CanvasManager - Central Orchestrator for Cross-Domain Form Builder
 * Simplifies architecture by consolidating logic and coordinating between layers
 */

import { DragDropService } from '../features/drag-drop/services/DragDropService';
import { ComponentEngine } from './ComponentEngine';
import type { FormComponentData, ComponentType } from '../types/component';

export interface CanvasManagerConfig {
  enableDragDrop?: boolean;
  enableMultiPage?: boolean;
  enableRealTimeUpdates?: boolean;
  crossDomainMode?: 'forms' | 'surveys' | 'workflows' | 'generic';
}

export interface CanvasState {
  selectedComponentId: string | null;
  currentPageId: string;
  isDragging: boolean;
  isLoading: boolean;
  components: FormComponentData[];
  formTitle: string;
}

export class CanvasManager {
  private config: Required<CanvasManagerConfig>;
  private state: CanvasState;
  private listeners: Set<(state: CanvasState) => void> = new Set();

  constructor(config: CanvasManagerConfig = {}) {
    this.config = {
      enableDragDrop: true,
      enableMultiPage: true,
      enableRealTimeUpdates: true,
      crossDomainMode: 'forms',
      ...config
    };

    this.state = {
      selectedComponentId: null,
      currentPageId: '',
      isDragging: false,
      isLoading: false,
      components: [],
      formTitle: 'Untitled Form'
    };
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Get current canvas state
   */
  getState(): CanvasState {
    return { ...this.state };
  }

  /**
   * Get canvas configuration
   */
  getConfig(): Required<CanvasManagerConfig> {
    return { ...this.config };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: CanvasState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<CanvasState>): void {
    this.state = { ...this.state, ...updates };
    
    if (this.config.enableRealTimeUpdates) {
      this.listeners.forEach(listener => listener(this.state));
    }
  }

  // ============================================================================
  // COMPONENT MANAGEMENT
  // ============================================================================

  /**
   * Add component to canvas
   */
  addComponent(componentType: ComponentType, position?: { index?: number; targetId?: string; side?: 'left' | 'right' }): void {
    if (!this.config.enableDragDrop) return;

    const newComponent = ComponentEngine.createComponent(componentType);
    
    if (position?.targetId && position?.side) {
      // Create horizontal layout
      const updatedComponents = DragDropService.handleDrop(
        this.state.components,
        {
          type: position.side,
          targetId: position.targetId,
          componentType
        },
        ComponentEngine.createComponent
      );
      this.updateState({ components: updatedComponents });
    } else if (position?.index !== undefined) {
      // Insert at specific index
      const components = [...this.state.components];
      components.splice(position.index, 0, newComponent);
      this.updateState({ components });
    } else {
      // Append to end
      this.updateState({ 
        components: [...this.state.components, newComponent] 
      });
    }

    // Auto-select new component
    this.selectComponent(newComponent.id);
  }

  /**
   * Update component properties
   */
  updateComponent(componentId: string, updates: Partial<FormComponentData>): void {
    const updateComponentInArray = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === componentId) {
          return { ...component, ...updates };
        } else if (component.type === 'horizontal_layout' && component.children) {
          return {
            ...component,
            children: updateComponentInArray(component.children)
          };
        }
        return component;
      });
    };

    const updatedComponents = updateComponentInArray(this.state.components);
    this.updateState({ components: updatedComponents });
  }

  /**
   * Delete component
   */
  deleteComponent(componentId: string): void {
    const deleteFromArray = (components: FormComponentData[]): FormComponentData[] => {
      const result: FormComponentData[] = [];
      
      for (const component of components) {
        if (component.id === componentId) {
          // Skip this component (delete it)
          continue;
        } else if (component.type === 'horizontal_layout' && component.children) {
          const updatedChildren = deleteFromArray(component.children);
          
          // Auto-dissolve layout if only one child remains
          if (updatedChildren.length === 1) {
            result.push(updatedChildren[0]);
          } else if (updatedChildren.length > 1) {
            result.push({ ...component, children: updatedChildren });
          }
          // If no children, don't add the layout
        } else {
          result.push(component);
        }
      }
      
      return result;
    };

    const components = deleteFromArray(this.state.components);
    this.updateState({ 
      components,
      selectedComponentId: this.state.selectedComponentId === componentId ? null : this.state.selectedComponentId
    });
  }

  /**
   * Move component to new position
   */
  moveComponent(fromIndex: number, toIndex: number): void {
    if (!this.config.enableDragDrop) return;

    const components = [...this.state.components];
    const [movedComponent] = components.splice(fromIndex, 1);
    components.splice(toIndex, 0, movedComponent);
    
    this.updateState({ components });
  }

  /**
   * Select component for property editing
   */
  selectComponent(componentId: string | null): void {
    this.updateState({ selectedComponentId: componentId });
  }

  /**
   * Get selected component from current state
   */
  getSelectedComponent(): FormComponentData | null {
    if (!this.state.selectedComponentId) return null;

    const findComponentById = (components: FormComponentData[], id: string): FormComponentData | null => {
      for (const component of components) {
        if (component.id === id) {
          return component;
        }
        if (component.type === 'horizontal_layout' && component.children) {
          const found = findComponentById(component.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findComponentById(this.state.components, this.state.selectedComponentId);
  }

  // ============================================================================
  // DRAG AND DROP COORDINATION
  // ============================================================================

  /**
   * Handle drag start
   */
  onDragStart(componentId?: string): void {
    this.updateState({ isDragging: true });
  }

  /**
   * Handle drag end
   */
  onDragEnd(): void {
    this.updateState({ isDragging: false });
  }

  /**
   * Handle drop operation
   */
  onDrop(componentType: ComponentType, targetId: string, position: 'before' | 'after' | 'left' | 'right' | 'center'): void {
    if (!this.config.enableDragDrop) return;

    const updatedComponents = DragDropService.handleDrop(
      this.state.components,
      {
        type: position,
        targetId,
        componentType
      },
      ComponentEngine.createComponent
    );

    this.updateState({ 
      components: updatedComponents,
      isDragging: false 
    });
  }

  /**
   * Handle existing item reordering with horizontal layout creation
   */
  onExistingItemDrop(draggedItemId: string, targetId: string, position: 'left' | 'right' | 'before' | 'after' | 'center'): void {
    if (!this.config.enableDragDrop) return;

    const updatedComponents = DragDropService.handleExistingItemDrop(
      this.state.components,
      draggedItemId,
      targetId,
      position
    );

    this.updateState({ 
      components: updatedComponents,
      isDragging: false 
    });
  }

  // ============================================================================
  // CROSS-DOMAIN ADAPTATIONS
  // ============================================================================

  /**
   * Get domain-specific component types
   */
  getAvailableComponents(): ComponentType[] {
    switch (this.config.crossDomainMode) {
      case 'surveys':
        return ['text_input', 'textarea', 'rich_text', 'select', 'radio_group', 'checkbox_group', 'number_input'];
      case 'workflows':
        return ['text_input', 'textarea', 'rich_text', 'select', 'button', 'heading', 'card'];
      case 'forms':
      default:
        return ComponentEngine.getAllComponentTypes();
    }
  }

  /**
   * Get domain-specific labels
   */
  getDomainLabel(componentType: ComponentType): string {
    const baseLabel = ComponentEngine.getDefaultLabel(componentType);
    
    switch (this.config.crossDomainMode) {
      case 'surveys':
        return baseLabel.replace('Field', 'Question');
      case 'workflows':
        return baseLabel.replace('Field', 'Step');
      default:
        return baseLabel;
    }
  }

  // ============================================================================
  // FORM MANAGEMENT
  // ============================================================================

  /**
   * Update form title
   */
  updateFormTitle(title: string): void {
    this.updateState({ formTitle: title });
  }

  /**
   * Export form data
   */
  exportForm(): any {
    return {
      title: this.state.formTitle,
      components: this.state.components,
      pages: this.config.enableMultiPage ? [{ 
        id: this.state.currentPageId,
        components: this.state.components 
      }] : undefined,
      metadata: {
        crossDomainMode: this.config.crossDomainMode,
        createdAt: new Date().toISOString()
      }
    };
  }

  /**
   * Import form data
   */
  importForm(formData: any): void {
    this.updateState({
      formTitle: formData.title || 'Imported Form',
      components: formData.components || [],
      selectedComponentId: null,
      isLoading: false
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear canvas
   */
  clear(): void {
    this.updateState({
      components: [],
      selectedComponentId: null,
      formTitle: 'Untitled Form'
    });
  }

  /**
   * Get canvas statistics
   */
  getStats(): { componentCount: number; selectedComponent: string | null; domainMode: string } {
    return {
      componentCount: this.state.components.length,
      selectedComponent: this.state.selectedComponentId,
      domainMode: this.config.crossDomainMode
    };
  }

  /**
   * Validate canvas state and form components
   */
  validate(): { isValid: boolean; errors: string[]; validationResults?: any[] } {
    const errors: string[] = [];
    const validationResults: any[] = [];
    
    // Check for duplicate IDs
    const ids = this.state.components.map(c => c.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate component IDs: ${duplicates.join(', ')}`);
    }

    // Check for required fields
    if (!this.state.formTitle.trim()) {
      errors.push('Form title is required');
    }

    // Validate individual components using ValidationEngine
    try {
      const { ValidationEngine } = require('./ValidationEngine');
      const componentValidation = ValidationEngine.validateForm(this.state.components, {});
      
      if (!componentValidation.isValid) {
        validationResults.push(...componentValidation.results);
        errors.push('Form contains validation errors');
      }
    } catch (error) {
      // ValidationEngine might not be available in all contexts
      console.warn('ValidationEngine not available for canvas validation:', error);
    }

    return {
      isValid: errors.length === 0,
      errors,
      validationResults: validationResults.length > 0 ? validationResults : undefined
    };
  }
}
