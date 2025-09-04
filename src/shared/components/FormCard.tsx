import React from 'react';
import type { FormComponentData } from '../../types/component';

interface FormCardProps {
  component: FormComponentData;
  mode?: 'builder' | 'preview';
  children?: React.ReactNode;
  renderChildren?: (child: FormComponentData) => React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({ 
  component, 
  mode = 'preview',
  children,
  renderChildren
}) => {
  const cardTitle = component.label || 'Card Container';
  const customCSS = component.styling?.customCSS || '';
  const cardTheme = component.styling?.theme || 'default';
  
  const getCardClasses = () => {
    const baseClasses = 'form-card';
    const themeClasses = `form-card--${cardTheme}`;
    const modeClasses = mode === 'builder' ? 'form-card--builder' : '';
    
    return [baseClasses, themeClasses, modeClasses]
      .filter(Boolean)
      .join(' ');
  };

  const renderCardChildren = () => {
    if (children) {
      return children;
    }
    
    if (component.children && renderChildren) {
      return component.children.map((child, index) => (
        <div key={child.id || index} className="form-card__child">
          {renderChildren(child)}
        </div>
      ));
    }
    
    if (mode === 'builder' && (!component.children || component.children.length === 0)) {
      return (
        <div className="form-card__empty-state">
          <span className="form-card__empty-text">
            Drop components here to organize them in a card
          </span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className={`form-field form-field--card`}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      <div
        className={getCardClasses()}
        style={{
          opacity: mode === 'builder' ? 0.95 : 1,
          ...customCSS ? { cssText: customCSS } : {}
        }}
      >
        {cardTitle && (
          <div className="form-card__header">
            <h3 className="form-card__title">{cardTitle}</h3>
          </div>
        )}
        
        <div className="form-card__content">
          {renderCardChildren()}
        </div>
      </div>
      
      {mode === 'builder' && (
        <div className="form-field__builder-overlay">
          <span className="form-field__type-badge">
            Card ({component.children?.length || 0} items)
          </span>
        </div>
      )}
    </div>
  );
};

export default FormCard;