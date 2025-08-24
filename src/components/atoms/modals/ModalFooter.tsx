
import React from 'react';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`flex justify-end space-x-2 p-4 border-t bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export default ModalFooter;
