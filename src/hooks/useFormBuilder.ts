
import { useUndoRedo } from "./useUndoRedo";
import { useState, useCallback, useRef } from "react";
import type { FormComponentData, ComponentType, FormPage, FormTemplateType, FormTemplate } from "../types";

interface ModalFunctions {
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'warning' | 'error' | 'info'
  ) => void;
  showNotification: (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

export const useFormBuilder = (modalFunctions?: ModalFunctions) => {
  const [pages, updatePages, undoRedoActions] = useUndoRedo<FormPage[]>([
    { id: '1', title: 'Page 1', components: [] }
  ]);
  
  // Defensive check for pages array
  const safePagesArray = pages || [{ id: '1', title: 'Page 1', components: [] }];
  const [currentPageId, setCurrentPageId] = useState<string>('1');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>("Untitled Form");

  // Utility function for safe component operations (defined early)
  const safelyFindComponent = (components: FormComponentData[], componentId: string | null): FormComponentData | null => {
    if (!componentId || !components || !Array.isArray(components)) {
      return null;
    }
    return components.find(c => c && c.id === componentId) || null;
  };

  const currentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
  const components = currentPage?.components || [];
  const selectedComponent = safelyFindComponent(components, selectedComponentId);

  const generateId = () => Date.now().toString();

  // Note: Layout helper functions removed as they're not needed with simplified layout objects

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

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
          label: "Row Layout",
          layout: {
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
          },
          children: [],
        };
      case "vertical_layout":
        return {
          ...baseComponent,
          label: "Column Layout",
          layout: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          },
          children: [],
        };
      default:
        return baseComponent;
    }
  }, []);

  // 🛡️ THROTTLING: Prevent rapid-fire updates that cause race conditions
  const lastUpdateRef = useRef<number>(0);
  const THROTTLE_MS = 50; // Minimum time between updates

  const updateCurrentPageComponents = useCallback((newComponents: FormComponentData[]) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_MS) {
      console.warn('🛡️ THROTTLED: Update blocked due to rapid succession (preventing race condition)');
      return;
    }
    lastUpdateRef.current = now;
    const currentCount = safePagesArray.find(p => p?.id === currentPageId)?.components?.length || 0;
    
    // 🚨 RACE CONDITION DETECTION
    if (newComponents?.length === 1 && currentCount > 1) {
      console.error('🚨 CRITICAL: Collection collapsed from', currentCount, 'to 1 element!');
      console.error('🚨 This suggests a race condition or competing state update!');
      console.error('🚨 Stack trace:', new Error().stack);
    }
    
    if (!newComponents || newComponents.length === 0) {
      console.error('🚨 CRITICAL: Empty or invalid components array passed!');
      console.error('🚨 This could cause collection to disappear!');
      console.error('🚨 Stack trace:', new Error().stack);
    }
    
    // 🚨 SPECIAL TRACKING FOR 5-ELEMENT BUG
    if (currentCount >= 5 || newComponents?.length >= 5) {
      console.error('🚨 5-ELEMENT BUG TRACKING:', {
        currentCount,
        newCount: newComponents?.length || 0,
        crossing5Threshold: currentCount < 5 && (newComponents?.length || 0) >= 5,
        droppingFrom5: currentCount >= 5 && (newComponents?.length || 0) < currentCount,
        timestamp: Date.now(),
        caller: new Error().stack?.split('\n')[1]?.trim()
      });
    }
    
    console.log('🔄 updateCurrentPageComponents called with:', {
      count: newComponents?.length || 0,
      components: newComponents?.map(c => ({ id: c?.id, label: c?.label })) || [],
      caller: new Error().stack?.split('\n')[1]?.trim() || 'unknown',
      timestamp: Date.now(),
      currentCount,
      isInsertion: newComponents?.length > currentCount,
      changeType: newComponents?.length > currentCount ? 'INSERTION' : newComponents?.length < currentCount ? 'DELETION' : 'REORDER',
      suspiciousDropTo1: newComponents?.length === 1 && currentCount > 1,
      suspiciousEmpty: !newComponents || newComponents.length === 0,
      at5ElementThreshold: currentCount >= 5 || newComponents?.length >= 5
    });
    
    if (!newComponents || !Array.isArray(newComponents)) {
      console.warn('updateCurrentPageComponents: Invalid components array provided');
      return;
    }
    
    // 🛡️ RACE CONDITION PROTECTION
    if (newComponents.length === 0 && currentCount > 0) {
      console.error('🛡️ BLOCKING: Attempt to clear non-empty collection blocked!');
      console.error('🛡️ This prevents race condition that clears collection');
      return;
    }
    
    const validComponents = newComponents.filter(c => c && c.id);
    
    // 🛡️ ADDITIONAL PROTECTION: Don't allow severe collection drops without explicit reason
    if (validComponents.length === 1 && currentCount > 2) {
      console.error('🚨 CRITICAL BUG DETECTED: Collection dropping from', currentCount, 'to 1 element!');
      console.error('🚨 This is exactly the bug user reported! Blocking this update!');
      console.error('🚨 Caller:', new Error().stack?.split('\n')[1]);
      console.error('🚨 Input components:', newComponents.map(c => ({ id: c?.id, label: c?.label, type: c?.type })));
      console.error('🚨 Valid components:', validComponents.map(c => ({ id: c.id, label: c.label, type: c.type })));
      
      // BLOCK this update to prevent the bug
      return;
    }
    
    console.log('🧹 Filtered to valid components:', {
      originalCount: newComponents.length,
      validCount: validComponents.length,
      validComponents: validComponents.map(c => ({ id: c.id, label: c.label }))
    });
    
    const updatedPages = safePagesArray.map(page =>
      page && page.id === currentPageId
        ? { ...page, components: validComponents }
        : page
    );
    console.log('📄 Updated pages with new components, calling updatePages...');
    updatePages(updatedPages);
    console.log('✅ updateCurrentPageComponents completed');
  }, [safePagesArray, currentPageId, updatePages]);

  const addComponent = useCallback((type: ComponentType) => {
    console.log('🏗️ addComponent called with type:', type);
    const newComponent = createComponent(type);
    console.log('📦 Created new component:', { id: newComponent.id, label: newComponent.label, type: newComponent.type });
    
    // Get fresh current page to avoid stale closure
    const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
    const freshComponents = freshCurrentPage?.components || [];
    console.log('📋 Current components before adding:', {
      count: freshComponents.length,
      components: freshComponents.map(c => ({ id: c.id, label: c.label }))
    });
    
    const newComponentsList = [...freshComponents, newComponent];
    console.log('📋 New components list:', {
      count: newComponentsList.length,
      components: newComponentsList.map(c => ({ id: c.id, label: c.label }))
    });
    
    updateCurrentPageComponents(newComponentsList);
    setSelectedComponentId(newComponent.id);
    console.log('✅ addComponent completed, component added to collection');
  }, [createComponent, safePagesArray, currentPageId, updateCurrentPageComponents]);

  const updateComponent = useCallback((updates: Partial<FormComponentData>) => {
    if (!selectedComponentId) return;

    // Get fresh current page to avoid stale closure
    const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
    const freshComponents = freshCurrentPage?.components || [];
    
    const updatedComponents = freshComponents.map(component =>
      component.id === selectedComponentId
        ? { ...component, ...updates }
        : component
    );
    updateCurrentPageComponents(updatedComponents);
  }, [selectedComponentId, safePagesArray, currentPageId, updateCurrentPageComponents]);

  const deleteComponent = useCallback((id: string) => {
    // Get fresh current page to avoid stale closure
    const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
    const freshComponents = freshCurrentPage?.components || [];
    
    const filteredComponents = freshComponents.filter(component => component.id !== id);
    updateCurrentPageComponents(filteredComponents);
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [safePagesArray, currentPageId, updateCurrentPageComponents, selectedComponentId]);

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    // Get fresh current page to avoid stale closure
    const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
    const freshComponents = freshCurrentPage?.components || [];
    
    const newComponents = [...freshComponents];
    const draggedComponent = newComponents[dragIndex];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, draggedComponent);
    updateCurrentPageComponents(newComponents);
  }, [safePagesArray, currentPageId, updateCurrentPageComponents]);

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
      setCurrentPageId(pagesData[0]?.id || '1');
    } else if (jsonData && jsonData.length > 0) {
      // Load single-page structure (backward compatibility)
      const singlePage: FormPage = {
        id: '1',
        title: 'Page 1',
        components: jsonData,
      };
      updatePages([singlePage]);
      setCurrentPageId('1');
    } else {
      // No valid data, reset to a clean state
      clearAllSilent();
      return;
    }

    setTemplateName(templateName || "Untitled Form");
    setSelectedComponentId(null);
  }, [updatePages, clearAllSilent]);

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
    position: 'before' | 'after' | 'inside'
  ) => {
    const newComponent = createComponent(type);

    const insertIntoComponents = (components: FormComponentData[]): FormComponentData[] => {
      for (let i = 0; i < components.length; i++) {
        const component = components[i];

        if (component.id === targetId) {
          const newComponents = [...components];

          if (position === 'before') {
            newComponents.splice(i, 0, newComponent);
          } else if (position === 'after') {
            newComponents.splice(i + 1, 0, newComponent);
          } else if (position === 'inside') {
            // Add to layout container
            if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
              const updatedComponent = {
                ...component,
                children: [...(component.children || []), newComponent]
              };
              newComponents[i] = updatedComponent;
            }
          }

          return newComponents;
        }

        // Recursively search in children
        if (component.children && component.children.length > 0) {
          const updatedChildren = insertIntoComponents(component.children);
          if (updatedChildren !== component.children) {
            const newComponents = [...components];
            newComponents[i] = { ...component, children: updatedChildren };
            return newComponents;
          }
        }
      }

      return components;
    };

    const updatedComponents = insertIntoComponents(components);
    updateCurrentPageComponents(updatedComponents);
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

  // Remove component from container and optionally move to canvas
  const removeFromContainer = useCallback((componentId: string, containerPath: string[]) => {
    const removeFromNestedComponents = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerPath[0]) {
          // Found the container
          if (containerPath.length === 1) {
            // Remove from this container's children
            return {
              ...component,
              children: component.children?.filter(child => child.id !== componentId) || []
            };
          } else {
            // Continue down the path
            return {
              ...component,
              children: removeFromNestedComponents(component.children || [])
            };
          }
        }
        return component;
      });
    };

    const updatedComponents = removeFromNestedComponents(components);
    updateCurrentPageComponents(updatedComponents);
  }, [components, updateCurrentPageComponents]);

  // Move component from container to canvas with row layout dissolution
  const moveFromContainerToCanvas = useCallback((componentId: string, containerPath: string[]) => {
    console.log('🎯 ROW LAYOUT RULE: Moving component from container, checking for dissolution');
    
    let componentToMove: FormComponentData | null = null;
    let parentContainer: FormComponentData | null = null;

    // Find the component and its parent container
    const findComponentAndParent = (components: FormComponentData[]): { component: FormComponentData | null; parent: FormComponentData | null } => {
      for (const component of components) {
        if (component.children) {
          // Check direct children
          for (const child of component.children) {
            if (child.id === componentId) {
              return { component: child, parent: component };
            }
          }
          // Check nested children
          const result = findComponentAndParent(component.children);
          if (result.component) return result;
        }
      }
      return { component: null, parent: null };
    };

    const { component, parent } = findComponentAndParent(components);
    componentToMove = component;
    parentContainer = parent;

    if (componentToMove && parentContainer) {
      console.log('📦 Found component to move:', {
        componentId: componentToMove.id,
        componentLabel: componentToMove.label,
        parentId: parentContainer.id,
        parentType: parentContainer.type,
        remainingChildren: (parentContainer.children?.length || 0) - 1
      });

      // CRITICAL RULE: If removing this component leaves only 1 child in row layout, dissolve the container
      if (parentContainer.type === 'horizontal_layout' && parentContainer.children && parentContainer.children.length === 2) {
        console.log('🔄 ROW LAYOUT DISSOLUTION: Only 1 child will remain, dissolving row layout');
        
        // Find the remaining child
        const remainingChild = parentContainer.children.find(child => child.id !== componentId);
        
        if (remainingChild) {
          // Replace the entire row layout with the remaining child + add moved component to canvas
          const newComponents = components.map(c => {
            if (c.id === parentContainer!.id) {
              // Replace row layout with remaining child
              console.log('✅ Promoting remaining child to main canvas:', remainingChild.label);
              return remainingChild;
            }
            return c;
          });
          
          // Add the moved component to the end of canvas
          const finalComponents = [...newComponents, componentToMove];
          
          console.log('✅ ROW LAYOUT DISSOLVED:', {
            oldRowLayout: parentContainer.label,
            promotedChild: remainingChild.label,
            movedComponent: componentToMove.label,
            newCanvasSize: finalComponents.length
          });
          
          updateCurrentPageComponents(finalComponents);
          setSelectedComponentId(componentId);
        }
      } else {
        // Normal case: just remove from container and add to canvas
        console.log('📝 Normal container removal (not dissolving)');
        removeFromContainer(componentId, containerPath);
        
        setTimeout(() => {
          const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
          const freshComponents = freshCurrentPage?.components || [];
          const updatedComponents = [...freshComponents, componentToMove!];
          updateCurrentPageComponents(updatedComponents);
          setSelectedComponentId(componentId);
        }, 50);
      }
    }
  }, [components, safePagesArray, currentPageId, removeFromContainer, updateCurrentPageComponents]);

  // Add component to container with position
  const addComponentToContainerWithPosition = useCallback((type: ComponentType, containerId: string, position: 'left' | 'center' | 'right' = 'center') => {
    const newComponent = createComponent(type);

    const updateComponentRecursively = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerId) {
          // Found the target container
          if (component.type === 'horizontal_layout') {
            const currentChildren = component.children || [];
            let insertIndex: number;
            
            // Determine insert position based on drop position
            switch (position) {
              case 'left':
                insertIndex = 0;
                break;
              case 'right':
                insertIndex = currentChildren.length;
                break;
              case 'center':
              default:
                insertIndex = Math.floor(currentChildren.length / 2);
                break;
            }

            const updatedChildren = [...currentChildren];
            updatedChildren.splice(insertIndex, 0, newComponent);

            // Recalculate widths for horizontal container
            const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
            updatedChildren.forEach(child => {
              child.layout = { ...child.layout, width: columnPercentage };
            });

            return {
              ...component,
              children: updatedChildren
            };
          } else if (component.type === 'vertical_layout') {
            // For vertical layouts, just add to the end
            const updatedChildren = [...(component.children || []), newComponent];
            updatedChildren.forEach(child => {
              child.layout = { ...child.layout, width: '100%' };
            });

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

  // Rearrange components within the same container
  const rearrangeWithinContainer = useCallback((containerId: string, dragIndex: number, hoverIndex: number) => {
    console.log('Rearranging within container:', containerId, 'from', dragIndex, 'to', hoverIndex);
    
    const updateComponentRecursively = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerId && component.children) {
          const updatedChildren = [...component.children];
          const [draggedItem] = updatedChildren.splice(dragIndex, 1);
          updatedChildren.splice(hoverIndex, 0, draggedItem);
          
          // Recalculate widths for horizontal containers
          if (component.type === 'horizontal_layout') {
            const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
            updatedChildren.forEach(child => {
              child.layout = { ...child.layout, width: columnPercentage };
            });
          }
          
          return {
            ...component,
            children: updatedChildren
          };
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
  }, [components, updateCurrentPageComponents]);

  // Move component between containers  
  const moveToContainer = useCallback((componentId: string, fromPath: string[], toPath: string[], position?: 'left' | 'center' | 'right') => {
    console.log('Move to container:', componentId, fromPath, toPath, position);
    
    // First, find and remove the component from its current location
    let componentToMove: FormComponentData | null = null;
    
    // Find the component in the nested structure
    const findInNestedComponents = (components: FormComponentData[]): FormComponentData | null => {
      for (const component of components) {
        if (component.children) {
          for (const child of component.children) {
            if (child.id === componentId) {
              return child;
            }
          }
          const found = findInNestedComponents(component.children);
          if (found) return found;
        }
      }
      return null;
    };

    componentToMove = findInNestedComponents(components);
    
    if (componentToMove) {
      // Remove from current container
      removeFromContainer(componentId, fromPath);
      
      // Add to new container with position
      setTimeout(() => {
        const targetContainerId = toPath[toPath.length - 1];
        
        const updateComponentRecursively = (components: FormComponentData[]): FormComponentData[] => {
          return components.map(component => {
            if (component.id === targetContainerId) {
              if (component.type === 'horizontal_layout') {
                const currentChildren = component.children || [];
                let insertIndex: number;
                
                switch (position) {
                  case 'left':
                    insertIndex = 0;
                    break;
                  case 'right':
                    insertIndex = currentChildren.length;
                    break;
                  case 'center':
                  default:
                    insertIndex = Math.floor(currentChildren.length / 2);
                    break;
                }

                const updatedChildren = [...currentChildren];
                updatedChildren.splice(insertIndex, 0, componentToMove!);

                // Recalculate widths
                const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
                updatedChildren.forEach(child => {
                  child.layout = { ...child.layout, width: columnPercentage };
                });

                return { ...component, children: updatedChildren };
              } else {
                // Vertical layout - just add to end
                return {
                  ...component,
                  children: [...(component.children || []), componentToMove!]
                };
              }
            }

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
        setSelectedComponentId(componentId);
      }, 100);
    }
  }, [components, removeFromContainer, updateCurrentPageComponents]);

  return {
    pages: safePagesArray,
    currentPage,
    currentPageId,
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
    createComponent,
    clearAll,
    clearAllSilent,
    loadFromJSON,
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
    insertComponentWithPosition,
    insertBetweenComponents,
    insertHorizontalToComponent,
    addComponentToContainer,
    addComponentToContainerWithPosition,
    rearrangeWithinContainer,
    removeFromContainer,
    moveFromContainerToCanvas,
    moveToContainer,
    undo: undoRedoActions.undo,
    redo: undoRedoActions.redo,
    canUndo: undoRedoActions.canUndo,
    canRedo: undoRedoActions.canRedo,
    updateCurrentPageComponents,
  };
};
