/**
 * Responsive Layout Component
 * Implements the UI structure specification with proper desktop/mobile views
 */

import React, { useState, useEffect } from 'react';
import FixedTopBar from './FixedTopBar';
import AccordionLeftPanel from './AccordionLeftPanel';
import FixedViewportCanvas from './FixedViewportCanvas';
import PropertiesRightPanel from './PropertiesRightPanel';
import type { FormComponentData, ComponentType } from '../../types';

interface ResponsiveLayoutProps {
  // Form builder props
  components: FormComponentData[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponents: (components: FormComponentData[]) => void;
  createComponent: (type: ComponentType) => FormComponentData;
  
  // Layout configuration
  templateName: string;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent,
  onUpdateComponents,
  createComponent,
  templateName,
  onSave,
  onExport,
  onPreview
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true); // Default: collapsed
  
  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Mobile: top_bar + canvas only */}
        <FixedTopBar
          templateName={templateName}
          isMobile={true}
          onSave={onSave}
          onExport={onExport}
          onPreview={onPreview}
          onTogglePanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          isPanelCollapsed={leftPanelCollapsed}
        />
        
        {/* Mobile Canvas - full viewport */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <FixedViewportCanvas
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onUpdateComponent={onUpdateComponent}
            onDeleteComponent={onDeleteComponent}
            onAddComponent={onAddComponent}
            onUpdateComponents={onUpdateComponents}
            createComponent={createComponent}
            isMobile={true}
          />
        </div>

        {/* Mobile Panel Overlay */}
        {!leftPanelCollapsed && (
          <div style={{
            position: 'fixed',
            top: '60px', // Below top bar
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            zIndex: 1000,
            overflow: 'auto'
          }}>
            <AccordionLeftPanel
              onAddComponent={onAddComponent}
              isCollapsed={false}
              onToggle={() => setLeftPanelCollapsed(true)}
              isMobile={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: leftPanelCollapsed 
        ? '0px 1fr 300px' 
        : '280px 1fr 300px',
      gridTemplateRows: '60px 1fr',
      height: '100vh',
      overflow: 'hidden',
      transition: 'grid-template-columns 0.3s ease'
    }}>
      {/* Fixed Top Bar - spans all columns */}
      <div style={{ gridColumn: '1 / -1' }}>
        <FixedTopBar
          templateName={templateName}
          isMobile={false}
          onSave={onSave}
          onExport={onExport}
          onPreview={onPreview}
          onTogglePanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          isPanelCollapsed={leftPanelCollapsed}
        />
      </div>

      {/* Left Panel - Accordion with draggable components */}
      {!leftPanelCollapsed && (
        <div style={{
          borderRight: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <AccordionLeftPanel
            onAddComponent={onAddComponent}
            isCollapsed={leftPanelCollapsed}
            onToggle={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            isMobile={false}
          />
        </div>
      )}

      {/* Canvas - Fixed to viewport with scroll */}
      <div style={{ 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <FixedViewportCanvas
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onUpdateComponent={onUpdateComponent}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onUpdateComponents={onUpdateComponents}
          createComponent={createComponent}
          isMobile={false}
        />
      </div>

      {/* Right Panel - Properties */}
      <div style={{
        borderLeft: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <PropertiesRightPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={onUpdateComponent}
        />
      </div>
    </div>
  );
};

export default ResponsiveLayout;