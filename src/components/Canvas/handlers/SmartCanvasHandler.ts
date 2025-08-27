import { layoutManager } from '../utils/layoutManager';
import type { PositionDetectionResult } from '../types/positioning';
import type { FormComponentData, ComponentType } from '../../../types';

export interface SmartCanvasActions {
  onAddComponent: (type: ComponentType) => void;
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
  onInsertBetween?: (type: ComponentType, insertIndex: number) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  onRemoveFromContainer?: (componentId: string, containerPath: string[]) => void;
  onMoveFromContainerToCanvas?: (componentId: string, containerPath: string[]) => void;
}

export class SmartCanvasHandler {
  constructor(
    private components: FormComponentData[],
    private actions: SmartCanvasActions
  ) {}

  /**
   * Handles smart drop positioning for both new components and rearrangement
   */
  handleSmartDrop(result: PositionDetectionResult & { sourceComponentId?: string, sourceIndex?: number }, newComponentType: ComponentType): void {
    // Check if this is a rearrangement of an existing component
    if (result.sourceComponentId && result.sourceIndex !== undefined) {
      console.log('SmartCanvasHandler: Handling component rearrangement');
      this.handleComponentRearrangement(result, newComponentType);
      return;
    }

    // Handle new component creation with smart positioning
    console.log('SmartCanvasHandler: Handling new component creation with position:', result.position);
    this.handleNewComponentWithSmartPositioning(result, newComponentType);
  }

  /**
   * Handles new component creation with smart positioning
   */
  private handleNewComponentWithSmartPositioning(result: PositionDetectionResult, newComponentType: ComponentType): void {
    const targetComponent = this.components.find(c => c.id === result.targetComponentId);
    if (!targetComponent) {
      console.error('Target component not found for new component creation:', result.targetComponentId);
      return;
    }

    // Handle different drop positions for new component creation
    switch (result.position) {
      case 'left':
      case 'right':
        this.handleNewComponentToRowLayout(targetComponent, newComponentType, result.position);
        break;
      
      case 'top':
        this.handleNewComponentToPosition(targetComponent, newComponentType, 'before');
        break;
        
      case 'bottom':
        this.handleNewComponentToPosition(targetComponent, newComponentType, 'after');
        break;
        
      case 'center':
        // For center drops, default to bottom
        this.handleNewComponentToPosition(targetComponent, newComponentType, 'after');
        break;
        
      default:
        console.warn('Unknown drop position for new component:', result.position);
    }
  }

  /**
   * Creates a new component in a row layout with target
   */
  private handleNewComponentToRowLayout(targetComponent: FormComponentData, newComponentType: ComponentType, position: 'left' | 'right'): void {
    console.log(`Creating new component in row layout: ${position} of target`);
    
    // Create the new component
    const newComponent = this.createComponent(newComponentType);
    
    // Find target component index
    const targetIndex = this.components.findIndex(c => c.id === targetComponent.id);
    if (targetIndex === -1) return;

    // Create row layout component
    const rowId = `row_${Date.now()}`;
    const rowComponent: FormComponentData = {
      id: rowId,
      type: 'horizontal_layout',
      label: 'Row Layout',
      fieldId: `field_${rowId}`,
      required: false,
      layout: {
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
      },
      children: position === 'left' 
        ? [newComponent, targetComponent]  // New component on left
        : [targetComponent, newComponent]  // New component on right
    };

    // Replace target component with the new row layout
    const newComponents = [
      ...this.components.slice(0, targetIndex),
      rowComponent,
      ...this.components.slice(targetIndex + 1)
    ];

    console.log('Created row layout with new component:', rowComponent);
    this.actions.onUpdateComponents(newComponents);
  }

  /**
   * Creates a new component in a simple before/after position
   */
  private handleNewComponentToPosition(targetComponent: FormComponentData, newComponentType: ComponentType, position: 'before' | 'after'): void {
    console.log(`Creating new component ${position} target`);
    
    // Create the new component
    const newComponent = this.createComponent(newComponentType);
    
    // Find target component index
    const targetIndex = this.components.findIndex(c => c.id === targetComponent.id);
    if (targetIndex === -1) return;

    // Calculate insertion index
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

    // Create new components array with new component inserted
    const newComponents = [
      ...this.components.slice(0, insertIndex),
      newComponent,
      ...this.components.slice(insertIndex)
    ];

    console.log(`Created new component ${position} target`);
    this.actions.onUpdateComponents(newComponents);
  }

