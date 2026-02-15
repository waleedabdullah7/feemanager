/**
 * Desktop Storage Manager using IndexedDB
 * Provides virtually unlimited storage compared to localStorage (5-10MB)
 * 
 * Features:
 * - 100MB-1GB+ storage (browser dependent, can request more)
 * - Persistent across browser sessions
 * - Automatic quota management
 * - Migration from localStorage
 * - Compatible with existing code
 * 
 * Version: 3.0
 * Developer: MWA
 */

const DB_NAME = 'SchoolFeeManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  size: number;
}

class DesktopStorageManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  private async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        this.requestPersistentStorage();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('size', 'size', { unique: false });
          console.log('✅ Object store created with indexes');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Request persistent storage (prevents browser from evicting data)
   */
  private async requestPersistentStorage(): Promise<void> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Storage persistence: ${isPersisted ? 'granted' : 'denied'}`);
      
      if (!isPersisted) {
        console.warn('⚠️ Storage is not persistent. Browser may clear data under storage pressure.');
      }
    }
  }

  /**
   * Get item from storage
   */
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      await this.initialize();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(key);

        request.onsuccess = () => {
          const item = request.result as StorageItem | undefined;
          if (item && item.value !== undefined) {
            resolve(item.value as T);
          } else {
            resolve(defaultValue);
          }
        };

        request.onerror = () => {
          console.error(`Error reading key "${key}":`, request.error);
          resolve(defaultValue);
        };
      });
    } catch (error) {
      console.error(`Failed to get item "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await this.initialize();

      const jsonString = JSON.stringify(value);
      const sizeInBytes = new Blob([jsonString]).size;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const item: StorageItem = {
          key,
          value,
          timestamp: Date.now(),
          size: sizeInBytes
        };

        const request = objectStore.put(item);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`Error saving key "${key}":`, request.error);
          
          // Check if quota exceeded
          if (request.error?.name === 'QuotaExceededError') {
            reject(new Error(
              `Storage quota exceeded! Please:\n` +
              `1. Export backup\n` +
              `2. Delete old records\n` +
              `3. Request more storage in browser settings`
            ));
          } else {
            reject(request.error);
          }
        };
      });
    } catch (error) {
      console.error(`Failed to set item "${key}":`, error);
      throw error;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await this.initialize();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to remove item "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      await this.initialize();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => {
          console.log('✅ All data cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      await this.initialize();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAllKeys();

        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Get storage statistics with quota information
   */
  async getStorageInfo(): Promise<{
    usedMB: string;
    itemCount: number;
    quotaMB?: string;
    availableMB?: string;
    percentUsed?: string;
    isPersistent?: boolean;
    isUnlimited: boolean;
  }> {
    try {
      await this.initialize();

      const keys = await this.getAllKeys();
      let totalSize = 0;

      // Calculate total size
      for (const key of keys) {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const item = await new Promise<StorageItem>((resolve) => {
          const request = objectStore.get(key);
          request.onsuccess = () => resolve(request.result);
        });
        
        if (item) {
          totalSize += item.size;
        }
      }

      const usedMB = (totalSize / (1024 * 1024)).toFixed(2);

      // Get quota information
      let quotaInfo: any = { isUnlimited: true };
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const isPersistent = await navigator.storage.persisted();
        
        if (estimate.quota && estimate.usage !== undefined) {
          const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
          const availableMB = ((estimate.quota - estimate.usage) / (1024 * 1024)).toFixed(2);
          const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(1);
          
          quotaInfo = {
            quotaMB,
            availableMB,
            percentUsed,
            isPersistent,
            isUnlimited: estimate.quota > 100 * 1024 * 1024 // >100MB is effectively unlimited
          };
        }
      }

      return {
        usedMB,
        itemCount: keys.length,
        ...quotaInfo
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { usedMB: '0', itemCount: 0, isUnlimited: true };
    }
  }

  /**
   * Export all data to JSON
   */
  async exportAllData(): Promise<string> {
    try {
      await this.initialize();

      const keys = await this.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        const value = await this.getItem(key, null);
        if (value !== null) {
          data[key] = value;
        }
      }

      return JSON.stringify({
        version: '3.0.0',
        exportDate: new Date().toISOString(),
        storageType: 'IndexedDB',
        itemCount: keys.length,
        data
      }, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON
   */
  async importAllData(jsonData: string): Promise<{ success: boolean; message: string; itemsImported: number }> {
    try {
      const imported = JSON.parse(jsonData);
      
      if (!imported.data) {
        throw new Error('Invalid import format - missing data field');
      }

      let itemsImported = 0;

      // Import each key-value pair
      for (const [key, value] of Object.entries(imported.data)) {
        await this.setItem(key, value);
        itemsImported++;
      }

      console.log(`✅ Import complete: ${itemsImported} items`);
      
      return {
        success: true,
        message: `Successfully imported ${itemsImported} items`,
        itemsImported
      };
    } catch (error: any) {
      console.error('Import failed:', error);
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        itemsImported: 0
      };
    }
  }

  /**
   * Migrate data from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<{ 
    success: boolean; 
    itemsMigrated: number; 
    errors: string[] 
  }> {
    try {
      await this.initialize();
      
      const itemsMigrated: string[] = [];
      const errors: string[] = [];
      
      // Keys to migrate
      const keysToMigrate = [
        'school_info',
        'users',
        'students',
        'teachers',
        'fee_records',
        'salary_payments',
        'classes',
        'fee_heads',
        'academic_years',
        'fee_structures',
        'google_api_config',
        'audit_logs',
        'backup_files',
        'setup_complete',
        'current_user',
        'theme',
        'last_user_id',
        'last_student_id',
        'last_teacher_id',
        'last_receipt_id',
        'last_salary_payment_id'
      ];

      for (const key of keysToMigrate) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            try {
              const parsed = JSON.parse(value);
              await this.setItem(key, parsed);
              itemsMigrated.push(key);
              console.log(`✅ Migrated: ${key}`);
            } catch (e) {
              // Not JSON, store as-is
              await this.setItem(key, value);
              itemsMigrated.push(key);
              console.log(`✅ Migrated (string): ${key}`);
            }
          }
        } catch (error: any) {
          errors.push(`Failed to migrate ${key}: ${error.message}`);
          console.error(`❌ Failed to migrate ${key}:`, error);
        }
      }

      console.log(`✅ Migration complete: ${itemsMigrated.length} items migrated`);
      
      if (errors.length > 0) {
        console.warn(`⚠️ Migration had ${errors.length} errors:`, errors);
      }

      return {
        success: true,
        itemsMigrated: itemsMigrated.length,
        errors
      };
    } catch (error: any) {
      console.error('Migration failed:', error);
      return {
        success: false,
        itemsMigrated: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Request more storage quota (only works in some browsers)
   */
  async requestMoreQuota(requestedMB: number = 1024): Promise<boolean> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const currentQuota = estimate.quota || 0;
        const requestedBytes = requestedMB * 1024 * 1024;
        
        console.log(`Current quota: ${(currentQuota / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Requesting: ${requestedMB}MB`);
        
        // Note: There's no direct API to request specific quota
        // But persisting storage helps
        if ('persist' in navigator.storage) {
          const granted = await navigator.storage.persist();
          console.log(`Persistent storage: ${granted ? 'granted' : 'denied'}`);
          return granted;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request quota:', error);
      return false;
    }
  }

  /**
   * Cleanup old items to free space
   */
  async cleanupOldItems(olderThanDays: number = 365): Promise<number> {
    try {
      await this.initialize();
      
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const index = objectStore.index('timestamp');
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            console.log(`✅ Cleanup complete: ${deletedCount} old items deleted`);
            resolve(deletedCount);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const desktopStorage = new DesktopStorageManager();

// Backward compatibility adapter for existing code
export const storageAdapter = {
  getItem: <T>(key: string, defaultValue: T) => desktopStorage.getItem(key, defaultValue),
  setItem: <T>(key: string, value: T) => desktopStorage.setItem(key, value),
  removeItem: (key: string) => desktopStorage.removeItem(key),
  clear: () => desktopStorage.clear(),
  getAllKeys: () => desktopStorage.getAllKeys(),
  getStorageInfo: () => desktopStorage.getStorageInfo(),
  exportAllData: () => desktopStorage.exportAllData(),
  importAllData: (data: string) => desktopStorage.importAllData(data),
  migrateFromLocalStorage: () => desktopStorage.migrateFromLocalStorage(),
  requestMoreQuota: (mb: number) => desktopStorage.requestMoreQuota(mb),
  cleanupOldItems: (days: number) => desktopStorage.cleanupOldItems(days)
};

// Auto-initialize on import
desktopStorage.getStorageInfo().then(info => {
  console.log('📊 Desktop Storage Ready:');
  console.log(`   - Used: ${info.usedMB}MB`);
  console.log(`   - Items: ${info.itemCount}`);
  console.log(`   - Quota: ${info.quotaMB || 'N/A'}MB`);
  console.log(`   - Available: ${info.availableMB || 'N/A'}MB`);
  console.log(`   - Unlimited: ${info.isUnlimited ? '✅ Yes' : '❌ No'}`);
  console.log(`   - Persistent: ${info.isPersistent ? '✅ Yes' : '⚠️ No'}`);
});
