import React, { useRef, useState, useEffect } from "react";

export default function SignatureRenderer({ component, previewMode = false }: { component: any, previewMode?: boolean }) {
  const { label, required } = component.properties;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSigned, setHasSigned] = useState<boolean>(false);

  // Resize canvas to fill the parent container dynamically on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = 128; // fixed height matching h-32

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000"; // Solid black signature color
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Support Touch Events
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    // Support Mouse Events
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!previewMode) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setHasSigned(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
      }
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 select-none">
        {label || "Signature Pad"}
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>
      
      <div 
        ref={containerRef}
        className="border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 h-32 relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 z-10 touch-none ${
            previewMode ? "cursor-crosshair" : "cursor-default"
          }`}
        />

        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none select-none">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 mb-2 opacity-55"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <p className="text-xs">Draw your signature here</p>
            </div>
          </div>
        )}
      </div>

      {previewMode && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
          >
            Clear Pad
          </button>
        </div>
      )}
    </div>
  );
}
