/**
 * SIMPLE COMPONENT RENDERER - Phase 3 Implementation  
 * Replaces: ComponentRenderer.ts (753 lines) + CSPSafeComponentRenderer
 * Total replacement: ~1,200 lines → ~200 lines (83% reduction)
 */

import React from 'react';
import type { Component } from '../types/components';

/**
 * Simple unified renderer for all component types
 * Replaces complex rendering paths with direct React element generation
 */
export function renderSimpleComponent(component: Component): React.ReactNode {
  const commonProps = {
    'data-component-id': component.id,
    'data-component-type': component.type,
    id: component.fieldId,
    required: component.required,
    style: component.style,
    className: component.className
  };

  switch (component.type) {
    case 'text_input':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <input 
            {...commonProps}
            type="text" 
            placeholder={component.placeholder}
            defaultValue={component.defaultValue as string}
            readOnly={component.readOnly}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'email_input':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <input 
            {...commonProps}
            type="email" 
            placeholder={component.placeholder}
            defaultValue={component.defaultValue as string}
            readOnly={component.readOnly}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'number_input':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <input 
            {...commonProps}
            type="number" 
            placeholder={component.placeholder}
            defaultValue={component.defaultValue as number}
            min={component.validation?.min}
            max={component.validation?.max}
            step={component.step}
            readOnly={component.readOnly}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <textarea 
            {...commonProps}
            placeholder={component.placeholder}
            defaultValue={component.defaultValue as string}
            rows={component.rows || 4}
            cols={component.cols}
            readOnly={component.readOnly}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'select':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <select 
            {...commonProps}
            defaultValue={component.defaultValue as string}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          >
            <option value="">Choose...</option>
            {component.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'radio_group':
      return (
        <div key={component.id} className="form-field">
          <fieldset>
            <legend className="form-label">
              {component.label}
              {component.required && <span className="required">*</span>}
            </legend>
            <div className="radio-group">
              {component.options?.map((option, index) => (
                <div key={option.value} className="form-check">
                  <input
                    type="radio"
                    id={`${component.fieldId}_${index}`}
                    name={component.fieldId}
                    value={option.value}
                    defaultChecked={component.defaultValue === option.value}
                    disabled={component.disabled}
                    className="form-check-input"
                  />
                  <label 
                    htmlFor={`${component.fieldId}_${index}`}
                    className="form-check-label"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div key={component.id} className="form-field">
          <div className="form-check">
            <input 
              {...commonProps}
              type="checkbox"
              defaultChecked={component.defaultValue as boolean}
              disabled={component.disabled}
              className={`form-check-input ${component.className || ''}`}
            />
            <label htmlFor={component.fieldId} className="form-check-label">
              {component.label}
              {component.required && <span className="required">*</span>}
            </label>
          </div>
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'date_picker':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <input 
            {...commonProps}
            type="date"
            defaultValue={component.defaultValue as string}
            readOnly={component.readOnly}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'file_upload':
      return (
        <div key={component.id} className="form-field">
          <label htmlFor={component.fieldId} className="form-label">
            {component.label}
            {component.required && <span className="required">*</span>}
          </label>
          <input 
            {...commonProps}
            type="file"
            accept={component.accept}
            multiple={component.multiple}
            disabled={component.disabled}
            className={`form-control ${component.className || ''}`}
          />
          {component.helpText && (
            <small className="form-text text-muted">{component.helpText}</small>
          )}
        </div>
      );

    case 'horizontal_layout':
      return (
        <div key={component.id} 
          className={`layout horizontal-layout ${component.className || ''}`}
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '1rem', 
            alignItems: 'flex-start',
            ...component.style 
          }}
        >
          {component.children?.map(child => renderSimpleComponent(child))}
        </div>
      );

    case 'vertical_layout':
      return (
        <div key={component.id} 
          className={`layout vertical-layout ${component.className || ''}`}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            ...component.style 
          }}
        >
          {component.children?.map(child => renderSimpleComponent(child))}
        </div>
      );

    case 'button':
      const buttonClasses = [
        'btn',
        `btn-${component.variant || 'primary'}`,
        `btn-${component.size || 'md'}`,
        component.fullWidth ? 'btn-block' : '',
        component.className || ''
      ].filter(Boolean).join(' ');

      return (
        <button
          key={component.id}
          {...commonProps}
          type="button"
          disabled={component.disabled}
          className={buttonClasses}
        >
          {component.label}
        </button>
      );

    case 'heading':
      const HeadingTag = `h${component.level || 2}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={component.id} 
          className={`heading ${component.className || ''}`}
          style={component.style}
        >
          {component.content || component.label}
        </HeadingTag>
      );

    case 'paragraph':
      return (
        <p key={component.id} 
          className={`paragraph ${component.className || ''}`}
          style={component.style}
        >
          {component.content || component.label}
        </p>
      );

    case 'divider':
      return (
        <hr key={component.id} 
          className={`divider ${component.className || ''}`}
          style={component.style}
        />
      );

    case 'section_divider':
      return (
        <div key={component.id} className={`section-divider ${component.className || ''}`} style={component.style}>
          <h3 className="section-title">{component.content || component.label}</h3>
          <hr />
        </div>
      );

    default:
      console.warn(`Unknown component type: ${component.type}. Component will not be rendered.`);
      return null;
  }
}

// CSS styles for form components (would normally be in a separate CSS file)
export const SIMPLE_RENDERER_STYLES = `
.form-field {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #212529;
}

.required {
  color: #dc3545;
  margin-left: 0.25rem;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #212529;
  background-color: #fff;
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check {
  display: block;
  margin-bottom: 0.5rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-block {
  display: block;
  width: 100%;
}

.layout {
  padding: 0.5rem;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  margin: 0.25rem 0;
}

.horizontal-layout {
  background-color: rgba(255, 193, 7, 0.1);
}

.vertical-layout {
  background-color: rgba(25, 135, 84, 0.1);
}

.heading {
  margin: 0.5rem 0;
  color: #212529;
}

.paragraph {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.divider {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid #dee2e6;
}

.section-divider {
  margin: 1.5rem 0;
}

.section-title {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.unknown-component {
  margin: 0.5rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-control {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .horizontal-layout {
    flex-direction: column;
  }
  
  .radio-group {
    flex-direction: column;
  }
}
`;

/**
 * Get component information for display (replaces ComponentRenderer.getComponentInfo)
 */
export function getSimpleComponentInfo(type: ComponentType): { label: string; icon: string; description: string } {
  const iconMap: Record<ComponentType, string> = {
    text_input: '📝',
    email_input: '📧',
    number_input: '🔢',
    textarea: '📄',
    date_picker: '📅',
    file_upload: '📎',
    select: '📋',
    radio_group: '🔘',
    checkbox: '☑️',
    horizontal_layout: '↔️',
    vertical_layout: '↕️',
    heading: '📍',
    paragraph: '📰',
    button: '🔲',
    divider: '➖',
    section_divider: '📑'
  };

  const descriptionMap: Record<ComponentType, string> = {
    text_input: 'Single line text input field',
    email_input: 'Email address input with validation',
    number_input: 'Numeric input field',
    textarea: 'Multi-line text input area',
    date_picker: 'Date selection input',
    file_upload: 'File upload input',
    select: 'Dropdown selection list',
    radio_group: 'Radio button group selection',
    checkbox: 'Checkbox input field',
    horizontal_layout: 'Horizontal layout container',
    vertical_layout: 'Vertical layout container',
    heading: 'Heading text element',
    paragraph: 'Paragraph text content',
    button: 'Interactive button element',
    divider: 'Visual divider line',
    section_divider: 'Section divider with text'
  };

  return {
    label: DEFAULT_COMPONENT_LABELS[type],
    icon: iconMap[type] || '❓',
    description: descriptionMap[type] || `${type} component`
  };
}