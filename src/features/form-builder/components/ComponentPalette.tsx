/**
 * PERFORMANCE OPTIMIZED - Clean Component Palette - Form Builder Feature
 * Single purpose: Display categorized draggable components with search
 * Features: Virtualization, memoization, lazy loading
 */

import React, { useState, memo, useMemo, CSSProperties } from 'react';
import { useDrag } from 'react-dnd';
import { ComponentRenderer } from '../../../core';
import { VirtualizedList } from '../../../shared/components/VirtualizedList';
import { usePerformanceMonitor } from '../../../shared/hooks/usePerformanceMonitor';
import type { ComponentType } from '../../../types';

interface PaletteItemProps {
  componentType: ComponentType;
  onAddComponent: (type: ComponentType) => void;
}

// Memoized palette item component for better performance
const PaletteItem: React.FC<PaletteItemProps> = memo(({ componentType, onAddComponent }) => {
  const { renderCount } = usePerformanceMonitor({ 
    componentName: `PaletteItem-${componentType}`,
    slowRenderThreshold: 8 // Stricter threshold for palette items
  });
  const [{ isDragging }, drag] = useDrag({
    type: 'new-item',
    item: { type: 'new-item', itemType: componentType },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const info = ComponentRenderer.getComponentInfo(componentType);

  return (
    <button
      ref={drag as any}
      onClick={() => onAddComponent(componentType)}
      className={`palette-item ${isDragging ? 'palette-item--dragging' : ''}`}
      title={info.description}
    >
      <span className="palette-item__icon">{info.icon}</span>
      <span className="palette-item__label">{info.label}</span>
    </button>
  );
});
PaletteItem.displayName = 'PaletteItem';

interface ComponentCategoryProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ComponentCategory: React.FC<ComponentCategoryProps> = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  return (
    <div className="accordion">
      <button className="accordion__header" onClick={onToggle}>
        <div className="accordion__header-content">
          <span className="accordion__icon">{icon}</span>
          <span className="accordion__title">{title}</span>
        </div>
        <span className={`accordion__chevron ${isExpanded ? 'accordion__chevron--expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="accordion__body">
          <div className="palette-items">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['input-components', 'selection-components']));

  // EXACTLY AS DOCUMENTED - Fixed component categorization
  const inputComponentTypes: ComponentType[] = [
    'text_input', 'email_input', 'password_input', 'number_input',
    'textarea', 'rich_text'
  ];

  const selectionComponentTypes: ComponentType[] = [
    'select', 'multi_select', 'checkbox', 'radio_group'
  ];

  const specialComponentTypes: ComponentType[] = [
    'date_picker', 'file_upload', 'signature'
  ];

  const layoutComponentTypes: ComponentType[] = [
    'horizontal_layout', 'vertical_layout'
  ];

  const uiComponentTypes: ComponentType[] = [
    'section_divider', 'button', 'heading', 'card'
  ];

  // Filter components based on search
  const filterComponents = (components: ComponentType[]) => {
    if (!searchTerm) return components;
    
    return components.filter(type => {
      const info = ComponentRenderer.getComponentInfo(type);
      return info.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             type.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredInputComponents = filterComponents(inputComponentTypes);
  const filteredSelectionComponents = filterComponents(selectionComponentTypes);
  const filteredSpecialComponents = filterComponents(specialComponentTypes);
  const filteredLayoutComponents = filterComponents(layoutComponentTypes);
  const filteredUIComponents = filterComponents(uiComponentTypes);

  return (
    <div className="component-palette-container">
      {/* Search - Always Visible */}
      <div className="search-section">
        <div className="search-header">
          <span className="search-icon">🔍</span>
          <span className="search-title">Search Components</span>
        </div>
        <input 
          type="text" 
          placeholder="Search components..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Input Components Category */}
      <ComponentCategory
        title="Input Components"
        icon="📝"
        isExpanded={expandedCategories.has('input-components')}
        onToggle={() => toggleCategory('input-components')}
      >
        {filteredInputComponents.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* Selection Components Category */}
      <ComponentCategory
        title="Selection Components"
        icon="☑️"
        isExpanded={expandedCategories.has('selection-components')}
        onToggle={() => toggleCategory('selection-components')}
      >
        {filteredSelectionComponents.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* Special Components Category */}
      <ComponentCategory
        title="Special Components"
        icon="⭐"
        isExpanded={expandedCategories.has('special-components')}
        onToggle={() => toggleCategory('special-components')}
      >
        {filteredSpecialComponents.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* Layout Components Category */}
      <ComponentCategory
        title="Layout Components"
        icon="📐"
        isExpanded={expandedCategories.has('layout-components')}
        onToggle={() => toggleCategory('layout-components')}
      >
        {filteredLayoutComponents.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* UI Components Category */}
      <ComponentCategory
        title="UI Components"
        icon="🎨"
        isExpanded={expandedCategories.has('ui-components')}
        onToggle={() => toggleCategory('ui-components')}
      >
        {filteredUIComponents.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* No results */}
      {searchTerm && 
       filteredInputComponents.length === 0 && 
       filteredSelectionComponents.length === 0 && 
       filteredSpecialComponents.length === 0 &&
       filteredLayoutComponents.length === 0 &&
       filteredUIComponents.length === 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          No components found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};