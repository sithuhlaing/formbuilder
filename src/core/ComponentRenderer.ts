/**
 * SINGLE SOURCE OF TRUTH for ALL component rendering
 * Convergence: All rendering logic in ONE place
 * Business Logic: Exactly what the UI requirements need
 */

import type { FormComponentData } from '../types';

export class ComponentRenderer {
  
  /**
   * SINGLE method to render ANY component
   * Replaces: Multiple scattered renderer components
   */
  static renderComponent(
    component: FormComponentData,
    mode: 'builder' | 'preview' = 'builder'
  ): string {
    
    // Builder mode: Show component with editing controls
    if (mode === 'builder') {
      return this.renderBuilderMode(component);
    }
    
    // Preview mode: Show actual form field
    return this.renderPreviewMode(component);
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
    const dragHandle = '⋮⋮';
    const deleteButton = '×';
    
    return `
      <div class="form-component smart-drop-zone" data-component-id="${component.id}">
        <div class="form-component__hover-controls">
          <button class="form-component__hover-action form-component__hover-action--drag" title="Drag to reorder">
            ${dragHandle}
          </button>
          <button class="form-component__hover-action form-component__hover-action--delete" title="Delete component">
            ${deleteButton}
          </button>
        </div>
        <div class="form-component__content">
          ${this.renderComponentContent(component)}
        </div>
      </div>
    `;
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
    const info: Record<string, { category: string; description: string; icon: string }> = {
      text_input: { category: 'Input Fields', description: 'Single line text input', icon: '📝' },
      email_input: { category: 'Input Fields', description: 'Email address input', icon: '📧' },
      password_input: { category: 'Input Fields', description: 'Password input field', icon: '🔒' },
      number_input: { category: 'Input Fields', description: 'Numeric input field', icon: '🔢' },
      textarea: { category: 'Input Fields', description: 'Multi-line text input', icon: '📄' },
      select: { category: 'Selection', description: 'Dropdown selection', icon: '⬇️' },
      multi_select: { category: 'Selection', description: 'Multiple selection dropdown', icon: '☑️' },
      checkbox: { category: 'Selection', description: 'Single checkbox', icon: '☑️' },
      radio_group: { category: 'Selection', description: 'Radio button group', icon: '🔘' },
      date_picker: { category: 'Input Fields', description: 'Date selection', icon: '📅' },
      file_upload: { category: 'Input Fields', description: 'File upload field', icon: '📎' },
      section_divider: { category: 'Layout', description: 'Section separator', icon: '➖' },
      signature: { category: 'Special', description: 'Digital signature pad', icon: '✍️' },
      horizontal_layout: { category: 'Layout', description: 'Horizontal container', icon: '⬌' },
      vertical_layout: { category: 'Layout', description: 'Vertical container', icon: '⬍' },
    };
    
    return info[type] || { category: 'Unknown', description: 'Unknown component', icon: '❓' };
  }
}