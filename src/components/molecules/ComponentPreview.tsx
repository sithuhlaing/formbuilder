import React from "react";
import type { FormComponentData } from "../types";

interface ComponentPreviewProps {
  component: FormComponentData;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ component }) => {
  const renderPreview = () => {
    switch (component.type) {
      case "text_input":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              placeholder={component.placeholder || "Enter text..."}
              disabled
              className="input form-component__preview"
            />
          </div>
        );
      case "number_input":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="number"
              placeholder={component.placeholder || "Enter a number..."}
              disabled
              className="input form-component__preview"
            />
          </div>
        );
      case "textarea":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              placeholder={component.placeholder || "Enter your message..."}
              disabled
              rows={3}
              className="textarea form-component__preview"
            />
          </div>
        );
      case "select":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <select disabled className="select form-component__preview">
              <option>Select an option...</option>
              {component.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case "checkbox":
        return (
          <div className="form-field-preview">
            <fieldset>
              <legend className="label">
                {component.label}
                {component.required && <span className="text-red-500"> *</span>}
              </legend>
              <div className="checkbox-group">
                {component.options?.map((option, index) => (
                  <label key={index} className="checkbox">
                    <input type="checkbox" disabled className="checkbox__input" />
                    <div className="checkbox__box"></div>
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        );
      case "radio_group":
        return (
          <div className="form-field-preview">
            <fieldset>
              <legend className="label">
                {component.label}
                {component.required && <span className="text-red-500"> *</span>}
              </legend>
              <div className="radio-group">
                {component.options?.map((option, index) => (
                  <label key={index} className="radio-option">
                    <input type="radio" name={component.id} disabled />
                    <span className="radio-option__text">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        );
      case "date_picker":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="date"
              disabled
              className="input form-component__preview"
            />
          </div>
        );
      case "file_upload":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <div className="file-upload-preview">
              <div className="file-upload-preview__icon">📎</div>
              <div className="file-upload-preview__text">
                <span>Click to upload or drag and drop</span>
                {component.acceptedFileTypes && (
                  <small>Accepted: {component.acceptedFileTypes}</small>
                )}
              </div>
            </div>
          </div>
        );
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
      case "multi_select":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <div className="multi-select-preview">
              <div className="multi-select-input">
                <span className="multi-select-placeholder">Select multiple options...</span>
                <span className="multi-select-arrow">▼</span>
              </div>
              {component.options && (
                <div className="multi-select-options">
                  {component.options.slice(0, 3).map((option, index) => (
                    <div key={index} className="multi-select-option">
                      <input type="checkbox" disabled className="checkbox__input" />
                      <span>{option}</span>
                    </div>
                  ))}
                  {component.options.length > 3 && (
                    <div className="multi-select-option">
                      <span>+{component.options.length - 3} more options</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "section_divider":
        return (
          <div className="form-field-preview">
            <div className="section-divider-preview">
              <div className="section-divider-header">
                <span className="section-divider-icon">📊</span>
                <h3 className="section-divider-title">{component.label}</h3>
              </div>
              {component.description && (
                <div className="section-divider-description">
                  {component.description}
                </div>
              )}
              <div className="section-divider-line"></div>
            </div>
          </div>
        );
      case "signature":
        return (
          <div className="form-field-preview">
            <label className="label">
              {component.label}
              {component.required && <span className="text-red-500"> *</span>}
            </label>
            <div className="signature-preview">
              <div className="signature-canvas">
                <div className="signature-placeholder">
                  <span className="signature-icon">✍️</span>
                  <span>Click to sign</span>
                </div>
              </div>
              <div className="signature-actions">
                <button type="button" disabled className="btn btn--secondary btn--sm">Clear</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-gray-500">Unknown component type</div>;
    }
  };

  return <div className="mb-3">{renderPreview()}</div>;
};

export default ComponentPreview;