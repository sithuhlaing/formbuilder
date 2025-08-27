import React from 'react';
import type { FormComponentData } from '../../../types';
import { PreviewField, PreviewInput } from '../../atoms';
import { getDefaultLabel, getDefaultPlaceholder } from '../../../utils/componentDefaults';

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

const InputPreview: React.FC<InputPreviewProps> = ({ component }) => {
  const inputType = getInputTypeFromComponentType(component.type);
  const displayLabel = component.label || getDefaultLabel(component.type);
  
  return (
    <PreviewField label={displayLabel} required={component.required}>
      <PreviewInput
        type={inputType}
        placeholder={component.placeholder || defaultPlaceholder}
      />
    </PreviewField>
  );
};

export default InputPreview;