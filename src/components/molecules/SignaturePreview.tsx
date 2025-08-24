
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewField, PreviewSignature } from '../atoms';

interface SignaturePreviewProps {
  component: FormComponentData;
}

const SignaturePreview: React.FC<SignaturePreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewSignature />
    </PreviewField>
  );
};

export default SignaturePreview;
