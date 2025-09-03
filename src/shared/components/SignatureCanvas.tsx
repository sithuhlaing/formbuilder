/**
 * Enhanced Signature Canvas Component
 * Provides full signature capture functionality with touch and mouse support
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignatureCanvasProps {
  value?: string;
  onChange?: (signature: string) => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  value,
  onChange,
  width = 400,
  height = 150,
  readOnly = false,
  className = '',
  placeholder = 'Sign here'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Set up drawing properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    return ctx;
  }, []);

  // Load existing signature
  useEffect(() => {
    if (value && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value, getContext]);

  // Get coordinates relative to canvas
  const getCoordinates = useCallback((event: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
  }, []);

  // Start drawing
  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (readOnly) return;
    
    event.preventDefault();
    setIsDrawing(true);
    
    const ctx = getContext();
    if (!ctx) return;
    
    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [readOnly, getContext, getCoordinates]);

  // Continue drawing
  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || readOnly) return;
    
    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    
    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, readOnly, getContext, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || readOnly) return;
    
    event.preventDefault();
    setIsDrawing(false);
    setHasSignature(true);
    
    // Export signature as base64
    const canvas = canvasRef.current;
    if (canvas && onChange) {
      const dataURL = canvas.toDataURL('image/png');
      onChange(dataURL);
    }
  }, [isDrawing, readOnly, onChange]);

  // Clear signature
  const clearSignature = useCallback(() => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange?.('');
  }, [readOnly, getContext, onChange]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e);
    const handleMouseLeave = (e: MouseEvent) => stopDrawing(e);

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e);

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  return (
    <div className={`signature-container ${className}`}>
      <div className="signature-canvas-wrapper" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="signature-canvas"
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
            cursor: readOnly ? 'default' : 'crosshair',
            touchAction: 'none'
          }}
        />
        
        {!hasSignature && !readOnly && (
          <div 
            className="signature-placeholder"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#9ca3af',
              fontSize: '14px',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {placeholder}
          </div>
        )}
      </div>
      
      {!readOnly && (
        <div className="signature-actions" style={{ marginTop: '8px', textAlign: 'right' }}>
          <button
            type="button"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="btn btn--secondary btn--sm"
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: hasSignature ? '#ffffff' : '#f9fafb',
              color: hasSignature ? '#374151' : '#9ca3af',
              cursor: hasSignature ? 'pointer' : 'not-allowed'
            }}
          >
            Clear Signature
          </button>
        </div>
      )}
    </div>
  );
};
