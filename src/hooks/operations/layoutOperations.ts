
import { useCallback } from 'react';
import type { FormComponentData, ComponentType } from "../../types";
import type { ModalFunctions } from '../types/formBuilder';
import { useComponentFactory } from '../factories/componentFactory';

export function useLayoutOperations(
  components: FormComponentData[],
  updateCurrentPageComponents: (components: FormComponentData[]) => void,
  setSelectedComponentId: (id: string | null) => void,
  modalFunctions?: ModalFunctions
) {
  const { createComponent } = useComponentFactory();

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
  }, [components, createComponent, updateCurrentPageComponents, setSelectedComponentId]);

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

    let parentContainer = newComponents.find(comp =>
      comp.type === 'horizontal_layout' &&
      comp.children?.some(child => child.id === targetId)
    );

    if (parentContainer && parentContainer.children) {
      if (parentContainer.children.length < 12) {
        const targetChildIndex = parentContainer.children.findIndex(child => child.id === targetId);
        const insertIndex = position === 'left' ? targetChildIndex : targetChildIndex + 1;

        const updatedChildren = [...parentContainer.children];
        updatedChildren.splice(insertIndex, 0, newComponent);

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
      const containerComponent = createComponent('horizontal_layout');
      containerComponent.label = 'Layout Row';
      containerComponent.children = position === 'left'
        ? [newComponent, targetComponent]
        : [targetComponent, newComponent];

      containerComponent.children.forEach(child => {
        child.layout = { ...child.layout, width: '50%' };
      });

      newComponents[targetIndex] = containerComponent;
    }

    updateCurrentPageComponents(newComponents);
    setSelectedComponentId(newComponent.id);
  }, [components, createComponent, updateCurrentPageComponents, setSelectedComponentId, modalFunctions]);

  const addComponentToContainer = useCallback((type: ComponentType, containerId: string) => {
    const newComponent = createComponent(type);

    const updateComponentRecursively = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerId) {
          if (component.type === 'horizontal_layout' || component.type === 'vertical_layout') {
            const updatedChildren = [...(component.children || []), newComponent];

            if (component.type === 'horizontal_layout') {
              const columnPercentage = `${(100 / updatedChildren.length).toFixed(2)}%`;
              updatedChildren.forEach(child => {
                child.layout = { ...child.layout, width: columnPercentage };
              });
            } else {
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
  }, [createComponent, components, updateCurrentPageComponents, setSelectedComponentId]);

  const removeFromContainer = useCallback((componentId: string, containerPath: string[]) => {
    const removeFromNestedComponents = (components: FormComponentData[]): FormComponentData[] => {
      return components.map(component => {
        if (component.id === containerPath[0]) {
          if (containerPath.length === 1) {
            return {
              ...component,
              children: component.children?.filter(child => child.id !== componentId) || []
            };
          } else {
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

  return {
    insertComponentWithPosition,
    insertHorizontalToComponent,
    addComponentToContainer,
    removeFromContainer
  };
}
