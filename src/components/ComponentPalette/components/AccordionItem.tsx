import React, { useState } from 'react';
import type { AccordionItemProps } from '../types';

const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  icon,
  isExpanded,
  onToggle,
  children
}) => {
  const handleToggle = () => {
    onToggle(id);
  };

  return (
    <div className="accordion-item">
      <button
        className={`accordion-header ${isExpanded ? 'accordion-header--expanded' : ''}`}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          backgroundColor: isExpanded ? '#f3f4f6' : '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span>{title}</span>
        </div>
        <span
          style={{
            transition: 'transform 0.2s ease',
            fontSize: '12px',
            color: '#6b7280'
          }}
        >
{isExpanded ? '▼' : '►'}
        </span>
      </button>
      
{isExpanded && (
        <div
          id={`accordion-content-${id}`}
          style={{
            backgroundColor: '#ffffff',
            padding: '8px 0'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionItem;