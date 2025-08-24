
import React, { useState } from 'react';
import type { FormComponentData, FormPage } from '../types';
import FormRenderer from './FormRenderer';
import PageNavigator from './PageNavigator';

interface PreviewFormProps {
  templateName: string;
  components: FormComponentData[];
  pages?: FormPage[];
  onSubmit: (data: Record<string, any>) => void;
}

const PreviewForm: React.FC<PreviewFormProps> = ({
  templateName,
  components,
  pages = [],
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const hasPages = pages.length > 0;
  const currentComponents = hasPages ? pages[currentPageIndex]?.components || [] : components;
  const currentPageTitle = hasPages ? pages[currentPageIndex]?.title : undefined;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
    }
  };

  const handleFormSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="preview-form">
      {hasPages && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800">
            {currentPageTitle || `Page ${currentPageIndex + 1}`}
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            Page {currentPageIndex + 1} of {pages.length}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentComponents.length > 0 ? (
          <FormRenderer
            components={currentComponents}
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p>No components found for this page</p>
          </div>
        )}

        {hasPages ? (
          <PageNavigator
            pages={pages}
            currentPageIndex={currentPageIndex}
            onPageChange={goToPage}
            onNext={goToNextPage}
            onPrevious={goToPrevPage}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Submit Preview
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PreviewForm;
