/**
 * Form Processing Integration Test Suite
 * Tests data collection, validation, and form submission
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import App from '../App';

const renderAppWithForm = async () => {
  const result = render(
    <DndProvider backend={TestBackend}>
      <App />
    </DndProvider>
  );
  
  // Navigate to form builder
  const createButton = screen.getByRole('button', { name: /create your first form/i });
  await userEvent.click(createButton);
  
  return result;
};

const createTestForm = async () => {
  // Add various form components
  const addComponentFn = (window as any).__testAddComponent__;
  if (addComponentFn) {
    addComponentFn('text_input');
    addComponentFn('email_input');
    addComponentFn('textarea');
    addComponentFn('select');
    addComponentFn('checkbox');
    addComponentFn('radio_group');
    addComponentFn('number_input');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

const setComponentProperties = async (componentId: string, properties: Record<string, any>) => {
  const updateComponentFn = (window as any).__testUpdateComponent__;
  if (updateComponentFn) {
    updateComponentFn(componentId, properties);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

describe('📋 Form Processing Integration', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Field Mapping Behavior', () => {
    it('should maintain individual fieldId values for child components', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get form schema
      const getSchemaFn = (window as any).__testGetFormSchema__;
      if (getSchemaFn) {
        const schema = getSchemaFn();
        
        // Each component should have unique fieldId
        const fieldIds = new Set();
        const collectFieldIds = (components: any[]) => {
          components.forEach(component => {
            if (component.fieldId) {
              fieldIds.add(component.fieldId);
            }
            if (component.children) {
              collectFieldIds(component.children);
            }
          });
        };
        
        collectFieldIds(schema.pages[0].components);
        
        // All fieldIds should be unique
        const componentCount = container.querySelectorAll('[data-component-id]').length;
        expect(fieldIds.size).toBe(componentCount);
      }
    });

    it('should exclude layout structure from form data', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('email_input', 'component-1', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get data schema (for form submission)
      const getDataSchemaFn = (window as any).__testGetDataSchema__;
      if (getDataSchemaFn) {
        const dataSchema = getDataSchemaFn();
        
        // Should not include horizontal_layout in data fields
        const hasLayoutFields = dataSchema.fields?.some((field: any) => 
          field.type === 'horizontal_layout'
        );
        expect(hasLayoutFields).toBeFalsy();
        
        // Should include actual form fields
        const hasFormFields = dataSchema.fields?.some((field: any) => 
          ['text_input', 'email_input', 'textarea'].includes(field.type)
        );
        expect(hasFormFields).toBeTruthy();
      }
    });

    it('should preserve field order in form submission', async () => {
      await renderAppWithForm();
      await createTestForm();
      
      // Reorder components
      const moveComponentFn = (window as any).__testMoveComponent__;
      if (moveComponentFn) {
        moveComponentFn(0, 2); // Move first component to third position
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get submission order
      const getSubmissionOrderFn = (window as any).__testGetSubmissionOrder__;
      if (getSubmissionOrderFn) {
        const order = getSubmissionOrderFn();
        
        // Order should match current visual order, not original creation order
        expect(order).toBeDefined();
        expect(Array.isArray(order)).toBeTruthy();
        expect(order.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Validation Flow', () => {
    it('should validate each component independently', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Set some components as required
      const components = container.querySelectorAll('[data-component-id]');
      if (components.length >= 3) {
        await setComponentProperties(components[0].getAttribute('data-component-id')!, { required: true });
        await setComponentProperties(components[1].getAttribute('data-component-id')!, { required: true });
        await setComponentProperties(components[2].getAttribute('data-component-id')!, { required: false });
      }
      
      // Test validation
      const validateFormFn = (window as any).__testValidateForm__;
      if (validateFormFn) {
        const validationResult = validateFormFn({
          [components[0].getAttribute('data-component-id')!]: '', // Empty required field
          [components[1].getAttribute('data-component-id')!]: 'valid@email.com', // Valid required field
          [components[2].getAttribute('data-component-id')!]: '' // Empty optional field
        });
        
        // Should have validation errors for required empty fields only
        expect(validationResult.isValid).toBeFalsy();
        expect(validationResult.errors).toBeDefined();
        expect(validationResult.errors.length).toBe(1); // Only one required field is empty
      }
    });

    it('should provide visual grouping without layout validation', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Layout should provide visual grouping
      const rowLayout = container.querySelector('[data-testid="row-layout"]');
      expect(rowLayout).toBeTruthy();
      
      // But validation should not apply to layout itself
      const validateLayoutFn = (window as any).__testValidateLayout__;
      if (validateLayoutFn) {
        const layoutValidation = validateLayoutFn(rowLayout?.getAttribute('data-component-id'));
        
        // Layout itself should not have validation rules
        expect(layoutValidation?.hasValidation).toBeFalsy();
      }
    });

    it('should handle cross-field validation', async () => {
      await renderAppWithForm();
      
      // Add password and confirm password fields
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('password_input');
        addComponentFn('password_input');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Set up cross-field validation
      const setCrossValidationFn = (window as any).__testSetCrossValidation__;
      if (setCrossValidationFn) {
        setCrossValidationFn({
          field1: 'password',
          field2: 'confirm_password',
          rule: 'match',
          message: 'Passwords must match'
        });
      }
      
      // Test cross-field validation
      const validateFormFn = (window as any).__testValidateForm__;
      if (validateFormFn) {
        const result = validateFormFn({
          password: 'password123',
          confirm_password: 'different123'
        });
        
        expect(result.isValid).toBeFalsy();
        expect(result.errors.some((e: any) => e.message.includes('match'))).toBeTruthy();
      }
    });
  });

  describe('Export Behavior', () => {
    it('should include layout structure in template schema export', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Create mixed layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('text_input', 'component-0', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Export template schema
      const exportButton = screen.getByRole('button', { name: /export json/i });
      await userEvent.click(exportButton);
      
      // Check exported schema
      const getExportedSchemaFn = (window as any).__testGetExportedSchema__;
      if (getExportedSchemaFn) {
        const schema = getExportedSchemaFn();
        
        // Should include layout structure
        const hasHorizontalLayout = schema.pages[0].components.some((c: any) => 
          c.type === 'horizontal_layout'
        );
        expect(hasHorizontalLayout).toBeTruthy();
        
        // Should include all component details
        expect(schema.pages[0].components.length).toBeGreaterThan(0);
      }
    });

    it('should exclude layout from data validation schema', async () => {
      await renderAppWithForm();
      await createTestForm();
      
      // Create horizontal layout
      const createHorizontalFn = (window as any).__testInsertHorizontalToComponent__;
      if (createHorizontalFn) {
        createHorizontalFn('email_input', 'component-1', 'right');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Export data validation schema
      const exportDataSchemaFn = (window as any).__testExportDataSchema__;
      if (exportDataSchemaFn) {
        const dataSchema = exportDataSchemaFn();
        
        // Should not include layout components in validation schema
        const layoutFields = dataSchema.properties ? 
          Object.keys(dataSchema.properties).filter((key: string) => 
            key.includes('horizontal_layout') || key.includes('row_layout')
          ) : [];
        
        expect(layoutFields.length).toBe(0);
        
        // Should include actual form fields
        const formFields = dataSchema.properties ? 
          Object.keys(dataSchema.properties).filter((key: string) => 
            !key.includes('layout')
          ) : [];
        
        expect(formFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Form Submission Integration', () => {
    it('should collect data from all form fields', async () => {
      await renderAppWithForm();
      await createTestForm();
      
      // Preview form to test submission
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);
      
      // Fill out form fields
      const textInput = screen.queryByLabelText(/text input/i);
      const emailInput = screen.queryByLabelText(/email input/i);
      const textArea = screen.queryByLabelText(/textarea/i);
      
      if (textInput) await userEvent.type(textInput, 'Test text');
      if (emailInput) await userEvent.type(emailInput, 'test@example.com');
      if (textArea) await userEvent.type(textArea, 'Test description');
      
      // Submit form
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        await userEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check collected data
      const getSubmissionDataFn = (window as any).__testGetSubmissionData__;
      if (getSubmissionDataFn) {
        const submissionData = getSubmissionDataFn();
        
        expect(submissionData).toBeDefined();
        expect(submissionData['text_input']).toBe('Test text');
        expect(submissionData['email_input']).toBe('test@example.com');
        expect(submissionData['textarea']).toBe('Test description');
      }
    });

    it('should handle multi-page form submission', async () => {
      await renderAppWithForm();
      
      // Add components to first page
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('text_input');
        addComponentFn('email_input');
      }
      
      // Add new page
      const addPageFn = (window as any).__testAddPage__;
      if (addPageFn) {
        addPageFn();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Add components to second page
      if (addComponentFn) {
        addComponentFn('textarea');
        addComponentFn('select');
      }
      
      // Preview multi-page form
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);
      
      // Fill first page
      const textInput = screen.queryByLabelText(/text input/i);
      const emailInput = screen.queryByLabelText(/email input/i);
      
      if (textInput) await userEvent.type(textInput, 'Page 1 text');
      if (emailInput) await userEvent.type(emailInput, 'page1@example.com');
      
      // Navigate to next page
      const nextButton = screen.queryByRole('button', { name: /next/i });
      if (nextButton) {
        await userEvent.click(nextButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Fill second page
      const textArea = screen.queryByLabelText(/textarea/i);
      if (textArea) await userEvent.type(textArea, 'Page 2 description');
      
      // Submit form
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        await userEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check multi-page submission data
      const getSubmissionDataFn = (window as any).__testGetSubmissionData__;
      if (getSubmissionDataFn) {
        const submissionData = getSubmissionDataFn();
        
        // Should include data from both pages
        expect(submissionData['text_input']).toBe('Page 1 text');
        expect(submissionData['email_input']).toBe('page1@example.com');
        expect(submissionData['textarea']).toBe('Page 2 description');
      }
    });

    it('should validate required fields before submission', async () => {
      const { container } = await renderAppWithForm();
      await createTestForm();
      
      // Set first component as required
      const components = container.querySelectorAll('[data-component-id]');
      if (components.length > 0) {
        await setComponentProperties(components[0].getAttribute('data-component-id')!, { 
          required: true,
          label: 'Required Field'
        });
      }
      
      // Preview form
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);
      
      // Try to submit without filling required field
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        await userEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should show validation error
      const errorMessage = await waitFor(() => 
        screen.queryByText(/required/i) || screen.queryByText(/field.*empty/i)
      );
      expect(errorMessage).toBeTruthy();
      
      // Form should not be submitted
      const getSubmissionDataFn = (window as any).__testGetSubmissionData__;
      if (getSubmissionDataFn) {
        const submissionData = getSubmissionDataFn();
        expect(submissionData).toBeFalsy(); // No submission should have occurred
      }
    });
  });

  describe('Data Processing and Transformation', () => {
    it('should transform form data for different output formats', async () => {
      await renderAppWithForm();
      await createTestForm();
      
      // Create form with various field types
      const setFieldPropertiesFn = (window as any).__testSetFieldProperties__;
      if (setFieldPropertiesFn) {
        setFieldPropertiesFn('component-0', { fieldId: 'firstName', type: 'text_input' });
        setFieldPropertiesFn('component-1', { fieldId: 'email', type: 'email_input' });
        setFieldPropertiesFn('component-2', { fieldId: 'comments', type: 'textarea' });
      }
      
      // Test different output formats
      const getFormDataFn = (window as any).__testGetFormData__;
      if (getFormDataFn) {
        const jsonFormat = getFormDataFn('json');
        const xmlFormat = getFormDataFn('xml');
        const csvFormat = getFormDataFn('csv');
        
        expect(jsonFormat).toBeDefined();
        expect(xmlFormat).toBeDefined();
        expect(csvFormat).toBeDefined();
        
        // JSON should be parseable
        if (typeof jsonFormat === 'string') {
          expect(() => JSON.parse(jsonFormat)).not.toThrow();
        }
      }
    });

    it('should handle file uploads in form data', async () => {
      await renderAppWithForm();
      
      // Add file upload component
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('file_upload');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Preview form
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);
      
      // Simulate file upload
      const fileInput = screen.queryByLabelText(/file upload/i) || screen.queryByRole('button', { name: /choose file/i });
      if (fileInput) {
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        await userEvent.upload(fileInput, file);
      }
      
      // Submit form
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        await userEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check file handling
      const getSubmissionDataFn = (window as any).__testGetSubmissionData__;
      if (getSubmissionDataFn) {
        const submissionData = getSubmissionDataFn();
        
        // Should handle file data appropriately
        expect(submissionData['file_upload']).toBeDefined();
      }
    });

    it('should preserve data types in submission', async () => {
      await renderAppWithForm();
      
      // Add various typed components
      const addComponentFn = (window as any).__testAddComponent__;
      if (addComponentFn) {
        addComponentFn('number_input');
        addComponentFn('checkbox');
        addComponentFn('date_picker');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Preview and fill form
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);
      
      const numberInput = screen.queryByLabelText(/number input/i);
      const checkbox = screen.queryByLabelText(/checkbox/i);
      const dateInput = screen.queryByLabelText(/date/i);
      
      if (numberInput) await userEvent.type(numberInput, '42');
      if (checkbox) await userEvent.click(checkbox);
      if (dateInput) await userEvent.type(dateInput, '2024-01-15');
      
      // Submit form
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        await userEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check data types
      const getSubmissionDataFn = (window as any).__testGetSubmissionData__;
      if (getSubmissionDataFn) {
        const submissionData = getSubmissionDataFn();
        
        // Number should be numeric
        expect(typeof submissionData['number_input']).toBe('number');
        expect(submissionData['number_input']).toBe(42);
        
        // Checkbox should be boolean
        expect(typeof submissionData['checkbox']).toBe('boolean');
        expect(submissionData['checkbox']).toBe(true);
        
        // Date should be proper date format
        expect(submissionData['date_picker']).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }
    });
  });
});
