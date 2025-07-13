const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', callback)
});