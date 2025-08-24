
import React from 'react';

interface ModalHeaderProps {
  title: string;
  icon?: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  title, 
  icon, 
  onClose 
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-xl"
      >
        ×
      </button>
    </div>
  );
};

export default ModalHeader;
