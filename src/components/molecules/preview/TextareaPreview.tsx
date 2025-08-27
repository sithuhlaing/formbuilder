
import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewField, PreviewTextarea } from '../../atoms';
import { getDefaultLabel, getDefaultPlaceholder } from '../../../utils/componentDefaults';

interface TextareaPreviewProps {
  component: FormComponentData;
}

const TextareaPreview: React.FC<TextareaPreviewProps> = ({ component }) => {
  const displayLabel = component.label || getDefaultLabel(component.type);
  
  return (
    <PreviewField label={displayLabel} required={component.required}>
      <PreviewTextarea
        placeholder={component.placeholder || getDefaultPlaceholder(component.type)}
        rows={3}
      />
    </PreviewField>
  );
};

export default TextareaPreview;
