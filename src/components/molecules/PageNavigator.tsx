
import React from 'react';
import type { FormPage } from '../types';

interface PageNavigatorProps {
  pages: FormPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentPageIndex,
  onPageChange,
  onNext,
  onPrevious,
  onSubmit
}) => {
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;

  return (
    <div className="mt-8 pt-6 border-t flex justify-between items-center">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstPage}
        className={`px-4 py-2 rounded-md ${
          isFirstPage
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        ← Previous
      </button>

      <div className="flex space-x-2">
        {pages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onPageChange(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentPageIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {isLastPage ? (
        <button
          type="submit"
          onClick={onSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Submit
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Next →
        </button>
      )}
    </div>
  );
};

export default PageNavigator;
