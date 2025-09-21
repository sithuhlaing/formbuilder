/**
 * Preview Form Component - Renders interactive form preview with multi-page support
 */

import React, { useState } from 'react';
import type { Component } from '../../../types/components';
import type { FormPage } from '../../../core/FormState';

interface PreviewFormProps {
  templateName: string;
  components?: Component[];
  pages?: FormPage[];
  onSubmit?: (data: Record<string, any>) => void;
}

export const PreviewForm: React.FC<PreviewFormProps> = ({
  templateName: _templateName,
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
  const _currentPageTitle = isMultiPage ? pages[currentPageIndex]?.title : '';

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

  const renderComponent = (component: Component) => {
    const fieldId = component.fieldId || component.id;
    const value = formData[fieldId] || '';
    const requiredMark = component.required ? ' *' : '';
    const hasError = errors[fieldId];

    switch (component.type) {
      case 'text_input':
      case 'email_input':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label" htmlFor={fieldId}>
              {component.label}{requiredMark}
            </label>
            <input
              id={fieldId}
              type={component.type === 'email_input' ? 'email' : 'text'}
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
            <label className="preview-field__label" htmlFor={fieldId}>
              {component.label}{requiredMark}
            </label>
            <input
              id={fieldId}
              type="number"
              className={`preview-field__number ${hasError ? 'preview-field__input--error' : ''}`}
              placeholder={component.placeholder}
              value={value}
              min={component.validation?.min}
              max={component.validation?.max}
              onChange={(e) => handleFieldChange(fieldId, Number(e.target.value))}
              required={component.required}
            />
            {hasError && <div className="preview-field__error">{hasError}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div key={component.id} className="preview-field">
            <label className="preview-field__label" htmlFor={fieldId}>
              {component.label}{requiredMark}
            </label>
            <textarea
              id={fieldId}
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
            <label className="preview-field__label" htmlFor={fieldId}>
              {component.label}{requiredMark}
            </label>
            <select
              id={fieldId}
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
                accept={component.accept}
                onChange={(e) => handleFieldChange(fieldId, e.target.files?.[0])}
                required={component.required}
              />
              {component.accept && (
                <div className="preview-field__file-types">
                  Accepted types: {component.accept}
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

      case 'heading':
        const level = component.level || 2;
        const content = component.content || component.label;
        switch (level) {
          case 1:
            return <h1 key={component.id} className="preview-heading">{content}</h1>;
          case 2:
            return <h2 key={component.id} className="preview-heading">{content}</h2>;
          case 3:
            return <h3 key={component.id} className="preview-heading">{content}</h3>;
          case 4:
            return <h4 key={component.id} className="preview-heading">{content}</h4>;
          case 5:
            return <h5 key={component.id} className="preview-heading">{content}</h5>;
          case 6:
            return <h6 key={component.id} className="preview-heading">{content}</h6>;
          default:
            return <h2 key={component.id} className="preview-heading">{content}</h2>;
        }

      case 'paragraph':
        return (
          <p key={component.id} className="preview-paragraph">
            {component.content || component.label}
          </p>
        );

      case 'button':
        return (
          <button 
            key={component.id} 
            type="button" 
            className="preview-button"
            disabled={component.disabled}
            onClick={() => console.log('Button clicked:', component.label)}
          >
            {component.label}
          </button>
        );

      case 'divider':
        return (
          <hr key={component.id} className="preview-divider" />
        );

      case 'horizontal_layout':
        return (
          <div key={component.id} className="preview-horizontal-layout" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {component.children?.map(child => renderComponent(child))}
          </div>
        );

      case 'vertical_layout':
        return (
          <div key={component.id} className="preview-vertical-layout" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {component.children?.map(child => renderComponent(child))}
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
      
      <form className="preview-form__content" onSubmit={handleSubmit}>
        {currentPageComponents.length === 0 ? (
          <div className="preview-form__empty">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No components found on this page</p>
            </div>
          </div>
        ) : (
          currentPageComponents.map((component) => (
            <React.Fragment key={component.id || component.fieldId}>
              {renderComponent(component)}
            </React.Fragment>
          ))
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