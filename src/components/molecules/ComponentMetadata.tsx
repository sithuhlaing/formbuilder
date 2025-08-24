
import React from "react";

interface ComponentMetadataProps {
  fieldId?: string;
  componentId: string;
  helpText?: string;
}

const ComponentMetadata: React.FC<ComponentMetadataProps> = ({
  fieldId,
  componentId,
  helpText,
}) => {
  return (
    <div className="component-metadata">
      {helpText && (
        <div className="component-metadata__help-text">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default ComponentMetadata;
