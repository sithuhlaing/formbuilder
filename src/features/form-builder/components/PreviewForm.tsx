/**
 * Preview Form Component - Renders interactive form preview with multi-page support
 */

import React, { useState } from 'react';
import type { FormComponentData } from '../../../types';
import type { FormPage } from '../../../core/FormState';

interface PreviewFormProps {
  templateName: string;
  components?: FormComponentData[];
  pages?: FormPage[];
  onSubmit?: (data: Record<string, any>) => void;
}

export const PreviewForm: React.FC<PreviewFormProps> = ({
  templateName,
  components = [],
  pages = [],
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine if we're using multi-page or single-page mode
  const isMultiPage = pages.length > 0;
  const totalPages = isMultiPage ? pages.length : 1;
  const currentPageComponents = isMultiPage ? pages[currentPageIndex]?.components || [] : components;
  const currentPageTitle = isMultiPage ? pages[currentPageIndex]?.title : '';

  const handleFieldChange = (fieldId: string, value: any) => {
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

  const validateCurrentPage = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    currentPageComponents.forEach(component => {
      const fieldId = component.fieldId || component.id;
      const value = formData[fieldId];
      
      if (component.required && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[fieldId] = `${component.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextPage = () => {
    if (validateCurrentPage() && currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentPage()) {
      return;
    }
    
    console.log('Form submitted with data:', formData);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const renderComponent = (component: FormComponentData) => {
    const fieldId = component.fieldId || component.id;
    const value = formData[fieldId] || '';
    const requiredMark = component.required ? ' *' : '';
    const hasError = errors[fieldId];

    switch (component.type) {
      case 'text_input':
      case 'email_input':
      case 'password_input':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type={component.type === 'email_input' ? 'email' : component.type === 'password_input' ? 'password' : 'text'}
              className={`preview-field__input ${hasError ? 'preview-field__input--error' : ''}`}
              placeholder={component.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'number_input':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type="number"
              className={`preview-field__number ${hasError ? 'preview-field__input--error' : ''}`}
              placeholder={component.placeholder}
              value={value}
              min={component.min}
              max={component.max}
              onChange={(e) => handleFieldChange(fieldId, Number(e.target.value))}
              required={component.required}
            />
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <textarea
              className={`preview-field__textarea ${hasError ? 'preview-field__textarea--error' : ''}`}
              placeholder={component.placeholder}
              value={value}
              rows={component.rows || 4}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'select':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <select
              className={`preview-field__select ${hasError ? 'preview-field__select--error' : ''}`}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            >
              <option value="">Choose an option</option>
              {(component.options || []).map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={index} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'multi_select':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <select
              className={`preview-field__multi-select ${hasError ? 'preview-field__select--error' : ''}`}
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFieldChange(fieldId, selectedOptions);
              }}
              required={component.required}
            >
              {(component.options || []).map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={index} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={component.id} className="preview-field">
            <div className="preview-field__checkbox">
              <input
                type="checkbox"
                id={component.id}
                checked={!!value}
                onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
                required={component.required}
              />
              <label htmlFor={component.id}>
                {component.label}{requiredMark}
              </label>
            </div>
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'radio_group':
        return (
          <div key={component.id} className="preview-field">
            <fieldset className="preview-field__fieldset">
              <legend className="preview-field__label">
                {component.label}{requiredMark}
              </legend>
              <div className="preview-field__radio-group">
                {(component.options || []).map((option, index) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  return (
                    <div key={index} className="preview-field__radio">
                      <input
                        type="radio"
                        id={`${component.id}_${index}`}
                        name={component.id}
                        value={optionValue}
                        checked={value === optionValue}
                        onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                        required={component.required}
                      />
                      <label htmlFor={`${component.id}_${index}`}>
                        {optionLabel}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'date_picker':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type="date"
              className={`preview-field__input ${hasError ? 'preview-field__input--error' : ''}`}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'file_upload':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label">
              {component.label}{requiredMark}
            </label>
            <div className="preview-field__file-upload">
              <input
                type="file"
                accept={component.acceptedFileTypes}
                onChange={(e) => handleFieldChange(fieldId, e.target.files?.[0])}
                required={component.required}
              />
              {component.acceptedFileTypes && (
                <div className="preview-field__file-types">
                  Accepted types: {component.acceptedFileTypes}
                </div>
              )}
              {value && (
                <div className="preview-field__file-selected">
                  Selected: {value.name}
                </div>
              )}
            </div>
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'section_divider':
        return (
          <div key={component.id} className="section-divider-preview">
            <hr />
            {component.label && (
              <h3>{component.label}</h3>
            )}
          </div>
        );

      default:
        return (
          <div key={component.id} className="preview-field">
            <div className="preview-field__error">
              Unknown component type: {component.type}
            </div>
          </div>
        );
    }
  };

  const isLastPage = currentPageIndex === totalPages - 1;
  const isFirstPage = currentPageIndex === 0;

  return (
    <div className="preview-form">
      <div className="preview-form__header">
        <h1 className="preview-form__title">{templateName}</h1>
        {isMultiPage && (
          <div className="preview-form__page-nav">
            <div className="preview-form__page-indicator">
              Page {currentPageIndex + 1} of {totalPages}
            </div>
            {currentPageTitle && (
              <div className="preview-form__page-title">
                <h3>{currentPageTitle}</h3>
              </div>
            )}
          </div>
        )}
      </div>
      
      <form className="preview-form__content" onSubmit={handleSubmit}>
        {currentPageComponents.length === 0 ? (
          <div className="preview-form__empty">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No components found on this page</p>
            </div>
          </div>
        ) : (
          currentPageComponents.map(renderComponent)
        )}
        
        <div className="preview-form__page-controls">
          <div className="preview-form__nav-buttons">
            {isMultiPage && !isFirstPage && (
              <button 
                type="button" 
                className="preview-form__nav-btn preview-form__nav-btn--prev"
                onClick={handlePreviousPage}
              >
                ← Previous
              </button>
            )}
            
            {isMultiPage && !isLastPage ? (
              <button 
                type="button" 
                className="preview-form__nav-btn preview-form__nav-btn--next"
                onClick={handleNextPage}
              >
                Next →
              </button>
            ) : (
              <button type="submit" className="preview-form__submit">
                Submit Form
              </button>
            )}
          </div>
          
          {isMultiPage && (
            <button 
              type="button" 
              className="preview-form__reset"
              onClick={() => {
                setFormData({});
                setErrors({});
                setCurrentPageIndex(0);
              }}
            >
              Reset Form
            </button>
          )}
        </div>
      </form>
      
      <div className="preview-form__note">
        <small className="text-gray-500">
          This is a preview mode. No data will be actually submitted.
        </small>
      </div>
    </div>
  );
};