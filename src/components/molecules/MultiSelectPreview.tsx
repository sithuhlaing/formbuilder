
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewField, PreviewMultiSelect } from '../atoms';

interface MultiSelectPreviewProps {
  component: FormComponentData;
}

const MultiSelectPreview: React.FC<MultiSelectPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewMultiSelect options={component.options} />
    </PreviewField>
  );
};

export default MultiSelectPreview;
