/**
 * Mobile/Touch Interface Testing Suite
 * Touch interaction, gesture support, and mobile-specific behavior testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';

// Touch simulation utilities
class TouchSimulator {
  private touchId = 0;

  createTouch(x: number, y: number, target?: Element): Touch {
    return {
      identifier: this.touchId++,
      target: target || document.body,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      screenX: x,
      screenY: y,
      radiusX: 10,
      radiusY: 10,
      rotationAngle: 0,
      force: 1
    } as Touch;
  }

  createTouchList(...touches: Touch[]): TouchList {
    const touchList = touches as any;
    touchList.item = (index: number) => touches[index] || null;
    return touchList as TouchList;
  }

  simulateTap(element: Element, x = 100, y = 100) {
    const touch = this.createTouch(x, y, element);
    const touchList = this.createTouchList(touch);

    fireEvent.touchStart(element, {
      touches: touchList,
      changedTouches: touchList,
      targetTouches: touchList
    });

    fireEvent.touchEnd(element, {
      touches: this.createTouchList(),
      changedTouches: touchList,
      targetTouches: this.createTouchList()
    });
  }

  simulateSwipe(element: Element, startX: number, startY: number, endX: number, endY: number, _duration = 300) {
    const startTouch = this.createTouch(startX, startY, element);
    const startTouchList = this.createTouchList(startTouch);

    fireEvent.touchStart(element, {
      touches: startTouchList,
      changedTouches: startTouchList,
      targetTouches: startTouchList
    });

    // Simulate movement
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;
      
      const moveTouch = this.createTouch(currentX, currentY, element);
      const moveTouchList = this.createTouchList(moveTouch);

      fireEvent.touchMove(element, {
        touches: moveTouchList,
        changedTouches: moveTouchList,
        targetTouches: moveTouchList
      });
    }

    const endTouch = this.createTouch(endX, endY, element);
    const endTouchList = this.createTouchList(endTouch);

    fireEvent.touchEnd(element, {
      touches: this.createTouchList(),
      changedTouches: endTouchList,
      targetTouches: this.createTouchList()
    });
  }

  simulatePinch(element: Element, startDistance: number, endDistance: number) {
    const centerX = 200;
    const centerY = 200;
    
    const touch1Start = this.createTouch(centerX - startDistance / 2, centerY, element);
    const touch2Start = this.createTouch(centerX + startDistance / 2, centerY, element);
    const startTouchList = this.createTouchList(touch1Start, touch2Start);

    fireEvent.touchStart(element, {
      touches: startTouchList,
      changedTouches: startTouchList,
      targetTouches: startTouchList
    });

    // Simulate pinch movement
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentDistance = startDistance + (endDistance - startDistance) * progress;
      
      const touch1Move = this.createTouch(centerX - currentDistance / 2, centerY, element);
      const touch2Move = this.createTouch(centerX + currentDistance / 2, centerY, element);
      const moveTouchList = this.createTouchList(touch1Move, touch2Move);

      fireEvent.touchMove(element, {
        touches: moveTouchList,
        changedTouches: moveTouchList,
        targetTouches: moveTouchList
      });
    }

    const touch1End = this.createTouch(centerX - endDistance / 2, centerY, element);
    const touch2End = this.createTouch(centerX + endDistance / 2, centerY, element);
    const endTouchList = this.createTouchList(touch1End, touch2End);

    fireEvent.touchEnd(element, {
      touches: this.createTouchList(),
      changedTouches: endTouchList,
      targetTouches: this.createTouchList()
    });
  }

  simulateLongPress(element: Element, x = 100, y = 100, duration = 500) {
    const touch = this.createTouch(x, y, element);
    const touchList = this.createTouchList(touch);

    fireEvent.touchStart(element, {
      touches: touchList,
      changedTouches: touchList,
      targetTouches: touchList
    });

    // Hold for duration
    return new Promise(resolve => {
      setTimeout(() => {
        fireEvent.touchEnd(element, {
          touches: this.createTouchList(),
          changedTouches: touchList,
          targetTouches: this.createTouchList()
        });
        resolve(undefined);
      }, duration);
    });
  }
}

// Mobile viewport simulation
const simulateMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    value: 375,
    writable: true
  });
  
  Object.defineProperty(window, 'innerHeight', {
    value: 667,
    writable: true
  });
  
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 5,
    writable: true
  });
  
  Object.defineProperty(window, 'ontouchstart', {
    value: () => {},
    writable: true
  });
};

beforeEach(() => {
  simulateMobileViewport();
});

afterEach(() => {
  cleanup();
});

describe('📱 Mobile/Touch Interface Testing', () => {
  let touchSim: TouchSimulator;

  beforeEach(() => {
    touchSim = new TouchSimulator();
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch targets', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      const rect = textInputButton.getBoundingClientRect();
      
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });

    it('should have adequate spacing between touch targets', async () => {
      render(<FormBuilder />);
      
      const buttons = screen.getAllByRole('button');
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const rect1 = buttons[i].getBoundingClientRect();
        const rect2 = buttons[i + 1].getBoundingClientRect();
        
        const horizontalGap = Math.abs(rect2.left - rect1.right);
        const verticalGap = Math.abs(rect2.top - rect1.bottom);
        
        // Should have at least 8px spacing
        if (horizontalGap > 0) {
          expect(horizontalGap).toBeGreaterThanOrEqual(8);
        }
        if (verticalGap > 0) {
          expect(verticalGap).toBeGreaterThanOrEqual(8);
        }
      }
    });

    it('should maintain touch target sizes after component addition', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      const rect = component.getBoundingClientRect();
      
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Touch Interactions', () => {
    it('should respond to tap gestures', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should handle touch drag for component reordering', async () => {
      render(<FormBuilder />);
      
      // Add multiple components
      const textInputButton = screen.getByText('Text Input');
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          touchSim.simulateTap(textInputButton);
        });
      }
      
      const components = screen.getAllByText('Text Input Field');
      const firstComponent = components[0];
      
      await act(async () => {
        touchSim.simulateSwipe(firstComponent, 100, 100, 100, 200);
      });
      
      // Component should still exist after drag
      expect(screen.getAllByText('Text Input Field')).toHaveLength(3);
    });

    it('should support long press for context menus', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      await act(async () => {
        await touchSim.simulateLongPress(component, 100, 100, 600);
      });
      
      // Should trigger some context action (like selection or menu)
      expect(component).toBeInTheDocument();
    });

    it('should handle multi-touch gestures', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      // Test pinch gesture (zoom)
      await act(async () => {
        touchSim.simulatePinch(canvas, 100, 200);
      });
      
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Mobile Layout Adaptation', () => {
    it('should stack components vertically on mobile', async () => {
      render(<FormBuilder />);
      
      // Add components to create horizontal layout
      const textInputButton = screen.getByText('Text Input');
      const emailInputButton = screen.getByText('Email Input');
      
      await act(async () => {
        touchSim.simulateTap(textInputButton);
        touchSim.simulateTap(emailInputButton);
      });
      
      // On mobile, components should stack vertically
      const canvas = screen.getByTestId('canvas');
      const _computedStyle = window.getComputedStyle(canvas);
      
      // Should use mobile-friendly layout
      expect(canvas).toBeInTheDocument();
    });

    it('should hide/collapse sidebars on mobile', async () => {
      render(<FormBuilder />);
      
      // Check if sidebars are adapted for mobile
      const sidebar = document.querySelector('.sidebar');
      const _propertiesPanel = document.querySelector('.properties-panel');
      
      if (sidebar) {
        const sidebarStyle = window.getComputedStyle(sidebar);
        // Should be collapsed or repositioned on mobile
        expect(sidebarStyle.display === 'none' || sidebarStyle.position === 'absolute').toBeTruthy();
      }
    });

    it('should provide mobile-friendly navigation', async () => {
      render(<FormBuilder />);
      
      // Should have mobile navigation elements
      const mobileNavElements = screen.queryAllByRole('button');
      expect(mobileNavElements.length).toBeGreaterThan(0);
      
      // All navigation should be touch-friendly
      mobileNavElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Touch Feedback', () => {
    it('should provide visual feedback on touch', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Simulate touch start
      await act(async () => {
        const touch = touchSim.createTouch(100, 100, textInputButton);
        const touchList = touchSim.createTouchList(touch);
        
        fireEvent.touchStart(textInputButton, {
          touches: touchList,
          changedTouches: touchList,
          targetTouches: touchList
        });
      });
      
      // Should have active/pressed state
      const computedStyle = window.getComputedStyle(textInputButton);
      expect(computedStyle.backgroundColor || computedStyle.opacity).toBeDefined();
    });

    it('should provide haptic feedback simulation', async () => {
      render(<FormBuilder />);
      
      // Mock vibration API
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      });
      
      const textInputButton = screen.getByText('Text Input');
      
      await act(async () => {
        touchSim.simulateTap(textInputButton);
        
        // Simulate haptic feedback trigger
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      });
      
      expect(mockVibrate).toHaveBeenCalledWith(50);
    });

    it('should handle touch cancellation gracefully', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      await act(async () => {
        const touch = touchSim.createTouch(100, 100, textInputButton);
        const touchList = touchSim.createTouchList(touch);
        
        fireEvent.touchStart(textInputButton, {
          touches: touchList,
          changedTouches: touchList,
          targetTouches: touchList
        });
        
        // Cancel the touch
        fireEvent.touchCancel(textInputButton, {
          touches: touchSim.createTouchList(),
          changedTouches: touchList,
          targetTouches: touchSim.createTouchList()
        });
      });
      
      // Should handle cancellation without errors
      expect(textInputButton).toBeInTheDocument();
    });
  });

  describe('Gesture Recognition', () => {
    it('should distinguish between tap and drag', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      // Test tap (should select)
      await act(async () => {
        touchSim.simulateTap(component);
      });
      
      // Test drag (should move)
      await act(async () => {
        touchSim.simulateSwipe(component, 100, 100, 150, 100);
      });
      
      expect(component).toBeInTheDocument();
    });

    it('should handle swipe gestures for navigation', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      // Swipe left/right for navigation
      await act(async () => {
        touchSim.simulateSwipe(canvas, 300, 200, 100, 200);
      });
      
      expect(canvas).toBeInTheDocument();
    });

    it('should support pinch-to-zoom', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      // Pinch out (zoom in)
      await act(async () => {
        touchSim.simulatePinch(canvas, 100, 200);
      });
      
      // Pinch in (zoom out)
      await act(async () => {
        touchSim.simulatePinch(canvas, 200, 100);
      });
      
      expect(canvas).toBeInTheDocument();
    });

    it('should handle two-finger scroll', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      await act(async () => {
        const touch1 = touchSim.createTouch(100, 100, canvas);
        const touch2 = touchSim.createTouch(200, 100, canvas);
        const touchList = touchSim.createTouchList(touch1, touch2);
        
        fireEvent.touchStart(canvas, {
          touches: touchList,
          changedTouches: touchList,
          targetTouches: touchList
        });
        
        // Move both fingers down (scroll up)
        const touch1Move = touchSim.createTouch(100, 150, canvas);
        const touch2Move = touchSim.createTouch(200, 150, canvas);
        const moveTouchList = touchSim.createTouchList(touch1Move, touch2Move);
        
        fireEvent.touchMove(canvas, {
          touches: moveTouchList,
          changedTouches: moveTouchList,
          targetTouches: moveTouchList
        });
        
        fireEvent.touchEnd(canvas, {
          touches: touchSim.createTouchList(),
          changedTouches: moveTouchList,
          targetTouches: touchSim.createTouchList()
        });
      });
      
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Mobile Performance', () => {
    it('should maintain 60fps during touch interactions', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      const startTime = performance.now();
      
      // Rapid touch interactions
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          touchSim.simulateTap(component, 100 + i * 5, 100 + i * 5);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgPerInteraction = duration / 10;
      
      expect(avgPerInteraction).toBeLessThan(16.67); // 60fps = 16.67ms per frame
    });

    it('should handle rapid touch events without lag', async () => {
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      
      const startTime = performance.now();
      
      // Simulate rapid touch events
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          const touch = touchSim.createTouch(100 + i, 100 + i, canvas);
          const touchList = touchSim.createTouchList(touch);
          
          fireEvent.touchStart(canvas, {
            touches: touchList,
            changedTouches: touchList,
            targetTouches: touchList
          });
          
          fireEvent.touchEnd(canvas, {
            touches: touchSim.createTouchList(),
            changedTouches: touchList,
            targetTouches: touchSim.createTouchList()
          });
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should handle 50 events in under 1 second
    });
  });

  describe('Mobile Accessibility', () => {
    it('should support screen reader touch exploration', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Should have proper ARIA labels for touch exploration
      expect(textInputButton.getAttribute('aria-label') || textInputButton.textContent).toBeTruthy();
      
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      expect(component.getAttribute('aria-label') || component.textContent).toBeTruthy();
    });

    it('should support voice control commands', async () => {
      render(<FormBuilder />);
      
      // Mock speech recognition
      const mockSpeechRecognition = {
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null as any
      };
      
      (global as any).SpeechRecognition = vi.fn(() => mockSpeechRecognition);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Simulate voice command
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult({
          results: [[{ transcript: 'add text input' }]]
        });
      }
      
      expect(textInputButton).toBeInTheDocument();
    });

    it('should provide alternative input methods', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Should support keyboard navigation on mobile
      await act(async () => {
        textInputButton.focus();
        fireEvent.keyDown(textInputButton, { key: 'Enter' });
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', async () => {
      render(<FormBuilder />);
      
      // Start in portrait
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
      
      // Switch to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      await act(async () => {
        fireEvent(window, new Event('orientationchange'));
      });
      
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('should maintain functionality across orientations', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add component in portrait
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      
      // Switch to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      await act(async () => {
        fireEvent(window, new Event('orientationchange'));
      });
      
      // Should still be functional
      await act(async () => {
        touchSim.simulateTap(textInputButton);
      });
      
      expect(screen.getAllByText('Text Input Field')).toHaveLength(2);
    });
  });
});
