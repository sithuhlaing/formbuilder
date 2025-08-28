import React from 'react';
import AccordionItem from './AccordionItem';
import DraggableComponentItem from './DraggableComponentItem';
import type { ComponentCategory as ComponentCategoryType } from '../types';
import type { ComponentType } from '../../../types';

interface ComponentCategoryProps {
  category: ComponentCategoryType;
  onAddComponent: (type: ComponentType) => void;
  // Props that may be passed by Accordion
  id?: string;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
}

const ComponentCategory: React.FC<ComponentCategoryProps> = ({
  category,
  onAddComponent,
  id,
  isExpanded = false,
  onToggle = () => {}
}) => {
  return (
    <AccordionItem
      id={id || category.id}
      title={category.name}
      icon={category.icon}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div style={{ padding: '0 8px 8px 8px' }}>
        {category.description && (
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              padding: '8px 8px 12px 8px',
              fontStyle: 'italic',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '8px'
            }}
          >
            {category.description}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {category.components.map((component) => (
            <DraggableComponentItem
              key={component.type}
              component={component}
              onAddComponent={onAddComponent}
            />
          ))}
        </div>
        
        {category.components.length === 0 && (
          <div
            style={{
              padding: '16px 8px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }}
          >
            No components available in this category
          </div>
        )}
      </div>
    </AccordionItem>
  );
};

export default ComponentCategory;