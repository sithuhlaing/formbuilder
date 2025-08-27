
import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewField, PreviewSelect } from '../../atoms';
import { getDefaultLabel } from '../../../utils/componentDefaults';

interface SelectPreviewProps {
  component: FormComponentData;
}

const SelectPreview: React.FC<SelectPreviewProps> = ({ component }) => {
  const displayLabel = component.label || getDefaultLabel(component.type);
  
  return (
    <PreviewField label={displayLabel} required={component.required}>
      <PreviewSelect options={component.options} />
    </PreviewField>
  );
};

export default SelectPreview;
