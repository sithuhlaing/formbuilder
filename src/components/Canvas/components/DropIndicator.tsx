import React from 'react';
import type { DropPosition } from '../types/positioning';

interface DropIndicatorProps {
  position: DropPosition;
  isVisible: boolean;
  bounds: DOMRect;
  containerRef: React.RefObject<HTMLElement>;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({
  position,
  isVisible,
  bounds,
  containerRef
}) => {
  if (!isVisible || !containerRef.current) {
    return null;
  }

  const containerRect = containerRef.current.getBoundingClientRect();
  
  // Calculate position relative to container
  const style: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    zIndex: 1000,
    opacity: 0.8,
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    left: bounds.left - containerRect.left,
    top: bounds.top - containerRect.top,
    width: bounds.width,
    height: bounds.height
  };

  // Add glow effect based on position
  const glowColor = position === 'left' || position === 'right' 
    ? '#10b981' // Green for row creation
    : '#3b82f6'; // Blue for column positioning

  style.boxShadow = `0 0 10px 2px ${glowColor}40`;

  // Add position-specific styling
  if (position === 'left' || position === 'right') {
    style.backgroundColor = '#10b981';
  }

  return (
    <>
      <div style={style} />
      {/* Position label */}
      <div
        style={{
          position: 'absolute',
          left: bounds.left - containerRect.left + bounds.width / 2,
          top: bounds.top - containerRect.top + bounds.height / 2,
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500',
          zIndex: 1001,
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        {getPositionLabel(position)}
      </div>
    </>
  );
};

function getPositionLabel(position: DropPosition): string {
  switch (position) {
    case 'top':
      return '▲ Insert Above';
    case 'right':
      return '▶ Add to Right';
    case 'bottom':
      return '▼ Insert Below';
    case 'left':
      return '◀ Add to Left';
    case 'center':
      return '⊕ Insert After';
    default:
      return 'Drop Here';
  }
}

export default DropIndicator;