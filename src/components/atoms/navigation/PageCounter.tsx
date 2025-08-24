
import React from 'react';

interface PageCounterProps {
  pageNumber: number;
  isActive?: boolean;
}

const PageCounter: React.FC<PageCounterProps> = ({ 
  pageNumber, 
  isActive = false 
}) => {
  return (
    <span 
      className={`
        inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-600'
        }
      `}
    >
      {pageNumber}
    </span>
  );
};

export default PageCounter;
