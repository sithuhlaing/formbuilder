
import React from 'react';
import type { FormComponentData } from '../../types';
import RichTextField from './RichTextField';

interface FormFieldProps {
  component: FormComponentData;
  value: any;
  onChange: (value: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ component, value, onChange }) => {
  const fieldId = component.fieldId || component.id;

  const renderLabel = () => (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {component.label}
      {component.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  switch (component.type) {
    case 'text_input':
      return (
        <div className="mb-4">
          {renderLabel()}
          <input
            type="text"
            className={baseInputClasses}
            placeholder={component.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={component.required}
          />
        </div>
      );

    case 'number_input':
      return (
        <div className="mb-4">
          {renderLabel()}
          <input
            type="number"
            className={baseInputClasses}
            placeholder={component.placeholder}
            value={value || ''}
            min={component.min}
            max={component.max}
            step={component.step}
            onChange={(e) => onChange(e.target.value)}
            required={component.required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="mb-4">
          {renderLabel()}
          <textarea
            className={baseInputClasses}
            placeholder={component.placeholder}
            value={value || ''}
            rows={4}
            onChange={(e) => onChange(e.target.value)}
            required={component.required}
          />
        </div>
      );

    case 'rich_text':
      return (
        <div className="mb-4">
          <RichTextField
            value={value || ''}
            onChange={onChange}
            label={component.label}
            placeholder={component.placeholder || 'Enter rich text...'}
            required={component.required}
            height={component.height || '200px'}
          />
        </div>
      );

    case 'select':
      return (
        <div className="mb-4">
          {renderLabel()}
          <select
            className={baseInputClasses}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={component.required}
          >
            <option value="">Select an option</option>
            {component.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );

    case 'date_picker':
      return (
        <div className="mb-4">
          {renderLabel()}
          <input
            type="date"
            className={baseInputClasses}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={component.required}
          />
        </div>
      );

    case 'file_upload':
      return (
        <div className="mb-4">
          {renderLabel()}
          <input
            type="file"
            className={baseInputClasses}
            accept={component.acceptedFileTypes}
            onChange={(e) => onChange(e.target.files?.[0])}
            required={component.required}
          />
        </div>
      );

    case 'section_divider':
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
            {component.label}
          </h3>
          {component.description && (
            <p className="text-sm text-gray-600 mt-2">{component.description}</p>
          )}
        </div>
      );

    case 'signature':
      return (
        <div className="mb-4">
          {renderLabel()}
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Signature field (preview only)</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Unknown component type: {component.type}</p>
        </div>
      );
  }
};

export default FormField;
