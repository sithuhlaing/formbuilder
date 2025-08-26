
export const enableTouchDragDrop = () => {
  let draggedElement: HTMLElement | null = null;
  let touchOffset = { x: 0, y: 0 };

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.draggable) {
      draggedElement = target;
      const touch = e.touches[0];
      const rect = target.getBoundingClientRect();
      touchOffset.x = touch.clientX - rect.left;
      touchOffset.y = touch.clientY - rect.top;
      
      target.style.opacity = '0.5';
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    draggedElement.style.position = 'fixed';
    draggedElement.style.left = `${touch.clientX - touchOffset.x}px`;
    draggedElement.style.top = `${touch.clientY - touchOffset.y}px`;
    draggedElement.style.zIndex = '1000';
    
    e.preventDefault();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!draggedElement) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Reset styles
    draggedElement.style.position = '';
    draggedElement.style.left = '';
    draggedElement.style.top = '';
    draggedElement.style.zIndex = '';
    draggedElement.style.opacity = '';
    
    // Trigger drop event if over valid drop zone
    if (elementBelow && elementBelow.classList.contains('drop-zone')) {
      const dropEvent = new CustomEvent('touchdrop', {
        detail: { draggedElement, dropZone: elementBelow }
      });
      elementBelow.dispatchEvent(dropEvent);
    }
    
    draggedElement = null;
  };

  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
};
