// src/utils/electronStorage.ts
/**
 * Electron Desktop Storage API
 * Adapter for React app to use Electron's SQLite database
 * Provides unlimited storage via desktop hard disk
 * 
 * Features:
 * - Unlimited storage (hard disk capacity)
 * - Fast SQLite database
 * - Automatic backups
 * - Export/import functionality
 * - Backward compatible with existing code
 * 
 * Version: 3.0 Desktop Edition
 */

declare global {
  interface Window {
    electronAPI?: {
      db: {
        get: <T>(key: string, defaultValue: T) => Promise<T>;
        set: <T>(key: string, value: T) => Promise<void>;
        remove: (key: string) => Promise<void>;
        query: (sql: string, params?: any[]) => Promise<any[]>;
        getStorageInfo: () => Promise<any>;
        backup: (directory?: string) => Promise<any>;
        export: () => Promise<string>;
        import: (jsonData: string) => Promise<any>;
      };
      app: {
        getInfo: () => Promise<any>;
      };
      dialog: {
        showSaveDialog: (options: any) => Promise<any>;
        showOpenDialog: (options: any) => Promise<any>;
      };
      shell: {
        showItemInFolder: (filepath: string) => Promise<void>;
        openExternal: (url: string) => Promise<void>;
      };
      platform: string;
      isElectron: boolean;
    };
  }
}

/**
 * Check if running in Electron
 */
export const isElectron = (): boolean => {
  return window.electronAPI?.isElectron === true;
};

/**
 * Unified Storage API
 * Works with both Electron (SQLite) and Web (IndexedDB)
 */
class UnifiedStorage {
  /**
   * Get item from storage
   */
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    if (isElectron()) {
      return window.electronAPI!.db.get<T>(key, defaultValue);
    } else {
      // Fallback to IndexedDB for web version
      const { desktopStorage } = await import('./desktopStorage');
      return desktopStorage.getItem(key, defaultValue);
    }
  }

  /**
   * Set item in storage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    if (isElectron()) {
      return window.electronAPI!.db.set(key, value);
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      return desktopStorage.setItem(key, value);
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    if (isElectron()) {
      return window.electronAPI!.db.remove(key);
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      return desktopStorage.removeItem(key);
    }
  }

  /**
   * Get storage information
   */
  async getStorageInfo() {
    if (isElectron()) {
      const info = await window.electronAPI!.db.getStorageInfo();
      return {
        ...info,
        type: 'Desktop SQLite',
        unlimited: true,
        isElectron: true
      };
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      const info = await desktopStorage.getStorageInfo();
      return {
        ...info,
        type: 'IndexedDB',
        unlimited: false,
        isElectron: false
      };
    }
  }

  /**
   * Create backup
   */
  async createBackup(directory?: string) {
    if (isElectron()) {
      return window.electronAPI!.db.backup(directory);
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      const data = await desktopStorage.exportAllData();
      
      // Download as file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SchoolFeeManager_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        filename: link.download,
        message: 'Backup downloaded'
      };
    }
  }

  /**
   * Export all data
   */
  async exportAllData(): Promise<string> {
    if (isElectron()) {
      return window.electronAPI!.db.export();
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      return desktopStorage.exportAllData();
    }
  }

  /**
   * Import data
   */
  async importAllData(jsonData: string) {
    if (isElectron()) {
      return window.electronAPI!.db.import(jsonData);
    } else {
      const { desktopStorage } = await import('./desktopStorage');
      return desktopStorage.importAllData(jsonData);
    }
  }

  /**
   * Execute SQL query (Electron only)
   */
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (isElectron()) {
      return window.electronAPI!.db.query(sql, params);
    } else {
      throw new Error('SQL queries are only available in desktop version');
    }
  }
}

// Create singleton instance
export const storage = new UnifiedStorage();

// Backward compatibility adapter
export const storageAdapter = {
  getItem: <T>(key: string, defaultValue: T) => storage.getItem(key, defaultValue),
  setItem: <T>(key: string, value: T) => storage.setItem(key, value),
  removeItem: (key: string) => storage.removeItem(key),
  getStorageInfo: () => storage.getStorageInfo(),
  createBackup: (dir?: string) => storage.createBackup(dir),
  exportAllData: () => storage.exportAllData(),
  importAllData: (data: string) => storage.importAllData(data),
  query: (sql: string, params?: any[]) => storage.query(sql, params)
};

/**
 * Get application information
 */
export const getAppInfo = async () => {
  if (isElectron()) {
    return window.electronAPI!.app.getInfo();
  } else {
    return {
      version: '3.0.0-web',
      name: 'School Fee Manager Pro (Web)',
      platform: navigator.platform,
      type: 'Web Application'
    };
  }
};

/**
 * Show save file dialog
 */
export const showSaveDialog = async (options: any) => {
  if (isElectron()) {
    return window.electronAPI!.dialog.showSaveDialog(options);
  } else {
    // Web fallback - use download
    return { canceled: false, filePath: null };
  }
};

/**
 * Show open file dialog
 */
export const showOpenDialog = async (options: any) => {
  if (isElectron()) {
    return window.electronAPI!.dialog.showOpenDialog(options);
  } else {
    // Web fallback - use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.filters?.map((f: any) => `.${f.extensions.join(',.')}`).join(',');
      input.onchange = (e: any) => {
        const files = e.target?.files;
        if (files && files.length > 0) {
          resolve({ canceled: false, filePaths: [files[0].path] });
        } else {
          resolve({ canceled: true, filePaths: [] });
        }
      };
      input.click();
    });
  }
};

/**
 * Open file location in file explorer
 */
export const showItemInFolder = async (filepath: string) => {
  if (isElectron()) {
    return window.electronAPI!.shell.showItemInFolder(filepath);
  } else {
    console.log('Show in folder not available in web version:', filepath);
  }
};

/**
 * Open external URL
 */
export const openExternal = async (url: string) => {
  if (isElectron()) {
    return window.electronAPI!.shell.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Hook to detect Electron environment
 */
export const useElectron = () => {
  return {
    isElectron: isElectron(),
    platform: isElectron() ? window.electronAPI!.platform : 'web',
    storage,
    getAppInfo,
    showSaveDialog,
    showOpenDialog,
    showItemInFolder,
    openExternal
  };
};

// Log environment on load
if (isElectron()) {
  console.log('🖥️ Running in Electron Desktop App');
  getAppInfo().then(info => {
    console.log('📦 App Info:', info);
  });
} else {
  console.log('🌐 Running in Web Browser');
}

// Auto-initialize storage info
storage.getStorageInfo().then(info => {
  console.log('💾 Storage Info:');
  console.log(`   Type: ${info.type}`);
  console.log(`   Unlimited: ${info.unlimited ? '✅ Yes' : '❌ No'}`);
  if (info.isElectron) {
    console.log(`   Database Size: ${info.dbSizeMB}MB`);
    console.log(`   Free Space: ${info.freeSpaceGB}GB`);
    console.log(`   Total Records: ${info.totalRecords?.toLocaleString()}`);
  } else {
    console.log(`   Used: ${info.usedMB}MB`);
    console.log(`   Items: ${info.itemCount}`);
  }
});
