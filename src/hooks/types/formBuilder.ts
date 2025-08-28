
import type { FormComponentData, ComponentType, FormPage, FormTemplateType } from "../../types";

export interface ModalFunctions {
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

export interface FormBuilderState {
  pages: FormPage[];
  currentPageId: string;
  selectedComponentId: string | null;
  templateName: string;
}

export interface ComponentOperations {
  addComponent: (type: ComponentType) => void;
  updateComponent: (updates: Partial<FormComponentData>) => void;
  deleteComponent: (id: string) => void;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  selectComponent: (id: string | null) => void;
  createComponent: (type: ComponentType) => FormComponentData;
}

export interface PageOperations {
  addPage: () => void;
  deletePage: (pageId: string) => void;
  updatePageTitle: (pageId: string, title: string) => void;
  switchToPage: (pageId: string) => void;
  clearPage: (pageId: string) => void;
}

export interface LayoutOperations {
  insertComponentWithPosition: (type: ComponentType, targetId: string, position: 'before' | 'after' | 'inside') => void;
  insertBetweenComponents: (type: ComponentType, insertIndex: number) => void;
  insertHorizontalToComponent: (type: ComponentType, targetId: string, position: 'left' | 'right') => void;
  addComponentToContainer: (type: ComponentType, containerId: string) => void;
  addComponentToContainerWithPosition: (type: ComponentType, containerId: string, position?: 'left' | 'center' | 'right') => void;
  rearrangeWithinContainer: (containerId: string, dragIndex: number, hoverIndex: number) => void;
  removeFromContainer: (componentId: string, containerPath: string[]) => void;
  moveFromContainerToCanvas: (componentId: string, containerPath: string[]) => void;
  moveToContainer: (componentId: string, fromPath: string[], toPath: string[], position?: 'left' | 'center' | 'right') => void;
}
