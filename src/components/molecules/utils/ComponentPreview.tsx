import React from 'react';
import ComponentRenderer from './ComponentRenderer';
import type { FormComponentData } from '../../types';

interface ComponentPreviewProps {
  component: FormComponentData;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ component }) => {
  const renderChild = (child: FormComponentData): React.ReactNode => {
    return <ComponentPreview key={child.id} component={child} />;
  };

  return <ComponentRenderer component={component} renderChild={renderChild} />;
};

export default ComponentPreview;