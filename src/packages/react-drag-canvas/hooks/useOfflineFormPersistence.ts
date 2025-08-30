/**
 * PWA Offline Form Persistence Hook
 * Handles local storage, IndexedDB, and sync when online
 */

import { useState, useEffect, useCallback } from 'react';

interface FormData {
  id: string;
  name: string;
  components: any[];
  lastModified: number;
  version: number;
}

interface OfflineFormState {
  forms: FormData[];
  isOnline: boolean;
  pendingSync: string[];
  lastSyncTime: number;
}

interface UseOfflineFormPersistenceOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  maxStoredForms?: number;
  onSyncSuccess?: (formId: string) => void;
  onSyncError?: (formId: string, error: Error) => void;
}

// IndexedDB wrapper for form storage
class FormStorageDB {
  private dbName = 'FormBuilderPWA';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create forms store
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { keyPath: 'id' });
          formsStore.createIndex('lastModified', 'lastModified', { unique: false });
          formsStore.createIndex('name', 'name', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'formId' });
        }
      };
    });
  }

  async saveForm(form: FormData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const request = store.put(form);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getForm(id: string): Promise<FormData | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllForms(): Promise<FormData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteForm(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addToSyncQueue(formId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.put({ formId, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncQueue(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result || [];
        resolve(items.map(item => item.formId));
      };
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const useOfflineFormPersistence = (options: UseOfflineFormPersistenceOptions = {}) => {
  const {
    autoSave = true,
    autoSaveInterval = 5000, // 5 seconds
    maxStoredForms = 50,
    onSyncSuccess,
    onSyncError
  } = options;

  const [state, setState] = useState<OfflineFormState>({
    forms: [],
    isOnline: navigator.onLine,
    pendingSync: [],
    lastSyncTime: 0
  });

  const [storage] = useState(() => new FormStorageDB());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await storage.init();
        const forms = await storage.getAllForms();
        const pendingSync = await storage.getSyncQueue();
        
        setState(prev => ({
          ...prev,
          forms,
          pendingSync
        }));
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initStorage();
  }, [storage]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when coming back online
      if (state.pendingSync.length > 0) {
        syncPendingForms();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.pendingSync.length]);

  // Save form to local storage
  const saveFormLocally = useCallback(async (formData: Omit<FormData, 'lastModified' | 'version'>) => {
    if (!isInitialized) return;

    try {
      const existingForm = await storage.getForm(formData.id);
      const version = existingForm ? existingForm.version + 1 : 1;
      
      const form: FormData = {
        ...formData,
        lastModified: Date.now(),
        version
      };

      await storage.saveForm(form);
      
      // Add to sync queue if offline
      if (!state.isOnline) {
        await storage.addToSyncQueue(form.id);
        setState(prev => ({
          ...prev,
          pendingSync: [...new Set([...prev.pendingSync, form.id])]
        }));
      }

      // Update local state
      setState(prev => ({
        ...prev,
        forms: prev.forms.some(f => f.id === form.id)
          ? prev.forms.map(f => f.id === form.id ? form : f)
          : [...prev.forms, form]
      }));

      // Cleanup old forms if exceeding limit
      if (state.forms.length >= maxStoredForms) {
        await cleanupOldForms();
      }

    } catch (error) {
      console.error('Failed to save form locally:', error);
      throw error;
    }
  }, [isInitialized, state.isOnline, state.forms.length, maxStoredForms, storage]);

  // Load form from local storage
  const loadFormLocally = useCallback(async (formId: string): Promise<FormData | null> => {
    if (!isInitialized) return null;

    try {
      return await storage.getForm(formId);
    } catch (error) {
      console.error('Failed to load form locally:', error);
      return null;
    }
  }, [isInitialized, storage]);

  // Delete form from local storage
  const deleteFormLocally = useCallback(async (formId: string) => {
    if (!isInitialized) return;

    try {
      await storage.deleteForm(formId);
      setState(prev => ({
        ...prev,
        forms: prev.forms.filter(f => f.id !== formId),
        pendingSync: prev.pendingSync.filter(id => id !== formId)
      }));
    } catch (error) {
      console.error('Failed to delete form locally:', error);
      throw error;
    }
  }, [isInitialized, storage]);

  // Sync pending forms with server
  const syncPendingForms = useCallback(async () => {
    if (!state.isOnline || state.pendingSync.length === 0) return;

    const syncPromises = state.pendingSync.map(async (formId) => {
      try {
        const form = await storage.getForm(formId);
        if (!form) return;

        // Simulate API call - replace with actual sync logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onSyncSuccess?.(formId);
        return formId;
      } catch (error) {
        onSyncError?.(formId, error as Error);
        throw error;
      }
    });

    try {
      const syncedFormIds = await Promise.allSettled(syncPromises);
      const successfulSyncs = syncedFormIds
        .filter((result): result is PromiseFulfilledResult<string> => 
          result.status === 'fulfilled' && result.value !== undefined
        )
        .map(result => result.value);

      if (successfulSyncs.length > 0) {
        setState(prev => ({
          ...prev,
          pendingSync: prev.pendingSync.filter(id => !successfulSyncs.includes(id)),
          lastSyncTime: Date.now()
        }));

        // Clear synced items from queue
        await storage.clearSyncQueue();
        
        // Re-add failed items
        const failedSyncs = state.pendingSync.filter(id => !successfulSyncs.includes(id));
        for (const formId of failedSyncs) {
          await storage.addToSyncQueue(formId);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [state.isOnline, state.pendingSync, storage, onSyncSuccess, onSyncError]);

  // Cleanup old forms
  const cleanupOldForms = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const forms = await storage.getAllForms();
      const sortedForms = forms.sort((a, b) => b.lastModified - a.lastModified);
      const formsToDelete = sortedForms.slice(maxStoredForms);

      for (const form of formsToDelete) {
        await storage.deleteForm(form.id);
      }

      setState(prev => ({
        ...prev,
        forms: sortedForms.slice(0, maxStoredForms)
      }));
    } catch (error) {
      console.error('Failed to cleanup old forms:', error);
    }
  }, [isInitialized, maxStoredForms, storage]);

  // Get storage usage info
  const getStorageInfo = useCallback(async () => {
    if (!isInitialized) return { used: 0, available: 0, percentage: 0 };

    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return { used, available, percentage };
      }
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }

    return { used: 0, available: 0, percentage: 0 };
  }, [isInitialized]);

  return {
    // State
    isOnline: state.isOnline,
    isOffline: !state.isOnline,
    pendingSync: state.pendingSync,
    lastSyncTime: state.lastSyncTime,
    isInitialized,
    forms: state.forms,

    // Actions
    saveFormLocally,
    loadFormLocally,
    deleteFormLocally,
    syncPendingForms,
    cleanupOldForms,
    getStorageInfo,

    // Computed
    hasPendingSync: state.pendingSync.length > 0,
    storageReady: isInitialized,
  };
};
