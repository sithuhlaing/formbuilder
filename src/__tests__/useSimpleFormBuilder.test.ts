import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimpleFormBuilder } from '../hooks/useSimpleFormBuilder';
import { templateService } from '../features/template-management/services/templateService';

vi.mock('../features/template-management/services/templateService');

describe('FormStateEngine - Mode & Persistence Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes a pristine state boundary in CREATE mode', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    expect(result.current.mode).toBe('create');
    expect(result.current.components).toEqual([]);
    expect(result.current.editingTemplateId).toBeUndefined();
    expect(result.current.templateName).toBe('Untitled Form');
  });

  it('transitions from CREATE to EDIT mode upon successful insertion', async () => {
    const mockUUID = 'uuid_888';
    vi.spyOn(templateService, 'saveTemplate').mockReturnValue({
      templateId: mockUUID,
      name: 'New Form',
      pages: []
    });

    const { result } = renderHook(() => useSimpleFormBuilder());

    act(() => {
      result.current.setTemplateName('New Form');
      result.current.handleSave();
    });

    expect(templateService.saveTemplate).toHaveBeenCalledTimes(1);
    expect(result.current.mode).toBe('edit');
    expect(result.current.editingTemplateId).toBe(mockUUID);
  });

  it('locks into EDIT mode when hydrating an existing schema', () => {
    const mockTemplate = {
      templateId: 'uuid_999',
      name: 'Existing Form',
      pages: [{ id: 'p1', title: 'Page 1', components: [{ id: 'c1', type: 'text_input', label: 'Name' }] }]
    };
    vi.spyOn(templateService, 'loadTemplate').mockReturnValue(mockTemplate);

    const { result } = renderHook(() => useSimpleFormBuilder());

    act(() => {
      result.current.loadExistingTemplate('uuid_999');
    });

    expect(result.current.mode).toBe('edit');
    expect(result.current.editingTemplateId).toBe('uuid_999');
    expect(result.current.components.length).toBe(1);
  });
});

describe('FormStateEngine - Page Management & Skill Guards', () => {
  it('enforces Empty Page Insertion Guard', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    // Initial page is empty
    expect(result.current.pages.length).toBe(1);
    expect(result.current.components.length).toBe(0);

    // Try adding a page - should be BLOCKED because the current page has 0 components
    act(() => {
      result.current.addPage();
    });
    expect(result.current.pages.length).toBe(1); // Still 1

    // Add a component to current page
    act(() => {
      result.current.addComponent('text_input');
    });
    expect(result.current.components.length).toBe(1);

    // Now try adding page - should SUCCEED
    act(() => {
      result.current.addPage();
    });
    expect(result.current.pages.length).toBe(2);
    expect(result.current.pages[1].title).toBe('Page 2');
  });

  it('enforces Multi-Page Auto-Deletion Garbage Collection and Sequential Reindexing', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    // Add component to Page 1
    act(() => {
      result.current.addComponent('text_input');
    });
    const c1Id = result.current.components[0].id;

    // Add Page 2
    act(() => {
      result.current.addPage();
    });
    expect(result.current.pages.length).toBe(2);
    expect(result.current.currentPageId).toBe(result.current.pages[1].id);

    // Add component to Page 2
    act(() => {
      result.current.addComponent('email_input');
    });
    expect(result.current.components.length).toBe(1);
    const c2Id = result.current.components[0].id;

    // Switch to Page 1
    act(() => {
      result.current.switchToPage(result.current.pages[0].id);
    });
    expect(result.current.components[0].id).toBe(c1Id);

    // Switch back to Page 2 and delete Page 2's only component
    act(() => {
      result.current.switchToPage(result.current.pages[1].id);
    });
    
    // Deleting the only component on Page 2 should trigger auto-deletion of Page 2 since Page 1 has components
    act(() => {
      result.current.deleteComponent(c2Id);
    });

    // Page 2 should be garbage-collected, reverting total pages back to 1
    expect(result.current.pages.length).toBe(1);
    expect(result.current.currentPageId).toBe(result.current.pages[0].id);
  });

  it('performs title reindexing sequentially upon page deletion', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());

    // Setup 3 pages, each with a component so they can be added
    act(() => {
      result.current.addComponent('text_input'); // Page 1
    });
    act(() => {
      result.current.addPage();
    });
    act(() => {
      result.current.addComponent('email_input'); // Page 2
    });
    act(() => {
      result.current.addPage();
    });
    act(() => {
      result.current.addComponent('number_input'); // Page 3
    });

    expect(result.current.pages.length).toBe(3);
    expect(result.current.pages[0].title).toBe('Page 1');
    expect(result.current.pages[1].title).toBe('Page 2');
    expect(result.current.pages[2].title).toBe('Page 3');

    // Delete Page 2
    const page2Id = result.current.pages[1].id;
    act(() => {
      result.current.deletePage(page2Id);
    });

    // Total pages should be 2, and they must be sequentially reindexed
    expect(result.current.pages.length).toBe(2);
    expect(result.current.pages[0].title).toBe('Page 1');
    expect(result.current.pages[1].title).toBe('Page 2'); // Former Page 3 reindexed to Page 2
  });
});

