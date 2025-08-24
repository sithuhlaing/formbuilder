
import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewSectionDivider } from '../../atoms';

interface SectionDividerPreviewProps {
  component: FormComponentData;
}

const SectionDividerPreview: React.FC<SectionDividerPreviewProps> = ({ component }) => {
  return (
    <div className="form-field-preview">
      <PreviewSectionDivider
        label={component.label || "Section Divider"}
        description={component.description}
      />
    </div>
  );
};

export default SectionDividerPreview;
