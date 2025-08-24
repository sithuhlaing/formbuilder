import React from 'react';

export interface ActionButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  icon: string;
  title: string;
  variant?: 'default' | 'delete' | 'warning';
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  title,
  variant = 'default',
  className = ''
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'delete':
        return 'action-btn--delete';
      case 'warning':
        return 'action-btn--warning';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={(e) => onClick(e)}
      className={`action-btn ${getVariantClass()} ${className}`}
      title={title}
      type="button"
    >
      {icon}
    </button>
  );
};

export default ActionButton;