describe('FormStateEngine - Interactive Operations & History API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exercises all hook operations sequentially for maximum coverage', async () => {
    const { result } = renderHook(() => useSimpleFormBuilder());

    // 1. addComponent and handleDrop
    act(() => {
      result.current.addComponent('text_input');
    });
    expect(result.current.components.length).toBe(1);
    const textId = result.current.components[0].id;

    act(() => {
      result.current.handleDrop('email_input', { index: 0 });
    });
    expect(result.current.components.length).toBe(2);
    expect(result.current.components[0].type).toBe('email_input');
    const emailId = result.current.components[0].id;

    // 2. selectComponent
    act(() => {
      result.current.selectComponent(textId);
    });
    expect(result.current.selectedId).toBe(textId);

    // 3. updateComponent
    act(() => {
      result.current.updateComponent(textId, { label: 'New Label', required: true });
    });
    expect(result.current.components[1].label).toBe('New Label');
    expect(result.current.components[1].required).toBe(true);

    // 4. moveComponent
    act(() => {
      result.current.moveComponent(0, 1);
    });
    expect(result.current.components[0].id).toBe(textId);
    expect(result.current.components[1].id).toBe(emailId);

    // Try moving to same index (early return)
    act(() => {
      result.current.moveComponent(0, 0);
    });
    expect(result.current.components[0].id).toBe(textId);

    // 5. undo and redo
    act(() => {
      result.current.undo();
    });
    // Should revert back to before move (email at 0, text at 1)
    expect(result.current.components[0].id).toBe(emailId);
    expect(result.current.components[1].id).toBe(textId);

    expect(result.current.canRedo()).toBe(true);
    act(() => {
      result.current.redo();
    });
    // Should redo move (text at 0, email at 1)
    expect(result.current.components[0].id).toBe(textId);
    expect(result.current.components[1].id).toBe(emailId);

    // 6. updateComponents
    const customList = [
      { id: textId, type: 'text_input', label: 'Custom' } as any
    ];
    act(() => {
      result.current.updateComponents(customList);
    });
    expect(result.current.components.length).toBe(1);
    expect(result.current.components[0].label).toBe('Custom');

    // 7. exportJSON and importJSON (multi-page format)
    const exported = result.current.exportJSON();
    expect(typeof exported).toBe('string');

    act(() => {
      result.current.importJSON(exported);
    });
    expect(result.current.components[0].label).toBe('Custom');

    // importJSON (single-page format compatibility)
    const legacyJSON = JSON.stringify({
      templateName: 'Legacy Form',
      components: [
        { id: 'legacy_1', type: 'text_input', label: 'Legacy Text' }
      ]
    });
    act(() => {
      result.current.importJSON(legacyJSON);
    });
    expect(result.current.templateName).toBe('Legacy Form');
    expect(result.current.components[0].label).toBe('Legacy Text');

    // importJSON error handling
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    act(() => {
      result.current.importJSON('invalid-json');
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();

    // 8. togglePreview
    act(() => {
      result.current.togglePreview();
    });
    expect(result.current.previewMode).toBe(true);
    act(() => {
      result.current.togglePreview();
    });
    expect(result.current.previewMode).toBe(false);

    // 9. clearAll
    act(() => {
      result.current.clearAll();
    });
    expect(result.current.components.length).toBe(0);

    // 10. setEditMode & setCreateMode
    act(() => {
      result.current.setEditMode('tmpl_123');
    });
    expect(result.current.mode).toBe('edit');
    expect(result.current.editingTemplateId).toBe('tmpl_123');

    act(() => {
      result.current.setCreateMode();
    });
    expect(result.current.mode).toBe('create');
    expect(result.current.editingTemplateId).toBeUndefined();

    // 11. Page switching and navigation
    act(() => {
      result.current.addComponent('text_input'); // page 1 must be non-empty
    });
    act(() => {
      result.current.addPage(); // Adds page 2
    });
    act(() => {
      result.current.addComponent('email_input'); // page 2 must be non-empty
    });
    act(() => {
      result.current.addNewPage(); // Adds page 3
    });

    expect(result.current.pages.length).toBe(3);
    expect(result.current.getCurrentPageIndex()).toBe(2);

    act(() => {
      result.current.navigateToPreviousPage();
    });
    expect(result.current.getCurrentPageIndex()).toBe(1);

    act(() => {
      result.current.navigateToNextPage();
    });
    expect(result.current.getCurrentPageIndex()).toBe(2);

    // 12. Page movement (movePageUp / movePageDown / reorderPages)
    const page3Id = result.current.pages[2].id;

    act(() => {
      result.current.movePageUp(page3Id);
    });
    // Page 3 should now be at index 1
    expect(result.current.pages[1].id).toBe(page3Id);

    act(() => {
      result.current.movePageDown(page3Id);
    });
    // Page 3 should now be back at index 2
    expect(result.current.pages[2].id).toBe(page3Id);

    act(() => {
      result.current.reorderPages(0, 1);
    });
    expect(result.current.pages[0].title).toBe('Page 2');
    expect(result.current.pages[1].title).toBe('Page 1');

    // 13. deletePage edge cases
    // Try to delete active page when multiple pages exist (should fall back to survivor)
    act(() => {
      result.current.deletePage(result.current.currentPageId);
    });
    expect(result.current.pages.length).toBe(2);
  });
});

