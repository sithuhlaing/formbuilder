import React from 'react';
import type { FormComponentData } from '../../types';
import { PreviewContainerHeader, PreviewContainerPlaceholder, PreviewField } from '../../atoms';
import { getDefaultLabel } from '../../../utils/componentDefaults';

interface PreviewHorizontalLayoutProps {
  component: FormComponentData;
  renderChild: (child: FormComponentData) => React.ReactNode;
}

const PreviewHorizontalLayout: React.FC<PreviewHorizontalLayoutProps> = ({
  component,
  renderChild
}) => {
  const childrenCount = component.children?.length || 0;
  const info = `${childrenCount} columns - Side by side layout`;
  const displayLabel = component.label || getDefaultLabel(component.type);

  return (
    <PreviewField label={displayLabel}>
      <div className="container-preview horizontal-container">
        <PreviewContainerHeader
          icon="↔️"
          label={displayLabel}
          info={info}
        />
        <div className="container-drop-zone">
          {component.children && component.children.length > 0 ? (
            <div 
              className="container-items horizontal grid-row"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 'var(--space-3)',
                width: '100%',
                alignItems: 'flex-start'
              }}
            >
              {component.children.map((child) => (
                <div 
                  key={child.id} 
                  className="container-item grid-column"
                  style={{ 
                    flex: child.layout?.width ? 'none' : '1',
                    width: child.layout?.width || 'auto',
                    minWidth: '150px',
                    maxWidth: '100%'
                  }}
                >
                  {renderChild(child)}
                </div>
              ))}
            </div>
          ) : (
            <PreviewContainerPlaceholder message="Drag fields here to arrange side by side" />
          )}
        </div>
      </div>
    </PreviewField>
  );
};

export default PreviewHorizontalLayout;