
import React, { useState } from 'react';
import PageItem from './PageItem';
import ConfirmDialog from './ConfirmDialog';
import { Button } from '../atoms';

interface Page {
  id: string;
  title: string;
  components: any[];
}

interface SimplePageNavigationProps {
  pages: Page[];
  currentPageId: string;
  onSwitchPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageTitle: (pageId: string, title: string) => void;
  onClearPage: (pageId: string) => void;
}

const SimplePageNavigation: React.FC<SimplePageNavigationProps> = ({
  pages,
  currentPageId,
  onSwitchPage,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
  onClearPage
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    pageId: string;
    pageTitle: string;
  }>({ isOpen: false, pageId: '', pageTitle: '' });

  const handleDeleteClick = (pageId: string, pageTitle: string) => {
    setDeleteConfirm({ isOpen: true, pageId, pageTitle });
  };

  const confirmDelete = () => {
    onDeletePage(deleteConfirm.pageId);
    setDeleteConfirm({ isOpen: false, pageId: '', pageTitle: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <span>📄</span>
          <span>Pages</span>
        </h3>
        <Button size="sm" onClick={onAddPage}>
          + Add Page
        </Button>
      </div>

      {/* Page List */}
      <div className="space-y-2 group">
        {pages.map((page, index) => (
          <PageItem
            key={page.id}
            page={page}
            pageNumber={index + 1}
            isActive={currentPageId === page.id}
            onSelect={() => onSwitchPage(page.id)}
            onRename={(title) => onUpdatePageTitle(page.id, title)}
            onDelete={() => handleDeleteClick(page.id, page.title)}
            onClear={() => onClearPage(page.id)}
            canDelete={pages.length > 1}
          />
        ))}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Double-click page titles to rename
      </p>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, pageId: '', pageTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Page"
        message={`Are you sure you want to delete "${deleteConfirm.pageTitle}"?\n\nThis action cannot be undone.`}
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SimplePageNavigation;
