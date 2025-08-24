import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { ActionButton } from '../atoms';
import type { FormPage } from '../types';

interface PageNavigationProps {
  pages: FormPage[];
  currentPageId: string;
  onSwitchPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageTitle: (pageId: string, title: string) => void;
  onClearPage: (pageId: string) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  currentPageId,
  onSwitchPage,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
  onClearPage
}) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    pageId: string;
    pageTitle: string;
  }>({ isOpen: false, pageId: '', pageTitle: '' });

  const handleStartEdit = (pageId: string, currentTitle: string) => {
    setEditingPageId(pageId);
    setTempTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingPageId && tempTitle.trim()) {
      onUpdatePageTitle(editingPageId, tempTitle.trim());
    }
    setEditingPageId(null);
    setTempTitle('');
  };

  const handleCancelEdit = () => {
    setEditingPageId(null);
    setTempTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (pageId: string, pageTitle: string) => {
    setDeleteConfirmation({ isOpen: true, pageId, pageTitle });
  };

  const confirmDeletePage = () => {
    onDeletePage(deleteConfirmation.pageId);
    setDeleteConfirmation({ isOpen: false, pageId: '', pageTitle: '' });
  };

  return (
    <div className="page-navigation">
      <div className="page-navigation__header">
        <h3 className="page-navigation__title">
          <span className="page-navigation__icon">📄</span>
          Pages
        </h3>
        <button
          onClick={onAddPage}
          className="btn btn--primary btn--sm page-navigation__add-btn"
          title="Add new page"
        >
          + Add Page
        </button>
      </div>
      
      <div className="page-navigation__list">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`page-navigation__item ${
              currentPageId === page.id ? 'page-navigation__item--active' : ''
            }`}
          >
            <div
              className="page-navigation__item-content"
              onClick={() => onSwitchPage(page.id)}
            >
              <div className="page-navigation__item-header">
                <span className="page-navigation__item-number">{index + 1}</span>
                {editingPageId === page.id ? (
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyPress}
                    className="page-navigation__title-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="page-navigation__item-title"
                    onDoubleClick={() => handleStartEdit(page.id, page.title)}
                  >
                    {page.title}
                  </span>
                )}
              </div>
              <div className="page-navigation__item-info">
                {page.components.length} component{page.components.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="page-navigation__item-actions">
              <ActionButton
                onClick={(e) => {
                  e?.stopPropagation();
                  handleStartEdit(page.id, page.title);
                }}
                icon="✏️"
                title="Rename page"
              />
              {page.components.length > 0 && (
                <ActionButton
                  onClick={(e) => {
                    e?.stopPropagation();
                    onClearPage(page.id);
                  }}
                  icon="🧹"
                  title="Clear page components"
                  variant="warning"
                />
              )}
              {pages.length > 1 && (
                <ActionButton
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleDeleteClick(page.id, page.title);
                  }}
                  icon="🗑️"
                  title="Delete page"
                  variant="delete"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="page-navigation__footer">
        <p className="page-navigation__help-text">
          Double-click page titles to rename
        </p>
      </div>
      
      {/* Delete Page Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, pageId: '', pageTitle: '' })}
        onConfirm={confirmDeletePage}
        title="Delete Page"
        message={`Are you sure you want to delete the page "${deleteConfirmation.pageTitle}"?\n\nThis action cannot be undone.`}
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
        icon="🗑️"
      />
    </div>
  );
};

export default PageNavigation;