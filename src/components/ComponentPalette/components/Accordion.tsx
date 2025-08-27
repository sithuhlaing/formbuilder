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
    console.log('Accordion initial defaultExpanded:', defaultExpanded);
    return [...defaultExpanded];
  });
  
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const handleToggle = (id: string) => {
    console.log(`Accordion handleToggle called for ${id}`, 'Current expanded items:', expandedItems);
    setExpandedItems(prev => {
      const isCurrentlyExpanded = prev.includes(id);
      console.log(`${id} is currently expanded:`, isCurrentlyExpanded);
      
      let newItems;
      if (isCurrentlyExpanded) {
        // Collapse the item
        console.log(`Collapsing ${id}`);
        newItems = prev.filter(itemId => itemId !== id);
      } else {
        // Expand the item
        console.log(`Expanding ${id}`);
        if (!allowMultiple) {
          // If only single expansion allowed, return only this item
          newItems = [id];
        } else {
          // Add to existing expanded items
          newItems = [...prev, id];
        }
      }
      
      console.log(`Setting new expanded items:`, newItems);
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
        if (React.isValidElement(child) && child.props && child.props.id) {
          const id = child.props.id;
          const isExpanded = expandedItems.includes(id);
          console.log(`Accordion rendering child ${id}, isExpanded:`, isExpanded, 'expandedItems:', expandedItems);
          return React.cloneElement(child, {
            isExpanded: isExpanded,
            onToggle: handleToggle
          });
        }
        return child;
      })}
    </div>
  );
};

export default Accordion;