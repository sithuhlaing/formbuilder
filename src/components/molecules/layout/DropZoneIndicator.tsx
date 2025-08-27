
import React from 'react';

interface DropZoneIndicatorProps {
  position: 'before' | 'after' | 'inside';
}

const DropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({ position }) => {
  const getIndicatorStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      right: 0,
      height: '3px',
      backgroundColor: '#10b981',
      borderRadius: '2px',
      zIndex: 10,
      boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
    };

    switch (position) {
      case 'before':
        return { ...baseStyle, top: '-2px' };
      case 'after':
        return { ...baseStyle, bottom: '-2px' };
      case 'inside':
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '4px 8px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getIndicatorStyle()}>
      {position === 'inside' && 'Drop inside'}
    </div>
  );
};

export default DropZoneIndicator;
