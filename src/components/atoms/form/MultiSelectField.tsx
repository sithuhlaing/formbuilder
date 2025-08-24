import React from 'react';
import type { FormComponentData } from '../../types';

interface MultiSelectFieldProps {
  component: FormComponentData;
  value: any[];
  onChange: (value: any[]) => void;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({ component, value = [], onChange }) => {
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
      <div className="border border-gray-300 rounded-md">
        {component.options?.map((option, index) => (
          <label key={index} className="flex items-center px-3 py-2 border-b border-gray-200 last:border-b-0">
            <input
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={(e) => handleOptionChange(option, e.target.checked)}
              className="mr-3"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectField;