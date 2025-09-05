import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { FormComponentData } from '../../../features/form-builder/types';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { PropertiesPanel } from '../../../features/form-builder/components/PropertiesPanel';

describe('PropertiesPanel', () => {
  const mockOnUpdateComponent = vi.fn();
  
  const textInputComponent: FormComponentData = {
    id: 'text-1',
    fieldId: 'text-1',
    type: 'text_input',
    label: 'Name',
    placeholder: 'Enter your name',
    required: false,
    style: {},
    validation: {}
  } as FormComponentData;

  const selectComponent: FormComponentData = {
    id: 'select-1',
    fieldId: 'select-1',
    type: 'select',
    label: 'Country',
    options: [
      { label: 'USA', value: 'usa' },
      { label: 'Canada', value: 'canada' },
      { label: 'UK', value: 'uk' }
    ],
    required: true,
    style: {},
    validation: {}
  } as FormComponentData;

  const textareaComponent: FormComponentData = {
    id: 'textarea-1',
    fieldId: 'textarea-1',
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
    required: true,
    style: {},
    validation: {}
  } as FormComponentData;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no component is selected', () => {
    render(<PropertiesPanel selectedComponent={null} onUpdateComponent={mockOnUpdateComponent} />);
    
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Select a component to edit its properties')).toBeInTheDocument();
  });

  describe('Common Properties', () => {
    it('renders common properties for a text input component', () => {
      render(
        <PropertiesPanel 
          selectedComponent={textInputComponent} 
          onUpdateComponent={mockOnUpdateComponent} 
        />
      );

      // Check common fields
      expect(screen.getByLabelText('Label')).toHaveValue('Name');
      expect(screen.getByLabelText('Placeholder')).toHaveValue('Enter your name');
      expect(screen.getByLabelText('Required field')).not.toBeChecked();
    });

    it('updates label when changed', () => {
      render(
        <PropertiesPanel 
          selectedComponent={textInputComponent} 
          onUpdateComponent={mockOnUpdateComponent} 
        />
      );

      const labelInput = screen.getByLabelText('Label');
      fireEvent.change(labelInput, { target: { value: 'Full Name' } });
      
      expect(mockOnUpdateComponent).toHaveBeenCalledWith({ label: 'Full Name' });
    });

    it('updates placeholder when changed', () => {
      render(
        <PropertiesPanel 
          selectedComponent={textInputComponent} 
          onUpdateComponent={mockOnUpdateComponent} 
        />
      );

      const placeholderInput = screen.getByLabelText('Placeholder');
      fireEvent.change(placeholderInput, { target: { value: 'Type your full name' } });
      
      expect(mockOnUpdateComponent).toHaveBeenCalledWith({ placeholder: 'Type your full name' });
    });

    it('toggles required field', () => {
      render(
        <PropertiesPanel 
          selectedComponent={textInputComponent} 
          onUpdateComponent={mockOnUpdateComponent} 
        />
      );

      const requiredCheckbox = screen.getByLabelText('Required field');
      fireEvent.click(requiredCheckbox);
      
      expect(mockOnUpdateComponent).toHaveBeenCalledWith({ required: true });
    });
  });

  describe('Type-Specific Properties', () => {
    describe('Select Component', () => {
      it('renders options textarea for select component', () => {
        const options = ['USA', 'Canada', 'UK'];
        // Using type assertion to bypass TypeScript error for test data
        const selectComponent = {
          ...textInputComponent,
          type: 'select',
          options: options
        } as unknown as FormComponentData;

        render(<PropertiesPanel selectedComponent={selectComponent} onUpdateComponent={mockOnUpdateComponent} />);

        const optionsTextarea = screen.getByLabelText('Options (one per line)');
        expect(optionsTextarea).toBeInTheDocument();
        expect((optionsTextarea as HTMLTextAreaElement).value).toBe(options.join('\n'));
      });

      it('updates options for select component', () => {
        render(
          <PropertiesPanel 
            selectedComponent={selectComponent} 
            onUpdateComponent={mockOnUpdateComponent} 
          />
        );

        const optionsTextarea = screen.getByLabelText('Options (one per line)');
        fireEvent.change(optionsTextarea, { 
          target: { 
            value: 'USA\nCanada\nUK\nAustralia' 
          } 
        });
        
        expect(mockOnUpdateComponent).toHaveBeenCalledWith({ 
          options: ['USA', 'Canada', 'UK', 'Australia'] 
        });
      });
    });

    describe('Textarea Component', () => {
      it('renders rows input for textarea component', () => {
        const textareaWithRows = { ...textareaComponent, rows: 4 };
        
        render(
          <PropertiesPanel 
            selectedComponent={textareaWithRows} 
            onUpdateComponent={mockOnUpdateComponent} 
          />
        );

        expect(screen.getByLabelText('Rows')).toHaveValue(4);
      });

      it('updates rows for textarea component', () => {
        render(
          <PropertiesPanel 
            selectedComponent={textareaComponent} 
            onUpdateComponent={mockOnUpdateComponent} 
          />
        );

        const rowsInput = screen.getByLabelText('Rows');
        fireEvent.change(rowsInput, { target: { value: '6' } });
        
        expect(mockOnUpdateComponent).toHaveBeenCalledWith({ rows: 6 });
      });
    });
  });

  it('matches snapshot with text input component', () => {
    const { container } = render(
      <PropertiesPanel 
        selectedComponent={textInputComponent} 
        onUpdateComponent={mockOnUpdateComponent} 
      />
    );
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with select component', () => {
    const { container } = render(
      <PropertiesPanel 
        selectedComponent={selectComponent} 
        onUpdateComponent={mockOnUpdateComponent} 
      />
    );
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with textarea component', () => {
    const textareaWithRows = { ...textareaComponent, rows: 4 };
    
    const { container } = render(
      <PropertiesPanel 
        selectedComponent={textareaWithRows} 
        onUpdateComponent={mockOnUpdateComponent} 
      />
    );
    
    expect(container).toMatchSnapshot();
  });
});
