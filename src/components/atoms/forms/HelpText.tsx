
import React from 'react';

interface HelpTextProps {
  text?: string;
  className?: string;
}

const HelpText: React.FC<HelpTextProps> = ({ 
  text, 
  className = "" 
}) => {
  if (!text) return null;

  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {text}
    </p>
  );
};

export default HelpText;
