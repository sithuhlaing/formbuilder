import React from 'react';
import type { FormComponentData } from '../../types';

interface CheckboxFieldProps {
  component: FormComponentData;
  value: any[];
  onChange: (value: any[]) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ component, value = [], onChange }) => {
  const handleOptionChange = (option: string, checked: boolean) => {
    const newValues = checked
      ? [...value, option]
      : value.filter(v => v !== option);
    onChange(newValues);
  };

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
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={(e) => handleOptionChange(option, e.target.checked)}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxField;