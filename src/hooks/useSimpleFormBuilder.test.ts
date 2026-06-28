import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimpleFormBuilder } from './useSimpleFormBuilder';
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

