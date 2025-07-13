const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('showToast', (message) => {
  const event = new CustomEvent('show-toast', { detail: message });
  document.dispatchEvent(event);
});