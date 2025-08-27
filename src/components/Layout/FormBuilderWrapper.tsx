/**
 * Form Builder Wrapper Component
 * Wraps ResponsiveLayout with additional functionality like template management
 */

import React from 'react';
import ResponsiveLayout from './ResponsiveLayout';
import type { FormComponentData, ComponentType } from '../../types';

interface FormBuilderWrapperProps {
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
  
  // Additional wrapper functions
  onBackToTemplates?: () => void;
  onJSONUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const FormBuilderWrapper: React.FC<FormBuilderWrapperProps> = ({
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
  onPreview,
  onBackToTemplates,
  onJSONUpload,
  onClearAll,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  // Enhanced save function with additional buttons
  const handleEnhancedSave = () => {
    if (onSave) onSave();
  };

  // Enhanced export with additional options
  const handleEnhancedExport = () => {
    if (onExport) onExport();
  };

  // Enhanced preview with additional functionality
  const handleEnhancedPreview = () => {
    if (onPreview) onPreview();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Additional toolbar for template management functions */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        zIndex: 1001
      }}>
        {onBackToTemplates && (
          <button
            onClick={onBackToTemplates}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Templates
          </button>
        )}

        <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />

        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: canUndo ? 'white' : '#f9fafb',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              opacity: canUndo ? 1 : 0.5
            }}
          >
            ↶ Undo
          </button>
        )}

        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: canRedo ? 'white' : '#f9fafb',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              opacity: canRedo ? 1 : 0.5
            }}
          >
            ↷ Redo
          </button>
        )}

        <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />

        {onJSONUpload && (
          <label style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📁 Load JSON
            <input
              type="file"
              accept=".json"
              onChange={onJSONUpload}
              style={{ display: 'none' }}
            />
          </label>
        )}

        {onClearAll && (
          <button
            onClick={onClearAll}
            disabled={components.length === 0}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: components.length > 0 ? 'white' : '#f9fafb',
              cursor: components.length > 0 ? 'pointer' : 'not-allowed',
              opacity: components.length > 0 ? 1 : 0.5
            }}
          >
            Clear All
          </button>
        )}

        <div style={{ flex: 1 }} />
        
        <div style={{ 
          color: '#6b7280',
          fontSize: '11px'
        }}>
          {components.length} components • Fixed viewport canvas
        </div>
      </div>

      {/* Main responsive layout */}
      <div style={{ flex: 1 }}>
        <ResponsiveLayout
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          onUpdateComponent={onUpdateComponent}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onUpdateComponents={onUpdateComponents}
          createComponent={createComponent}
          templateName={templateName}
          onSave={handleEnhancedSave}
          onExport={handleEnhancedExport}
          onPreview={handleEnhancedPreview}
        />
      </div>
    </div>
  );
};

export default FormBuilderWrapper;