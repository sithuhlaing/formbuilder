
import { useState, useCallback } from "react";
import type { FormComponentData, ComponentType, FormPage } from "../components/types";
import { useUndoRedo } from "./useUndoRedo";

export const useFormBuilder = () => {
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
      case "horizontal_container":
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
      case "vertical_container":
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
    if (components.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all components from this page? You can undo this action with Ctrl+Z.')) {
      updateCurrentPageComponents([]);
      setSelectedComponentId(null);
    }
  }, [components.length, updateCurrentPageComponents]);

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
      alert('Cannot delete the last page. At least one page is required.');
      return;
    }
    
    const filteredPages = pages.filter(page => page.id !== pageId);
    updatePages(filteredPages);
    
    if (currentPageId === pageId) {
      setCurrentPageId(filteredPages[0].id);
    }
    setSelectedComponentId(null);
  }, [pages, currentPageId, updatePages]);

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

  const loadFromJSON = useCallback((jsonData: FormComponentData[], templateName?: string, templateType?: FormTemplateType) => {
    // For backward compatibility, load into first page
    const updatedPages = pages.map((page, index) => 
      index === 0 ? { ...page, components: jsonData } : page
    );
    updatePages(updatedPages);
    setSelectedComponentId(null);
    if (templateName) {
      setTemplateName(templateName);
    }
  }, [pages, updatePages]);

  const insertBetweenComponents = useCallback((type: ComponentType, insertIndex: number) => {
    const newComponent = createComponent(type);
    const newComponents = [...components];
    newComponents.splice(insertIndex, 0, newComponent);
    updateComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateComponents]);

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
      comp.type === 'horizontal_container' && 
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
        alert('Maximum 12 elements per row reached.');
        return;
      }
    } else {
      // Create new horizontal container
      const containerComponent = createComponent('horizontal_container');
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
    
    updateComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateComponents]);

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
      comp.type === 'horizontal_container' && 
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
          alert('Maximum 12 elements per row. Creating new row below.');
          const containerComponent = createComponent('vertical_container');
          containerComponent.label = 'Layout Column';
          
          const newRowContainer = createComponent('horizontal_container');
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
        const containerComponent = createComponent('horizontal_container');
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
      const containerComponent = createComponent('vertical_container');
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
    
    updateComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateComponents]);

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
    loadFromJSON,
    insertComponentWithPosition,
    insertBetweenComponents,
    insertHorizontalToComponent,
    // Undo/Redo actions
    ...undoRedoActions,
  };
};
