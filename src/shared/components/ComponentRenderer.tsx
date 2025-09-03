/**
 * PERFORMANCE OPTIMIZED - Smart Component Renderer
 * Uses reusable components with memoization and lazy loading
 */

import React, { memo, useMemo } from 'react';
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
  isSelected?: boolean;
}

// Memoized component renderer for performance
const ComponentRendererImpl: React.FC<ComponentRendererProps> = ({ 
  component, 
  readOnly = true,
  showControls = false,
  isSelected = false
}) => {
  // Memoize component key properties to prevent unnecessary re-renders
  const componentKey = useMemo(() => ({
    id: component.id,
    type: component.type,
    label: component.label,
    required: component.required,
    readOnly,
    showControls,
    isSelected
  }), [component.id, component.type, component.label, component.required, readOnly, showControls, isSelected]);
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
          
          case 'rich_text':
            return (
              <RichTextEditor
                value={component.defaultValue || ''}
                placeholder={component.placeholder || 'Enter rich text content...'}
                readOnly={readOnly}
                height={component.height || '200px'}
                className="component-rich-text"
                onChange={(value) => {
                  // TODO: Implement proper state management for rich text content
                  console.log('Rich text content changed:', value);
                }}
              />
            );
          
          case 'select':
            return (
              <Select
                required={component.required}
                disabled={readOnly}
                options={(component.options || []).map(option => 
                  typeof option === 'string' ? option : option.label
                )}
              />
            );
          
          case 'multi_select':
            return (
              <Select
                required={component.required}
                disabled={readOnly}
                options={(component.options || []).map(option => 
                  typeof option === 'string' ? option : option.label
                )}
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
                options={(component.options || []).map(option => 
                  typeof option === 'string' ? option : option.label
                )}
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
          
          default:
            return <UnknownComponent type={component.type} />;
        }
      })()}
    </FormField>
  );
};

// Memoized export with custom comparison function
export const ComponentRenderer = memo(ComponentRendererImpl, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.component.id === nextProps.component.id &&
    prevProps.component.type === nextProps.component.type &&
    prevProps.component.label === nextProps.component.label &&
    prevProps.component.required === nextProps.component.required &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.showControls === nextProps.showControls &&
    prevProps.isSelected === nextProps.isSelected &&
    // Deep compare options if present
    JSON.stringify(prevProps.component.options) === JSON.stringify(nextProps.component.options) &&
    // Compare other frequently changing props
    prevProps.component.placeholder === nextProps.component.placeholder &&
    prevProps.component.defaultValue === nextProps.component.defaultValue
  );
});