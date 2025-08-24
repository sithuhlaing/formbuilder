
import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewField, PreviewSelect } from '../../atoms';

interface SelectPreviewProps {
  component: FormComponentData;
}

const SelectPreview: React.FC<SelectPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewSelect options={component.options} />
    </PreviewField>
  );
};

export default SelectPreview;
