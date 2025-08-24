import React from 'react';
import type { FormComponentData } from '../../types';

interface RadioGroupFieldProps {
  component: FormComponentData;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({ component, value, onChange }) => {
  const fieldId = component.fieldId || component.id;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {component.label}
        {component.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {component.options?.map((option, index) => (
          <label key={index} className="flex items-center">
            <input
              type="radio"
              name={fieldId}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2"
              required={component.required}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroupField;