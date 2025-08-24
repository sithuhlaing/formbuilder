
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewField, PreviewRadioGroup } from '../atoms';

interface RadioGroupPreviewProps {
  component: FormComponentData;
}

const RadioGroupPreview: React.FC<RadioGroupPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewRadioGroup options={component.options} />
    </PreviewField>
  );
};

export default RadioGroupPreview;
