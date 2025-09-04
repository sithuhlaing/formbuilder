/**
 * Properties Panel Component
 * Provides dynamic property editing for selected form components
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { FormComponentData } from '../../types/component';

interface PropertiesPanelProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (componentId: string, updates: Partial<FormComponentData>) => void;
  onClose?: () => void;
}

interface PropertySection {
  title: string;
  expanded: boolean;
  fields: PropertyField[];
}

interface PropertyField {
  key: keyof FormComponentData;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'options';
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  rows?: number;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onUpdateComponent,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'validation'])
  );

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handlePropertyChange = useCallback((key: keyof FormComponentData, value: any) => {
    if (!selectedComponent) return;
    onUpdateComponent(selectedComponent.id, { [key]: value });
  }, [selectedComponent, onUpdateComponent]);

  const handleOptionsChange = useCallback((options: any[]) => {
    if (!selectedComponent) return;
    onUpdateComponent(selectedComponent.id, { options });
  }, [selectedComponent, onUpdateComponent]);

  const addOption = useCallback(() => {
    if (!selectedComponent) return;
    const currentOptions = selectedComponent.options || [];
    const newOption = {
      value: `option_${currentOptions.length + 1}`,
      label: `Option ${currentOptions.length + 1}`,
      selected: false,
      disabled: false
    };
    handleOptionsChange([...currentOptions, newOption]);
  }, [selectedComponent, handleOptionsChange]);

  const updateOption = useCallback((index: number, field: string, value: any) => {
    if (!selectedComponent) return;
    const currentOptions = [...(selectedComponent.options || [])];
    if (currentOptions[index]) {
      currentOptions[index] = { ...currentOptions[index], [field]: value };
      handleOptionsChange(currentOptions);
    }
  }, [selectedComponent, handleOptionsChange]);

  const removeOption = useCallback((index: number) => {
    if (!selectedComponent) return;
    const currentOptions = [...(selectedComponent.options || [])];
    currentOptions.splice(index, 1);
    handleOptionsChange(currentOptions);
  }, [selectedComponent, handleOptionsChange]);

  const getPropertySections = useMemo((): PropertySection[] => {
    if (!selectedComponent) return [];

    const sections: PropertySection[] = [
      {
        title: 'Basic Properties',
        expanded: expandedSections.has('basic'),
        fields: [
          { key: 'label', label: 'Label', type: 'text', placeholder: 'Enter component label' },
          { key: 'fieldId', label: 'Field ID', type: 'text', placeholder: 'field_name' },
          { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter placeholder text' },
          { key: 'helpText', label: 'Help Text', type: 'textarea', placeholder: 'Additional help information', rows: 2 }
        ]
      },
      {
        title: 'Validation',
        expanded: expandedSections.has('validation'),
        fields: [
          { key: 'required', label: 'Required', type: 'boolean' }
        ]
      }
    ];

    // Add type-specific properties
    switch (selectedComponent.type) {
      case 'text_input':
      case 'email_input':
      case 'password_input':
      case 'textarea':
        if (selectedComponent.type === 'text_input') {
          sections[1].fields.push(
            { key: 'pattern', label: 'Pattern (Regex)', type: 'text', placeholder: '^[a-zA-Z]+' }
          );
        }
        if (selectedComponent.type === 'textarea') {
          sections[1].fields.push(
            { key: 'rows', label: 'Rows', type: 'number', min: 2, max: 10 }
          );
        }
        break;

      case 'number_input':
        sections[1].fields.push(
          { key: 'min', label: 'Minimum Value', type: 'number' },
          { key: 'max', label: 'Maximum Value', type: 'number' },
          { key: 'step', label: 'Step', type: 'number', min: 0.01 }
        );
        break;

      case 'select':
      case 'multi_select':
      case 'radio_group':
      case 'checkbox':
        sections.push({
          title: 'Options',
          expanded: expandedSections.has('options'),
          fields: [{ key: 'options', label: 'Options', type: 'options' }]
        });
        break;

      case 'file_upload':
        sections.push({
          title: 'File Settings',
          expanded: expandedSections.has('file'),
          fields: [
            { key: 'acceptedFileTypes', label: 'Accepted File Types', type: 'text', placeholder: '.jpg,.png,.pdf' }
          ]
        });
        break;

      case 'signature':
        sections.push({
          title: 'Canvas Settings',
          expanded: expandedSections.has('canvas'),
          fields: [
            { key: 'height', label: 'Height', type: 'text', placeholder: '200px' }
          ]
        });
        break;

      case 'rich_text':
        sections.push({
          title: 'Editor Settings',
          expanded: expandedSections.has('editor'),
          fields: [
            { key: 'height', label: 'Height', type: 'text', placeholder: '200px' }
          ]
        });
        break;

      case 'button':
        // Remove required field since buttons are not form inputs
        sections[1].fields = sections[1].fields.filter(field => field.key !== 'required');
        sections.push({
          title: 'Button Settings',
          expanded: expandedSections.has('button'),
          fields: [
            { key: 'defaultValue', label: 'Button Text', type: 'text', placeholder: 'Click Me' },
            { 
              key: 'styling.theme', 
              label: 'Button Style', 
              type: 'select', 
              options: [
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'danger', label: 'Danger' },
                { value: 'success', label: 'Success' }
              ]
            }
          ]
        });
        break;

      case 'heading':
        // Remove required field since headings are not form inputs
        sections[1].fields = sections[1].fields.filter(field => field.key !== 'required');
        sections.push({
          title: 'Heading Settings',
          expanded: expandedSections.has('heading'),
          fields: [
            { key: 'defaultValue', label: 'Heading Text', type: 'text', placeholder: 'Section Title' },
            {
              key: 'styling.theme',
              label: 'Heading Level',
              type: 'select',
              options: [
                { value: 'h1', label: 'H1 - Large Title' },
                { value: 'h2', label: 'H2 - Section Title' },
                { value: 'h3', label: 'H3 - Subsection' },
                { value: 'h4', label: 'H4 - Minor Heading' },
                { value: 'h5', label: 'H5 - Small Heading' },
                { value: 'h6', label: 'H6 - Tiny Heading' }
              ]
            }
          ]
        });
        break;

      case 'card':
        // Remove required field since cards are containers, not form inputs
        sections[1].fields = sections[1].fields.filter(field => field.key !== 'required');
        sections.push({
          title: 'Card Settings',
          expanded: expandedSections.has('card'),
          fields: [
            {
              key: 'styling.theme',
              label: 'Card Style',
              type: 'select',
              options: [
                { value: 'default', label: 'Default' },
                { value: 'bordered', label: 'Bordered' },
                { value: 'shadow', label: 'Shadow' },
                { value: 'minimal', label: 'Minimal' }
              ]
            }
          ]
        });
        break;

      case 'section_divider':
        // Remove required field since dividers are not form inputs
        sections[1].fields = sections[1].fields.filter(field => field.key !== 'required');
        // Section dividers use basic properties only
        break;
    }

    // Add styling section
    sections.push({
      title: 'Styling',
      expanded: expandedSections.has('styling'),
      fields: [
        { key: 'width', label: 'Width', type: 'text', placeholder: '100%' },
        { key: 'height', label: 'Height', type: 'text', placeholder: '200px' }
      ]
    });

    return sections;
  }, [selectedComponent, expandedSections]);

  const renderPropertyField = useCallback((field: PropertyField, value: any) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="property-input"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handlePropertyChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.key === 'step' ? 0.01 : 1}
            className="property-input"
          />
        );

      case 'boolean':
        return (
          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handlePropertyChange(field.key, e.target.checked)}
            />
            <span className="checkbox-label">{field.label}</span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className="property-textarea"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            className="property-select"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'options':
        return (
          <div className="options-editor">
            {selectedComponent?.options?.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option.label || ''}
                  onChange={(e) => updateOption(index, 'label', e.target.value)}
                  placeholder="Option label"
                  className="option-input"
                />
                <input
                  type="text"
                  value={option.value || ''}
                  onChange={(e) => updateOption(index, 'value', e.target.value)}
                  placeholder="Option value"
                  className="option-input"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="option-remove-btn"
                  title="Remove option"
                  aria-label={`Remove option ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="add-option-btn"
            >
              + Add Option
            </button>
          </div>
        );

      default:
        return null;
    }
  }, [selectedComponent, handlePropertyChange, updateOption, removeOption, addOption]);

  if (!selectedComponent) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Properties</h3>
        </div>
        <div className="properties-content">
          <div className="no-selection">
            <p>Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <div className="component-type-badge">
          {selectedComponent.type.replace(/_/g, ' ')}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="close-btn"
            title="Close properties panel"
            aria-label="Close properties panel"
          >
            ×
          </button>
        )}
      </div>

      <div className="properties-content">
        {getPropertySections.map((section) => (
          <div key={section.title} className="property-section">
            <button
              type="button"
              className={`section-header ${section.expanded ? 'expanded' : ''}`}
              onClick={() => toggleSection(section.title.toLowerCase().replace(/\s+/g, ''))}
              aria-expanded={section.expanded}
              aria-controls={`section-${section.title.toLowerCase().replace(/\s+/g, '')}`}
            >
              <span className="section-title">{section.title}</span>
              <span className="section-toggle">{section.expanded ? '−' : '+'}</span>
            </button>

            {section.expanded && (
              <div 
                className="section-content"
                id={`section-${section.title.toLowerCase().replace(/\s+/g, '')}`}
              >
                {section.fields.map((field) => (
                  <div key={field.key} className="property-field">
                    {field.type !== 'boolean' && (
                      <label className="property-label">{field.label}</label>
                    )}
                    {renderPropertyField(field, selectedComponent[field.key])}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPanel;