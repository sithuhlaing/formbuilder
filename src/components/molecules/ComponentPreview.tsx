import React from 'react';
import InputPreview from './InputPreview';
import TextareaPreview from './TextareaPreview';
import SelectPreview from './SelectPreview';
import CheckboxPreview from './CheckboxPreview';
import RadioGroupPreview from './RadioGroupPreview';
import FileUploadPreview from './FileUploadPreview';
import MultiSelectPreview from './MultiSelectPreview';
import SectionDividerPreview from './SectionDividerPreview';
import SignaturePreview from './SignaturePreview';
import type { FormComponentData } from '../types';

interface ComponentPreviewProps {
  component: FormComponentData;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ component }) => {
  const renderChild = (child: FormComponentData): React.ReactNode => {
    return <ComponentPreview key={child.id} component={child} />;
  };

  const renderPreview = () => {
    switch (component.type) {
      case "text_input":
      case "number_input":
      case "date_picker":
        return <InputPreview component={component} />;
      
      case "textarea":
        return <TextareaPreview component={component} />;
      
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
        return (
          <div className="form-field-preview">
            <div className="container-preview horizontal-container">
              <div className="container-header">
                <span className="container-label">↔️ {component.label}</span>
                <span className="container-info">
                  {component.children?.length || 0}/12 columns - Drag fields here to arrange horizontally
                </span>
              </div>
              <div className="container-drop-zone">
                {component.children && component.children.length > 0 ? (
                  <div className="container-items horizontal grid-row">
                    {component.children.map((child, index) => (
                      <div 
                        key={child.id} 
                        className="container-item grid-column"
                        style={{ 
                          width: child.layout?.width || `${(100 / component.children!.length).toFixed(2)}%`,
                          minWidth: '100px',
                          flexShrink: 0
                        }}
                      >
                        <ComponentPreview component={child} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="container-placeholder">
                    <span>Drop components here to arrange horizontally (max 12 per row)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case "vertical_layout":
        return (
          <div className="form-field-preview">
            <div className="container-preview vertical-container">
              <div className="container-header">
                <span className="container-label">↕️ {component.label}</span>
                <span className="container-info">Drag fields here to arrange vertically</span>
              </div>
              <div className="container-drop-zone">
                {component.children && component.children.length > 0 ? (
                  <div className="container-items vertical">
                    {component.children.map((child, index) => (
                      <div key={child.id} className="container-item">
                        <ComponentPreview component={child} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="container-placeholder">
                    <span>Drop components here to arrange vertically</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
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

  return renderPreview();
};

export default ComponentPreview;