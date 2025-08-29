/**
 * Clean Component Palette - Form Builder Feature
 * Single purpose: Display categorized draggable components with search
 */

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ComponentRenderer } from '../../../core';
import type { ComponentType } from '../../../types';

interface PaletteItemProps {
  componentType: ComponentType;
  onAddComponent: (type: ComponentType) => void;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ componentType, onAddComponent }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: componentType },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const info = ComponentRenderer.getComponentInfo(componentType);

  return (
    <button
      ref={drag}
      onClick={() => onAddComponent(componentType)}
      className={`palette-item ${isDragging ? 'palette-item--dragging' : ''}`}
      title={info.description}
    >
      <span className="palette-item__icon">{info.icon}</span>
      <span className="palette-item__label">{info.description}</span>
    </button>
  );
};

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['input-fields']));

  // Properly categorized components
  const inputFieldTypes: ComponentType[] = [
    'text_input', 'email_input', 'password_input', 'number_input',
    'textarea', 'date_picker', 'file_upload', 'signature'
  ];

  const selectionControlTypes: ComponentType[] = [
    'select', 'multi_select', 'checkbox', 'radio_group'
  ];

  const layoutTypes: ComponentType[] = [
    'section_divider'
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

  const filteredInputFields = filterComponents(inputFieldTypes);
  const filteredSelectionControls = filterComponents(selectionControlTypes);
  const filteredLayoutComponents = filterComponents(layoutTypes);

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

      {/* Input Fields Category */}
      <ComponentCategory
        title="Input Fields"
        icon="📝"
        isExpanded={expandedCategories.has('input-fields')}
        onToggle={() => toggleCategory('input-fields')}
      >
        {filteredInputFields.map(type => (
          <PaletteItem
            key={type}
            componentType={type}
            onAddComponent={onAddComponent}
          />
        ))}
      </ComponentCategory>

      {/* Selection Controls Category */}
      <ComponentCategory
        title="Selection Controls"
        icon="⚙️"
        isExpanded={expandedCategories.has('selection-controls')}
        onToggle={() => toggleCategory('selection-controls')}
      >
        {filteredSelectionControls.map(type => (
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
        icon="🏗️"
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

      {/* No results */}
      {searchTerm && 
       filteredInputFields.length === 0 && 
       filteredSelectionControls.length === 0 && 
       filteredLayoutComponents.length === 0 && (
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