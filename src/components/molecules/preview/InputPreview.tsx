import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewField, PreviewInput } from '../../atoms';

interface InputPreviewProps {
  component: FormComponentData;
}

const getInputTypeFromComponentType = (componentType: string): string => {
  switch (componentType) {
    case 'text_input':
      return 'text';
    case 'number_input':
      return 'number';
    case 'date_picker':
      return 'date';
    default:
      return 'text';
  }
};

const getDefaultPlaceholder = (componentType: string): string => {
  switch (componentType) {
    case 'text_input':
      return 'Enter text...';
    case 'number_input':
      return 'Enter a number...';
    case 'date_picker':
      return 'Select date...';
    default:
      return 'Enter value...';
  }
};

const InputPreview: React.FC<InputPreviewProps> = ({ component }) => {
  const inputType = getInputTypeFromComponentType(component.type);
  const defaultPlaceholder = getDefaultPlaceholder(component.type);
  
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewInput
        type={inputType}
        placeholder={component.placeholder || defaultPlaceholder}
      />
    </PreviewField>
  );
};

export default InputPreview;