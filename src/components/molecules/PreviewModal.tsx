import React, { useState } from 'react';
import type { FormComponentData, FormPage } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  components: FormComponentData[];
  pages?: FormPage[];
  showNotification?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface PreviewFormData {
  [key: string]: any;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  templateName,
  components,
  pages = [],
  showNotification,
}) => {
  const [formData, setFormData] = useState<PreviewFormData>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!isOpen) return null;
  
  console.log('PreviewModal opened:', {
    templateName,
    componentCount: components.length,
    pageCount: pages?.length || 0,
    hasPages: pages && pages.length > 0
  });

  const hasPages = pages.length > 0;
  const currentComponents = hasPages ? pages[currentPageIndex]?.components || [] : components;
  const currentPageTitle = hasPages ? pages[currentPageIndex]?.title : undefined;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderComponent = (component: FormComponentData): React.ReactNode => {
    const value = formData[component.fieldId || component.id] || '';

    switch (component.type) {
      case 'text_input':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={component.placeholder}
              value={value}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'number_input':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={component.placeholder}
              value={value}
              min={component.min}
              max={component.max}
              step={component.step}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={component.placeholder}
              value={value}
              rows={4}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
              required={component.required}
            >
              <option value="">Select an option</option>
              {component.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'multi_select':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border border-gray-300 rounded-md">
              {component.options?.map((option, index) => (
                <label key={index} className="flex items-center px-3 py-2 border-b border-gray-200 last:border-b-0">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleInputChange(component.fieldId || component.id, newValues);
                    }}
                    className="mr-3"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case 'radio_group':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {component.options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={component.fieldId || component.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
                    className="mr-2"
                    required={component.required}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {component.options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleInputChange(component.fieldId || component.id, newValues);
                    }}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case 'date_picker':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.value)}
              required={component.required}
            />
          </div>
        );

      case 'file_upload':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept={component.acceptedFileTypes}
              onChange={(e) => handleInputChange(component.fieldId || component.id, e.target.files?.[0])}
              required={component.required}
            />
          </div>
        );

      case 'section_divider':
        return (
          <div key={component.id} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
              {component.label}
            </h3>
            {component.description && (
              <p className="text-sm text-gray-600 mt-2">{component.description}</p>
            )}
          </div>
        );

      case 'signature':
        return (
          <div key={component.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <p className="text-sm text-gray-500">Signature field (preview only)</p>
            </div>
          </div>
        );

      case 'horizontal_layout':
      case 'vertical_layout':
        return (
          <div 
            key={component.id} 
            className={`mb-4 ${component.type === 'horizontal_layout' ? 'flex gap-4' : 'space-y-4'}`}
          >
            {component.children?.map(child => renderComponent(child))}
          </div>
        );

      default:
        return (
          <div key={component.id} className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Unknown component type: {component.type}</p>
          </div>
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showNotification) {
      showNotification('Form Submitted', 'This is a preview. Form data would be submitted in the actual form.', 'info');
    } else {
      alert('This is a preview. Form data would be submitted in the actual form.');
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Preview: {templateName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {hasPages && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800">{currentPageTitle}</h3>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {currentComponents.length > 0 ? (
              currentComponents.map(renderComponent)
            ) : (
              <div className="text-center py-8 text-gray-500">
                No components found for this page
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentPageIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentPageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentPageIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {currentPageIndex < pages.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextPage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;