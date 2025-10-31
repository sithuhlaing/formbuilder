'use client';

import { useCallback, useMemo, useState } from 'react';
import { BuilderTab } from '@/types/template';

const builderTabs: BuilderTab[] = [
  { id: 'preview', label: 'Live Preview', path: '/builder/preview' },
  { id: 'validation', label: 'Validation', path: '/builder/validation' },
  { id: 'layout', label: 'Layout', path: '/builder/layout' },
  { id: 'style', label: 'Style', path: '/builder/style' },
];

type UseBuilderTabsResult = {
  tabs: BuilderTab[];
  activeTab: BuilderTab;
  setActiveTab: (tabId: BuilderTab['id']) => void;
  getTabById: (tabId: BuilderTab['id']) => BuilderTab | undefined;
};

export function useBuilderTabs(defaultTab: BuilderTab['id'] = 'preview'): UseBuilderTabsResult {
  const [activeTabId, setActiveTabId] = useState<BuilderTab['id']>(defaultTab);

  const activeTab = useMemo(
    () => builderTabs.find((tab) => tab.id === activeTabId) ?? builderTabs[0],
    [activeTabId],
  );

  const setActiveTab = useCallback((tabId: BuilderTab['id']) => {
    setActiveTabId(tabId);
  }, []);

  const getTabById = useCallback((tabId: BuilderTab['id']) => {
    return builderTabs.find((tab) => tab.id === tabId);
  }, []);

  return {
    tabs: builderTabs,
    activeTab,
    setActiveTab,
    getTabById,
  };
}
