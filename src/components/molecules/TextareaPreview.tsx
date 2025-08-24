
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewField, PreviewTextarea } from '../atoms';

interface TextareaPreviewProps {
  component: FormComponentData;
}

const TextareaPreview: React.FC<TextareaPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewTextarea
        placeholder={component.placeholder || "Enter your message..."}
        rows={3}
      />
    </PreviewField>
  );
};

export default TextareaPreview;
