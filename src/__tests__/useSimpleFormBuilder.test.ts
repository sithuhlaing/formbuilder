import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimpleFormBuilder, INITIAL_STATE, formBuilderReducer } from '../hooks/useSimpleFormBuilder';
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

describe('useSimpleFormBuilder - Direct Reducer Branch Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('covers reducer default fallback case', () => {
    const nextState = formBuilderReducer(INITIAL_STATE, { type: 'INVALID_TEST_TYPE' });
    expect(nextState).toBe(INITIAL_STATE);
  });

  it('covers UNDO boundary fallback when history index is 0 or less', () => {
    const stateWithLowHistoryIndex = {
      ...INITIAL_STATE,
      historyIndex: 0
    };
    const nextState = formBuilderReducer(stateWithLowHistoryIndex, { type: 'UNDO' });
    expect(nextState).toBe(stateWithLowHistoryIndex);
  });

  it('covers REDO boundary fallback when history index is at the end', () => {
    const stateWithHighHistoryIndex = {
      ...INITIAL_STATE,
      history: [{} as any],
      historyIndex: 0
    };
    const nextState = formBuilderReducer(stateWithHighHistoryIndex, { type: 'REDO' });
    expect(nextState).toBe(stateWithHighHistoryIndex);
  });

  it('covers ADD_COMPONENT fallback when type is null or undefined', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const nextState = formBuilderReducer(INITIAL_STATE, { type: 'ADD_COMPONENT', payload: { type: null } });
    expect(nextState).toBe(INITIAL_STATE);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('covers LOAD_TEMPLATE fallback when template does not exist', () => {
    vi.spyOn(templateService, 'loadTemplate').mockReturnValue(null);
    const nextState = formBuilderReducer(INITIAL_STATE, { type: 'LOAD_TEMPLATE', payload: { templateId: 'unknown' } });
    expect(nextState).toBe(INITIAL_STATE);
  });

  it('covers LOAD_TEMPLATE fallback properties for empty or missing template pages structures', () => {
    const incompleteTemplate = {
      templateId: 'tmpl_incomplete',
      name: 'Incomplete',
      pages: [
        {
          // missing id, title, and components/items
        }
      ]
    };
    vi.spyOn(templateService, 'loadTemplate').mockReturnValue(incompleteTemplate as any);
    
    const nextState = formBuilderReducer(INITIAL_STATE, { type: 'LOAD_TEMPLATE', payload: { templateId: 'tmpl_incomplete' } });
    expect(nextState.pages.length).toBe(1);
    expect(nextState.pages[0].id).toBeDefined();
    expect(nextState.pages[0].title).toBe('Untitled Page');
    expect(nextState.pages[0].components).toEqual([]);
  });

  it('covers SAVE_TEMPLATE fallback branches', () => {
    // 1. SAVE_TEMPLATE in edit mode (calls updateTemplate)
    const editState = {
      ...INITIAL_STATE,
      mode: 'edit' as const,
      editingTemplateId: 'tmpl_edit_test'
    };
    const mockUpdate = vi.fn();
    vi.spyOn(templateService, 'updateTemplate').mockImplementation(mockUpdate);

    formBuilderReducer(editState, { type: 'SAVE_TEMPLATE' });
    expect(templateService.updateTemplate).toHaveBeenCalledWith('tmpl_edit_test', expect.any(Object));

    // 2. SAVE_TEMPLATE when saveTemplate fails (returns template without templateId)
    vi.spyOn(templateService, 'saveTemplate').mockReturnValue({} as any);
    const failState = formBuilderReducer(INITIAL_STATE, { type: 'SAVE_TEMPLATE' });
    expect(failState).toBe(INITIAL_STATE);
  });

  it('covers IMPORT_JSON fallback for invalid structure throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const nextState = formBuilderReducer(INITIAL_STATE, { type: 'IMPORT_JSON', payload: { jsonString: '{}' } });
    expect(nextState).toBe(INITIAL_STATE);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('covers IMPORT_JSON name fallback branches and format variations', () => {
    // 1. JSON pages import with templateName provided
    const nextPages = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ pages: [{ id: 'p1', title: 'Imported Title' }], templateName: 'Provided Name' }) }
    });
    expect(nextPages.templateName).toBe('Provided Name');

    // 2. JSON components import with templateName provided
    const nextComps = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ components: [{ id: 'c1', type: 'text_input' }], templateName: 'Provided Comps' }) }
    });
    expect(nextComps.templateName).toBe('Provided Comps');
  });

  it('covers navigation action boundaries in useSimpleFormBuilder hook', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    // Add components so pages can be created
    act(() => { result.current.addComponent('text_input'); });
    act(() => { result.current.addPage(); });
    act(() => { result.current.addComponent('email_input'); });
    
    expect(result.current.pages.length).toBe(2);
    expect(result.current.getCurrentPageIndex()).toBe(1);

    // 1. navigateToNextPage on last page (boundary, should do nothing)
    act(() => {
      result.current.navigateToNextPage();
    });
    expect(result.current.getCurrentPageIndex()).toBe(1);

    // 2. navigateToPreviousPage to page 0
    act(() => {
      result.current.navigateToPreviousPage();
    });
    expect(result.current.getCurrentPageIndex()).toBe(0);

    // 3. navigateToPreviousPage on page 0 (boundary, should do nothing)
    act(() => {
      result.current.navigateToPreviousPage();
    });
    expect(result.current.getCurrentPageIndex()).toBe(0);
  });

  it('covers getCurrentPage fallback boundaries', () => {
    const { result } = renderHook(() => useSimpleFormBuilder());
    
    // Set currentPageId to an invalid ID
    act(() => {
      result.current.switchToPage('non-existent-page-id');
    });
    
    // Should fallback to the first page (index 0)
    const page = result.current.getCurrentPage();
    expect(page).not.toBeNull();
    expect(page?.id).toBe(result.current.pages[0].id);
  });

  it('covers covers multi-page reducer map fallback branches', () => {
    // Setup state with 2 pages, first page has 2 components, second page has 1 component
    const page1 = { id: 'p1', title: 'Page 1', components: [{ id: 'c1', type: 'text_input', label: 'C1' }, { id: 'c2', type: 'text_input', label: 'C2' }] };
    const page2 = { id: 'p2', title: 'Page 2', components: [{ id: 'c3', type: 'text_input', label: 'C3' }] };
    const state = {
      ...INITIAL_STATE,
      pages: [page1, page2] as any,
      currentPageId: 'p1',
      selectedId: 'c1'
    };

    // 1. UPDATE_COMPONENT: verify page 2 is mapped without modifications
    const stateAfterUpdate = formBuilderReducer(state, {
      type: 'UPDATE_COMPONENT',
      payload: { id: 'c1', updates: { label: 'Updated C1' } }
    });
    expect(stateAfterUpdate.pages[1]).toEqual(page2);

    // 2. UPDATE_COMPONENTS: verify page 2 is mapped without modifications
    const stateAfterUpdateAll = formBuilderReducer(state, {
      type: 'UPDATE_COMPONENTS',
      payload: { components: [] }
    });
    expect(stateAfterUpdateAll.pages[1]).toEqual(page2);

    // 3. DELETE_COMPONENT (where page is NOT empty after delete, and selectedId === id):
    const stateAfterDelete = formBuilderReducer(state, {
      type: 'DELETE_COMPONENT',
      payload: { id: 'c1' }
    });
    expect(stateAfterDelete.pages.length).toBe(2); // Should not delete page 1
    expect(stateAfterDelete.pages[0].components.length).toBe(1);
    expect(stateAfterDelete.pages[1]).toEqual(page2);
    expect(stateAfterDelete.selectedId).toBeNull(); // selectedId should be cleared

    // 4. MOVE_COMPONENT where fromIndex === toIndex
    const stateAfterMoveSame = formBuilderReducer(state, {
      type: 'MOVE_COMPONENT',
      payload: { fromIndex: 0, toIndex: 0 }
    });
    expect(stateAfterMoveSame).toBe(state);

    // 5. MOVE_COMPONENT (where page 2 is mapped unchanged)
    const stateAfterMoveDiff = formBuilderReducer(state, {
      type: 'MOVE_COMPONENT',
      payload: { fromIndex: 0, toIndex: 1 }
    });
    expect(stateAfterMoveDiff.pages[1]).toEqual(page2);

    // 6. IMPORT_JSON fallback templateName when missing in payload
    const stateAfterImportNoNamePages = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ pages: [{ id: 'p1', title: 'Imported Title' }] }) }
    });
    expect(stateAfterImportNoNamePages.templateName).toBe('Imported Form');

    const stateAfterImportNoNameComps = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ components: [{ id: 'c1', type: 'text_input' }] }) }
    });
    expect(stateAfterImportNoNameComps.templateName).toBe('Imported Form');

    // 7. IMPORT_JSON with invalid array types
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const stateInvalidPages = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ pages: 'not-an-array' }) }
    });
    expect(stateInvalidPages).toBe(INITIAL_STATE);

    const stateInvalidComps = formBuilderReducer(INITIAL_STATE, {
      type: 'IMPORT_JSON',
      payload: { jsonString: JSON.stringify({ components: 'not-an-array' }) }
    });
    expect(stateInvalidComps).toBe(INITIAL_STATE);

    consoleSpy.mockRestore();
  });

  it('covers DELETE_PAGE reindexing when deleted page index is greater than 0', () => {
    const page1 = { id: 'p1', title: 'Page 1', components: [{ id: 'c1', type: 'text_input' }] };
    const page2 = { id: 'p2', title: 'Page 2', components: [{ id: 'c2', type: 'text_input' }] };
    const page3 = { id: 'p3', title: 'Page 3', components: [{ id: 'c3', type: 'text_input' }] };
    const state = {
      ...INITIAL_STATE,
      pages: [page1, page2, page3] as any,
      currentPageId: 'p3'
    };

    const stateAfterDelete = formBuilderReducer(state, {
      type: 'DELETE_PAGE',
      payload: { pageId: 'p3' }
    });
    expect(stateAfterDelete.pages.length).toBe(2);
    expect(stateAfterDelete.currentPageId).toBe('p1'); // should default to index 0 (page 1)
  });

  it('covers DELETE_COMPONENT when activePage is undefined', () => {
    const state = {
      ...INITIAL_STATE,
      currentPageId: 'invalid-page-id'
    };
    const nextState = formBuilderReducer(state, {
      type: 'DELETE_COMPONENT',
      payload: { id: 'c1' }
    });
    expect(nextState.currentPageId).toBe('invalid-page-id');
  });
});
