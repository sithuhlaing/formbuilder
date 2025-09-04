/**
 * CSP-Safe Component Renderer for PWA
 * Replaces dangerouslySetInnerHTML with React components
 */

import React from 'react';
import { RichTextEditor } from '../../../shared/components/RichTextEditor';
import { SignatureCanvas } from '../../../shared/components/SignatureCanvas';
import { ValidatedFormField } from '../../../shared/components/ValidatedFormField';
import type { CanvasItem, RenderContext } from '../types';
import type { FormComponentData } from '../../../types/component';


interface CSPSafeRendererProps {
  item: CanvasItem;
  context: RenderContext;
  readOnly?: boolean;
}

// PWA-safe form component renderers with validation support
const FormComponents = {
  text_input: ({ component, readOnly, showValidation, value, onChange, onValidation }: { 
    component: FormComponentData; 
    readOnly?: boolean;
    showValidation?: boolean;
    value?: any;
    onChange?: (value: any) => void;
    onValidation?: (fieldId: string, result: any) => void;
  }) => {
    const baseComponent = (
      <div className="form-field">
        <label className="form-field__label">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </label>
        <input
          type="text"
          className="form-field__input"
          placeholder={component.placeholder || 'Enter text'}
          readOnly={readOnly}
          disabled={readOnly}
          aria-label={component.label}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );

    if (showValidation && !readOnly) {
      return (
        <ValidatedFormField
          component={component}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
        >
          {baseComponent}
        </ValidatedFormField>
      );
    }

    return baseComponent;
  },

  email_input: ({ component, readOnly, showValidation, value, onChange, onValidation }: { 
    component: FormComponentData; 
    readOnly?: boolean;
    showValidation?: boolean;
    value?: any;
    onChange?: (value: any) => void;
    onValidation?: (fieldId: string, result: any) => void;
  }) => {
    const baseComponent = (
      <div className="form-field">
        <label className="form-field__label">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </label>
        <input
          type="email"
          className="form-field__input"
          placeholder={component.placeholder || 'Enter email'}
          readOnly={readOnly}
          disabled={readOnly}
          aria-label={component.label}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );

    if (showValidation && !readOnly) {
      return (
        <ValidatedFormField
          component={component}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
        >
          {baseComponent}
        </ValidatedFormField>
      );
    }

    return baseComponent;
  },

  password_input: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <input
        type="password"
        className="form-field__input"
        placeholder={component.placeholder || 'Enter password'}
        readOnly={readOnly}
        disabled={readOnly}
        aria-label={component.label}
      />
    </div>
  ),

  number_input: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <input
        type="number"
        className="form-field__input"
        placeholder={component.placeholder || 'Enter number'}
        readOnly={readOnly}
        disabled={readOnly}
        aria-label={component.label}
      />
    </div>
  ),

  date_picker: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <input
        type="date"
        className="form-field__input"
        readOnly={readOnly}
        disabled={readOnly}
        aria-label={component.label}
      />
    </div>
  ),

  file_upload: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <input
        type="file"
        className="form-field__file"
        disabled={readOnly}
        aria-label={component.label}
      />
    </div>
  ),

  textarea: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <textarea
        className="form-field__textarea"
        placeholder={component.placeholder || 'Enter text'}
        readOnly={readOnly}
        disabled={readOnly}
        rows={4}
        aria-label={component.label}
      />
    </div>
  ),

  select: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <select
        className="form-field__select"
        disabled={readOnly}
        aria-label={component.label}
      >
        <option value="">Select an option</option>
        {component.options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),

  multi_select: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <select
        className="form-field__select"
        multiple
        disabled={readOnly}
        aria-label={component.label}
      >
        {component.options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),

  checkbox: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <div className="form-field__checkbox-wrapper">
        <input
          type="checkbox"
          className="form-field__checkbox"
          id={component.id}
          disabled={readOnly}
        />
        <label htmlFor={component.id} className="form-field__checkbox-label">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </label>
      </div>
    </div>
  ),

  radio_group: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <fieldset className="form-field__fieldset">
        <legend className="form-field__legend">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </legend>
        <div className="form-field__radio-group">
          {component.options?.map((option, index) => (
            <label key={index} className="form-field__radio-label">
              <input
                type="radio"
                name={component.id}
                value={option.value}
                className="form-field__radio"
                disabled={readOnly}
              />
              <span className="form-field__radio-text">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  ),

  signature: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => {
    return (
      <div className="form-field">
        <label className="form-field__label">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </label>
        <SignatureCanvas
          value={typeof component.defaultValue === 'string' ? component.defaultValue : ''}
          width={component.width ? parseInt(component.width) : 400}
          height={component.height ? parseInt(component.height) : 150}
          readOnly={readOnly}
          placeholder={component.placeholder || 'Sign here'}
        />
      </div>
    );
  },

  rich_text: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <RichTextEditor
        value={typeof component.defaultValue === 'string' ? component.defaultValue : ''}
        placeholder={typeof component.placeholder === 'string' ? component.placeholder : 'Enter rich text content...'}
        readOnly={readOnly}
        height={component.height || '200px'}
        className="form-field__rich-text"
      />
    </div>
  ),

  checkbox_group: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <fieldset className="form-field__fieldset">
        <legend className="form-field__legend">
          {component.label}
          {component.required && <span className="form-field__required">*</span>}
        </legend>
        <div className="form-field__checkbox-group">
          {component.options?.map((option, index) => (
            <label key={index} className="form-field__checkbox-label">
              <input
                type="checkbox"
                value={option.value}
                className="form-field__checkbox"
                disabled={readOnly}
              />
              <span className="form-field__checkbox-text">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  ),

  button: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <button
        type="button"
        className="btn btn--primary"
        disabled={readOnly}
        aria-label={component.label}
      >
        {component.label}
      </button>
    </div>
  ),

  heading: ({ component }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <h2 className="form-field__heading">{component.label}</h2>
    </div>
  ),

  card: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <div className="form-field__card">
        <div className="form-field__card-header">
          <h3 className="form-field__card-title">{component.label}</h3>
        </div>
        <div className="form-field__card-content">
          {component.children?.map((child) => {
            const ChildComponent = FormComponents[child.type as keyof typeof FormComponents];
            return ChildComponent ? (
              <ChildComponent key={child.id} component={child} readOnly={readOnly} />
            ) : (
              <div key={child.id}>Unsupported component: {child.type}</div>
            );
          })}
        </div>
      </div>
    </div>
  ),

  horizontal_layout: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <div className="form-field__horizontal-layout" data-testid="row-layout" style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        {component.children?.map((child) => {
          const ChildComponent = FormComponents[child.type as keyof typeof FormComponents];
          return (
            <div key={child.id} className="form-field__horizontal-item" style={{ flex: 1 }}>
              {ChildComponent ? (
                <ChildComponent component={child} readOnly={readOnly} />
              ) : (
                <div>Unsupported component: {child.type}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ),

  vertical_layout: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <div className="form-field__vertical-layout" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {component.children?.map((child) => {
          const ChildComponent = FormComponents[child.type as keyof typeof FormComponents];
          return (
            <div key={child.id} className="form-field__vertical-item">
              {ChildComponent ? (
                <ChildComponent component={child} readOnly={readOnly} />
              ) : (
                <div>Unsupported component: {child.type}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ),

  section_divider: ({ component }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <div className="form-field__section-divider" style={{ 
        margin: '24px 0',
        padding: '12px 0',
        borderBottom: '2px solid #e5e7eb',
        textAlign: 'center'
      }}>
        {component.label && (
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {component.label}
          </h3>
        )}
        {component.placeholder && (
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            {component.placeholder}
          </p>
        )}
      </div>
    </div>
  ),
};

// Main CSP-safe renderer component
export const CSPSafeComponentRenderer: React.FC<CSPSafeRendererProps> = ({ 
  item, 
  context, 
  readOnly = false 
}) => {
  const component = item.data as unknown as FormComponentData;
  
  // Get the appropriate renderer
  const ComponentRenderer = FormComponents[component.type as keyof typeof FormComponents];
  
  if (!ComponentRenderer) {
    return (
      <div className="form-field form-field--unknown">
        <span className="form-field__error">
          Unknown component type: {component.type}
        </span>
      </div>
    );
  }

  // Enable validation in preview mode for form fields
  const showValidation = context.mode === 'preview' && !readOnly;
  
  const renderedComponent = ComponentRenderer({ 
    component, 
    readOnly,
    showValidation,
    value: undefined, // Will be managed by form state
    onChange: undefined, // Will be managed by form state
    onValidation: undefined // Will be managed by form state
  });

  // In builder mode, wrap with selection and editing controls
  if (context.mode === 'builder') {
    return (
      <div 
        className={`canvas-component ${context.selectedId === component.id ? 'canvas-component--selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          context.onSelect?.(component.id);
        }}
        data-component-id={component.id}
        data-testid={`component-${component.type}`}
      >
        {/* Component content */}
        <div className="canvas-component__content">
          {renderedComponent}
        </div>
        
        {/* Builder controls */}
        {context.selectedId === component.id && (
          <div className="canvas-component__controls">
            <button
              className="canvas-component__delete"
              onClick={(e) => {
                e.stopPropagation();
                context.onDelete?.(component.id);
              }}
              aria-label="Delete component"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  // Preview mode - just return the component
  return <div className="canvas-component">{renderedComponent}</div>;
};

// PWA-optimized form canvas adapter using CSP-safe rendering
export const PWAFormCanvasAdapter: React.FC<{
  items: CanvasItem[];
  onItemMove: (fromIndex: number, toIndex: number) => void;
  onLayoutCreate: (itemType: string, targetId: string, position: 'left' | 'right') => void;
  onItemDelete: (itemId: string) => void;
  onItemAdd?: (itemType: string, position: any) => void;
  selectedItemId?: string;
  className?: string;
  pwaConfig?: {
    touchOptimized?: boolean;
    reducedMotion?: boolean;
    offlineMode?: boolean;
  };
  onOfflineStateChange?: (isOffline: boolean) => void;
}> = (props) => {
  // Import PWADragDropCanvas dynamically to avoid circular dependencies
  const PWADragDropCanvas = React.lazy(() => 
    import('./PWAOptimizedCanvas').then(module => ({ default: module.PWADragDropCanvas }))
  );

  const renderFormComponent = React.useCallback((item: CanvasItem, context: RenderContext) => {
    return (
      <CSPSafeComponentRenderer
        item={item}
        context={context}
        readOnly={true}
      />
    );
  }, []);

  return (
    <React.Suspense fallback={<div>Loading canvas...</div>}>
      <PWADragDropCanvas
        {...props}
        renderItem={renderFormComponent}
        config={{
          cssPrefix: 'form-canvas',
          enableHorizontalLayouts: true,
          enableVerticalLayouts: true,
        }}
      />
    </React.Suspense>
  );
};
