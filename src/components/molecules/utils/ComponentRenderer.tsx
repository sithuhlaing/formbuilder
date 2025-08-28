import React from 'react';
import { FormComponentData } from '../../../types';
import RichTextEditor from '../../atoms/forms/RichTextEditor';
import LayoutContainer from '../layout/LayoutContainer';

interface ComponentRendererProps {
  component: FormComponentData;
  [key: string]: any; // Allow other props to be passed down
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, ...props }) => {
  const {
    isInContainer,
    containerPath,
    handleRemoveFromContainer,
    handleMoveToCanvas,
    selectedComponentId,
    onSelectComponent,
    onDropInContainerWithPosition,
    onRearrangeWithinContainer,
    onDropInContainer,
    handleMoveToContainer,
    onUpdateComponent,
    onInsertComponent,
  } = props;

  const baseStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundColor: 'white',
    position: 'relative',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  switch (component.type) {
    case 'text_input':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <input
            type="text"
            placeholder={component.placeholder}
            style={inputStyle}
            disabled
          />
        </div>
      );

    case 'textarea':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <textarea
            placeholder={component.placeholder}
            rows={4}
            style={inputStyle}
            disabled
          />
        </div>
      );

    case 'number_input':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <input
            type="number"
            placeholder={component.placeholder}
            min={component.min}
            max={component.max}
            step={component.step}
            style={inputStyle}
            disabled
          />
        </div>
      );

    case 'select':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <select style={inputStyle} disabled>
            <option>Select an option...</option>
            {component.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );

    case 'multi_select':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <select multiple style={{ ...inputStyle, height: '120px' }} disabled>
            {component.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {component.options?.map((option, index) => (
              <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" disabled />
                {option}
              </label>
            ))}
          </div>
        </div>
      );

    case 'radio_group':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {component.options?.map((option, index) => (
              <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input type="radio" name={component.fieldId} disabled />
                {option}
              </label>
            ))}
          </div>
        </div>
      );

    case 'date_picker':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <input
            type="date"
            style={inputStyle}
            disabled
          />
        </div>
      );

    case 'file_upload':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <input
            type="file"
            accept={component.acceptedFileTypes}
            style={inputStyle}
            disabled
          />
          {component.acceptedFileTypes && (
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Accepted types: {component.acceptedFileTypes}
            </small>
          )}
        </div>
      );

    case 'section_divider':
      return (
        <div style={{ ...baseStyle, padding: '16px 0', borderBottom: '2px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            {component.label}
          </h3>
          {component.description && (
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              {component.description}
            </p>
          )}
        </div>
      );

    case 'rich_text':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label}
          </label>
          <RichTextEditor
            value={component.content || ''}
            onChange={(content) => onUpdateComponent?.(component.id, { content })}
            readOnly={true} // In builder, it's not directly editable
          />
        </div>
      );

    case 'signature':
      return (
        <div style={baseStyle}>
          <label style={labelStyle}>
            {component.label} {component.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ 
            border: '1px dashed #d1d5db', 
            borderRadius: '6px', 
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              Signature area - not editable in preview
            </span>
          </div>
        </div>
      );

    case 'horizontal_layout':
      return (
        <LayoutContainer
          component={component}
          direction="horizontal"
          isInContainer={isInContainer}
          containerPath={containerPath}
          onRemoveFromContainer={handleRemoveFromContainer}
          onMoveToCanvas={handleMoveToCanvas}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onDropInContainerWithPosition={onDropInContainerWithPosition}
          onRearrangeWithinContainer={onRearrangeWithinContainer}
          onDropInContainer={(item, containerId, position) => {
            if (item.type && !item.isFromContainer) {
              if (onDropInContainerWithPosition) {
                onDropInContainerWithPosition(item, containerId, position || 'center');
              } else if (onDropInContainer) {
                onDropInContainer(item, containerId);
              }
            } else if (item.isFromContainer) {
              if (handleMoveToContainer) {
                handleMoveToContainer(item.id, item.containerPath, [...(containerPath || []), containerId], position);
              }
            }
          }}
          onUpdateComponent={(id, updates) => onUpdateComponent?.(id, updates)}
          onInsertComponent={onInsertComponent}
        />
      );

    case 'vertical_layout':
      return (
        <LayoutContainer
          component={component}
          direction="vertical"
          isInContainer={isInContainer}
          containerPath={containerPath}
          onRemoveFromContainer={handleRemoveFromContainer}
          onMoveToCanvas={handleMoveToCanvas}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onDropInContainerWithPosition={onDropInContainerWithPosition}
          onRearrangeWithinContainer={onRearrangeWithinContainer}
          onDropInContainer={(item, containerId, position) => {
            if (item.type && !item.isFromContainer) {
              if (onDropInContainer) {
                onDropInContainer(item, containerId);
              }
            } else if (item.isFromContainer) {
              if (handleMoveToContainer) {
                handleMoveToContainer(item.id, item.containerPath, [...(containerPath || []), containerId], position);
              }
            }
          }}
          onUpdateComponent={(id, updates) => onUpdateComponent?.(id, updates)}
          onInsertComponent={onInsertComponent}
        />
      );

    case 'button':
      return (
        <div style={baseStyle}>
          <button
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled
          >
            {component.label}
          </button>
        </div>
      );

    default:
      return (
        <div style={baseStyle}>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626'
          }}>
            Unknown component type: {component.type}
          </div>
        </div>
      );
  }
};

export default ComponentRenderer;
