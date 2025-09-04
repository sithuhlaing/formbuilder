import React from 'react';
import type { JSX } from 'react';
import type { FormComponentData } from '../../types/component';

interface FormHeadingProps {
  component: FormComponentData;
  mode?: 'builder' | 'preview';
}

export const FormHeading: React.FC<FormHeadingProps> = ({ 
  component, 
  mode = 'preview' 
}) => {
  const headingText = component.defaultValue || component.label || 'Section Heading';
  const headingLevel = component.styling?.theme || 'h2'; // h1, h2, h3, etc.
  const customCSS = component.styling?.customCSS || '';
  
  const getHeadingClasses = () => {
    const baseClasses = 'form-field__heading';
    const levelClasses = `form-field__heading--${headingLevel}`;
    const modeClasses = mode === 'builder' ? 'form-field__heading--builder' : '';
    
    return [baseClasses, levelClasses, modeClasses]
      .filter(Boolean)
      .join(' ');
  };

  const HeadingTag = headingLevel as keyof JSX.IntrinsicElements;

  return (
    <div 
      className={`form-field form-field--heading`}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      <HeadingTag
        className={getHeadingClasses()}
        style={{
          opacity: mode === 'builder' ? 0.9 : 1,
          ...customCSS ? { cssText: customCSS } : {}
        }}
      >
        {headingText}
      </HeadingTag>
      
      {mode === 'builder' && (
        <div className="form-field__builder-overlay">
          <span className="form-field__type-badge">Heading ({headingLevel.toUpperCase()})</span>
        </div>
      )}
    </div>
  );
};

export default FormHeading;