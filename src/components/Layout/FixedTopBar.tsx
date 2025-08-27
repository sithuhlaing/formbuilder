/**
 * Fixed Top Bar Component
 * Position: top, Behavior: fixed, Mobile: center alignment
 */

import React from 'react';

interface FixedTopBarProps {
  templateName: string;
  isMobile: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  onTogglePanel?: () => void;
  isPanelCollapsed?: boolean;
}

const FixedTopBar: React.FC<FixedTopBarProps> = ({
  templateName,
  isMobile,
  onSave,
  onExport,
  onPreview,
  onTogglePanel,
  isPanelCollapsed
}) => {
  const buttonStyle = {
    background: 'none',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: isMobile ? '6px 8px' : '8px 12px',
    cursor: 'pointer',
    fontSize: isMobile ? '12px' : '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#374151'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white'
  };

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Mobile: center alignment
        padding: '0 16px',
        zIndex: 1000,
        gap: '12px'
      }}>
        {/* Left: Menu toggle */}
        <button
          onClick={onTogglePanel}
          style={{
            ...buttonStyle,
            position: 'absolute',
            left: '16px'
          }}
        >
          {isPanelCollapsed ? '☰' : '✕'}
        </button>

        {/* Center: Template name */}
        <div style={{
          fontWeight: '600',
          fontSize: '16px',
          color: '#111827',
          textAlign: 'center',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {templateName || 'Form Builder'}
        </div>

        {/* Right: Actions */}
        <div style={{
          position: 'absolute',
          right: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <button onClick={onPreview} style={buttonStyle}>
            👁️
          </button>
          <button onClick={onSave} style={primaryButtonStyle}>
            💾
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000
    }}>
      {/* Left Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onTogglePanel}
          style={{
            ...buttonStyle,
            padding: '8px'
          }}
          title={isPanelCollapsed ? 'Show component palette' : 'Hide component palette'}
        >
          {isPanelCollapsed ? '☰' : '◀'}
        </button>

        <div style={{
          height: '24px',
          width: '1px',
          background: '#e5e7eb'
        }} />

        <h1 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827'
        }}>
          {templateName || 'Form Builder'}
        </h1>
      </div>

      {/* Right Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button onClick={onPreview} style={buttonStyle}>
          👁️ Preview
        </button>

        <button onClick={onExport} style={buttonStyle}>
          📤 Export
        </button>

        <button onClick={onSave} style={primaryButtonStyle}>
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default FixedTopBar;