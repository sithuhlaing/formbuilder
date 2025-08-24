
import React from 'react';
import type { FormComponentData } from '../types';
import { PreviewContainerHeader, PreviewContainerPlaceholder, PreviewField } from '../atoms';

interface PreviewVerticalLayoutProps {
  component: FormComponentData;
  renderChild: (child: FormComponentData) => React.ReactNode;
}

const PreviewVerticalLayout: React.FC<PreviewVerticalLayoutProps> = ({
  component,
  renderChild
}) => {
  return (
    <PreviewField label={component.label} required={component.required}>
      <div className="vertical-layout-preview">
        <PreviewContainerHeader
          icon="↕️"
          label="Vertical Layout"
          info={`${component.children?.length || 0} components stacked vertically`}
        />
        
        <div className="vertical-layout-content" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-gray-50)'
        }}>
          {component.children && component.children.length > 0 ? (
            component.children.map((child) => (
              <div key={child.id} className="vertical-layout-item">
                {renderChild(child)}
              </div>
            ))
          ) : (
            <PreviewContainerPlaceholder
              message="Drop components here to arrange vertically"
            />
          )}
        </div>
      </div>
    </PreviewField>
  );
};

export default PreviewVerticalLayout;
