
import React from 'react';
import type { FormComponentData } from '../../types';

interface LayoutContainerProps {
  component: FormComponentData;
  children: React.ReactNode;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({ component, children }) => {
  const isHorizontal = component.type === 'horizontal_layout';

  return (
    <div className={`mb-4 ${isHorizontal ? 'flex gap-4' : 'space-y-4'}`}>
      {children}
    </div>
  );
};

export default LayoutContainer;
