/**
 * Smart Component Renderer
 * Uses reusable components to render form components
 */

import React from 'react';
import { FormField } from './FormField';
import { 
  TextInput, 
  NumberInput, 
  Textarea, 
  Select, 
  Checkbox, 
  RadioGroup, 
  FileUpload 
} from './Input';
import {
  SectionDivider,
  SignatureField,
  ButtonPreview,
  HeadingPreview,
  CardPreview,
  DatePicker,
  UnknownComponent,
  RichTextEditor
} from './SpecializedFormComponents';
import type { FormComponentData } from '../../types';

interface ComponentRendererProps {
  component: FormComponentData;
  readOnly?: boolean;
  showControls?: boolean;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ 
  component, 
  readOnly = true,
  showControls = false 
}) => {
  // Handle components that don't need FormField wrapper
  const renderWithoutWrapper = () => {
    switch (component.type) {
      case 'section_divider':
        return <SectionDivider label={component.label} />;
      
      case 'heading':
        return (
          <FormField>
            <HeadingPreview 
              level={component.level}
              text={component.text}
              label={component.label}
            />
          </FormField>
        );
      
      case 'button':
        return (
          <FormField>
            <ButtonPreview
              buttonType={component.buttonType}
              buttonText={component.buttonText}
              label={component.label}
              disabled={readOnly}
            />
          </FormField>
        );
      
      case 'card':
        return (
          <FormField>
            <CardPreview label={component.label}>
              {component.children?.map((child, index) => (
                <ComponentRenderer 
                  key={child.id || index} 
                  component={child} 
                  readOnly={readOnly}
                  showControls={showControls}
                />
              ))}
            </CardPreview>
          </FormField>
        );
      
      default:
        return null;
    }
  };

  // Check if this component should render without wrapper
  const withoutWrapper = renderWithoutWrapper();
  if (withoutWrapper) {
    return withoutWrapper;
  }

  // Render with FormField wrapper
  return (
    <FormField
      label={component.label}
      required={component.required}
      helpText={component.description || component.helpText}
    >
      {(() => {
        switch (component.type) {
          case 'text_input':
            return (
              <TextInput
                type="text"
                placeholder={component.placeholder}
                required={component.required}
                readOnly={readOnly}
              />
            );
          
          case 'email_input':
            return (
              <TextInput
                type="email"
                placeholder={component.placeholder}
                required={component.required}
                readOnly={readOnly}
              />
            );
          
          case 'password_input':
            return (
              <TextInput
                type="password"
                placeholder={component.placeholder}
                required={component.required}
                readOnly={readOnly}
              />
            );
          
          case 'number_input':
            return (
              <NumberInput
                placeholder={component.placeholder}
                required={component.required}
                readOnly={readOnly}
                min={component.min}
                max={component.max}
                step={component.step}
              />
            );
          
          case 'textarea':
            return (
              <Textarea
                placeholder={component.placeholder}
                required={component.required}
                readOnly={readOnly}
                rows={component.rows}
              />
            );
          
          case 'select':
            return (
              <Select
                required={component.required}
                disabled={readOnly}
                options={component.options || []}
              />
            );
          
          case 'multi_select':
            return (
              <Select
                required={component.required}
                disabled={readOnly}
                options={component.options || []}
                multiple
              />
            );
          
          case 'checkbox':
            return (
              <div className="form-field__checkbox-wrapper">
                <Checkbox
                  id={component.id}
                  required={component.required}
                  disabled={readOnly}
                />
                <label htmlFor={component.id} className="form-field__checkbox-label">
                  {component.label}{component.required ? ' *' : ''}
                </label>
              </div>
            );
          
          case 'radio_group':
            return (
              <RadioGroup
                name={component.id}
                options={component.options || []}
                required={component.required}
                disabled={readOnly}
              />
            );
          
          case 'date_picker':
            return (
              <DatePicker
                required={component.required}
                readOnly={readOnly}
              />
            );
          
          case 'file_upload':
            return (
              <FileUpload
                required={component.required}
                disabled={readOnly}
                accept={component.acceptedFileTypes}
              />
            );
          
          case 'signature':
            return <SignatureField />;
          
          case 'rich_text':
            return (
              <RichTextEditor
                value={component.defaultValue || ''}
                placeholder={component.placeholder || 'Enter rich text content...'}
                readOnly={false}
                height={component.height || '200px'}
              />
            );
          
          default:
            return <UnknownComponent type={component.type} />;
        }
      })()}
    </FormField>
  );
};