import React from 'react';
import type { FormComponentData } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components: FormComponentData[];
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components,
}) => {
  if (!isOpen) return null;

  const renderFormField = (component: FormComponentData) => {
    switch (component.type) {
      case 'text_input':
        return (
          <div className="preview-field" key={component.id}>
            <label className="preview-field__label">
              {component.label}
              {component.required && <span className="preview-field__required">*</span>}
            </label>
            <input
              type="text"
              className="preview-field__input"
              placeholder={component.placeholder || ''}
            />
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="preview-field" key={component.id}>
            <label className="preview-field__label">
              {component.label}
              {component.required && <span className="preview-field__required">*</span>}
            </label>
            <textarea
              className="preview-field__textarea"
              placeholder={component.placeholder || ''}
              rows={4}
            />
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="preview-field" key={component.id}>
            <label className="preview-field__label">
              {component.label}
              {component.required && <span className="preview-field__required">*</span>}
            </label>
            <select className="preview-field__select">
              <option value="">Choose an option</option>
              {(component.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="preview-field" key={component.id}>
            <fieldset className="preview-field__fieldset">
              <legend className="preview-field__label">
                {component.label}
                {component.required && <span className="preview-field__required">*</span>}
              </legend>
              <div className="preview-field__checkbox-group">
                {(component.options || []).map((option, index) => (
                  <label key={index} className="preview-field__checkbox">
                    <input type="checkbox" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'radio_group':
        return (
          <div className="preview-field" key={component.id}>
            <fieldset className="preview-field__fieldset">
              <legend className="preview-field__label">
                {component.label}
                {component.required && <span className="preview-field__required">*</span>}
              </legend>
              <div className="preview-field__radio-group">
                {(component.options || []).map((option, index) => (
                  <label key={index} className="preview-field__radio">
                    <input type="radio" name={component.id} value={option} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'date_picker':
        return (
          <div className="preview-field" key={component.id}>
            <label className="preview-field__label">
              {component.label}
              {component.required && <span className="preview-field__required">*</span>}
            </label>
            <input type="date" className="preview-field__input" />
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'file_upload':
        return (
          <div className="preview-field" key={component.id}>
            <label className="preview-field__label">
              {component.label}
              {component.required && <span className="preview-field__required">*</span>}
            </label>
            <div className="preview-field__file-upload">
              <input type="file" accept={component.acceptedFileTypes} />
              {component.acceptedFileTypes && (
                <div className="preview-field__file-types">
                  Accepted: {component.acceptedFileTypes}
                </div>
              )}
            </div>
            {component.helpText && (
              <div className="preview-field__help">{component.helpText}</div>
            )}
          </div>
        );

      case 'horizontal_container':
        return (
          <div key={component.id} className="preview-container horizontal-layout grid-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: component.layout?.gap === 'none' ? '0' : 
                   component.layout?.gap === 'small' ? 'var(--space-2)' :
                   component.layout?.gap === 'large' ? 'var(--space-6)' : 'var(--space-4)',
              alignItems: component.layout?.alignment === 'center' ? 'center' :
                         component.layout?.alignment === 'end' ? 'flex-end' :
                         component.layout?.alignment === 'stretch' ? 'stretch' : 'flex-start',
              flexWrap: 'nowrap'
            }}
          >
            {(component.children || []).map(child => (
              <div key={child.id} className="grid-column" style={{ 
                width: child.layout?.width || `${(100 / (component.children?.length || 1)).toFixed(2)}%`,
                minWidth: '100px',
                flexShrink: 0,
                boxSizing: 'border-box'
              }}>
                {renderFormField(child)}
              </div>
            ))}
          </div>
        );

      case 'vertical_container':
        return (
          <div key={component.id} className="preview-container vertical-layout"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: component.layout?.gap === 'none' ? '0' : 
                   component.layout?.gap === 'small' ? 'var(--space-2)' :
                   component.layout?.gap === 'large' ? 'var(--space-6)' : 'var(--space-4)',
              alignItems: component.layout?.alignment === 'center' ? 'center' :
                         component.layout?.alignment === 'end' ? 'flex-end' :
                         component.layout?.alignment === 'stretch' ? 'stretch' : 'flex-start'
            }}
          >
            {(component.children || []).map(child => (
              <div key={child.id} style={{ 
                width: child.layout?.width || 'auto'
              }}>
                {renderFormField(child)}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{templateName || 'Untitled Form'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="preview-form">
            
            <form className="preview-form__content" onSubmit={(e) => e.preventDefault()}>
              {components.length === 0 ? (
                <div className="preview-form__empty">
                  <p>No form fields to display. Add components to see the preview.</p>
                </div>
              ) : (
                components.map(renderFormField)
              )}
              
              {components.length > 0 && (
                <div className="preview-form__actions">
                  <button type="submit" className="preview-form__submit">
                    Submit Form
                  </button>
                  <button type="reset" className="preview-form__reset">
                    Reset
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;