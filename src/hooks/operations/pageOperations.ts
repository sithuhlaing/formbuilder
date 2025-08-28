
import { useCallback } from 'react';

type UsePageOperationsProps = {
  pages: FormPage[];
  currentPageId: string;
  updatePages: (newPages: FormPage[]) => void;
  setCurrentPageId: (pageId: string) => void;
  setSelectedComponentId: (id: string | null) => void;
  generateId: () => string;
  showNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirmation?: (title: string, message: string, onConfirm: () => void, type?: 'info' | 'success' | 'warning' | 'error' | 'danger') => void;
};

export const usePageOperations = ({
  pages,
  currentPageId,
  updatePages,
  setCurrentPageId,
  setSelectedComponentId,
  generateId,
  showNotification,
  showConfirmation,
}: UsePageOperationsProps) => {
  const addPage = useCallback(() => {
    const newPageId = generateId();
    const newPage: FormPage = {
      id: newPageId,
      title: `Page ${pages.length + 1}`,
      components: [],
      layout: {}
    };
    
    const updatedPages = [...pages, newPage];
    updatePages(updatedPages);
    setCurrentPageId(newPageId);
    setSelectedComponentId(null);
  }, [pages, generateId, updatePages, setCurrentPageId, setSelectedComponentId]);

  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      if (showNotification) {
        showNotification('Cannot Delete Page', 'Cannot delete the last page. At least one page is required.', 'warning');
      } else {
        alert('Cannot delete the last page. At least one page is required.');
      }
      return;
    }

    const filteredPages = pages.filter(page => page.id !== pageId);
    updatePages(filteredPages);

    if (currentPageId === pageId) {
      setCurrentPageId(filteredPages[0].id);
    }
    setSelectedComponentId(null);
  }, [pages, currentPageId, updatePages, showNotification, setCurrentPageId, setSelectedComponentId]);

  const updatePageTitle = useCallback((pageId: string, title: string) => {
    const updatedPages = pages.map(page =>
      page.id === pageId ? { ...page, title } : page
    );
    updatePages(updatedPages);
  }, [pages, updatePages]);

  const switchToPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    setSelectedComponentId(null);
  }, [setCurrentPageId, setSelectedComponentId]);

  const clearPage = useCallback((pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page || page.components.length === 0) return;

    const performClearPage = () => {
      const updatedPages = pages.map(p =>
        p.id === pageId ? { ...p, components: [] } : p
      );
      updatePages(updatedPages);
      setSelectedComponentId(null);
    };

    if (showConfirmation) {
      showConfirmation(
        'Clear Page Components',
        `Are you sure you want to clear all components from "${page.title}"?\n\nYou can undo this action with Ctrl+Z.`,
        performClearPage,
        'warning'
      );
    } else {
      if (window.confirm(`Are you sure you want to clear all components from "${page.title}"? You can undo this action with Ctrl+Z.`)) {
        performClearPage();
      }
    }
  }, [pages, updatePages, showConfirmation, setSelectedComponentId]);

  return {
    addPage,
    deletePage,
    updatePageTitle,
    switchToPage,
    clearPage,
  };
};
