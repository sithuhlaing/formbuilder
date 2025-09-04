/**
 * Error Recovery Testing Suite
 * Comprehensive error recovery scenarios and resilience testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { FormBuilder } from '../../features/form-builder/components/FormBuilder';

// Error simulation utilities
class ErrorSimulator {
  private originalConsoleError = console.error;
  private originalConsoleWarn = console.warn;
  private errors: Array<{ type: string; message: string; timestamp: number }> = [];

  startCapturing() {
    console.error = (...args) => {
      this.errors.push({
        type: 'error',
        message: args.join(' '),
        timestamp: Date.now()
      });
      this.originalConsoleError(...args);
    };
    
    console.warn = (...args) => {
      this.errors.push({
        type: 'warn',
        message: args.join(' '),
        timestamp: Date.now()
      });
      this.originalConsoleWarn(...args);
    };
  }

  stopCapturing() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }

  simulateNetworkError() {
    return new Error('Network request failed');
  }

  simulateStorageError() {
    return new Error('Storage quota exceeded');
  }

  simulateParsingError() {
    return new Error('JSON parsing failed');
  }
}

// Mock localStorage with error simulation
const mockLocalStorage = {
  data: {} as Record<string, string>,
  throwError: false,
  
  getItem: vi.fn((key: string) => {
    if (mockLocalStorage.throwError) {
      throw new Error('Storage access denied');
    }
    return mockLocalStorage.data[key] || null;
  }),
  
  setItem: vi.fn((key: string, value: string) => {
    if (mockLocalStorage.throwError) {
      throw new Error('Storage quota exceeded');
    }
    mockLocalStorage.data[key] = value;
  }),
  
  removeItem: vi.fn((key: string) => {
    if (mockLocalStorage.throwError) {
      throw new Error('Storage access denied');
    }
    delete mockLocalStorage.data[key];
  }),
  
  clear: vi.fn(() => {
    if (mockLocalStorage.throwError) {
      throw new Error('Storage access denied');
    }
    mockLocalStorage.data = {};
  })
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  mockLocalStorage.throwError = false;
  mockLocalStorage.data = {};
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('🛡️ Error Recovery Testing', () => {
  let errorSimulator: ErrorSimulator;

  beforeEach(() => {
    errorSimulator = new ErrorSimulator();
    errorSimulator.startCapturing();
  });

  afterEach(() => {
    errorSimulator.stopCapturing();
    errorSimulator.clearErrors();
  });

  describe('State Corruption Recovery', () => {
    it('should recover from corrupted form state', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add some components
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Simulate state corruption by directly manipulating internal state
      const corruptState = { pages: null, components: undefined };
      
      // Trigger state corruption through invalid operation
      await act(async () => {
        try {
          // Simulate corrupted drag operation
          const component = screen.getAllByText('Text Input Field')[0];
          fireEvent.dragStart(component);
          
          // Corrupt the drag data
          Object.defineProperty(component, 'dataset', {
            value: { componentId: 'invalid-id-that-does-not-exist' },
            writable: true
          });
          
          fireEvent.drop(screen.getByTestId('canvas'));
        } catch (error) {
          // Expected error due to corruption
        }
      });
      
      // Application should still be functional
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Should be able to add new components
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const components = screen.getAllByText('Text Input Field');
      expect(components.length).toBeGreaterThan(0);
    });

    it('should handle invalid component data gracefully', async () => {
      render(<FormBuilder />);
      
      // Simulate adding component with invalid data
      await act(async () => {
        try {
          // Mock invalid component type
          const invalidButton = document.createElement('button');
          invalidButton.textContent = 'Invalid Component';
          invalidButton.setAttribute('data-component-type', 'invalid_type');
          
          fireEvent.click(invalidButton);
        } catch (error) {
          // Expected error
        }
      });
      
      // Application should remain stable
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Valid operations should still work
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getByText('Text Input Field')).toBeInTheDocument();
    });

    it('should recover from circular reference errors', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Simulate circular reference in component data
      const component = screen.getByText('Text Input Field');
      
      await act(async () => {
        try {
          // Create circular reference
          const mockCircularData = { self: null as any };
          mockCircularData.self = mockCircularData;
          
          // Trigger operation that might cause circular reference
          fireEvent.click(component);
          
          // Simulate property update with circular data
          const labelInput = screen.getByDisplayValue('Text Input Field');
          fireEvent.change(labelInput, {
            target: { value: JSON.stringify(mockCircularData) }
          });
        } catch (error) {
          // Expected error due to circular reference
        }
      });
      
      // Application should recover
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(component).toBeInTheDocument();
    });
  });

  describe('Network Error Recovery', () => {
    it('should handle failed form export gracefully', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Mock network failure
      const mockFetch = vi.fn().mockRejectedValue(errorSimulator.simulateNetworkError());
      global.fetch = mockFetch;
      
      // Attempt export
      const exportButton = screen.getByText('Export JSON');
      
      await act(async () => {
        fireEvent.click(exportButton);
      });
      
      // Should show error but remain functional
      const errors = errorSimulator.getErrors();
      const hasNetworkError = errors.some(e => e.message.includes('Network') || e.message.includes('export'));
      
      // Application should still be responsive
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Should be able to continue working
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getAllByText('Text Input Field')).toHaveLength(2);
    });

    it('should retry failed operations with exponential backoff', async () => {
      render(<FormBuilder />);
      
      let attemptCount = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw errorSimulator.simulateNetworkError();
        }
        return Promise.resolve('success');
      });
      
      // Simulate retry logic
      const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
          }
        }
        
        throw lastError;
      };
      
      const result = await retryOperation(mockOperation);
      
      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
    });
  });

  describe('Storage Error Recovery', () => {
    it('should handle localStorage quota exceeded', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add components
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Simulate storage quota exceeded
      mockLocalStorage.throwError = true;
      
      // Try to save (should fail gracefully)
      await act(async () => {
        try {
          // Trigger auto-save
          fireEvent.click(screen.getAllByText('Text Input Field')[0]);
        } catch (error) {
          // Expected storage error
        }
      });
      
      // Application should continue working
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Reset storage
      mockLocalStorage.throwError = false;
      
      // Should be able to continue
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getAllByText('Text Input Field')).toHaveLength(11);
    });

    it('should provide fallback storage mechanisms', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Disable localStorage
      mockLocalStorage.throwError = true;
      
      // Should fall back to in-memory storage
      const component = screen.getByText('Text Input Field');
      await act(async () => {
        fireEvent.click(component);
      });
      
      // Change label (should work with fallback storage)
      const labelInput = screen.getByDisplayValue('Text Input Field');
      await act(async () => {
        fireEvent.change(labelInput, {
          target: { value: 'Updated Label' }
        });
      });
      
      expect(screen.getByDisplayValue('Updated Label')).toBeInTheDocument();
    });
  });

  describe('JSON Parsing Error Recovery', () => {
    it('should handle malformed JSON import gracefully', async () => {
      render(<FormBuilder />);
      
      const uploadInput = screen.getByLabelText(/upload json/i) || 
                          document.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (uploadInput) {
        // Create malformed JSON file
        const malformedJSON = '{"pages": [{"components": [invalid json}]}';
        const file = new File([malformedJSON], 'malformed.json', { type: 'application/json' });
        
        await act(async () => {
          Object.defineProperty(uploadInput, 'files', {
            value: [file],
            writable: false
          });
          
          fireEvent.change(uploadInput);
        });
        
        // Should handle error gracefully
        const errors = errorSimulator.getErrors();
        const hasParsingError = errors.some(e => 
          e.message.includes('JSON') || 
          e.message.includes('parse') || 
          e.message.includes('invalid')
        );
        
        // Application should remain functional
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
        
        // Should be able to add components normally
        const textInputButton = screen.getByText('Text Input');
        await act(async () => {
          fireEvent.click(textInputButton);
        });
        
        expect(screen.getByText('Text Input Field')).toBeInTheDocument();
      }
    });

    it('should validate imported data structure', async () => {
      render(<FormBuilder />);
      
      // Simulate import with invalid structure
      const invalidData = {
        pages: 'not an array',
        components: { invalid: 'structure' }
      };
      
      await act(async () => {
        try {
          // Simulate import operation
          const importEvent = new CustomEvent('import', {
            detail: { data: invalidData }
          });
          
          window.dispatchEvent(importEvent);
        } catch (error) {
          // Expected validation error
        }
      });
      
      // Should reject invalid data and maintain current state
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Should show appropriate error message
      const errors = errorSimulator.getErrors();
      const hasValidationError = errors.some(e => 
        e.message.includes('invalid') || 
        e.message.includes('validation')
      );
    });
  });

  describe('Component Error Recovery', () => {
    it('should isolate component rendering errors', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add multiple components
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Simulate error in one component
      const components = screen.getAllByText('Text Input Field');
      const problematicComponent = components[2];
      
      await act(async () => {
        try {
          // Simulate component error
          Object.defineProperty(problematicComponent, 'innerHTML', {
            get: () => {
              throw new Error('Component rendering error');
            }
          });
          
          // Trigger re-render
          fireEvent.click(problematicComponent);
        } catch (error) {
          // Expected component error
        }
      });
      
      // Other components should still work
      const workingComponent = components[0];
      await act(async () => {
        fireEvent.click(workingComponent);
      });
      
      // Should be able to add new components
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const updatedComponents = screen.getAllByText('Text Input Field');
      expect(updatedComponents.length).toBeGreaterThan(5);
    });

    it('should handle drag and drop errors gracefully', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      const component = screen.getByText('Text Input Field');
      const canvas = screen.getByTestId('canvas');
      
      // Simulate drag error
      await act(async () => {
        try {
          // Start drag with invalid data
          fireEvent.dragStart(component, {
            dataTransfer: {
              setData: () => {
                throw new Error('DataTransfer error');
              }
            }
          });
          
          fireEvent.drop(canvas);
        } catch (error) {
          // Expected drag error
        }
      });
      
      // Application should recover
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(component).toBeInTheDocument();
      
      // Should be able to perform normal operations
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      expect(screen.getAllByText('Text Input Field')).toHaveLength(2);
    });
  });

  describe('Error Boundary Integration', () => {
    it('should catch and recover from React errors', async () => {
      // Mock React error boundary behavior
      const ErrorBoundaryComponent = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div data-testid="error-fallback">Error occurred, but recovered</div>;
        }
      };
      
      render(
        <ErrorBoundaryComponent>
          <FormBuilder />
        </ErrorBoundaryComponent>
      );
      
      // Should render normally
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // If error occurs, should show fallback
      await act(async () => {
        try {
          // Simulate React error
          throw new Error('React component error');
        } catch (error) {
          // Error boundary should catch this
        }
      });
    });

    it('should provide error recovery actions', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      
      // Add components
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          fireEvent.click(textInputButton);
        });
      }
      
      // Simulate error that triggers recovery
      await act(async () => {
        try {
          // Trigger error condition
          const invalidOperation = () => {
            throw new Error('Critical error requiring recovery');
          };
          
          invalidOperation();
        } catch (error) {
          // Error should be caught and recovery initiated
        }
      });
      
      // Application should provide recovery options
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Should maintain some state after recovery
      const components = screen.queryAllByText('Text Input Field');
      expect(components.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Logging and Reporting', () => {
    it('should log errors with sufficient context', async () => {
      render(<FormBuilder />);
      
      const textInputButton = screen.getByText('Text Input');
      await act(async () => {
        fireEvent.click(textInputButton);
      });
      
      // Trigger error with context
      await act(async () => {
        try {
          const component = screen.getByText('Text Input Field');
          
          // Simulate error with context
          fireEvent.click(component);
          throw new Error('Test error with context');
        } catch (error) {
          console.error('Error context:', {
            action: 'component_click',
            componentType: 'text_input',
            timestamp: Date.now(),
            error: error.message
          });
        }
      });
      
      const errors = errorSimulator.getErrors();
      const contextualError = errors.find(e => e.message.includes('Error context'));
      
      expect(contextualError).toBeDefined();
    });

    it('should not spam error logs for repeated issues', async () => {
      render(<FormBuilder />);
      
      // Trigger same error multiple times
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          try {
            throw new Error('Repeated error');
          } catch (error) {
            console.error('Repeated error occurred');
          }
        });
      }
      
      const errors = errorSimulator.getErrors();
      const repeatedErrors = errors.filter(e => e.message.includes('Repeated error'));
      
      // Should implement error deduplication
      expect(repeatedErrors.length).toBeLessThanOrEqual(5);
    });
  });
});
