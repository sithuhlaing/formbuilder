
import { useCallback, useRef } from 'react';
import type { FormComponentData, ComponentType, FormPage } from "../../types";
import { useComponentFactory } from '../factories/componentFactory';

export function useComponentOperations(
  safePagesArray: FormPage[],
  currentPageId: string,
  updateCurrentPageComponents: (components: FormComponentData[]) => void,
  selectedComponentId: string | null,
  setSelectedComponentId: (id: string | null) => void
) {
  const { createComponent } = useComponentFactory();
  
  // Throttling to prevent race conditions
  const lastUpdateRef = useRef<number>(0);
  const THROTTLE_MS = 50;

  const throttledUpdate = useCallback((updater: (prev: FormComponentData[]) => FormComponentData[]) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_MS) {
      console.log('Update throttled');
      return;
    }
    lastUpdateRef.current = now;

    const freshCurrentPage = safePagesArray.find(p => p && p.id === currentPageId) || safePagesArray[0];
    const freshComponents = freshCurrentPage?.components || [];
    const newComponents = updater(freshComponents);
    updateCurrentPageComponents(newComponents);
  }, [safePagesArray, currentPageId, updateCurrentPageComponents, THROTTLE_MS]);

  const safelyFindComponent = useCallback((components: FormComponentData[], componentId: string | null): FormComponentData | null => {
    if (!componentId || !components || !Array.isArray(components)) {
      return null;
    }
    return components.find(c => c && c.id === componentId) || null;
  }, []);

  const addComponent = useCallback((type: ComponentType) => {
    console.log('🏗️ addComponent called with type:', type);
    const newComponent = createComponent(type);
    console.log('📦 Created new component:', { id: newComponent.id, label: newComponent.label, type: newComponent.type });
    
    throttledUpdate(prevComponents => {
      const newComponentsList = [...prevComponents, newComponent];
      console.log('📋 New components list:', {
        count: newComponentsList.length,
        components: newComponentsList.map(c => ({ id: c.id, label: c.label }))
      });
      return newComponentsList;
    });

    setSelectedComponentId(newComponent.id);
    console.log('✅ addComponent completed, component added to collection');
  }, [createComponent, throttledUpdate, setSelectedComponentId]);

  const insertComponent = useCallback((type: ComponentType, index: number) => {
    const newComponent = createComponent(type);
    throttledUpdate(prevComponents => {
      const newComponents = [...prevComponents];
      newComponents.splice(index, 0, newComponent);
      return newComponents;
    });
    setSelectedComponentId(newComponent.id);
  }, [createComponent, throttledUpdate, setSelectedComponentId]);

  const updateComponent = useCallback((updates: Partial<FormComponentData>) => {
    if (!selectedComponentId) return;

    throttledUpdate(prevComponents => 
      prevComponents.map(component =>
        component.id === selectedComponentId
          ? { ...component, ...updates }
          : component
      )
    );
  }, [selectedComponentId, throttledUpdate]);

  const deleteComponent = useCallback((id: string) => {
    throttledUpdate(prevComponents => prevComponents.filter(component => component.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [throttledUpdate, selectedComponentId, setSelectedComponentId]);

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    throttledUpdate(prevComponents => {
      const newComponents = [...prevComponents];
      const draggedComponent = newComponents[dragIndex];
      newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, draggedComponent);
      return newComponents;
    });
  }, [throttledUpdate]);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, [setSelectedComponentId]);

  return {
    addComponent,
    insertComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    selectComponent,
    createComponent,
    safelyFindComponent
  };
}
