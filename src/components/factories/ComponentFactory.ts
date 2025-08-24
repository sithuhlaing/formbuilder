
import type { ComponentType, FormComponentData } from '../types/component';

interface ComponentCreator {
  create(id: string): FormComponentData;
}

class TextInputCreator implements ComponentCreator {
  create(id: string): FormComponentData {
    return {
      id,
      type: 'text_input',
      label: 'Text Input Field',
      fieldId: `field_${id}`,
      placeholder: 'Enter text...',
      required: false,
    };
  }
}

class NumberInputCreator implements ComponentCreator {
  create(id: string): FormComponentData {
    return {
      id,
      type: 'number_input',
      label: 'Number Input Field',
      fieldId: `field_${id}`,
      placeholder: 'Enter number...',
      required: false,
      min: 0,
      step: 1,
    };
  }
}

class SelectCreator implements ComponentCreator {
  create(id: string): FormComponentData {
    return {
      id,
      type: 'select',
      label: 'Select Field',
      fieldId: `field_${id}`,
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
  }
}

export class ComponentFactory {
  private creators: Map<ComponentType, ComponentCreator> = new Map([
    ['text_input', new TextInputCreator()],
    ['number_input', new NumberInputCreator()],
    ['select', new SelectCreator()],
  ]);

  createComponent(type: ComponentType): FormComponentData {
    const id = Date.now().toString();
    const creator = this.creators.get(type);
    
    if (!creator) {
      throw new Error(`Unknown component type: ${type}`);
    }
    
    return creator.create(id);
  }
}
