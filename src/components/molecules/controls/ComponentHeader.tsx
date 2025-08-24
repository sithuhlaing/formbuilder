
import React from "react";
import ComponentIcon from "../../atoms/icons/ComponentIcon";
import DeleteButton from "../../atoms/controls/DeleteButton";
import DragHandle from "../../atoms/controls/DragHandle";
import type { ComponentType } from "../../types";

interface ComponentHeaderProps {
  type: ComponentType;
  label: string;
  required?: boolean;
  onDelete: () => void;
}

const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  type,
  label,
  required,
  onDelete,
}) => {
  return (
    <div className="form-component__header">
      <div className="form-component__info">
        <div className="form-component__type-icon">
          <ComponentIcon type={type} />
        </div>
        <span className="form-component__label">{label}</span>
        {required && <span className="form-component__required">*</span>}
      </div>
      <div className="form-component__actions">
        <div className="form-component__action form-component__action--drag">
          <DragHandle />
        </div>
        <div className="form-component__action form-component__action--delete">
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

export default ComponentHeader;
