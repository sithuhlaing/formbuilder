import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface MobileDragDropManagerProps {
  children: React.ReactNode;
}

// HTML5 backend options for all devices
const html5BackendOptions = {
  enableMouseEvents: true
};

export const MobileDragDropManager: React.FC<MobileDragDropManagerProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device and touch capability
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsMobile(isTouchDevice && (isSmallScreen || isMobileUA));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced drag state management for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleDragStart = () => {
      setIsDragging(true);
      document.body.classList.add('mobile-dragging');
      
      // Prevent scrolling during drag
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Clear any existing timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };

    const handleDragEnd = () => {
      // Delay drag end to ensure smooth transitions
      dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
        document.body.classList.remove('mobile-dragging');
        
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }, 100);
    };

    // Listen for touch drag events
    document.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('touchcancel', handleDragEnd);

    return () => {
      document.removeEventListener('touchstart', handleDragStart);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
      
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [isMobile]);

  // Prevent context menu on long press during drag
  useEffect(() => {
    if (!isMobile) return;

    const preventContextMenu = (e: Event) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, [isMobile, isDragging]);

  // Use HTML5Backend for all devices (works well with touch events)
  const backend = HTML5Backend;
  const backendOptions = html5BackendOptions;

  return (
    <DndProvider backend={backend} options={backendOptions}>
      <div 
        className={`mobile-drag-drop-manager ${isMobile ? 'mobile-mode' : 'desktop-mode'} ${isDragging ? 'is-dragging' : ''}`}
        data-mobile={isMobile}
        data-dragging={isDragging}
      >
        {children}
      </div>
    </DndProvider>
  );
};
