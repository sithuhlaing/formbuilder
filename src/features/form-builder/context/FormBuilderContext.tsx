import React, { createContext, useContext, ReactNode } from 'react';
import { FormComponentData } from '../../core/interfaces/ComponentInterfaces';

interface FormBuilderContextType {
  formData: FormComponentData[];
  selectedComponent: FormComponentData | null;
  setSelectedComponent: (component: FormComponentData | null) => void;
  updateComponent: (id: string, updates: Partial<FormComponentData>) => void;
  addComponent: (component: Omit<FormComponentData, 'id'>, parentId?: string) => void;
  removeComponent: (id: string) => void;
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

interface FormBuilderProviderProps {
  children: ReactNode;
  initialData?: FormComponentData[];
}

export const FormBuilderProvider: React.FC<FormBuilderProviderProps> = ({
  children,
  initialData = [],
}) => {
  const [formData, setFormData] = React.useState<FormComponentData[]>(initialData);
  const [selectedComponent, setSelectedComponent] = React.useState<FormComponentData | null>(null);

  const updateComponent = (id: string, updates: Partial<FormComponentData>) => {
    setFormData(prevData =>
      prevData.map(comp => (comp.id === id ? { ...comp, ...updates } : comp))
    );
    
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const addComponent = (component: Omit<FormComponentData, 'id'>, parentId?: string) => {
    const newComponent = {
      ...component,
      id: `comp-${Date.now()}`,
    };

    if (parentId) {
      setFormData(prevData =>
        prevData.map(comp =>
          comp.id === parentId
            ? { ...comp, components: [...(comp.components || []), newComponent] }
            : comp
        )
      );
    } else {
      setFormData(prevData => [...prevData, newComponent]);
    }
  };

  const removeComponent = (id: string) => {
    setFormData(prevData => prevData.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const value = {
    formData,
    selectedComponent,
    setSelectedComponent,
    updateComponent,
    addComponent,
    removeComponent,
  };

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = (): FormBuilderContextType => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};
