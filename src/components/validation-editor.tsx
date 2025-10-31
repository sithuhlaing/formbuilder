'use client';

import { useMemo } from 'react';
import { Template, ValidationRule } from '@/types/template';

type ValidationEditorProps = {
  template: Template;
  onUpdateValidation?: (fieldId: string | number, rules: ValidationRule[]) => void;
};

type FlattenedField = {
  id: string | number;
  label: string;
  type: string;
  required: boolean;
  validation: ValidationRule[];
};

const flattenFields = (template: Template): FlattenedField[] => {
  const fields: FlattenedField[] = [];

  const traverse = (items: Template['pages'][number]['items']) => {
    items.forEach((item) => {
      if (item.isLayout && item.columns) {
        item.columns.forEach((column) => traverse(column.fields));
        return;
      }

      if (item.children) {
        traverse(item.children);
      }

      fields.push({
        id: item.id,
        label: item.label ?? String(item.id),
        type: item.type,
        required: Boolean(item.required),
        validation: item.validation ?? [],
      });
    });
  };

  template.pages?.forEach((page) => traverse(page.items));

  return fields;
};

const toggleRequiredRule = (rules: ValidationRule[], required: boolean): ValidationRule[] => {
  const withoutRequired = rules.filter((rule) => rule.type !== 'required');
  if (!required) {
    return withoutRequired;
  }
  return [...withoutRequired, { type: 'required', message: 'This field is required' }];
};

export default function ValidationEditor({ template, onUpdateValidation }: ValidationEditorProps) {
  const fields = useMemo(() => flattenFields(template), [template]);

  if (fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
        No validation rules available for this template yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const required = field.validation.some((rule) => rule.type === 'required');
        const lengthRules = field.validation.filter((rule) =>
          rule.type === 'minLength' || rule.type === 'maxLength',
        );

        return (
          <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{field.label}</h3>
                <p className="text-xs uppercase tracking-wide text-gray-500">{field.type.replace(/_/g, ' ')}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(event) => {
                    const nextRules = toggleRequiredRule(field.validation, event.target.checked);
                    onUpdateValidation?.(field.id, nextRules);
                  }}
                />
                Required
              </label>
            </div>

            {lengthRules.length > 0 && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <p className="font-medium">Length Rules</p>
                <ul className="ml-4 list-disc">
                  {lengthRules.map((rule, index) => (
                    <li key={index}>
                      {rule.type === 'minLength' ? 'Minimum' : 'Maximum'} length: {rule.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {field.validation.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">No additional validation rules configured.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
