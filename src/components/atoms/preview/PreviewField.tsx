
import React from 'react';
import Label from '../forms/Label';

interface PreviewFieldProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const PreviewField: React.FC<PreviewFieldProps> = ({
  label,
  required = false,
  children,
  className = ''
}) => {
  return (
    <div className={`preview-field ${className}`}>
      {label && <Label required={required}>{label}</Label>}
      {children}
    </div>
  );
};

export default PreviewField;
