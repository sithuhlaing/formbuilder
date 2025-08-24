
import React from 'react';

interface NavigationItemProps {
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  isActive = false,
  onClick,
  children,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer p-3 rounded-md transition-colors duration-200
        ${isActive 
          ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' 
          : 'hover:bg-gray-50 text-gray-700'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default NavigationItem;
