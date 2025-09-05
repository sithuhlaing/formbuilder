/**
 * SOLID PRINCIPLE REFACTORING - Single Responsibility & Open/Closed
 * ComponentEngine now focuses ONLY on component operations
 * Uses ComponentRegistry for creation (Open/Closed Principle)
 */

import type { ComponentType, ValidationResult } from '../types';
import type { FormComponentData } from './interfaces/ComponentInterfaces';
import type { ComponentLayout } from '../types/layout';
import { ComponentRegistry } from './ComponentRegistry';
import { ComponentValidationEngine } from './ComponentValidationEngine';
import { generateId } from '../shared/utils';

export class ComponentEngine {
  
  /**
   * SOLID REFACTORING - Delegates to ComponentRegistry (Open/Closed Principle)
   * No more switch statements - new component types can be added without modifying this code
   */
  static createComponent(type: ComponentType): FormComponentData {
    // Defensive programming - ensure we have a valid type
    if (!type || type === null || type === undefined) {
      console.error('❌ ComponentEngine.createComponent: type is undefined');
      throw new Error('Component type is required');
    }

    const baseData = {
      id: generateId(),
      label: ComponentEngine.getDefaultLabel(type),
      fieldId: generateId('field'),
      required: false
    };

    try {
      const component = ComponentRegistry.createComponent(type, baseData);
      
      // Add default layout properties based on component type
      return this.enhanceWithDefaultLayout(component);
    } catch (error) {
      console.error('❌ ComponentEngine.createComponent: Failed to create component', error);
      // Fallback to text input
      return ComponentRegistry.createComponent('text_input', baseData);
    }
  }

  /**
   * ENHANCED: Create component with custom layout options
   */
  static createComponentWithLayout(
    type: ComponentType, 
    layoutOptions?: Partial<ComponentLayout>
  ): FormComponentData {
    const component = this.createComponent(type);
    
    if (layoutOptions) {
      component.layout = {
        layoutType: 'block', // Default layout type
        ...layoutOptions
      } as ComponentLayout;
    }
    
    return component;
  }

  /**
   * Add smart default layout properties based on component type
   */
  private static enhanceWithDefaultLayout(component: FormComponentData): FormComponentData {
    // Smart defaults based on component type
    const layoutDefaults: Partial<ComponentLayout> = {};
    
    switch (component.type) {
      case 'horizontal_layout':
        layoutDefaults.layoutType = 'flex';
        layoutDefaults.flex = {
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          alignItems: 'center'
        };
        break;
        
      case 'vertical_layout':
        layoutDefaults.layoutType = 'flex';
        layoutDefaults.flex = {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        };
        break;
        
      case 'button':
        layoutDefaults.layoutType = 'block';
        layoutDefaults.size = { width: 'fit-content' };
        layoutDefaults.spacing = { margin: '0.5rem 0' };
        break;
        
      case 'card':
        layoutDefaults.layoutType = 'block';
        layoutDefaults.spacing = { 
          padding: '1rem',
          margin: '0.5rem 0' 
        };
        layoutDefaults.border = { 
          width: 1, 
          style: 'solid', 
          color: '#e0e0e0',
          radius: '8px'
        };
        break;
        
      default:
        // Default block layout for input components
        layoutDefaults.layoutType = 'block';
        layoutDefaults.spacing = { margin: '0.5rem 0' };
    }
    
    // Only add layout if we have meaningful defaults
    if (Object.keys(layoutDefaults).length > 1) {
      component.layout = layoutDefaults as ComponentLayout;
    }
    
    return component;
  }

  /**
   * SINGLE method to update ANY component
   * Replaces: scattered update logic
   * Overloaded to support both array and single component updates
   */
  static updateComponent(
    components: FormComponentData[], 
    componentId: string, 
    updates: Partial<FormComponentData>
  ): FormComponentData[];
  static updateComponent(
    component: FormComponentData, 
    updates: Partial<FormComponentData>
  ): FormComponentData;
  static updateComponent(
    componentsOrComponent: FormComponentData[] | FormComponentData, 
    componentIdOrUpdates: string | Partial<FormComponentData>, 
    updates?: Partial<FormComponentData>
  ): FormComponentData[] | FormComponentData {
    // Handle single component update (2 parameter version)
    if (!Array.isArray(componentsOrComponent) && typeof componentIdOrUpdates === 'object') {
      const component = componentsOrComponent;
      const updateData = componentIdOrUpdates as Partial<FormComponentData>;
      return { ...component, ...updateData };
    }
    
    // Handle array component update (3 parameter version)
    const components = componentsOrComponent as FormComponentData[];
    const componentId = componentIdOrUpdates as string;
    const updateData = updates as Partial<FormComponentData>;
    
    return components.map(component => {
      if (component.id === componentId) {
        return { ...component, ...updateData };
      }
      
      // Handle nested components
      if (component.children) {
        return {
          ...component,
          children: this.updateComponent(component.children, componentId, updateData)
        };
      }
      
      return component;
    });
  }

