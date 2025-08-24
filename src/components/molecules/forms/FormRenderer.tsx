
import React from 'react';
import type { FormComponentData } from '../../types';
import FormField from '../../atoms/form/FormField';
import MultiSelectField from '../../atoms/form/MultiSelectField';
import RadioGroupField from '../../atoms/form/RadioGroupField';
import CheckboxField from '../../atoms/form/CheckboxField';
import LayoutContainer from '../../atoms/form/LayoutContainer';

interface FormRendererProps {
  components: FormComponentData[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ components, formData, onFieldChange }) => {
  const renderComponent = (component: FormComponentData): React.ReactNode => {
    const fieldId = component.fieldId || component.id;
    const value = formData[fieldId];

    const handleChange = (newValue: any) => {
      onFieldChange(fieldId, newValue);
    };

    switch (component.type) {
      case 'multi_select':
        return (
          <MultiSelectField
            key={component.id}
            component={component}
            value={value || []}
            onChange={handleChange}
          />
        );

      case 'radio_group':
        return (
          <RadioGroupField
            key={component.id}
            component={component}
            value={value || ''}
            onChange={handleChange}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            key={component.id}
            component={component}
            value={value || []}
            onChange={handleChange}
          />
        );

      case 'horizontal_layout':
      case 'vertical_layout':
        return (
          <LayoutContainer key={component.id} component={component}>
            {component.children?.map(child => renderComponent(child))}
          </LayoutContainer>
        );

      default:
        return (
          <FormField
            key={component.id}
            component={component}
            value={value}
            onChange={handleChange}
          />
        );
    }
  };

  return <div>{components.map(renderComponent)}</div>;
};

export default FormRenderer;
