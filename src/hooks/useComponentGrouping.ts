
import { useMemo } from 'react';
import type { FormComponentData } from '../components/types';

interface GroupedItem {
  type: 'component' | 'group';
  data: FormComponentData | {
    groupId: string;
    components: FormComponentData[];
  };
}

export const useComponentGrouping = (components: FormComponentData[]) => {
  const groupedComponents = useMemo(() => {
    const groups: (FormComponentData | FormComponentData[])[] = [];
    let currentHorizontalGroup: FormComponentData[] = [];

    components.forEach((component) => {
      if (component.layout?.horizontal) {
        // Add to current horizontal group
        currentHorizontalGroup.push(component);
      } else {
        // If we have a horizontal group, close it
        if (currentHorizontalGroup.length > 0) {
          groups.push([...currentHorizontalGroup]);
          currentHorizontalGroup = [];
        }
        // Add single component
        groups.push(component);
      }
    });

    // Don't forget the last horizontal group if it exists
    if (currentHorizontalGroup.length > 0) {
      groups.push([...currentHorizontalGroup]);
    }

    return groups;
  }, [components]);

  const createOrderedItems = useMemo(() => {
    return () => {
      const orderedItems: GroupedItem[] = [];
      
      groupedComponents.forEach((item, index) => {
        if (Array.isArray(item)) {
          // This is a horizontal group
          orderedItems.push({
            type: 'group',
            data: {
              groupId: `horizontal-group-${index}`,
              components: item
            }
          });
        } else {
          // This is a single component
          orderedItems.push({
            type: 'component',
            data: item
          });
        }
      });
      
      return orderedItems;
    };
  }, [groupedComponents]);

  return { 
    groupedComponents,
    createOrderedItems
  };
};
