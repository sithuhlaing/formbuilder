
import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewField, PreviewFileUpload } from '../../atoms';

interface FileUploadPreviewProps {
  component: FormComponentData;
}

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ component }) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <PreviewFileUpload />
    </PreviewField>
  );
};

export default FileUploadPreview;
