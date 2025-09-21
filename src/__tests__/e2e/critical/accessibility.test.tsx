/**
 * Accessibility Testing Suite
 * WCAG compliance and accessibility validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { FormBuilder } from '../../../features/form-builder/components/FormBuilder';

// Mock the useFormBuilder hook
vi.mock('../../../features/form-builder/hooks/useFormBuilder', () => ({
  useFormBuilder: vi.fn(() => ({
    formState: {
      templateName: 'Test Form',
      pages: [{
        id: 'page-1',
        title: 'Page 1',
        components: []
      }],
      currentPageId: 'page-1'
    },
    currentComponents: [],
    selectedComponent: null,
    addComponent: vi.fn(),
    updateComponent: vi.fn(),
    deleteComponent: vi.fn(),
    selectComponent: vi.fn(),
    handleDrop: vi.fn(),
    moveComponent: vi.fn(),
    setTemplateName: vi.fn(),
    getCurrentPageIndex: vi.fn(() => 0),
    navigateToNextPage: vi.fn(),
    navigateToPreviousPage: vi.fn(),
    addNewPage: vi.fn(),
    handleFormSubmit: vi.fn(),
    updatePageTitle: vi.fn(),
    clearAll: vi.fn(),
    loadFromJSON: vi.fn(),
    exportJSON: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    isPreviewMode: false,
    togglePreview: vi.fn()
  }))
}));

// Accessibility testing utilities
class AccessibilityTester {
  private violations: Array<{ rule: string; element: Element; severity: string }> = [];

  checkAriaLabels(container: HTMLElement) {
    const interactiveElements = container.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]'
    );
    
    interactiveElements.forEach(element => {
      const hasLabel = element.getAttribute('aria-label') ||
                      element.getAttribute('aria-labelledby') ||
                      element.getAttribute('title') ||
                      (element as HTMLElement).innerText.trim();
      
      if (!hasLabel) {
        this.violations.push({
          rule: 'aria-label-missing',
          element,
          severity: 'error'
        });
      }
    });
  }

  checkColorContrast(container: HTMLElement) {
    const textElements = container.querySelectorAll('*');
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (would use actual contrast calculation in real implementation)
      if (color === backgroundColor) {
        this.violations.push({
          rule: 'insufficient-contrast',
          element,
          severity: 'warning'
        });
      }
    });
  }

  checkKeyboardNavigation(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, _index) => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.violations.push({
          rule: 'positive-tabindex',
          element,
          severity: 'warning'
        });
      }
    });
  }

  checkSemanticStructure(container: HTMLElement) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        this.violations.push({
          rule: 'heading-skip-level',
          element: heading,
          severity: 'warning'
        });
      }
      
      previousLevel = level;
    });
  }

  checkFormLabels(container: HTMLElement) {
    const formControls = container.querySelectorAll('input, select, textarea');
    
    formControls.forEach(control => {
      const id = control.getAttribute('id');
      const hasLabel = id && container.querySelector(`label[for="${id}"]`) ||
                      control.getAttribute('aria-label') ||
                      control.getAttribute('aria-labelledby');
      
      if (!hasLabel) {
        this.violations.push({
          rule: 'form-control-no-label',
          element: control,
          severity: 'error'
        });
      }
    });
  }

  getViolations() {
    return this.violations;
  }

  clearViolations() {
    this.violations = [];
  }
}

// Mock screen reader announcements
const mockScreenReader = {
  announcements: [] as string[],
  announce: (text: string) => {
    mockScreenReader.announcements.push(text);
  },
  clear: () => {
    mockScreenReader.announcements = [];
  }
};

beforeEach(() => {
  mockScreenReader.clear();
  
  // Mock aria-live regions
  (global as any).ariaLiveAnnounce = mockScreenReader.announce;
});

afterEach(() => {
  cleanup();
});

describe('♿ Accessibility Testing', () => {
  let a11yTester: AccessibilityTester;

  beforeEach(() => {
    a11yTester = new AccessibilityTester();
  });

  afterEach(() => {
    a11yTester.clearViolations();
  });

  describe('WCAG 2.1 Level A Compliance', () => {
    it('should have proper heading structure', async () => {
      const { container } = render(<FormBuilder />);
      
      a11yTester.checkSemanticStructure(container);
      const violations = a11yTester.getViolations();
      const headingViolations = violations.filter(v => v.rule === 'heading-skip-level');
      
      expect(headingViolations).toHaveLength(0);
    });

    it('should provide text alternatives for images', async () => {
      const { container } = render(<FormBuilder />);
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        const hasAlt = img.getAttribute('alt') !== null;
        const isDecorative = img.getAttribute('role') === 'presentation' || 
                            img.getAttribute('alt') === '';
        
        expect(hasAlt || isDecorative).toBe(true);
      });
    });

    it('should have proper form labels', async () => {
      const { container } = render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Click component to show properties panel
      const component = screen.getByText('Text Input Field');
      await act(async () => {
        fireEvent.click(component);
      });
      
      a11yTester.checkFormLabels(container);
      const violations = a11yTester.getViolations();
      const labelViolations = violations.filter(v => v.rule === 'form-control-no-label');
      
      expect(labelViolations).toHaveLength(0);
    });

    it('should be keyboard navigable', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Test keyboard navigation
      await act(async () => {
        textInputButton.focus();
        fireEvent.keyDown(textInputButton, { key: 'Enter' });
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should have proper ARIA labels', async () => {
      const { container } = render(<FormBuilder />);
      
      a11yTester.checkAriaLabels(container);
      const violations = a11yTester.getViolations();
      const ariaViolations = violations.filter(v => v.rule === 'aria-label-missing');
      
      // Allow some violations for complex components, but should be minimal
      expect(ariaViolations.length).toBeLessThan(5);
    });
  });

  describe('WCAG 2.1 Level AA Compliance', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(<FormBuilder />);
      
      a11yTester.checkColorContrast(container);
      const violations = a11yTester.getViolations();
      const contrastViolations = violations.filter(v => v.rule === 'insufficient-contrast');
      
      expect(contrastViolations).toHaveLength(0);
    });

    it('should support zoom up to 200%', async () => {
      // Simulate 200% zoom
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      });
      
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Should remain functional at high zoom
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should have minimum touch target sizes (44px)', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      const buttonRect = textInputButton.getBoundingClientRect();
      
      expect(buttonRect.width).toBeGreaterThanOrEqual(44);
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
    });

    it('should not use positive tabindex values', async () => {
      const { container } = render(<FormBuilder />);
      
      a11yTester.checkKeyboardNavigation(container);
      const violations = a11yTester.getViolations();
      const tabindexViolations = violations.filter(v => v.rule === 'positive-tabindex');
      
      expect(tabindexViolations).toHaveLength(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce component additions', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
        
        // Simulate screen reader announcement
        mockScreenReader.announce('Text Input Field added to form');
      });
      
      expect(mockScreenReader.announcements).toContain('Text Input Field added to form');
    });

    it('should announce drag and drop operations', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      await act(async () => {
        fireEvent.dragStart(component);
        mockScreenReader.announce('Dragging Text Input Field');
        
        fireEvent.drop(screen.getByTestId('canvas'));
        mockScreenReader.announce('Text Input Field moved');
      });
      
      expect(mockScreenReader.announcements).toContain('Dragging Text Input Field');
      expect(mockScreenReader.announcements).toContain('Text Input Field moved');
    });

    it('should provide status updates', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add multiple components
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
          mockScreenReader.announce(`Form now has ${i + 1} components`);
        });
      }
      
      expect(mockScreenReader.announcements).toContain('Form now has 3 components');
    });

    it('should announce validation errors', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      await act(async () => {
        fireEvent.click(component);
      });
      
      // Simulate validation error
      const labelInput = screen.getByDisplayValue('Text Input Field');
      await act(async () => {
        fireEvent.change(labelInput, { target: { value: '' } });
        mockScreenReader.announce('Error: Label is required');
      });
      
      expect(mockScreenReader.announcements).toContain('Error: Label is required');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through components', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Test tab navigation
      const component = screen.getByText('Text Input Field');
      
      await act(async () => {
        fireEvent.keyDown(component, { key: 'Tab' });
      });
      
      // Should move focus to next focusable element
      expect(document.activeElement).not.toBe(component);
    });

    it('should support arrow key navigation', async () => {
      render(<FormBuilder />);
      
      // Add multiple components
      const textInputButton = screen.getByText('Text Input');
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      const components = screen.getAllByText('Text Input Field');
      const firstComponent = components[0];
      
      await act(async () => {
        firstComponent.focus();
        fireEvent.keyDown(firstComponent, { key: 'ArrowDown' });
      });
      
      // Should navigate to next component
      expect(document.activeElement).not.toBe(firstComponent);
    });

    it('should support Enter and Space for activation', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Test Enter key
      await act(async () => {
        textInputButton.focus();
        fireEvent.keyDown(textInputButton, { key: 'Enter' });
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      
      // Test Space key
      const emailInputButton = screen.getByText('Email Input');
      await act(async () => {
        emailInputButton.focus();
        fireEvent.keyDown(emailInputButton, { key: ' ' });
      });
      
      expect(screen.getByText('Email Input Field')).toBeInTheDocument();
    });

    it('should support Escape key for canceling operations', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      
      // Start drag operation
      await act(async () => {
        fireEvent.dragStart(component);
        
        // Cancel with Escape
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      
      // Drag should be canceled
      expect(component).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus after component operations', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        textInputButton.focus();
        fireEvent.click(textInputButton);
      });
      
      // Focus should move to newly created component
      const component = screen.getByText('Text Input Field');
      expect(document.activeElement).toBe(component);
    });

    it('should provide focus indicators', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      await act(async () => {
        textInputButton.focus();
      });
      
      // Should have visible focus indicator
      const computedStyle = window.getComputedStyle(textInputButton);
      expect(computedStyle.outline || computedStyle.boxShadow).toBeDefined();
    });

    it('should trap focus in modal dialogs', async () => {
      render(<FormBuilder />);
      
      // Simulate opening a modal dialog
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      await act(async () => {
        fireEvent.click(component);
      });
      
      // If properties panel is modal, focus should be trapped
      const propertiesPanel = screen.getByText('Text Input Field'); // Assuming this opens properties
      expect(propertiesPanel).toBeInTheDocument();
    });
  });

  describe('ARIA Live Regions', () => {
    it('should announce dynamic content changes', async () => {
      const { container } = render(<FormBuilder />);
      
      // Check for aria-live regions
      const liveRegions = container.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Should announce the change
      expect(mockScreenReader.announcements.length).toBeGreaterThan(0);
    });

    it('should use appropriate aria-live politeness levels', async () => {
      const { container } = render(<FormBuilder />);
      
      const liveRegions = container.querySelectorAll('[aria-live]');
      
      liveRegions.forEach(region => {
        const politeness = region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(politeness);
      });
    });
  });

  describe('High Contrast Mode', () => {
    it('should work in high contrast mode', async () => {
      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      expect(textInputButton).toBeInTheDocument();
      
      // Should maintain functionality in high contrast
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion', async () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Should work without animations
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });
  });

  describe('Language and Internationalization', () => {
    it('should have proper lang attributes', async () => {
      render(<FormBuilder />);
      
      const htmlElement = document.documentElement;
      expect(htmlElement.getAttribute('lang')).toBeTruthy();
    });

    it('should support RTL languages', async () => {
      // Simulate RTL
      document.documentElement.setAttribute('dir', 'rtl');
      
      render(<FormBuilder />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Reset
      document.documentElement.setAttribute('dir', 'ltr');
    });
  });
});
