
import { useState, useCallback } from "react";
import type { FormComponentData, ComponentType, FormPage, FormTemplateType } from "../components/types";
import { useUndoRedo } from "./useUndoRedo";

interface ModalFunctions {
  showConfirmation: (title: string, message: string, onConfirm: () => void, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const useFormBuilder = (modalFunctions?: ModalFunctions) => {
  const [pages, updatePages, undoRedoActions] = useUndoRedo<FormPage[]>([
    { id: '1', title: 'Page 1', components: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>('1');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>("Untitled Form");

  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
  const components = currentPage?.components || [];
  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  const generateId = () => Date.now().toString();

  const createComponent = useCallback((type: ComponentType): FormComponentData => {
    const id = generateId();
    const baseComponent = {
      id,
      type,
      label: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Field`,
      fieldId: `field_${id}`,
      required: false,
    };

    switch (type) {
      case "text_input":
        return {
          ...baseComponent,
          placeholder: "Enter text...",
        };
      case "textarea":
        return {
          ...baseComponent,
          placeholder: "Enter your message...",
        };
      case "select":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "checkbox":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "radio_group":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "date_picker":
        return baseComponent;
      case "file_upload":
        return {
          ...baseComponent,
          acceptedFileTypes: ".pdf,.doc,.docx,.jpg,.png",
        };
      case "number_input":
        return {
          ...baseComponent,
          placeholder: "Enter number...",
          min: 0,
          step: 1,
        };
      case "multi_select":
        return {
          ...baseComponent,
          options: ["Option 1", "Option 2", "Option 3"],
        };
      case "section_divider":
        return {
          ...baseComponent,
          label: "Section Title",
          description: "Section description (optional)",
        };
      case "signature":
        return {
          ...baseComponent,
          label: "Digital Signature",
        };
      case "horizontal_layout":
        return {
          ...baseComponent,
          label: "Horizontal Layout",
          layout: {
            direction: "horizontal" as const,
            alignment: "start" as const,
            gap: "medium" as const,
          },
          children: [],
        };
      case "vertical_layout":
        return {
          ...baseComponent,
          label: "Vertical Layout", 
          layout: {
            direction: "vertical" as const,
            alignment: "start" as const,
            gap: "medium" as const,
          },
          children: [],
        };
      default:
        return baseComponent;
    }
  }, []);

  const updateCurrentPageComponents = useCallback((newComponents: FormComponentData[]) => {
    const updatedPages = pages.map(page => 
      page.id === currentPageId 
        ? { ...page, components: newComponents }
        : page
    );
    updatePages(updatedPages);
  }, [pages, currentPageId, updatePages]);

  const addComponent = useCallback((type: ComponentType) => {
    const newComponent = createComponent(type);
    updateCurrentPageComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  }, [createComponent, components, updateCurrentPageComponents]);

  const selectComponent = useCallback((id: string) => {
    setSelectedComponentId(id);
  }, []);

  const updateComponent = useCallback((updates: Partial<FormComponentData>) => {
    if (!selectedComponentId) return;
    
    const updatedComponents = components.map(component => 
      component.id === selectedComponentId 
        ? { ...component, ...updates }
        : component
    );
    updateCurrentPageComponents(updatedComponents);
  }, [selectedComponentId, components, updateCurrentPageComponents]);

  const deleteComponent = useCallback((id: string) => {
    const filteredComponents = components.filter(component => component.id !== id);
    updateCurrentPageComponents(filteredComponents);
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId, components, updateCurrentPageComponents]);

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    const newComponents = [...components];
    const draggedComponent = newComponents[dragIndex];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, draggedComponent);
    updateCurrentPageComponents(newComponents);
  }, [components, updateCurrentPageComponents]);

  const clearAll = useCallback(() => {
    if (pages.length === 1 && components.length === 0) return;
    
    const hasMultiplePages = pages.length > 1;
    const hasComponents = pages.some(page => page.components.length > 0);
    
    if (!hasMultiplePages && !hasComponents) return;
    
    const title = hasMultiplePages ? 'Reset Form' : 'Clear All Components';
    const message = hasMultiplePages 
      ? 'Are you sure you want to reset the form? This will keep only the first page and clear all components.\n\nYou can undo this action with Ctrl+Z.'
      : 'Are you sure you want to clear all components from this page?\n\nYou can undo this action with Ctrl+Z.';
    
    const performClearAll = () => {
      // Reset to single clean first page
      const cleanFirstPage: FormPage = {
        id: '1',
        title: 'Page 1',
        components: []
      };
      updatePages([cleanFirstPage]);
      setCurrentPageId('1');
      setSelectedComponentId(null);
    };

    if (modalFunctions) {
      modalFunctions.showConfirmation(title, message, performClearAll, 'warning');
    } else {
      // Fallback to window.confirm for backward compatibility
      if (window.confirm(message)) {
        performClearAll();
      }
    }
  }, [pages, components.length, updatePages, modalFunctions]);

  const clearAllSilent = useCallback(() => {
    // Reset to single clean first page without confirmation
    const cleanFirstPage: FormPage = {
      id: '1',
      title: 'Page 1',
      components: []
    };
    updatePages([cleanFirstPage]);
    setCurrentPageId('1');
    setSelectedComponentId(null);
  }, [updatePages]);

  const addPage = useCallback(() => {
    const newPageId = generateId();
    const newPage: FormPage = {
      id: newPageId,
      title: `Page ${pages.length + 1}`,
      components: []
    };
    updatePages([...pages, newPage]);
    setCurrentPageId(newPageId);
    setSelectedComponentId(null);
  }, [pages, updatePages]);

  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      if (modalFunctions) {
        modalFunctions.showNotification(
          'Cannot Delete Page',
          'Cannot delete the last page. At least one page is required.',
          'warning'
        );
      } else {
        alert('Cannot delete the last page. At least one page is required.');
      }
      return;
    }
    
    const filteredPages = pages.filter(page => page.id !== pageId);
    updatePages(filteredPages);
    
    if (currentPageId === pageId) {
      setCurrentPageId(filteredPages[0].id);
    }
    setSelectedComponentId(null);
  }, [pages, currentPageId, updatePages, modalFunctions]);

  const updatePageTitle = useCallback((pageId: string, title: string) => {
    const updatedPages = pages.map(page =>
      page.id === pageId ? { ...page, title } : page
    );
    updatePages(updatedPages);
  }, [pages, updatePages]);

  const switchToPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    setSelectedComponentId(null);
  }, []);

  const clearPage = useCallback((pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page || page.components.length === 0) return;
    
    const performClearPage = () => {
      const updatedPages = pages.map(p => 
        p.id === pageId ? { ...p, components: [] } : p
      );
      updatePages(updatedPages);
      setSelectedComponentId(null);
    };

    if (modalFunctions) {
      modalFunctions.showConfirmation(
        'Clear Page Components',
        `Are you sure you want to clear all components from "${page.title}"?\n\nYou can undo this action with Ctrl+Z.`,
        performClearPage,
        'warning'
      );
    } else {
      // Fallback to window.confirm for backward compatibility
      if (window.confirm(`Are you sure you want to clear all components from "${page.title}"? You can undo this action with Ctrl+Z.`)) {
        performClearPage();
      }
    }
  }, [pages, updatePages, modalFunctions]);

  const loadFromJSON = useCallback((jsonData: FormComponentData[], templateName?: string, templateType?: FormTemplateType, pagesData?: FormPage[]) => {
    if (pagesData && pagesData.length > 0) {
      // Load multi-page structure
      updatePages(pagesData);
      setCurrentPageId(pagesData[0].id);
    } else {
      // For backward compatibility, load into first page
      const updatedPages = pages.map((page, index) => 
        index === 0 ? { ...page, components: jsonData } : page
      );
      updatePages(updatedPages);
    }
    setSelectedComponentId(null);
    if (templateName) {
      setTemplateName(templateName);
    }
  }, [pages, updatePages]);

  const insertBetweenComponents = useCallback((type: ComponentType, insertIndex: number) => {
    const newComponent = createComponent(type);
    const newComponents = [...components];
    newComponents.splice(insertIndex, 0, newComponent);
    updateCurrentPageComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateCurrentPageComponents]);

  const insertHorizontalToComponent = useCallback((
    type: ComponentType,
    targetId: string,
    position: 'left' | 'right'
  ) => {
    const newComponent = createComponent(type);
    const newComponents = [...components];
    const targetIndex = newComponents.findIndex(c => c.id === targetId);
    
    if (targetIndex === -1) return;
    
    const targetComponent = newComponents[targetIndex];
    
    // Check if target is already in a horizontal container
    let parentContainer = newComponents.find(comp => 
      comp.type === 'horizontal_layout' && 
      comp.children?.some(child => child.id === targetId)
    );

    if (parentContainer && parentContainer.children) {
      // Add to existing horizontal container if under 12 items
      if (parentContainer.children.length < 12) {
        const targetChildIndex = parentContainer.children.findIndex(child => child.id === targetId);
        const insertIndex = position === 'left' ? targetChildIndex : targetChildIndex + 1;
        
        const updatedChildren = [...parentContainer.children];
        updatedChildren.splice(insertIndex, 0, newComponent);
        
        // Recalculate equal widths
        const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
        updatedChildren.forEach(child => {
          child.layout = { ...child.layout, width: columnPercentage };
        });
        
        parentContainer.children = updatedChildren;
      } else {
        if (modalFunctions) {
          modalFunctions.showNotification(
            'Row Limit Reached',
            'Maximum 12 elements per row reached.',
            'warning'
          );
        } else {
          alert('Maximum 12 elements per row reached.');
        }
        return;
      }
    } else {
      // Create new horizontal container
      const containerComponent = createComponent('horizontal_layout');
      containerComponent.label = 'Layout Row';
      containerComponent.children = position === 'left' 
        ? [newComponent, targetComponent]
        : [targetComponent, newComponent];
      
      // Set equal widths (50% each)
      containerComponent.children.forEach(child => {
        child.layout = { ...child.layout, width: '50%' };
      });
      
      newComponents[targetIndex] = containerComponent;
    }
    
    updateCurrentPageComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateCurrentPageComponents]);

  const insertComponentWithPosition = useCallback((
    type: ComponentType, 
    targetId: string, 
    position: 'left' | 'right' | 'top' | 'bottom'
  ) => {
    const newComponent = createComponent(type);
    const newComponents = [...components];
    const targetIndex = newComponents.findIndex(c => c.id === targetId);
    
    if (targetIndex === -1) return;
    
    const targetComponent = newComponents[targetIndex];
    
    // Check if target is already in a horizontal container
    const parentContainer = newComponents.find(comp => 
      comp.type === 'horizontal_layout' && 
      comp.children?.some(child => child.id === targetId)
    );
    
    if (position === 'left' || position === 'right') {
      if (parentContainer && parentContainer.children) {
        // Add to existing horizontal container if under 12 items
        if (parentContainer.children.length < 12) {
          const targetChildIndex = parentContainer.children.findIndex(child => child.id === targetId);
          const insertIndex = position === 'left' ? targetChildIndex : targetChildIndex + 1;
          
          // Insert new component and recalculate widths
          const updatedChildren = [...parentContainer.children];
          updatedChildren.splice(insertIndex, 0, newComponent);
          
          // Set equal widths for all children in grid
          const columnWidth = `${Math.floor(12 / updatedChildren.length)}`;
          const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
          
          updatedChildren.forEach(child => {
            child.layout = {
              ...child.layout,
              width: columnPercentage
            };
          });
          
          parentContainer.children = updatedChildren;
        } else {
          // Maximum reached - create new row
          if (modalFunctions) {
            modalFunctions.showNotification(
              'Row Limit Reached',
              'Maximum 12 elements per row. Creating new row below.',
              'info'
            );
          } else {
            alert('Maximum 12 elements per row. Creating new row below.');
          }
          const containerComponent = createComponent('vertical_layout');
          containerComponent.label = 'Layout Column';
          
          const newRowContainer = createComponent('horizontal_layout');
          newRowContainer.label = 'Layout Row';
          newRowContainer.children = [newComponent];
          newComponent.layout = { ...newComponent.layout, width: '100%' };
          
          containerComponent.children = [parentContainer, newRowContainer];
          
          // Replace parent container with new vertical container
          const parentIndex = newComponents.findIndex(c => c.id === parentContainer.id);
          newComponents[parentIndex] = containerComponent;
        }
      } else {
        // Create new horizontal container
        const containerComponent = createComponent('horizontal_layout');
        containerComponent.label = 'Layout Row';
        containerComponent.children = position === 'left' 
          ? [newComponent, targetComponent]
          : [targetComponent, newComponent];
        
        // Set equal widths (50% each for 2 items)
        containerComponent.children.forEach(child => {
          child.layout = { ...child.layout, width: '50%' };
        });
        
        newComponents[targetIndex] = containerComponent;
      }
    } else {
      // Vertical positioning - unlimited
      const containerComponent = createComponent('vertical_layout');
      containerComponent.label = 'Layout Column';
      containerComponent.children = position === 'top'
        ? [newComponent, targetComponent] 
        : [targetComponent, newComponent];
      
      // Vertical items take full width
      containerComponent.children.forEach(child => {
        child.layout = { ...child.layout, width: '100%' };
      });
      
      newComponents[targetIndex] = containerComponent;
    }
    
    updateCurrentPageComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateCurrentPageComponents]);

  const addComponentToContainer = useCallback((type: ComponentType, containerId: string) => {
    const newComponent = createComponent(type);
    
    const updateComponentRecursively = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerId) {
          // Found the target container
          if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
            const updatedChildren = [...(component.children || []), newComponent];
            
            // For horizontal containers, recalculate widths
            if (component.type === 'horizontal_layout') {
              const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
              updatedChildren.forEach(child => {
                child.layout = { ...child.layout, width: columnPercentage };
              });
            } else {
              // For vertical containers, set full width
              updatedChildren.forEach(child => {
                child.layout = { ...child.layout, width: '100%' };
              });
            }
            
            return {
              ...component,
              children: updatedChildren
            };
          }
        }
        
        // Recursively search in children
        if (component.children) {
          return {
            ...component,
            children: updateComponentRecursively(component.children)
          };
        }
        
        return component;
      });
    };
    
    const updatedComponents = updateComponentRecursively(components);
    updateCurrentPageComponents(updatedComponents);
    setSelectedComponentId(newComponent.id);
  }, [createComponent, components, updateCurrentPageComponents]);

  return {
    components,
    selectedComponent,
    selectedComponentId,
    templateName,
    setTemplateName,
    addComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    clearAll,
    clearAllSilent,
    loadFromJSON,
    insertComponentWithPosition,
    insertBetweenComponents,
    insertHorizontalToComponent,
    // Page management
    pages,
    currentPage,
    currentPageId,
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
    // Undo/Redo actions
    ...undoRedoActions,
    // New function for adding components to containers
    addComponentToContainer,
  };
};
