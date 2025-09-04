/**
 * SINGLE SOURCE OF TRUTH for ALL component rendering
 * Convergence: All rendering logic in ONE place
 * Business Logic: Exactly what the UI requirements need
 */

import React from 'react';
import type { FormComponentData } from '../types';
import { ValidatedFormField } from '../shared/components/ValidatedFormField';

export class ComponentRenderer {
  
  /**
   * SINGLE method to render ANY component with validation
   * Replaces: Multiple scattered renderer components
   */
  static renderComponent(
    component: FormComponentData,
    mode: 'builder' | 'preview' = 'builder',
    options?: {
      value?: any;
      onChange?: (value: any) => void;
      onValidation?: (fieldId: string, result: any) => void;
      showValidation?: boolean;
    }
  ): React.ReactElement | string {
    
    // If validation is enabled, wrap in ValidatedFormField
    if (options?.showValidation && (mode === 'preview' || mode === 'builder')) {
      return React.createElement(ValidatedFormField, {
        component,
        value: options.value,
        onChange: options.onChange,
        onValidation: options.onValidation,
        children: this.renderComponentElement(component, mode)
      });
    }
    
    // Legacy string rendering for backward compatibility
    if (mode === 'builder') {
      return this.renderBuilderMode(component);
    }
    
    return this.renderPreviewMode(component);
  }

  /**
   * Render component as React element
   */
  static renderComponentElement(
    component: FormComponentData,
    _mode: 'builder' | 'preview' = 'preview'
  ): React.ReactElement {
    const props = {
      key: component.id,
      'data-component-id': component.id,
      'data-component-type': component.type,
      className: `form-field form-field--${component.type}`,
      required: component.required
    };

    switch (component.type) {
      case 'text_input':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            className: 'form-field__input',
            placeholder: component.placeholder || '',
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'email_input':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'email',
            className: 'form-field__input',
            placeholder: component.placeholder || '',
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'textarea':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('textarea', {
            key: 'textarea',
            className: 'form-field__textarea',
            placeholder: component.placeholder || '',
            rows: component.rows || 4,
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'password_input':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'password',
            className: 'form-field__input',
            placeholder: component.placeholder || '',
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'number_input':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'number',
            className: 'form-field__input',
            placeholder: component.placeholder || '',
            min: component.min,
            max: component.max,
            step: component.step,
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'select':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('select', {
            key: 'select',
            className: 'form-field__select',
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          }, [
            React.createElement('option', { key: 'placeholder', value: '' }, 'Choose an option'),
            ...(component.options || []).map((option, idx) => 
              React.createElement('option', { key: idx, value: option.value }, option.label)
            )
          ])
        ]);

      case 'checkbox':
        return React.createElement('div', props, [
          React.createElement('input', {
            key: 'input',
            type: 'checkbox',
            className: 'form-field__checkbox',
            id: component.fieldId,
            name: component.fieldId,
            required: component.required
          }),
          React.createElement('label', {
            key: 'label',
            htmlFor: component.fieldId,
            className: 'form-field__checkbox-label'
          }, component.label + (component.required ? ' *' : ''))
        ]);

      case 'date_picker':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'date',
            className: 'form-field__input',
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'file_upload':
        return React.createElement('div', props, [
          React.createElement('label', { 
            key: 'label', 
            className: 'form-field__label',
            htmlFor: component.fieldId
          }, component.label + (component.required ? ' *' : '')),
          React.createElement('input', {
            key: 'input',
            type: 'file',
            className: 'form-field__file',
            accept: component.acceptedFileTypes,
            multiple: component.multiple,
            required: component.required,
            id: component.fieldId,
            name: component.fieldId
          })
        ]);

      case 'button':
        return React.createElement('button', {
          ...props,
          type: 'button',
          className: 'btn btn--primary'
        }, component.label);

      case 'heading':
        return React.createElement('h2', {
          ...props,
          className: 'form-field__heading'
        }, component.label);

      case 'card':
        return React.createElement('div', {
          ...props,
          className: 'form-card'
        }, [
          React.createElement('div', { key: 'header', className: 'form-card__header' },
            React.createElement('span', { className: 'form-card__label' }, component.label)
          ),
          React.createElement('div', { key: 'content', className: 'form-card__content' },
            (component.children || []).map(child => 
              this.renderComponentElement(child, _mode)
            )
          )
        ]);

      case 'section_divider':
        return React.createElement('div', props, [
          React.createElement('hr', { key: 'divider', className: 'form-field__divider' }),
          component.label ? React.createElement('h3', { 
            key: 'title', 
            className: 'form-field__section-title' 
          }, component.label) : null
        ]);

      default:
        return React.createElement('div', props, 
          React.createElement('span', { className: 'form-field__error' }, 
            `Unknown component type: ${component.type}`
          )
        );
    }
  }

