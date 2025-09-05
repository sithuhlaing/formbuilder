/**
 * Unified Drop Zone - Compatibility bridge between legacy and new implementations
 * SAFE: Preserves all existing functionality while eliminating duplication
 */

import React from 'react';
import { BetweenDropZone } from '../../../shared/components/DropZone';
import { BetweenElementsDropZone } from './BetweenElementsDropZone';
import type { ComponentType } from '../../../types';

// Unified interface supporting both patterns
interface UnifiedDropZoneProps {
  // Legacy pattern support (shared components)
  index?: number;
  onInsertBetween?: (componentType: ComponentType, insertIndex: number) => void;
  
  // New pattern support (package components)  
  beforeIndex?: number;
  afterIndex?: number;
  onItemAdd?: (itemType: string, position: { type: string; targetIndex?: number }) => void;
  
  // Common configuration
  config?: {
    cssPrefix: string;
    thresholds?: { horizontal: number; vertical: number };
  };
  
  // Styling
  className?: string;
}

/**
 * Unified Between Drop Zone - Auto-detects which pattern to use
 * SAFE: No existing functionality is modified or broken
 */
export const UnifiedBetweenDropZone: React.FC<UnifiedDropZoneProps> = (props) => {
  // Pattern 1: Legacy shared component pattern
  if (props.onInsertBetween && props.index !== undefined) {
    return (
      <BetweenDropZone
        index={props.index}
        onInsertBetween={props.onInsertBetween}
        className={props.className}
      />
    );
  }
  
  // Pattern 2: New package component pattern  
  if (props.onItemAdd && props.beforeIndex !== undefined && props.afterIndex !== undefined) {
    return (
      <BetweenElementsDropZone
        beforeIndex={props.beforeIndex}
        afterIndex={props.afterIndex}
        onItemAdd={props.onItemAdd}
        config={props.config || { cssPrefix: 'canvas' }}
      />
    );
  }
  
  // Fallback: Use new pattern with sensible defaults
  if (props.index !== undefined && props.onItemAdd) {
    return (
      <BetweenElementsDropZone
        beforeIndex={props.index}
        afterIndex={props.index + 1}
        onItemAdd={props.onItemAdd}
        config={props.config || { cssPrefix: 'canvas' }}
      />
    );
  }
  
  // Error case: Invalid props combination
  console.error('UnifiedBetweenDropZone: Invalid props combination', props);
  return (
    <div className="drop-zone-error" style={{ 
      padding: '8px', 
      background: '#fee', 
      border: '1px solid #fcc',
      borderRadius: '4px',
      color: '#c33',
      fontSize: '12px'
    }}>
      Invalid drop zone configuration
    </div>
  );
};

/**
 * Compatibility adapter for legacy consumers
 * SAFE: Bridges old callback pattern to new pattern
 */
export const legacyCompatibilityAdapter = {
  /**
   * Converts legacy onInsertBetween callback to new onItemAdd pattern
   */
  adaptLegacyCallback: (
    onInsertBetween: (componentType: ComponentType, insertIndex: number) => void,
    index: number
  ) => {
    return (itemType: string, position: { type: string; targetIndex?: number }) => {
      // Convert string back to ComponentType for legacy compatibility
      const componentType = itemType as ComponentType;
      const insertIndex = position.targetIndex ?? index;
      onInsertBetween(componentType, insertIndex);
    };
  },
  
  /**
   * Converts new onItemAdd callback to legacy onInsertBetween pattern
   */
  adaptNewCallback: (
    onItemAdd: (itemType: string, position: { type: string; targetIndex?: number }) => void
  ) => {
    return (componentType: ComponentType, insertIndex: number) => {
      onItemAdd(componentType, { type: 'between', targetIndex: insertIndex });
    };
  }
};

/**
 * Migration helper for gradual transition
 * SAFE: Allows consumers to migrate gradually without breaking changes
 */
export const dropZoneMigrationHelper = {
  /**
   * Detects which pattern a consumer is using
   */
  detectPattern: (props: UnifiedDropZoneProps): 'legacy' | 'new' | 'unknown' => {
    if (props.onInsertBetween && props.index !== undefined) {
      return 'legacy';
    }
    if (props.onItemAdd && (props.beforeIndex !== undefined || props.afterIndex !== undefined)) {
      return 'new';
    }
    return 'unknown';
  },
  
  /**
   * Validates props for correctness
   */
  validateProps: (props: UnifiedDropZoneProps): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check for legacy pattern completeness
    if (props.onInsertBetween && props.index === undefined) {
      errors.push('Legacy pattern requires index prop when using onInsertBetween');
    }
    
    // Check for new pattern completeness  
    if (props.onItemAdd && (props.beforeIndex === undefined || props.afterIndex === undefined)) {
      errors.push('New pattern requires both beforeIndex and afterIndex when using onItemAdd');
    }
    
    // Check for conflicting patterns
    if (props.onInsertBetween && props.onItemAdd) {
      errors.push('Cannot use both onInsertBetween and onItemAdd simultaneously');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};