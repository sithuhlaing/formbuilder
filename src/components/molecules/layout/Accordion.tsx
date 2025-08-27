import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  icon, 
  defaultExpanded = false, 
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="accordion">
      <button
        className="accordion__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded} 
        aria-controls={`accordion-content-${title}`}
      >
        <div className="accordion__header-content">
          {icon && <span className="accordion__icon">{icon}</span>}
          <span className="accordion__title">{title}</span>
        </div>
        <span className={`accordion__chevron ${isExpanded ? 'accordion__chevron--expanded' : ''}`}>
          ▼
        </span>
      </button>
      
      <div 
        id={`accordion-content-${title}`}
        className={`accordion__content ${isExpanded ? 'accordion__content--expanded' : ''}`}
        aria-hidden={!isExpanded}
        style={{ 
          display: isExpanded ? 'block' : 'none' // Simple show/hide instead of complex transitions
        }}
      >
        <div className="accordion__body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;