  /**
   * SINGLE method to remove ANY component
   * Replaces: scattered delete logic
   * Includes row layout dissolution when only one child remains
   */
  static removeComponent(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData[] {
    return components
      .filter(component => component.id !== componentId)
      .map(component => {
        if (component.children) {
          const updatedChildren = this.removeComponent(component.children, componentId);
          
          // Row layout dissolution rule: if only one child remains, replace with the child
          if (component.type === 'horizontal_layout' && updatedChildren.length === 1) {
            console.log('🔄 Dissolving row layout with single child:', component.id);
            return updatedChildren[0];
          }
          
          return {
            ...component,
            children: updatedChildren
          };
        }
        return component;
      })
      .filter(component => {
        // Also handle top-level row layout dissolution
        if (component.type === 'horizontal_layout' && component.children && component.children.length === 1) {
          console.log('🔄 Dissolving top-level row layout with single child:', component.id);
          return false; // Remove the row layout - it will be replaced by its child
        }
        return true;
      })
      .flatMap(component => {
        // Replace dissolved row layouts with their single child
        if (component.type === 'horizontal_layout' && component.children && component.children.length === 1) {
          return [component.children[0]];
        }
        return [component];
      });
  }

  /**
   * SINGLE method to find ANY component
   * Replaces: scattered find logic
   */
  static findComponent(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      
      if (component.children) {
        const found = this.findComponent(component.children, componentId);
        if (found) return found;
      }
    }
    
    return null;
  }

  /**
   * Alias for findComponent to maintain backward compatibility
   */
  static findComponentById(
    components: FormComponentData[], 
    componentId: string
  ): FormComponentData | null {
    return this.findComponentWithCycleDetection(components, componentId, new Set());
  }

  /**
   * Find component with cycle detection to prevent infinite recursion
   */
  private static findComponentWithCycleDetection(
    components: FormComponentData[], 
    componentId: string,
    visited: Set<string>
  ): FormComponentData | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      
      // Prevent infinite recursion by tracking visited components
      if (component.children && !visited.has(component.id)) {
        visited.add(component.id);
        const found = this.findComponentWithCycleDetection(component.children, componentId, visited);
        if (found) return found;
        visited.delete(component.id);
      }
    }
    
    return null;
  }

  /**
   * Clone component with new ID
   */
  static cloneComponent(component: FormComponentData): FormComponentData {
    const cloned = { ...component, id: generateId() };
    
    // Clone children recursively if they exist
    if (component.children) {
      cloned.children = component.children.map(child => this.cloneComponent(child));
    }
    
    // Clone options array if it exists
    if (component.options) {
      cloned.options = component.options.map(option => ({ ...option }));
    }
    
    return cloned;
  }

  /**
   * SOLID REFACTORING - Delegates to ComponentRegistry
   * Component types are now managed centrally
   */
  static getAllComponentTypes(): ComponentType[] {
    return ComponentRegistry.getSupportedTypes();
  }

  /**
   * SOLID REFACTORING - Delegates to ComponentValidationEngine (Single Responsibility)
   * Validation logic is now separated for better maintainability
   */
  static validateComponent(component: FormComponentData): ValidationResult {
    // Import here to avoid circular dependency
     
    return ComponentValidationEngine.validateComponent(component);
  }

  // Private helpers - all in ONE place
  public static getDefaultLabel(type: ComponentType): string {
    if (!type) {
      console.error('❌ ComponentEngine.getDefaultLabel: type is undefined');
      return 'Form Component';
    }

    const labels: Record<ComponentType, string> = {
      text_input: 'Text Input',
      email_input: 'Email Input',
      password_input: 'Password Input',
      number_input: 'Number Input', 
      textarea: 'Text Area',
      rich_text: 'Rich Text',
      select: 'Select',
      multi_select: 'Multi Select',
      checkbox: 'Checkbox',
      checkbox_group: 'Checkbox Group',
      radio_group: 'Radio Group',
      date_picker: 'Date Picker',
      file_upload: 'File Upload',
      section_divider: 'Section Divider',
      signature: 'Signature',
      horizontal_layout: 'Horizontal Layout',
      vertical_layout: 'Vertical Layout',
      button: 'Button',
      heading: 'Heading',
      paragraph: 'Paragraph',
      divider: 'Divider',
      card: 'Card'
    };
    
    const label = labels[type];
    if (!label) {
      console.warn('⚠️ ComponentEngine.getDefaultLabel: Unknown type', type);
      return 'Form Component';
    }
    
    return label;
  }

}