  /**
   * Creates a new component with proper defaults
   */
  private createComponent(type: ComponentType): FormComponentData {
    const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseComponent = {
      id,
      type,
      label: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Field`,
      fieldId: `field_${id}`,
      required: false,
    };

    // Add type-specific properties
    switch (type) {
      case "text_input":
        return { ...baseComponent, placeholder: "Enter text..." };
      case "textarea":
        return { ...baseComponent, placeholder: "Enter your message..." };
      case "select":
        return { ...baseComponent, options: ["Option 1", "Option 2", "Option 3"] };
      case "checkbox":
      case "radio_group":
      case "multi_select":
        return { ...baseComponent, options: ["Option 1", "Option 2", "Option 3"] };
      case "number_input":
        return { ...baseComponent, placeholder: "Enter number...", min: 0, step: 1 };
      case "file_upload":
        return { ...baseComponent, acceptedFileTypes: ".pdf,.doc,.docx,.jpg,.png" };
      default:
        return baseComponent;
    }
  }

  /**
   * Handles rearrangement of existing components with smart positioning
   */
  private handleComponentRearrangement(result: PositionDetectionResult & { sourceComponentId: string, sourceIndex: number }, componentType: ComponentType): void {
    console.log('Rearranging component:', result.sourceComponentId, 'from index:', result.sourceIndex, 'to target:', result.targetComponentId, 'position:', result.position);
    
    const sourceComponent = this.components.find(c => c.id === result.sourceComponentId);
    if (!sourceComponent) {
      console.error('Source component not found:', result.sourceComponentId);
      return;
    }

    const targetComponent = this.components.find(c => c.id === result.targetComponentId);
    if (!targetComponent) {
      console.error('Target component not found:', result.targetComponentId);
      return;
    }

    // Handle different drop positions with smart logic
    switch (result.position) {
      case 'left':
      case 'right':
        console.log(`Creating row layout: ${result.position} positioning`);
        this.handleRearrangeToRowLayout(sourceComponent, targetComponent, result.position);
        break;
      
      case 'top':
        console.log(`Moving above target`);
        this.handleRearrangeToPosition(sourceComponent, targetComponent, 'before');
        break;
        
      case 'bottom':
        console.log(`Moving below target`);
        this.handleRearrangeToPosition(sourceComponent, targetComponent, 'after');
        break;
        
      case 'center':
        console.log(`Center drop - placing below target`);
        this.handleRearrangeToPosition(sourceComponent, targetComponent, 'after');
        break;
        
      default:
        console.warn('Unknown drop position:', result.position);
    }
  }

  /**
   * Rearranges component to create or join a row layout
   */
  private handleRearrangeToRowLayout(sourceComponent: FormComponentData, targetComponent: FormComponentData, position: 'left' | 'right'): void {
    console.log(`Creating row layout: ${position} of target`);
    
    // Remove source component from current position
    const componentsWithoutSource = this.components.filter(c => c.id !== sourceComponent.id);
    
    // Find target component index in the filtered array
    const targetIndex = componentsWithoutSource.findIndex(c => c.id === targetComponent.id);
    if (targetIndex === -1) return;

    // Create row layout component
    const rowId = `row_${Date.now()}`;
    const rowComponent: FormComponentData = {
      id: rowId,
      type: 'horizontal_layout',
      label: 'Row Layout',
      fieldId: `field_${rowId}`,
      required: false,
      layout: {
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
      },
      children: position === 'left' 
        ? [sourceComponent, targetComponent]  // Source on left
        : [targetComponent, sourceComponent]  // Source on right
    };

    // Replace target component with the new row layout
    const newComponents = [
      ...componentsWithoutSource.slice(0, targetIndex),
      rowComponent,
      ...componentsWithoutSource.slice(targetIndex + 1)
    ];

    console.log('Created row layout:', rowComponent);
    this.actions.onUpdateComponents(newComponents);
  }

  /**
   * Rearranges component to a simple before/after position
   */
  private handleRearrangeToPosition(sourceComponent: FormComponentData, targetComponent: FormComponentData, position: 'before' | 'after'): void {
    console.log(`Moving "${sourceComponent.label}" ${position} "${targetComponent.label}"`);
    
    // Remove source component from current position
    const componentsWithoutSource = this.components.filter(c => c.id !== sourceComponent.id);
    
    // Find target component index in the filtered array
    const targetIndex = componentsWithoutSource.findIndex(c => c.id === targetComponent.id);
    if (targetIndex === -1) {
      console.error('Target component not found');
      return;
    }

    // Calculate insertion index
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

    // Create new components array with rearranged component
    const newComponents = [
      ...componentsWithoutSource.slice(0, insertIndex),
      sourceComponent,
      ...componentsWithoutSource.slice(insertIndex)
    ];

    this.actions.onUpdateComponents(newComponents);
  }

  /**
   * Handles removal of components from row layouts with auto-cleanup
   */
  handleRemoveFromRow(componentId: string, containerPath: string[]): FormComponentData[] {
    const updatedComponents = layoutManager.removeFromRowLayout(
      this.components,
      componentId,
      containerPath
    );
    
    // Auto-cleanup: unwrap single-child row layouts
    const finalComponents = this.unwrapSingleChildRowLayouts(updatedComponents);
    
    this.actions.onUpdateComponents(finalComponents);
    return finalComponents;
  }

  /**
   * Unwraps row layouts that have only one child component
   */
  private unwrapSingleChildRowLayouts(components: FormComponentData[]): FormComponentData[] {
    return components.map(component => {
      if (component.type === 'horizontal_layout' && 
          component.children && 
          component.children.length === 1) {
        console.log('Auto-unwrapping single-child row layout:', component.id);
        // Return the single child component instead of the row layout
        return component.children[0];
      }
      
      // Recursively check nested components
      if (component.children) {
        return {
          ...component,
          children: this.unwrapSingleChildRowLayouts(component.children)
        };
      }
      
      return component;
    });
  }

  /**
   * Checks if a component is inside a row layout
   */
  isComponentInRow(componentId: string): { inRow: boolean; containerPath: string[] } {
    const path: string[] = [];
    const isInRow = this.searchForComponentInRow(this.components, componentId, path);
    return { inRow: isInRow, containerPath: path };
  }

  /**
   * Gets the parent row layout of a component if it exists
   */
  getParentRowLayout(componentId: string): FormComponentData | null {
    return this.findParentRowLayout(this.components, componentId);
  }

  /**
   * Handles automatic cleanup when components are moved out of rows
   */
  handleComponentMove(componentId: string, fromPath: string[]): void {
    if (fromPath.length > 0) {
      // Component was moved from a container, trigger cleanup
      const updatedComponents = this.handleRemoveFromRow(componentId, fromPath);
      
      // Check if the parent row now has only one child and needs unwrapping
      const parentId = fromPath[fromPath.length - 1];
      const parentComponent = this.findComponentById(updatedComponents, parentId);
      
      if (parentComponent?.type === 'horizontal_layout' && 
          parentComponent.children && 
          parentComponent.children.length === 1) {
        console.log('Auto-unwrapping single-child row layout:', parentId);
      }
    }
  }

  private handleRowConversion(targetIndex: number, newComponentType: ComponentType, position: 'left' | 'right'): void {
    const updatedComponents = layoutManager.convertToRowLayout(
      this.components,
      targetIndex,
      newComponentType,
      position
    );
    this.actions.onUpdateComponents(updatedComponents);
  }

  private handleAddToRow(targetComponentId: string, newComponentType: ComponentType, position: 'left' | 'right'): void {
    // Find the row layout that contains this component
    const rowLayout = this.getParentRowLayout(targetComponentId);
    if (rowLayout) {
      const updatedComponents = layoutManager.addToRowLayout(
        this.components,
        rowLayout.id,
        newComponentType,
        position
      );
      this.actions.onUpdateComponents(updatedComponents);
    }
  }

  private handleInsert(targetIndex: number, newComponentType: ComponentType): void {
    if (this.actions.onInsertBetween) {
      this.actions.onInsertBetween(newComponentType, targetIndex);
    } else {
      const updatedComponents = layoutManager.insertAtIndex(
        this.components,
        targetIndex,
        newComponentType
      );
      this.actions.onUpdateComponents(updatedComponents);
    }
  }

  private searchForComponentInRow(
    components: FormComponentData[], 
    targetId: string, 
    path: string[]
  ): boolean {
    for (const component of components) {
      if (component.id === targetId) {
        return path.length > 0 && path[path.length - 1] !== targetId;
      }
      
      if (component.children && component.children.length > 0) {
        const currentPath = [...path];
        if (component.type === 'horizontal_layout') {
          currentPath.push(component.id);
        }
        
        if (this.searchForComponentInRow(component.children, targetId, currentPath)) {
          path.push(...currentPath);
          return true;
        }
      }
    }
    return false;
  }

  private findParentRowLayout(components: FormComponentData[], targetId: string): FormComponentData | null {
    for (const component of components) {
      if (component.type === 'horizontal_layout' && component.children) {
        // Check if target is a direct child of this row layout
        if (component.children.some(child => child.id === targetId)) {
          return component;
        }
        
        // Recursively search in children
        const result = this.findParentRowLayout(component.children, targetId);
        if (result) return result;
      } else if (component.children) {
        const result = this.findParentRowLayout(component.children, targetId);
        if (result) return result;
      }
    }
    return null;
  }

  private findComponentById(components: FormComponentData[], targetId: string): FormComponentData | null {
    for (const component of components) {
      if (component.id === targetId) {
        return component;
      }
      
      if (component.children) {
        const result = this.findComponentById(component.children, targetId);
        if (result) return result;
      }
    }
    return null;
  }
}