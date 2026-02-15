// electron/preload.js
/**
 * Preload Script
 * Bridge between Electron main process and React renderer
 * Provides secure API for database and system operations
 * 
 * Version: 3.0
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    get: (key, defaultValue) => ipcRenderer.invoke('db:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('db:set', key, value),
    remove: (key) => ipcRenderer.invoke('db:remove', key),
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
    getStorageInfo: () => ipcRenderer.invoke('db:getStorageInfo'),
    backup: (directory) => ipcRenderer.invoke('db:backup', directory),
    export: () => ipcRenderer.invoke('db:export'),
    import: (jsonData) => ipcRenderer.invoke('db:import', jsonData)
  },

  // App information
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  },

  // Dialog operations
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:save', options),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:open', options)
  },

  // Shell operations
  shell: {
    showItemInFolder: (filepath) => ipcRenderer.invoke('shell:showItemInFolder', filepath),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  },

  // Platform information
  platform: process.platform,
  isElectron: true
});

// Log that preload script loaded successfully
console.log('✅ Preload script loaded - Electron API ready');
