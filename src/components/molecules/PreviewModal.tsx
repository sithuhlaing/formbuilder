import React, { useState } from 'react';
import type { FormComponentData, FormPage } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components: FormComponentData[];
  pages?: FormPage[];
  showNotification?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components,
  pages = [],
  showNotification,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when modal is closed
  const handleClose = () => {
    setCurrentPageIndex(0);
    setFormData({});
    setErrors({});
    onClose();
  };
  
  if (!isOpen) return null;

  // Use pages if available, otherwise create single page from components
  const previewPages = pages.length > 0 ? pages : [{ id: '1', title: 'Page 1', components }];
  const totalPages = previewPages.length;
  const currentPage = previewPages[currentPageIndex] || previewPages[0];

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPageIndex(index);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateCurrentPage = () => {
    const currentPageErrors: Record<string, string> = {};
    let isValid = true;
    
    currentPage.components.forEach(component => {
      const fieldId = component.fieldId || component.id;
      const value = formData[fieldId];
      
      // Check required fields
      if (component.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || value.toString().trim() === '') {
          currentPageErrors[fieldId] = `${component.label} is required`;
          isValid = false;
        }
      }
      
      // Check validation rules
      if (value && component.validation && component.validation !== 'none') {
        switch (component.validation) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              currentPageErrors[fieldId] = 'Please enter a valid email address';
              isValid = false;
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              currentPageErrors[fieldId] = 'Please enter a valid number';
              isValid = false;
            }
            break;
          case 'custom':
            if (component.customValidation) {
              try {
                const regex = new RegExp(component.customValidation);
                if (!regex.test(value)) {
                  currentPageErrors[fieldId] = 'Input does not match required format';
                  isValid = false;
                }
              } catch (e) {
                // Invalid regex, skip validation
              }
            }
            break;
        }
      }
    });
    
    setErrors(prev => ({ ...prev, ...currentPageErrors }));
    return isValid;
  };

  const handleNextPage = () => {
    if (validateCurrentPage()) {
      goToNextPage();
    }
  };

  const handleSubmitForm = () => {
    if (validateCurrentPage()) {
      console.log('Form submitted with data:', formData);
      
      if (showNotification) {
        showNotification(
          'Form Submitted Successfully!',
          `Your form "${templateName}" has been submitted successfully.\n\nSubmitted data:\n${JSON.stringify(formData, null, 2)}`,
          'success'
        );
      } else {
        // Fallback to alert for backward compatibility
        alert(`Form submitted successfully!\n\nSubmitted data:\n${JSON.stringify(formData, null, 2)}`);
      }
      
      setFormData({});
      setCurrentPageIndex(0);
      onClose();
    }
  };

  const renderFormField = (component: FormComponentData) => {
    const fieldId = component.fieldId || component.id;
    const fieldValue = formData[fieldId] || '';
    const fieldError = errors[fieldId];

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
              className={`preview-field__input ${fieldError ? 'preview-field__input--error' : ''}`}
              placeholder={component.placeholder || ''}
              value={fieldValue}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
            />
            {fieldError && (
              <div className="preview-field__error">{fieldError}</div>
            )}
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
              className={`preview-field__textarea ${fieldError ? 'preview-field__textarea--error' : ''}`}
              placeholder={component.placeholder || ''}
              rows={4}
              value={fieldValue}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
            />
            {fieldError && (
              <div className="preview-field__error">{fieldError}</div>
            )}
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
            <select 
              className={`preview-field__select ${fieldError ? 'preview-field__select--error' : ''}`}
              value={fieldValue}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
            >
              <option value="">Choose an option</option>
              {(component.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError && (
              <div className="preview-field__error">{fieldError}</div>
            )}
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
                {(component.options || []).map((option, index) => {
                  const checkboxValues = Array.isArray(fieldValue) ? fieldValue : [];
                  const isChecked = checkboxValues.includes(option);
                  
                  return (
                    <label key={index} className="preview-field__checkbox">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => {
                          const currentValues = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
                          let newValues;
                          
                          if (e.target.checked) {
                            newValues = [...currentValues, option];
                          } else {
                            newValues = currentValues.filter((val: string) => val !== option);
                          }
                          
                          handleInputChange(fieldId, newValues);
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {fieldError && (
                <div className="preview-field__error">{fieldError}</div>
              )}
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
                    <input 
                      type="radio" 
                      name={fieldId}
                      value={option}
                      checked={fieldValue === option}
                      onChange={(e) => handleInputChange(fieldId, e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {fieldError && (
                <div className="preview-field__error">{fieldError}</div>
              )}
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
            <input 
              type="date" 
              className={`preview-field__input ${fieldError ? 'preview-field__input--error' : ''}`}
              value={fieldValue}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
            />
            {fieldError && (
              <div className="preview-field__error">{fieldError}</div>
            )}
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
              <input 
                type="file" 
                accept={component.acceptedFileTypes}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleInputChange(fieldId, files[0].name);
                  } else {
                    handleInputChange(fieldId, '');
                  }
                }}
              />
              {fieldValue && (
                <div className="preview-field__file-selected">
                  Selected: {fieldValue}
                </div>
              )}
              {fieldError && (
                <div className="preview-field__error">{fieldError}</div>
              )}
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{templateName || 'Untitled Form'}</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="preview-form">
            
            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="preview-form__page-nav">
                <div className="page-progress">
                  <div className="page-progress__bar">
                    <div 
                      className="page-progress__fill" 
                      style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
                    />
                  </div>
                  <div className="page-progress__text">
                    Page {currentPageIndex + 1} of {totalPages}
                  </div>
                </div>
              </div>
            )}

            {/* Page Title */}
            {totalPages > 1 && (
              <div className="preview-form__page-title">
                <h3>{currentPage.title}</h3>
              </div>
            )}
            
            <form className="preview-form__content" onSubmit={(e) => e.preventDefault()}>
              {currentPage.components.length === 0 ? (
                <div className="preview-form__empty">
                  <p>No form fields on this page. Add components to see the preview.</p>
                </div>
              ) : (
                currentPage.components.map(renderFormField)
              )}
            </form>

            {/* Navigation Controls */}
            <div className="preview-form__actions">
              {totalPages > 1 && (
                <div className="preview-form__page-controls">
                  <button 
                    type="button" 
                    onClick={goToPrevPage}
                    disabled={currentPageIndex === 0}
                    className="btn btn--secondary"
                  >
                    ← Previous
                  </button>
                  
                  <div className="page-indicators">
                    {previewPages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`page-dot ${index === currentPageIndex ? 'page-dot--active' : ''}`}
                        title={`Go to ${previewPages[index].title}`}
                      />
                    ))}
                  </div>
                  
                  {currentPageIndex < totalPages - 1 ? (
                    <button 
                      type="button" 
                      onClick={handleNextPage}
                      className="btn btn--primary"
                    >
                      Next →
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSubmitForm}
                      className="btn btn--primary"
                    >
                      Submit Form
                    </button>
                  )}
                </div>
              )}
              
              {totalPages === 1 && currentPage.components.length > 0 && (
                <div>
                  <button 
                    type="button" 
                    onClick={handleSubmitForm}
                    className="preview-form__submit"
                  >
                    Submit Form
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({});
                      setErrors({});
                    }}
                    className="preview-form__reset"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;