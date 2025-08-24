
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewCheckboxGroup, PreviewField } from '../atoms';

interface CheckboxPreviewProps {
  component: FormComponentData;
}

const CheckboxPreview: React.FC<CheckboxPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewCheckboxGroup options={component.options} />
    </PreviewField>
  );
};

export default CheckboxPreview;