describe('FormStateEngine - Edge Cases & Fallbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles history truncation when inserting in the middle of history', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    act(() => {
      result.current.addComponent('text_input');
    });
    act(() => {
      result.current.addComponent('email_input');
    });
    expect(result.current.canUndo()).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo()).toBe(true);

    act(() => {
      result.current.addComponent('number_input');
    });
    expect(result.current.canRedo()).toBe(false);
  });

  it('prevents page deletion when only one page exists', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    expect(result.current.pages.length).toBe(1);

    const firstPageId = result.current.pages[0].id;
    act(() => {
      result.current.deletePage(firstPageId);
    });
    expect(result.current.pages.length).toBe(1);
  });

  it('prevents page movement when bounds are reached', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    act(() => {
      result.current.addComponent('text_input');
    });
    act(() => {
      result.current.addPage();
    });

    const page1Id = result.current.pages[0].id;
    const page2Id = result.current.pages[1].id;

    // Try moving page 1 up (out of bounds)
    act(() => {
      result.current.movePageUp(page1Id);
    });
    expect(result.current.pages[0].id).toBe(page1Id);

    // Try moving page 2 down (out of bounds)
    act(() => {
      result.current.movePageDown(page2Id);
    });
    expect(result.current.pages[1].id).toBe(page2Id);
  });

  it('handles template loading with empty pages fallback', () => {
    const mockTemplate = {
      templateId: 'tmpl_empty',
      name: 'Empty Template',
      pages: []
    };
    vi.spyOn(templateService, 'loadTemplate').mockReturnValue(mockTemplate);

    const { result } = renderHook(() => useSimpleFormBuilder());
    act(() => {
      result.current.loadExistingTemplate('tmpl_empty');
    });
    expect(result.current.pages.length).toBe(1);
    expect(result.current.pages[0].title).toBe('Page 1');
  });

  it('handles update and delete on nested components inside layout columns', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    // Setup: layout container with children
    const layout = {
      id: 'row_1',
      type: 'horizontal_layout',
      children: [
        { id: 'child_1', type: 'text_input', label: 'Child Label' }
      ]
    } as any;

    act(() => {
      result.current.updateComponents([layout]);
    });

    // Update child_1
    act(() => {
      result.current.updateComponent('child_1', { label: 'Updated Child' });
    });
    expect(result.current.components[0].children?.[0].label).toBe('Updated Child');

    // Delete child_1
    act(() => {
      result.current.deleteComponent('child_1');
    });
    expect(result.current.components[0].children?.length).toBe(0);
  });

  it('falls back when saving template name updates fail', () => {
    vi.spyOn(templateService, 'updateTemplate').mockImplementation(() => {
      throw new Error('Update failed');
    });

    const { result } = renderHook(() => useSimpleFormBuilder());
    act(() => {
      result.current.setEditMode('tmpl_error');
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      result.current.setTemplateName('New Error Name');
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