  /**
   * SINGLE method to render form structure
   * Replaces: Multiple form renderers
   */
  static renderForm(
    components: FormComponentData[],
    options: {
      mode: 'builder' | 'preview';
      title?: string;
      showValidation?: boolean;
    } = { mode: 'preview' }
  ): string {
    
    const renderedComponents = components
      .map(component => this.renderComponent(component, options.mode))
      .join('\n');
    
    if (options.mode === 'preview') {
      return `
        <form class="form-preview">
          ${options.title ? `<h2 class="form-title">${options.title}</h2>` : ''}
          ${renderedComponents}
          <div class="form-actions">
            <button type="submit" class="btn btn--primary">Submit</button>
          </div>
        </form>
      `;
    }
    
    return `
      <div class="form-builder-canvas">
        ${renderedComponents || '<div class="canvas-empty-state">No components yet. Add components from the palette.</div>'}
      </div>
    `;
  }

  // Private rendering methods - all in ONE place
  private static renderBuilderMode(component: FormComponentData): string {
    return this.renderComponentContent(component);
  }

  private static renderPreviewMode(component: FormComponentData): string {
    return `
      <div class="form-field" data-component-type="${component.type}">
        ${this.renderComponentContent(component)}
      </div>
    `;
  }

  private static renderComponentContent(component: FormComponentData): string {
    const requiredMark = component.required ? ' *' : '';
    const label = `<label class="form-field__label">${component.label}${requiredMark}</label>`;
    
    switch (component.type) {
      case 'text_input':
        return `
          ${label}
          <input 
            type="text" 
            class="form-field__input" 
            placeholder="${component.placeholder || ''}"
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'email_input':
        return `
          ${label}
          <input 
            type="email" 
            class="form-field__input" 
            placeholder="${component.placeholder || ''}"
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'password_input':
        return `
          ${label}
          <input 
            type="password" 
            class="form-field__input" 
            placeholder="${component.placeholder || ''}"
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'number_input':
        return `
          ${label}
          <input 
            type="number" 
            class="form-field__input" 
            placeholder="${component.placeholder || ''}"
            ${component.min !== undefined ? `min="${component.min}"` : ''}
            ${component.max !== undefined ? `max="${component.max}"` : ''}
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'textarea':
        return `
          ${label}
          <textarea 
            class="form-field__textarea" 
            placeholder="${component.placeholder || ''}"
            rows="${component.rows || 4}"
            ${component.required ? 'required' : ''}
          ></textarea>
        `;
      
      case 'select':
        const selectOptions = (component.options || [])
          .map(option => `<option value="${option}">${option}</option>`)
          .join('');
        
        return `
          ${label}
          <select class="form-field__select" ${component.required ? 'required' : ''}>
            <option value="">Choose an option</option>
            ${selectOptions}
          </select>
        `;
      
      case 'multi_select':
        const multiOptions = (component.options || [])
          .map(option => `<option value="${option}">${option}</option>`)
          .join('');
        
        return `
          ${label}
          <select class="form-field__select" multiple ${component.required ? 'required' : ''}>
            ${multiOptions}
          </select>
        `;
      
      case 'checkbox':
        return `
          <div class="form-field__checkbox-wrapper">
            <input 
              type="checkbox" 
              class="form-field__checkbox" 
              id="${component.id}"
              ${component.required ? 'required' : ''}
            />
            <label for="${component.id}" class="form-field__checkbox-label">
              ${component.label}${requiredMark}
            </label>
          </div>
        `;
      
      case 'radio_group':
        const radioOptions = (component.options || [])
          .map((option, index) => `
            <div class="form-field__radio-item">
              <input 
                type="radio" 
                class="form-field__radio" 
                id="${component.id}_${index}"
                name="${component.id}"
                value="${option}"
                ${component.required ? 'required' : ''}
              />
              <label for="${component.id}_${index}" class="form-field__radio-label">
                ${option}
              </label>
            </div>
          `).join('');
        
        return `
          ${label}
          <div class="form-field__radio-group">
            ${radioOptions}
          </div>
        `;
      
      case 'date_picker':
        return `
          ${label}
          <input 
            type="date" 
            class="form-field__input" 
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'file_upload':
        return `
          ${label}
          <input 
            type="file" 
            class="form-field__file" 
            ${component.acceptedFileTypes ? `accept="${component.acceptedFileTypes}"` : ''}
            ${component.required ? 'required' : ''}
          />
        `;
      
      case 'section_divider':
        return `
          <hr class="form-field__divider" />
          ${component.label ? `<h3 class="form-field__section-title">${component.label}</h3>` : ''}
        `;
      
      case 'signature':
        return `
          ${label}
          <div class="form-field__signature">
            <canvas class="signature-canvas" width="400" height="100"></canvas>
            <button type="button" class="btn btn--secondary btn--sm">Clear Signature</button>
          </div>
        `;
      
      case 'horizontal_layout':
        const horizontalChildren = (component.children || [])
          .map(child => this.renderComponentContent(child))
          .join('');
        
        return `
          <div class="form-layout form-layout--horizontal">
            <div class="form-layout__header">
              <span class="form-layout__label">${component.label}</span>
            </div>
            <div class="form-layout__content">
              ${horizontalChildren}
            </div>
          </div>
        `;
      
      case 'vertical_layout':
        const verticalChildren = (component.children || [])
          .map(child => this.renderComponentContent(child))
          .join('');
        
        return `
          <div class="form-layout form-layout--vertical">
            <div class="form-layout__header">
              <span class="form-layout__label">${component.label}</span>
            </div>
            <div class="form-layout__content">
              ${verticalChildren}
            </div>
          </div>
        `;
      
      case 'button':
        return `
          <button type="button" class="btn btn--primary">
            ${component.label}
          </button>
        `;
      
      case 'heading':
        return `
          <h2 class="form-field__heading">
            ${component.label}
          </h2>
        `;
      
      case 'card':
        const cardChildren = (component.children || [])
          .map(child => this.renderComponentContent(child))
          .join('');
        
        return `
          <div class="form-card">
            <div class="form-card__header">
              <span class="form-card__label">${component.label}</span>
            </div>
            <div class="form-card__content">
              ${cardChildren}
            </div>
          </div>
        `;
      
      default:
        return `
          <div class="form-field__unknown">
            <span class="form-field__error">Unknown component type: ${component.type}</span>
          </div>
        `;
    }
  }

  /**
   * SINGLE method to get component metadata
   * Replaces: scattered component info logic
   */
  static getComponentInfo(type: string) {
    const info: Record<string, { category: string; description: string; label: string; icon: string }> = {
      text_input: { category: 'Input Fields', description: 'Single line text input', label: 'Text Input', icon: '📝' },
      email_input: { category: 'Input Fields', description: 'Email address input', label: 'Email Input', icon: '📧' },
      password_input: { category: 'Input Fields', description: 'Password input field', label: 'Password Input', icon: '🔒' },
      number_input: { category: 'Input Fields', description: 'Numeric input field', label: 'Number Input', icon: '🔢' },
      textarea: { category: 'Input Fields', description: 'Multi-line text input', label: 'Text Area', icon: '📄' },
      rich_text: { category: 'Input Fields', description: 'Rich text editor', label: 'Rich Text', icon: '📝' },
      select: { category: 'Selection', description: 'Dropdown selection', label: 'Select', icon: '⬇️' },
      multi_select: { category: 'Selection', description: 'Multiple selection dropdown', label: 'Multi Select', icon: '☑️' },
      checkbox: { category: 'Selection', description: 'Single checkbox', label: 'Checkbox', icon: '☑️' },
      radio_group: { category: 'Selection', description: 'Radio button group', label: 'Radio Group', icon: '🔘' },
      date_picker: { category: 'Input Fields', description: 'Date selection', label: 'Date Picker', icon: '📅' },
      file_upload: { category: 'Input Fields', description: 'File upload field', label: 'File Upload', icon: '📎' },
      section_divider: { category: 'Layout', description: 'Section separator', label: 'Section Divider', icon: '➖' },
      signature: { category: 'Special', description: 'Digital signature pad', label: 'Signature', icon: '✍️' },
      button: { category: 'Actions', description: 'Clickable button', label: 'Button', icon: '🔘' },
      heading: { category: 'Content', description: 'Text heading', label: 'Heading', icon: '📰' },
      card: { category: 'Layout', description: 'Card container', label: 'Card', icon: '🃏' },
      horizontal_layout: { category: 'Layout', description: 'Horizontal container', label: 'Horizontal Layout', icon: '⬌' },
      vertical_layout: { category: 'Layout', description: 'Vertical container', label: 'Vertical Layout', icon: '⬍' },
    };
    
    return info[type] || { category: 'Unknown', description: 'Unknown component', label: 'Unknown', icon: '❓' };
  }
}