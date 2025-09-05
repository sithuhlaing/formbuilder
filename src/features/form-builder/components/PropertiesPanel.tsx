/**
 * Clean Properties Panel - Form Builder Feature
 * Single purpose: Edit selected component properties
 */

import React from 'react';
import type { FormComponentData } from '../../../core/interfaces/ComponentInterfaces';
import { TEST_IDS } from '../../../__tests__/utils/test-utils';
import '../../../styles/PropertiesPanel.css';

interface PropertiesPanelProps {
  selectedComponent: FormComponentData | null;
  onUpdateComponent: (updates: Partial<FormComponentData>) => void;
}

export const PropertiesPanel = ({ 
  selectedComponent, 
  onUpdateComponent 
}: PropertiesPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="properties-panel" data-testid={TEST_IDS.PROPERTIES_PANEL}>
        <h3>Properties</h3>
        <div className="properties-panel__empty">
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: string, value: unknown) => {
    onUpdateComponent({ [field]: value });
  };


  return (
    <div className="properties-panel" data-testid={TEST_IDS.PROPERTIES_PANEL}>
      <h3>Properties</h3>
      <div className="properties-form">
        {/* Common properties for all components */}
        <div className="form-group">
          <label htmlFor="component-label">Label</label>
          <input
            id="component-label"
            type="text"
            value={selectedComponent.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="component-label">Label</label>
          <input
            id="component-label"
            type="text"
            value={selectedComponent.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="component-placeholder">Placeholder</label>
          <input
            id="component-placeholder"
            type="text"
            value={selectedComponent.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedComponent.required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
            Required field
          </label>
        </div>

        {/* Type-specific properties */}
        {selectedComponent.type === 'select' && (
          <div className="form-group">
            <label htmlFor="component-options">Options (one per line)</label>
            <textarea
              id="component-options"
              value={selectedComponent.options?.join('\n') || ''}
              onChange={(e) => handleChange('options', e.target.value.split('\n').filter(Boolean))}
              className="form-control"
              rows={4}
            />
          </div>
        )}

        {selectedComponent.type === 'textarea' && (
          <div className="form-group">
            <label htmlFor="component-rows">Rows</label>
            <input
              id="component-rows"
              type="number"
              min="2"
              max="10"
              value={selectedComponent.rows || 3}
              onChange={(e) => handleChange('rows', parseInt(e.target.value))}
              className="form-control"
            />
          </div>
        )}

        {/* Button Properties */}
        {selectedComponent.type === 'button' && (
          <>
            <div className="form-group">
              <label htmlFor="button-type">Button Type</label>
              <select
                id="button-type"
                value={selectedComponent.buttonType || 'primary'}
                onChange={(e) => handleChange('buttonType', e.target.value)}
                className="form-control"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="success">Success</option>
                <option value="danger">Danger</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="link">Link</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="button-size">Size</label>
              <select
                id="button-size"
                value={selectedComponent.size || 'md'}
                onChange={(e) => handleChange('size', e.target.value)}
                className="form-control"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="button-variant">Variant</label>
              <select
                id="button-variant"
                value={selectedComponent.variant || 'filled'}
                onChange={(e) => handleChange('variant', e.target.value)}
                className="form-control"
              >
                <option value="filled">Filled</option>
                <option value="outline">Outline</option>
                <option value="text">Text</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedComponent.fullWidth || false}
                  onChange={(e) => handleChange('fullWidth', e.target.checked)}
                />
                Full Width
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedComponent.disabled || false}
                  onChange={(e) => handleChange('disabled', e.target.checked)}
                />
                Disabled
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedComponent.isLoading || false}
                  onChange={(e) => handleChange('isLoading', e.target.checked)}
                />
                Loading State
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="button-icon">Icon (SVG or emoji)</label>
              <input
                id="button-icon"
                type="text"
                value={selectedComponent.icon || ''}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="form-control"
                placeholder="Paste SVG or emoji"
              />
            </div>

            <div className="form-group">
              <label>Icon Position</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="iconPosition"
                    value="left"
                    checked={!selectedComponent.iconPosition || selectedComponent.iconPosition === 'left'}
                    onChange={(e) => handleChange('iconPosition', e.target.value)}
                  />
                  Left
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="iconPosition"
                    value="right"
                    checked={selectedComponent.iconPosition === 'right'}
                    onChange={(e) => handleChange('iconPosition', e.target.value)}
                  />
                  Right
                </label>
              </div>
            </div>
          </>
        )}

        {selectedComponent.type === 'heading' && (
          <>
            <div className="form-group">
              <label htmlFor="heading-level">Heading Level</label>
              <select
                id="heading-level"
                value={selectedComponent.level || 2}
                onChange={(e) => handleChange('level', parseInt(e.target.value))}
                className="form-control"
              >
                <option value={1}>Heading 1</option>
                <option value={2}>Heading 2</option>
                <option value={3}>Heading 3</option>
                <option value={4}>Heading 4</option>
                <option value={5}>Heading 5</option>
                <option value={6}>Heading 6</option>
              </select>
            </div>

            <div className="form-group">
              <label>Text Alignment</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="headingAlign"
                    value="left"
                    checked={!selectedComponent.alignment || selectedComponent.alignment === 'left'}
                    onChange={(e) => handleChange('alignment', e.target.value)}
                  />
                  Left
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="headingAlign"
                    value="center"
                    checked={selectedComponent.alignment === 'center'}
                    onChange={(e) => handleChange('alignment', e.target.value)}
                  />
                  Center
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="headingAlign"
                    value="right"
                    checked={selectedComponent.alignment === 'right'}
                    onChange={(e) => handleChange('alignment', e.target.value)}
                  />
                  Right
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="heading-color">Text Color</label>
              <input
                id="heading-color"
                type="color"
                value={selectedComponent.color || '#000000'}
                onChange={(e) => handleChange('color', e.target.value)}
                className="form-control"
                style={{ height: '38px' }}
              />
            </div>

            <div className="form-group">
              <label>Margins</label>
              <div className="spacing-controls">
                <div className="spacing-control">
                  <label>Top</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.top || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...selectedComponent.margin,
                      top: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Right</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.right || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...selectedComponent.margin,
                      right: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Bottom</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.bottom || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...selectedComponent.margin,
                      bottom: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Left</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.left || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...selectedComponent.margin,
                      left: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Card-specific properties */}
        {selectedComponent.type === 'card' && (
          <>
            <div className="form-group">
              <label>Variant</label>
              <select
                value={selectedComponent.variant || 'elevated'}
                onChange={(e) => handleChange('variant', e.target.value)}
                className="form-control"
              >
                <option value="elevated">Elevated</option>
                <option value="outlined">Outlined</option>
                <option value="filled">Filled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shadow</label>
              <select
                value={selectedComponent.shadow || 'md'}
                onChange={(e) => handleChange('shadow', e.target.value)}
                className="form-control"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="card-padding">Padding</label>
              <input
                id="card-padding"
                type="text"
                value={selectedComponent.padding || '1.25rem'}
                onChange={(e) => handleChange('padding', e.target.value)}
                className="form-control"
                placeholder="e.g., 1rem or 16px"
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-border-color">Border Color</label>
              <input
                id="card-border-color"
                type="color"
                value={selectedComponent.borderColor || '#e2e8f0'}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="form-control"
                style={{ height: '38px' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-bg-color">Background Color</label>
              <input
                id="card-bg-color"
                type="color"
                value={selectedComponent.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="form-control"
                style={{ height: '38px' }}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedComponent.showHeader !== false}
                  onChange={(e) => handleChange('showHeader', e.target.checked)}
                />
                Show Header
              </label>
            </div>

            {selectedComponent.showHeader !== false && (
              <div className="form-group">
                <label>Header Alignment</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="headerAlign"
                      value="left"
                      checked={!selectedComponent.headerAlign || selectedComponent.headerAlign === 'left'}
                      onChange={(e) => handleChange('headerAlign', e.target.value)}
                    />
                    Left
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="headerAlign"
                      value="center"
                      checked={selectedComponent.headerAlign === 'center'}
                      onChange={(e) => handleChange('headerAlign', e.target.value)}
                    />
                    Center
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="headerAlign"
                      value="right"
                      checked={selectedComponent.headerAlign === 'right'}
                      onChange={(e) => handleChange('headerAlign', e.target.value)}
                    />
                    Right
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedComponent.showFooter === true}
                  onChange={(e) => handleChange('showFooter', e.target.checked)}
                />
                Show Footer
              </label>
            </div>

            {selectedComponent.showFooter && (
              <div className="form-group">
                <label>Footer Alignment</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="footerAlign"
                      value="left"
                      checked={!selectedComponent.footerAlign || selectedComponent.footerAlign === 'left'}
                      onChange={(e) => handleChange('footerAlign', e.target.value)}
                    />
                    Left
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="footerAlign"
                      value="center"
                      checked={selectedComponent.footerAlign === 'center'}
                      onChange={(e) => handleChange('footerAlign', e.target.value)}
                    />
                    Center
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="footerAlign"
                      value="right"
                      checked={selectedComponent.footerAlign === 'right'}
                      onChange={(e) => handleChange('footerAlign', e.target.value)}
                    />
                    Right
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Margins</label>
              <div className="spacing-controls">
                <div className="spacing-control">
                  <label>Top</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.top || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...(selectedComponent.margin || {}),
                      top: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Right</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.right || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...(selectedComponent.margin || {}),
                      right: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Bottom</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.bottom || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...(selectedComponent.margin || {}),
                      bottom: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
                <div className="spacing-control">
                  <label>Left</label>
                  <input
                    type="text"
                    value={selectedComponent.margin?.left || '0'}
                    onChange={(e) => handleChange('margin', {
                      ...(selectedComponent.margin || {}),
                      left: e.target.value
                    })}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;