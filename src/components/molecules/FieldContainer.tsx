
import React from 'react';
import { ErrorMessage, HelpText, Label } from '../atoms';

interface FieldContainerProps {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

const FieldContainer: React.FC<FieldContainerProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      <ErrorMessage message={error} />
      <HelpText text={helpText} />
    </div>
  );
};

export default FieldContainer;
