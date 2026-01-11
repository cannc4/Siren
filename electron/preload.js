const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Path management
  getPaths: () => ipcRenderer.invoke('get-paths'),
  setPaths: (paths) => ipcRenderer.invoke('set-paths', paths),

  // Setup state
  getSetupCompleted: () => ipcRenderer.invoke('get-setup-completed'),
  setSetupCompleted: (completed) => ipcRenderer.invoke('set-setup-completed', completed),

  // Resource paths
  getResourcePath: () => ipcRenderer.invoke('get-resource-path'),
  getVendorPath: () => ipcRenderer.invoke('get-vendor-path'),

  // File dialogs
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },

  // Platform info
  platform: process.platform,
  arch: process.arch,

  // App info
  isPackaged: process.env.ELECTRON_IS_DEV !== 'true'
});

// Log that preload script has loaded
console.log('Siren preload script loaded');
