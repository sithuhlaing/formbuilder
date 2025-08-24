
import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const SPACING_STYLES = {
  tight: 'space-x-1',
  normal: 'space-x-2',
  loose: 'space-x-4',
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  spacing = 'normal'
}) => {
  const spacingClass = SPACING_STYLES[spacing];

  return (
    <div className={`flex ${spacingClass} ${className}`}>
      {children}
    </div>
  );
};

export default ButtonGroup;
