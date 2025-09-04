import React from 'react';
import type { FormComponentData } from '../../types/component';

interface FormButtonProps {
  component: FormComponentData;
  mode?: 'builder' | 'preview';
  onClick?: () => void;
}

export const FormButton: React.FC<FormButtonProps> = ({ 
  component, 
  mode = 'preview', 
  onClick 
}) => {
  const buttonText = component.defaultValue || component.label || 'Click Me';
  const buttonType = component.styling?.theme || 'primary';
  
  const getButtonClasses = () => {
    const baseClasses = 'btn';
    const typeClasses = `btn--${buttonType}`;
    const modeClasses = mode === 'builder' ? 'btn--builder' : '';
    
    return [baseClasses, typeClasses, modeClasses]
      .filter(Boolean)
      .join(' ');
  };

  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'builder') {
      e.preventDefault(); // Prevent action in builder mode
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`form-field form-field--button`}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      <button
        type="button"
        className={getButtonClasses()}
        onClick={handleClick}
        style={{
          opacity: mode === 'builder' ? 0.8 : 1,
          cursor: mode === 'builder' ? 'move' : 'pointer'
        }}
        disabled={mode === 'builder'}
      >
        {buttonText}
      </button>
      
      {mode === 'builder' && (
        <div className="form-field__builder-overlay">
          <span className="form-field__type-badge">Button</span>
        </div>
      )}
    </div>
  );
};

export default FormButton;