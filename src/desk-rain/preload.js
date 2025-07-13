const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('showToast', (message) => {
  const event = new CustomEvent('show-toast', { detail: message });
  document.dispatchEvent(event);
});

contextBridge.exposeInMainWorld('electronAPI', {

  updateSettings: (callback) => ipcRenderer.on('update-settings', callback),
  requestSettings: () => ipcRenderer.send('request-settings'),

  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', callback)
});