import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewContainerHeader, PreviewContainerPlaceholder, PreviewField } from '../../atoms';

interface PreviewHorizontalLayoutProps {
  component: FormComponentData;
  renderChild: (child: FormComponentData) => React.ReactNode;
}

const PreviewHorizontalLayout: React.FC<PreviewHorizontalLayoutProps> = ({
  component,
  renderChild
}) => {
  const childrenCount = component.children?.length || 0;
  const info = `${childrenCount}/12 columns - Drag fields here to arrange horizontally`;

  return (
    <PreviewField label={component.label}>
      <div className="container-preview horizontal-container">
        <PreviewContainerHeader
          icon="↔️"
          label={component.label}
          info={info}
        />
        <div className="container-drop-zone">
          {component.children && component.children.length > 0 ? (
            <div className="container-items horizontal grid-row">
              {component.children.map((child) => (
                <div 
                  key={child.id} 
                  className="container-item grid-column"
                  style={{ 
                    width: child.layout?.width || `${(100 / component.children!.length).toFixed(2)}%`,
                    minWidth: '100px',
                    flexShrink: 0
                  }}
                >
                  {renderChild(child)}
                </div>
              ))}
            </div>
          ) : (
            <PreviewContainerPlaceholder message="Drag fields here to arrange horizontally" />
          )}
        </div>
      </div>
    </PreviewField>
  );
};

export default PreviewHorizontalLayout;