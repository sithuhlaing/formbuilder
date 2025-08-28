import type { FormComponentData, ComponentType, RowLayout } from '../../../types';
import { createNewComponent } from './componentFactory';

export class LayoutManager {
  private components: FormComponentData[];

  constructor(components: FormComponentData[]) {
    this.components = components;
  }

  /**
   * Inserts a new component into the layout.
   * This is the corrected logic that appends instead of replaces.
   */
  insertNewComponent(componentType: ComponentType): FormComponentData[] {
    const newComponent = createNewComponent(componentType);
    // The FIX: Return a new array with the existing components plus the new one.
    return [...this.components, newComponent];
  }

  /**
   * Converts a component to a row layout
   */
  convertToRowLayout(
    components: FormComponentData[],
    targetIndex: number,
    newComponentType: ComponentType,
    position: 'left' | 'right'
  ): FormComponentData[] {
    const targetComponent = components[targetIndex];
    if (!targetComponent) return components;

    const newComponent = this.createComponent(newComponentType);
    const rowId = this.generateId();

    // Create row layout container
    const rowLayout: FormComponentData = {
      id: rowId,
      type: 'horizontal_layout',
      label: 'Row Layout',
      required: false,
      children: position === 'left'
        ? [newComponent, targetComponent]
        : [targetComponent, newComponent],
      layout: {
        display: 'flex',
        flexDirection: 'row',
        gap: '16px'
      }
    };

    // Update children with proper layout
    const columnWidth = '50%';
    rowLayout.children!.forEach(child => {
      child.layout = {
        ...child.layout,
        width: columnWidth,
        flex: '1'
      };
    });

    // Replace target component with row layout
    const newComponents = [...components];
    newComponents[targetIndex] = rowLayout;

    return newComponents;
  }

  /**
   * Adds a component to an existing row layout
   */
  addToRowLayout(
    components: FormComponentData[],
    targetComponentId: string,
    newComponentType: ComponentType,
    position: 'left' | 'right'
  ): FormComponentData[] {
    const newComponent = this.createComponent(newComponentType);

    return this.updateComponentRecursively(components, targetComponentId, (component) => {
      if (component.type === 'horizontal_layout' && component.children) {
        const newChildren = position === 'left'
          ? [newComponent, ...component.children]
          : [...component.children, newComponent];

        // Recalculate column widths
        const columnWidth = `${(100 / newChildren.length).toFixed(2)}%`;
        newChildren.forEach(child => {
          child.layout = {
            ...child.layout,
            width: columnWidth,
            flex: '1'
          };
        });

        return {
          ...component,
          children: newChildren
        };
      }
      return component;
    });
  }

  /**
   * Removes a component from a row layout and cleans up if needed
   */
  removeFromRowLayout(
    components: FormComponentData[],
    componentId: string,
    containerPath: string[]
  ): FormComponentData[] {
    if (containerPath.length === 0) return components;

    const parentId = containerPath[containerPath.length - 1];

    return this.updateComponentRecursively(components, parentId, (component) => {
      if (component.type === 'horizontal_layout' && component.children) {
        const filteredChildren = component.children.filter(child => child.id !== componentId);

        // If only one child left, unwrap the row layout
        if (filteredChildren.length === 1) {
          const singleChild = filteredChildren[0];
          // Remove layout constraints from the child
          const { width, flex, ...restLayout } = singleChild.layout || {};
          return {
            ...singleChild,
            layout: restLayout
          };
        }

        // Recalculate column widths for remaining children
        if (filteredChildren.length > 0) {
          const columnWidth = `${(100 / filteredChildren.length).toFixed(2)}%`;
          filteredChildren.forEach(child => {
            child.layout = {
              ...child.layout,
              width: columnWidth,
              flex: '1'
            };
          });
        }

        return {
          ...component,
          children: filteredChildren
        };
      }
      return component;
    });
  }

  /**
   * Inserts a component at a specific index (normal column layout)
   */
  insertAtIndex(
    components: FormComponentData[],
    index: number,
    newComponentType: ComponentType
  ): FormComponentData[] {
    const newComponent = this.createComponent(newComponentType);
    const newComponents = [...components];
    newComponents.splice(index, 0, newComponent);
    return newComponents;
  }

  /**
   * Processes a drop result and determines the layout operation needed
   */
  processDropResult(
    dropResult: PositionDetectionResult,
    newComponentType: ComponentType,
    currentComponents: FormComponentData[]
  ): LayoutOperation {
    const { position, targetIndex, shouldCreateRow, targetComponentId } = dropResult;

    if (shouldCreateRow && (position === 'left' || position === 'right')) {
      return this.createRowConversionOperation(targetIndex, targetComponentId!, newComponentType, position);
    }

    if (position === 'left' || position === 'right') {
      return this.createAddToRowOperation(targetComponentId!, newComponentType, position);
    }

    return this.createInsertOperation(targetIndex, newComponentType);
  }

  private createRowConversionOperation(
    targetIndex: number,
    targetComponentId: string,
    newComponentType: ComponentType,
    position: 'left' | 'right'
  ): LayoutOperation {
    return {
      type: 'convert_to_row',
      targetIndex,
      targetComponentId,
      newComponent: this.createComponent(newComponentType),
      position
    };
  }

  private createAddToRowOperation(
    targetComponentId: string,
    newComponentType: ComponentType,
    position: 'left' | 'right'
  ): LayoutOperation {
    return {
      type: 'add_to_row',
      targetComponentId,
      newComponent: this.createComponent(newComponentType),
      position
    };
  }

  private createInsertOperation(
    targetIndex: number,
    newComponentType: ComponentType
  ): LayoutOperation {
    return {
      type: 'insert',
      targetIndex,
      newComponent: this.createComponent(newComponentType)
    };
  }

  private createComponent(type: ComponentType): FormComponentData {
    return {
      id: this.generateId(),
      type,
      label: this.getDefaultLabel(type),
      required: false,
      placeholder: this.getDefaultPlaceholder(type)
    };
  }

  private updateComponentRecursively(
    components: FormComponentData[],
    targetId: string,
    updater: (component: FormComponentData) => FormComponentData
  ): FormComponentData[] {
    return components.map(component => {
      if (component.id === targetId) {
        return updater(component);
      }

      if (component.children) {
        return {
          ...component,
          children: this.updateComponentRecursively(component.children, targetId, updater)
        };
      }

      return component;
    });
  }

  private generateId(): string {
    return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultLabel(type: ComponentType): string {
    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input',
      number_input: 'Number Input',
      textarea: 'Text Area',
      rich_text: 'Rich Text Editor',
      select: 'Select Dropdown',
      multi_select: 'Multi-Select',
      checkbox: 'Checkbox',
      radio_group: 'Radio Group',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      section_divider: 'Section Divider',
      signature: 'Digital Signature',
      horizontal_layout: 'Row Layout',
      vertical_layout: 'Column Layout'
    };
    return labels[type] || 'Form Component';
  }

  private getDefaultPlaceholder(type: ComponentType): string {
    const placeholders: Record<ComponentType, string> = {
      text_input: 'Enter text...',
      number_input: 'Enter a number...',
      textarea: 'Enter your message...',
      rich_text: '',
      select: 'Choose an option...',
      multi_select: 'Choose options...',
      checkbox: '',
      radio_group: '',
      date_picker: 'Select date...',
      file_upload: 'Click to upload files...',
      section_divider: '',
      signature: 'Sign here...',
      horizontal_layout: '',
      vertical_layout: ''
    };
    return placeholders[type] || 'Enter value...';
  }
}

// Singleton instance
export const layoutManager = new LayoutManager([]);