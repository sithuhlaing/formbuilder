import React from 'react';
import RichTextField from '../../atoms/form/RichTextField';
import type { FormComponentData } from '../../types';

interface RichTextPreviewProps {
  component: FormComponentData;
}

const RichTextPreview: React.FC<RichTextPreviewProps> = ({ component }) => {
  return (
    <div className="form-field-preview" style={{ marginBottom: 'var(--space-4)' }}>
      <RichTextField
        value={component.value || ''}
        onChange={() => {}} // Preview mode - no changes
        label={component.label}
        placeholder={component.placeholder || 'Enter rich text...'}
        required={component.required}
        disabled={true} // Always disabled in preview
        height={component.height || '200px'}
        helpText={component.helpText}
      />
    </div>
  );
};

export default RichTextPreview;