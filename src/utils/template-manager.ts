import {
  Template,
  TemplateStorage,
  TemplateFilter,
  SaveTemplateData,
  PerformanceMetrics,
  NhsStyleSettings
} from '@/types/template';
import { templateLibrary } from '@/app/datas/template-definitions';

const isBrowser = typeof window !== 'undefined';

// LocalStorage Keys
const STORAGE_KEYS = {
  TEMPLATES_LIBRARY: 'fb.templates.library',
  TEMPLATES_CUSTOM: 'fb.templates.custom',
  TEMPLATES_FILTERS: 'fb.templates.lastFilters',
  SESSION_CURRENT: 'fb.session.current',
  STYLE_SETTINGS: 'fb.style.settings',
  PERFORMANCE_METRICS: 'fb.performance.metrics',
  TEMPLATES_USAGE: 'fb.templates.usage'
} as const;

const defaultStyleSettings: NhsStyleSettings = {
  typographyScale: 'nhs-default',
  spacingScale: 'nhs-default',
  colorPreset: 'standard-aa',
  showLogo: false,
  logoUrl: undefined,
  clinicName: undefined,
  showFooter: false,
  footerText: undefined
};

type TemplateUsageRecord = {
  templateId: string;
  usedAt: string;
};

// Default storage structure
const defaultStorage: TemplateStorage = {
  library: templateLibrary,
  customTemplates: [],
  lastFilters: {
    category: 'all',
    type: 'all',
    difficulty: 'all',
    search: '',
    hipaaReady: false
  },
  currentSession: {
    lastModified: new Date().toISOString()
  }
};

// Template Manager Class
export class TemplateManager {
  private static instance: TemplateManager;
  private storage: TemplateStorage;
  private performanceMetrics: PerformanceMetrics;
  private styleSettings: NhsStyleSettings;
  private usageHistory: TemplateUsageRecord[];

