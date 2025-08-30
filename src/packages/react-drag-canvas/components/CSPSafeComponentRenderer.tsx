/**
 * CSP-Safe Component Renderer for PWA
 * Replaces dangerouslySetInnerHTML with React components
 */

import React from 'react';
import { RichTextEditor } from '../../../shared/components/RichTextEditor';
import type { CanvasItem, RenderContext } from '../types';

interface FormComponentData {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  children?: FormComponentData[];
  defaultValue?: string;
  height?: string;
}

interface CSPSafeRendererProps {
  item: CanvasItem;
  context: RenderContext;
  readOnly?: boolean;
}

// PWA-safe form component renderers
const FormComponents = {
  text_input: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
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
      />
    </div>
  ),

  email_input: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
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
      />
    </div>
  ),

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

  signature: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <div className="form-field__signature">
        <canvas 
          className="signature-canvas" 
          width="400" 
          height="100"
          style={{ border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          type="button" 
          className="btn btn--secondary btn--sm"
          disabled={readOnly}
        >
          Clear Signature
        </button>
      </div>
    </div>
  ),

  rich_text: ({ component, readOnly }: { component: FormComponentData; readOnly?: boolean }) => (
    <div className="form-field">
      <label className="form-field__label">
        {component.label}
        {component.required && <span className="form-field__required">*</span>}
      </label>
      <RichTextEditor
        value={component.defaultValue || ''}
        placeholder={component.placeholder || 'Enter rich text content...'}
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
          {component.children?.map((child, index) => {
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
      <div className="form-field__horizontal-layout">
        {component.children?.map((child, index) => {
          const ChildComponent = FormComponents[child.type as keyof typeof FormComponents];
          return (
            <div key={child.id} className="form-field__horizontal-item">
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
};

// Main CSP-safe renderer component
export const CSPSafeComponentRenderer: React.FC<CSPSafeRendererProps> = ({
  item,
  readOnly = true
}) => {
  const component = item.data as FormComponentData;
  const ComponentRenderer = FormComponents[component.type as keyof typeof FormComponents];

  if (!ComponentRenderer) {
    return (
      <div className="form-field form-field--error">
        <div className="form-field__error">
          Unsupported component type: {component.type}
        </div>
      </div>
    );
  }

  // Render component directly without extra wrapper
  return <ComponentRenderer component={component} readOnly={readOnly} />;
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
