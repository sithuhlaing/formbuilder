import React from 'react';
import InputPreview from '../preview/InputPreview';
import TextareaPreview from '../preview/TextareaPreview';
import RichTextPreview from '../preview/RichTextPreview';
import SelectPreview from '../preview/SelectPreview';
import CheckboxPreview from '../preview/CheckboxPreview';
import RadioGroupPreview from '../preview/RadioGroupPreview';
import FileUploadPreview from '../preview/FileUploadPreview';
import MultiSelectPreview from '../preview/MultiSelectPreview';
import SectionDividerPreview from '../preview/SectionDividerPreview';
import SignaturePreview from '../preview/SignaturePreview';
import PreviewHorizontalLayout from '../preview/PreviewHorizontalLayout';
import PreviewVerticalLayout from '../preview/PreviewVerticalLayout';
import type { FormComponentData } from '../../types';

interface ComponentRendererProps {
  component: FormComponentData;
  renderChild: (child: FormComponentData) => React.ReactNode;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, renderChild }) => {
  switch (component.type) {
    case "text_input":
    case "number_input":
    case "date_picker":
      return <InputPreview component={component} />;
    
    case "textarea":
      return <TextareaPreview component={component} />;
    
    case "rich_text":
      return <RichTextPreview component={component} />;
    
    case "select":
      return <SelectPreview component={component} />;
    
    case "checkbox":
      return <CheckboxPreview component={component} />;
    
    case "radio_group":
      return <RadioGroupPreview component={component} />;
    
    case "file_upload":
      return <FileUploadPreview component={component} />;
    
    case "multi_select":
      return <MultiSelectPreview component={component} />;
    
    case "section_divider":
      return <SectionDividerPreview component={component} />;
    
    case "signature":
      return <SignaturePreview component={component} />;
    
    case "horizontal_layout":
      return <PreviewHorizontalLayout component={component} renderChild={renderChild} />;
    
    case "vertical_layout":
      return <PreviewVerticalLayout component={component} renderChild={renderChild} />;
    
    default:
      return (
        <div className="form-field-preview">
          <div className="preview-error" style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-red-50)',
            border: '1px solid var(--color-red-200)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-red-700)'
          }}>
            Unknown component type: {component.type}
          </div>
        </div>
      );
  }
};

export default ComponentRenderer;
