/**
 * Responsive Drawer Components for Mobile Layout
 */

import React, { useState, useEffect } from 'react';

interface DrawerToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  side: 'left' | 'right';
  icon?: string;
  label?: string;
}

export const DrawerToggle: React.FC<DrawerToggleProps> = ({
  isOpen,
  onToggle,
  side,
  icon,
  label
}) => {
  return (
    <button
      className={`drawer-toggle drawer-toggle--${side} ${isOpen ? 'drawer-toggle--active' : ''}`}
      onClick={onToggle}
      aria-label={label || `Toggle ${side} panel`}
      title={label || `Toggle ${side} panel`}
    >
      <span className="drawer-toggle__icon">
        {icon || (side === 'left' ? '☰' : '⚙️')}
      </span>
      {label && <span className="drawer-toggle__label">{label}</span>}
    </button>
  );
};

interface DrawerOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

export const DrawerOverlay: React.FC<DrawerOverlayProps> = ({
  isVisible,
  onClick
}) => {
  return (
    <div
      className={`drawer-overlay ${isVisible ? 'drawer-overlay--visible' : ''}`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

interface ResponsiveDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  className?: string;
}

export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  children,
  isOpen,
  onClose,
  side,
  className = ''
}) => {
  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <DrawerOverlay isVisible={isOpen} onClick={onClose} />
      <div
        className={`responsive-drawer responsive-drawer--${side} ${
          isOpen ? 'responsive-drawer--open' : ''
        } ${className}`}
      >
        <div className="responsive-drawer__header">
          <button
            className="responsive-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="responsive-drawer__content">
          {children}
        </div>
      </div>
    </>
  );
};

interface MobileDrawerManagerProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  children: React.ReactNode;
}

export const MobileDrawerManager: React.FC<MobileDrawerManagerProps> = ({
  leftPanelContent,
  rightPanelContent,
  children
}) => {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawers when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setLeftDrawerOpen(false);
      setRightDrawerOpen(false);
    }
  }, [isMobile]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-drawer-manager">
      {/* Mobile Toggle Buttons */}
      <div className="mobile-toggles">
        <DrawerToggle
          isOpen={leftDrawerOpen}
          onToggle={() => setLeftDrawerOpen(!leftDrawerOpen)}
          side="left"
          icon="☰"
          label="Components"
        />
        <DrawerToggle
          isOpen={rightDrawerOpen}
          onToggle={() => setRightDrawerOpen(!rightDrawerOpen)}
          side="right"
          icon="⚙️"
          label="Properties"
        />
      </div>

      {/* Main Content */}
      {children}

      {/* Left Drawer */}
      <ResponsiveDrawer
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        side="left"
        className="component-palette-drawer"
      >
        {leftPanelContent}
      </ResponsiveDrawer>

      {/* Right Drawer */}
      <ResponsiveDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        side="right"
        className="properties-panel-drawer"
      >
        {rightPanelContent}
      </ResponsiveDrawer>
    </div>
  );
};
