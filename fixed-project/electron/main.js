// electron/main.js
/**
 * School Fee Manager Pro - Desktop Edition
 * Main Electron Process
 * 
 * Features:
 * - Unlimited SQLite database storage
 * - Native file system access
 * - Auto-updates
 * - System tray integration
 * - Backup/restore to hard disk
 * 
 * Version: 3.0 Desktop Edition
 * Developer: MWA
 */

const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let tray;
let db;

const isDev = process.env.NODE_ENV === 'development';
const APP_NAME = 'School Fee Manager Pro';

// Database path in user's data directory
const dbPath = path.join(app.getPath('userData'), 'school-data.db');
const backupDir = path.join(app.getPath('documents'), 'SchoolFeeManager', 'Backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: APP_NAME,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true
    },
    backgroundColor: '#ffffff',
    show: false // Don't show until ready
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // External links open in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/**
 * Create system tray
 */
function createTray() {
  const trayIconPath = path.join(__dirname, '../assets/tray-icon.png');
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          if (process.platform === 'darwin') {
            app.dock.show();
          }
        } else {
          createWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Backup Now',
      click: async () => {
        try {
          const result = await db.createBackup(backupDir);
          dialog.showMessageBox({
            type: 'info',
            title: 'Backup Complete',
            message: `Backup saved successfully!\n\n${result.filename}\nSize: ${result.sizeMB}MB`,
            buttons: ['OK', 'Open Folder']
          }).then((response) => {
            if (response.response === 1) {
              shell.showItemInFolder(result.filepath);
            }
          });
        } catch (error) {
          dialog.showErrorBox('Backup Failed', error.message);
        }
      }
    },
    {
      label: 'Storage Info',
      click: async () => {
        const info = await db.getStorageInfo();
        dialog.showMessageBox({
          type: 'info',
          title: 'Storage Information',
          message: `Database Statistics:\n\n` +
                   `Total Records: ${info.totalRecords.toLocaleString()}\n` +
                   `Database Size: ${info.dbSizeMB}MB\n` +
                   `Free Space: ${info.freeSpaceGB}GB\n\n` +
                   `Students: ${info.students}\n` +
                   `Teachers: ${info.teachers}\n` +
                   `Fee Records: ${info.feeRecords}\n` +
                   `Salary Records: ${info.salaryRecords}`,
          buttons: ['OK']
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);

  // Double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Backup Database',
          accelerator: 'CmdOrCtrl+B',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Save Backup',
              defaultPath: path.join(
                backupDir,
                `SchoolFeeManager_Backup_${new Date().toISOString().split('T')[0]}.db`
              ),
              filters: [
                { name: 'Database Files', extensions: ['db'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePath) {
              try {
                await db.createBackup(result.filePath);
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Success',
                  message: 'Backup created successfully!'
                });
              } catch (error) {
                dialog.showErrorBox('Backup Failed', error.message);
              }
            }
          }
        },
        {
          label: 'Restore from Backup',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Select Backup File',
              defaultPath: backupDir,
              filters: [
                { name: 'Database Files', extensions: ['db'] },
                { name: 'All Files', extensions: ['*'] }
              ],
              properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const confirmation = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Confirm Restore',
                message: 'This will replace all current data with the backup. Are you sure?',
                buttons: ['Cancel', 'Restore'],
                defaultId: 0,
                cancelId: 0
              });

              if (confirmation.response === 1) {
                try {
                  await db.restoreFromBackup(result.filePaths[0]);
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Success',
                    message: 'Database restored successfully! The app will restart.'
                  });
                  app.relaunch();
                  app.quit();
                } catch (error) {
                  dialog.showErrorBox('Restore Failed', error.message);
                }
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data (JSON)',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Data',
              defaultPath: path.join(
                app.getPath('documents'),
                `SchoolData_Export_${new Date().toISOString().split('T')[0]}.json`
              ),
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePath) {
              try {
                const data = await db.exportToJSON();
                fs.writeFileSync(result.filePath, data);
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Success',
                  message: 'Data exported successfully!'
                });
              } catch (error) {
                dialog.showErrorBox('Export Failed', error.message);
              }
            }
          }
        },
        {
          label: 'Import Data (JSON)',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Select JSON File',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ],
              properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
              try {
                const data = fs.readFileSync(result.filePaths[0], 'utf8');
                await db.importFromJSON(data);
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Success',
                  message: 'Data imported successfully!'
                });
                mainWindow.reload();
              } catch (error) {
                dialog.showErrorBox('Import Failed', error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://schoolfeemanager.com/docs')
        },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: async () => {
            const info = await db.getStorageInfo();
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: `${APP_NAME}\nVersion ${app.getVersion()}\n\n` +
                       `Database Size: ${info.dbSizeMB}MB\n` +
                       `Total Records: ${info.totalRecords.toLocaleString()}\n\n` +
                       `Developer: MWA Software\n` +
                       `License: Commercial`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Initialize database
 */
async function initializeDatabase() {
  try {
    console.log('📦 Initializing database at:', dbPath);
    db = new Database(dbPath);
    await db.initialize();
    console.log('✅ Database initialized successfully');
    
    // Get initial stats
    const info = await db.getStorageInfo();
    console.log('📊 Database stats:', info);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    dialog.showErrorBox(
      'Database Error',
      `Failed to initialize database:\n${error.message}\n\nThe application will now exit.`
    );
    app.quit();
  }
}

/**
 * Setup auto-updater
 */
function setupAutoUpdater() {
  if (isDev) return;

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. It will be downloaded in the background.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to install the update.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

/**
 * IPC Handlers - Database Operations
 */
function setupIpcHandlers() {
  // Get item
  ipcMain.handle('db:get', async (event, key, defaultValue) => {
    try {
      return await db.get(key, defaultValue);
    } catch (error) {
      console.error('db:get error:', error);
      return defaultValue;
    }
  });

  // Set item
  ipcMain.handle('db:set', async (event, key, value) => {
    try {
      return await db.set(key, value);
    } catch (error) {
      console.error('db:set error:', error);
      throw error;
    }
  });

  // Remove item
  ipcMain.handle('db:remove', async (event, key) => {
    try {
      return await db.remove(key);
    } catch (error) {
      console.error('db:remove error:', error);
      throw error;
    }
  });

  // Query
  ipcMain.handle('db:query', async (event, sql, params) => {
    try {
      return await db.query(sql, params);
    } catch (error) {
      console.error('db:query error:', error);
      throw error;
    }
  });

  // Get storage info
  ipcMain.handle('db:getStorageInfo', async () => {
    try {
      return await db.getStorageInfo();
    } catch (error) {
      console.error('db:getStorageInfo error:', error);
      throw error;
    }
  });

  // Backup
  ipcMain.handle('db:backup', async (event, directory) => {
    try {
      const dir = directory || backupDir;
      return await db.createBackup(dir);
    } catch (error) {
      console.error('db:backup error:', error);
      throw error;
    }
  });

  // Export JSON
  ipcMain.handle('db:export', async () => {
    try {
      return await db.exportToJSON();
    } catch (error) {
      console.error('db:export error:', error);
      throw error;
    }
  });

  // Import JSON
  ipcMain.handle('db:import', async (event, jsonData) => {
    try {
      return await db.importFromJSON(jsonData);
    } catch (error) {
      console.error('db:import error:', error);
      throw error;
    }
  });

  // Get app info
  ipcMain.handle('app:getInfo', async () => {
    return {
      version: app.getVersion(),
      name: APP_NAME,
      platform: process.platform,
      arch: process.arch,
      dbPath: dbPath,
      backupDir: backupDir,
      userDataPath: app.getPath('userData'),
      documentsPath: app.getPath('documents')
    };
  });

  // Show save dialog
  ipcMain.handle('dialog:save', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
  });

  // Show open dialog
  ipcMain.handle('dialog:open', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
  });

  // Open folder in file explorer
  ipcMain.handle('shell:showItemInFolder', async (event, filepath) => {
    shell.showItemInFolder(filepath);
  });

  // Open external link
  ipcMain.handle('shell:openExternal', async (event, url) => {
    await shell.openExternal(url);
  });
}

/**
 * App lifecycle
 */
app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();
  createTray();
  createMenu();
  setupIpcHandlers();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', async () => {
  // Close database connection
  if (db) {
    await db.close();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An unexpected error occurred:\n${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
