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
