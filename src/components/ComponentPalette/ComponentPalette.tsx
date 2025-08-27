import React, { useState } from 'react';
import Accordion from './components/Accordion';
import ComponentCategory from './components/ComponentCategory';
import { componentCategories } from './config/componentCategories';
import type { ComponentType } from '../../types';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? componentCategories.map(category => ({
        ...category,
        components: category.components.filter(comp =>
          comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comp.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.components.length > 0)
    : componentCategories;


  const totalComponents = componentCategories.reduce(
    (total, category) => total + category.components.length,
    0
  );

  const filteredComponentCount = filteredCategories.reduce(
    (total, category) => total + category.components.length,
    0
  );

  return (
    <div className="component-palette" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>🧩</span>
          Components
        </h2>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#f9fafb',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              color: '#9ca3af'
            }}
          >
            🔍
          </span>
        </div>

        {searchTerm && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}
          >
            Showing {filteredComponentCount} of {totalComponents} components
          </div>
        )}
      </div>

      {/* Categories */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}
      >
        {filteredCategories.length > 0 ? (
          <Accordion allowMultiple={true} defaultExpanded={searchTerm ? filteredCategories.map(cat => cat.id) : ['inputs', 'selections', 'layout']}>
            {filteredCategories.map((category) => (
              <ComponentCategory
                key={category.id}
                category={category}
                onAddComponent={onAddComponent}
              />
            ))}
          </Accordion>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: '#6b7280'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>
              🔍
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              No components found
            </div>
            <div style={{ fontSize: '14px' }}>
              Try adjusting your search terms
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}
      >
        💡 Drag components to canvas or click to add
      </div>
    </div>
  );
};

export default ComponentPalette;