  private constructor() {
    this.storage = this.loadStorage();
    this.performanceMetrics = this.loadPerformanceMetrics();
    this.styleSettings = this.loadStyleSettings();
    this.usageHistory = this.loadUsageHistory();
  }

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  // Storage Operations
  private loadStorage(): TemplateStorage {
    if (!isBrowser) {
      return defaultStorage;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES_LIBRARY);
      const customStored = localStorage.getItem(STORAGE_KEYS.TEMPLATES_CUSTOM);
      const filtersStored = localStorage.getItem(STORAGE_KEYS.TEMPLATES_FILTERS);
      const sessionStored = localStorage.getItem(STORAGE_KEYS.SESSION_CURRENT);

      return {
        library: stored ? JSON.parse(stored) : defaultStorage.library,
        customTemplates: customStored ? JSON.parse(customStored) : defaultStorage.customTemplates,
        lastFilters: filtersStored ? JSON.parse(filtersStored) : defaultStorage.lastFilters,
        currentSession: sessionStored ? JSON.parse(sessionStored) : defaultStorage.currentSession
      };
    } catch (error) {
      console.error('Error loading template storage:', error);
      return defaultStorage;
    }
  }

  private saveStorage(): void {
    if (!isBrowser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES_LIBRARY, JSON.stringify(this.storage.library));
      localStorage.setItem(STORAGE_KEYS.TEMPLATES_CUSTOM, JSON.stringify(this.storage.customTemplates));
      localStorage.setItem(STORAGE_KEYS.TEMPLATES_FILTERS, JSON.stringify(this.storage.lastFilters));
      localStorage.setItem(STORAGE_KEYS.SESSION_CURRENT, JSON.stringify(this.storage.currentSession));
    } catch (error) {
      console.error('Error saving template storage:', error);
    }
  }

  private loadPerformanceMetrics(): PerformanceMetrics {
    if (!isBrowser) {
      return {
        templateLoadTime: 0,
        previewRenderTime: 0,
        builderResponseTime: 0,
        memoryUsage: 0
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PERFORMANCE_METRICS);
      return stored ? JSON.parse(stored) : {
        templateLoadTime: 0,
        previewRenderTime: 0,
        builderResponseTime: 0,
        memoryUsage: 0
      };
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      return {
        templateLoadTime: 0,
        previewRenderTime: 0,
        builderResponseTime: 0,
        memoryUsage: 0
      };
    }
  }

  private savePerformanceMetrics(): void {
    if (!isBrowser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE_METRICS, JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('Error saving performance metrics:', error);
    }
  }

  private loadStyleSettings(): NhsStyleSettings {
    if (!isBrowser) {
      return defaultStyleSettings;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STYLE_SETTINGS);
      return stored ? { ...defaultStyleSettings, ...JSON.parse(stored) } : defaultStyleSettings;
    } catch (error) {
      console.error('Error loading style settings:', error);
      return defaultStyleSettings;
    }
  }

  private saveStyleSettings(): void {
    if (!isBrowser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STYLE_SETTINGS, JSON.stringify(this.styleSettings));
    } catch (error) {
      console.error('Error saving style settings:', error);
    }
  }

  private loadUsageHistory(): TemplateUsageRecord[] {
    if (!isBrowser) {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES_USAGE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading usage history:', error);
      return [];
    }
  }

  private saveUsageHistory(): void {
    if (!isBrowser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES_USAGE, JSON.stringify(this.usageHistory));
    } catch (error) {
      console.error('Error saving usage history:', error);
    }
  }

  // Template Operations
  public getAllTemplates(): Template[] {
    return [...this.storage.library, ...this.storage.customTemplates];
  }

  public getTemplateById(id: string): Template | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  public getCustomTemplates(): Template[] {
    return this.storage.customTemplates;
  }

  public getLibraryTemplates(): Template[] {
    return this.storage.library;
  }

  public saveCustomTemplate(templateData: SaveTemplateData, baseTemplate?: Template): Template {
    const startTime = performance.now();
    
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      type: baseTemplate?.type ?? 'general',
      difficulty: baseTemplate?.difficulty ?? 'medium',
      fieldCount: baseTemplate?.fieldCount || 0,
      estimatedTime: baseTemplate?.estimatedTime || '~3m',
      thumbnailUrl: templateData.thumbnailUrl,
      tags: templateData.tags,
      isCustom: true,
      isHipaaCompliant: baseTemplate?.isHipaaCompliant ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      pages: baseTemplate?.pages ? JSON.parse(JSON.stringify(baseTemplate.pages)) : []
    };

    this.storage.customTemplates.push(newTemplate);
    this.saveStorage();

    const endTime = performance.now();
    this.performanceMetrics.templateLoadTime = endTime - startTime;
    this.savePerformanceMetrics();

    return newTemplate;
  }

  public updateCustomTemplate(id: string, updates: Partial<Template>): Template | null {
    const index = this.storage.customTemplates.findIndex(template => template.id === id);
    if (index === -1) return null;

    this.storage.customTemplates[index] = {
      ...this.storage.customTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveStorage();
    return this.storage.customTemplates[index];
  }

  public deleteCustomTemplate(id: string): boolean {
    const index = this.storage.customTemplates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.storage.customTemplates.splice(index, 1);
    this.saveStorage();
    return true;
  }

  public duplicateTemplate(id: string, newName: string): Template | null {
    const template = this.getTemplateById(id);
    if (!template) return null;

    const duplicated: Template = {
      ...template,
      id: `custom-${Date.now()}`,
      name: newName,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    if (template.isCustom) {
      this.storage.customTemplates.push(duplicated);
    } else {
      this.storage.customTemplates.push(duplicated);
    }

    this.saveStorage();
    return duplicated;
  }

  public getStyleSettings(): NhsStyleSettings {
    return this.styleSettings;
  }

  public updateStyleSettings(updates: Partial<NhsStyleSettings>): NhsStyleSettings {
    this.styleSettings = {
      ...this.styleSettings,
      ...updates
    };
    this.saveStyleSettings();
    return this.styleSettings;
  }

  public recordTemplateUsage(templateId: string): void {
    if (!templateId) return;

    const entry: TemplateUsageRecord = {
      templateId,
      usedAt: new Date().toISOString()
    };

    this.usageHistory = [entry, ...this.usageHistory.filter(record => record.templateId !== templateId)].slice(0, 10);
    this.saveUsageHistory();
  }

  public getRecentTemplateIds(): string[] {
    return this.usageHistory.map(record => record.templateId);
  }

  public getRecentTemplates(): Template[] {
    const ids = this.getRecentTemplateIds();
    return ids
      .map(id => this.getTemplateById(id))
      .filter((template): template is Template => Boolean(template));
  }

  // Filter Operations
  public getFilters(): TemplateFilter {
    return this.storage.lastFilters;
  }

  public setFilters(filters: Partial<TemplateFilter>): void {
    this.storage.lastFilters = {
      ...this.storage.lastFilters,
      ...filters
    };
    this.saveStorage();
  }

  public clearFilters(): void {
    this.storage.lastFilters = defaultStorage.lastFilters;
    this.saveStorage();
  }

  public filterTemplates(templates: Template[], filters: TemplateFilter): Template[] {
    let filtered = [...templates];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(template => template.category === filters.category);
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(template => template.type === filters.type);
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === filters.difficulty);
    }

    // HIPAA filter
    if (filters.hipaaReady) {
      filtered = filtered.filter(template => template.isHipaaCompliant);
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }

  // Session Management
  public setCurrentTemplate(templateId: string, isCustom: boolean = false): void {
    this.storage.currentSession = {
      templateId: isCustom ? undefined : templateId,
      customTemplateId: isCustom ? templateId : undefined,
      lastModified: new Date().toISOString()
    };
    this.saveStorage();
  }

  public getCurrentSession(): TemplateStorage['currentSession'] {
    return this.storage.currentSession;
  }

  public clearCurrentSession(): void {
    this.storage.currentSession = defaultStorage.currentSession;
    this.saveStorage();
  }

  // Performance Monitoring
  public getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMetrics;
  }

  public updatePerformanceMetrics(updates: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...updates
    };
    this.savePerformanceMetrics();
  }

  public measurePerformance<T>(operation: () => T, metricKey: keyof PerformanceMetrics): T {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();

    this.updatePerformanceMetrics({
      [metricKey]: endTime - startTime
    } as Partial<PerformanceMetrics>);

    return result;
  }

  // Storage Management
  public exportTemplates(): string {
    return JSON.stringify({
      library: this.storage.library,
      customTemplates: this.storage.customTemplates,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  public importTemplates(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      
      if (imported.customTemplates && Array.isArray(imported.customTemplates)) {
        this.storage.customTemplates = [...this.storage.customTemplates, ...imported.customTemplates];
        this.saveStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing templates:', error);
      return false;
    }
  }

  public clearAllData(): void {
    if (!isBrowser) {
      return;
    }

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      this.storage = defaultStorage;
      this.performanceMetrics = this.loadPerformanceMetrics();
      this.styleSettings = defaultStyleSettings;
      this.usageHistory = [];
      this.saveStyleSettings();
      this.saveUsageHistory();
    } catch (error) {
      console.error('Error clearing template data:', error);
    }
  }

  // Storage Statistics
  public getStorageStats(): {
    totalTemplates: number;
    customTemplates: number;
    libraryTemplates: number;
    storageSize: number;
  } {
    if (!isBrowser) {
      return {
        totalTemplates: this.getAllTemplates().length,
        customTemplates: this.storage.customTemplates.length,
        libraryTemplates: this.storage.library.length,
        storageSize: 0
      };
    }

    const totalTemplates = this.getAllTemplates().length;
    const customTemplates = this.storage.customTemplates.length;
    const libraryTemplates = this.storage.library.length;
    
    let storageSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        storageSize += new Blob([item]).size;
      }
    });

    return {
      totalTemplates,
      customTemplates,
      libraryTemplates,
      storageSize
    };
  }
}

// Utility functions
export const getStorageUsage = (): { used: number; available: number; percentage: number } => {
  if (!isBrowser) {
    return { used: 0, available: 0, percentage: 0 };
  }

  const templateManager = TemplateManager.getInstance();
  const testKey = 'storage-test';
  const testData = 'x'.repeat(1024); // 1KB test data
  
  try {
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    
    // Estimate available storage (typically 5-10MB for localStorage)
    const estimated = 5 * 1024 * 1024; // 5MB
    const used = templateManager.getStorageStats().storageSize;
    
    return {
      used,
      available: estimated - used,
      percentage: (used / estimated) * 100
    };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
};

export const isStorageAvailable = (): boolean => {
  if (!isBrowser) {
    return false;
  }

  try {
    const testKey = 'storage-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};
