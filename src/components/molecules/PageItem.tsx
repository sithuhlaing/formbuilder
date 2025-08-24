
import React, { useState } from 'react';
import NavigationItem from '../atoms/navigation/NavigationItem';
import PageCounter from '../atoms/navigation/PageCounter';
import EditableTitle from '../atoms/layout/EditableTitle';
import ActionButton from '../atoms/controls/ActionButton';

interface PageItemProps {
  page: {
    id: string;
    title: string;
    components: any[];
  };
  pageNumber: number;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onClear: () => void;
  canDelete: boolean;
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  pageNumber,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onClear,
  canDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (newTitle: string) => {
    onRename(newTitle);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <NavigationItem isActive={isActive} onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <PageCounter pageNumber={pageNumber} isActive={isActive} />
          <div className="flex-1">
            <EditableTitle
              title={page.title}
              onSave={handleSave}
              isEditing={isEditing}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              className="font-medium"
            />
            <div className="text-xs text-gray-500 mt-1">
              {page.components.length} component{page.components.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            onClick={handleStartEdit}
            icon="✏️"
            title="Rename page"
            variant="default"
          />
          {page.components.length > 0 && (
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              icon="🧹"
              title="Clear page"
              variant="default"
            />
          )}
          {canDelete && (
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              icon="🗑️"
              title="Delete page"
              variant="danger"
            />
          )}
        </div>
      </div>
    </NavigationItem>
  );
};

export default PageItem;
