/**
 * Preview Form Component - Renders interactive form preview
 */

import React, { useState } from 'react';
import type { FormComponentData } from '../../../types';

interface PreviewFormProps {
  templateName: string;
  components: FormComponentData[];
  onSubmit?: (data: Record<string, any>) => void;
}

export const PreviewForm: React.FC<PreviewFormProps> = ({
  templateName,
  components,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const renderComponent = (component: FormComponentData) => {
    const fieldId = component.fieldId || component.id;
    const value = formData[fieldId] || '';
    const requiredMark = component.required ? ' *' : '';

    switch (component.type) {
      case 'text_input':
      case 'email_input':
      case 'password_input':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type={component.type === 'email_input' ? 'email' : component.type === 'password_input' ? 'password' : 'text'}
              className="form-field__input"
              placeholder={component.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'number_input':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type="number"
              className="form-field__input"
              placeholder={component.placeholder}
              value={value}
              min={component.min}
              max={component.max}
              onChange={(e) => handleFieldChange(fieldId, Number(e.target.value))}
              required={component.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <textarea
              className="form-field__textarea"
              placeholder={component.placeholder}
              value={value}
              rows={component.rows || 4}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <select
              className="form-field__select"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            >
              <option value="">Choose an option</option>
              {(component.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multi_select':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <select
              className="form-field__select"
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFieldChange(fieldId, selectedOptions);
              }}
              required={component.required}
            >
              {(component.options || []).map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={component.id} className="preview-form__field">
            <div className="form-field__checkbox-wrapper">
              <input
                type="checkbox"
                id={component.id}
                className="form-field__checkbox"
                checked={!!value}
                onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
                required={component.required}
              />
              <label htmlFor={component.id} className="form-field__checkbox-label">
                {component.label}{requiredMark}
              </label>
            </div>
          </div>
        );

      case 'radio_group':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <div className="form-field__radio-group">
              {(component.options || []).map((option, index) => (
                <div key={index} className="form-field__radio-item">
                  <input
                    type="radio"
                    id={`${component.id}_${index}`}
                    name={component.id}
                    value={option}
                    className="form-field__radio"
                    checked={value === option}
                    onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                    required={component.required}
                  />
                  <label htmlFor={`${component.id}_${index}`} className="form-field__radio-label">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'date_picker':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type="date"
              className="form-field__input"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'file_upload':
        return (
          <div key={component.id} className="preview-form__field">
            <label className="form-field__label">
              {component.label}{requiredMark}
            </label>
            <input
              type="file"
              className="form-field__file"
              accept={component.acceptedFileTypes}
              onChange={(e) => handleFieldChange(fieldId, e.target.files?.[0])}
              required={component.required}
            />
          </div>
        );

      case 'section_divider':
        return (
          <div key={component.id} className="preview-form__section">
            <hr className="form-field__divider" />
            {component.label && (
              <h3 className="form-field__section-title">{component.label}</h3>
            )}
          </div>
        );

      default:
        return (
          <div key={component.id} className="preview-form__field">
            <div className="form-field__error">
              Unknown component type: {component.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="preview-form">
      <h1 className="preview-form__title">{templateName}</h1>
      
      <form className="preview-form__form" onSubmit={handleSubmit}>
        {components.length === 0 ? (
          <div className="preview-form__empty">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No components found in this form</p>
            </div>
          </div>
        ) : (
          components.map(renderComponent)
        )}
        
        <div className="preview-form__actions">
          <button type="submit" className="btn btn--primary">
            Submit Form
          </button>
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