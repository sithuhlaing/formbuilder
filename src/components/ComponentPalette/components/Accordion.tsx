import React, { useState, useCallback, useReducer } from 'react';
import AccordionItem from './AccordionItem';

interface AccordionProps {
  children: React.ReactElement<any>[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = true,
  defaultExpanded = []
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    return [...defaultExpanded];
  });
  
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const handleToggle = (id: string) => {
    setExpandedItems(prev => {
      const isCurrentlyExpanded = prev.includes(id);
      
      let newItems;
      if (isCurrentlyExpanded) {
        // Collapse the item
        newItems = prev.filter(itemId => itemId !== id);
      } else {
        // Expand the item
        if (!allowMultiple) {
          // If only single expansion allowed, return only this item
          newItems = [id];
        } else {
          // Add to existing expanded items
          newItems = [...prev, id];
        }
      }
      
      forceUpdate(); // Force a re-render
      return newItems;
    });
  };

  return (
    <div 
      className="accordion"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Try to get the id from various possible locations
          let id = child.props?.id;
          if (!id && child.props?.category?.id) {
            id = child.props.category.id;
          }
          
          if (id) {
            const isExpanded = expandedItems.includes(id);
              // Create new props with accordion overrides
            const newProps = {
              ...child.props,
              id: id,
              isExpanded: isExpanded,
              onToggle: handleToggle
            };
            return React.cloneElement(child, newProps);
          }
        }
        return child;
      })}
    </div>
  );
};

export default Accordion;