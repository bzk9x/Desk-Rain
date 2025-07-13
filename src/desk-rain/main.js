const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    minimizable: false,
    resizable: false,
    movable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
});

  win.loadFile('src/desk-rain/app/res/layout/index.html');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.maximize();
  
  // Send a message to the renderer process to show the toast
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript('window.showToast("Press Alt+Q to stop the rain");');
  });
}

app.whenReady().then(() => {
  createWindow()
  
  // Register the Alt+Q shortcut to quit the app
  globalShortcut.register('Alt+Q', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  // Unregister the shortcut when the app is about to quit
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})