const { app, BrowserWindow } = require('electron')
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
    }
});

  win.loadFile('src/desk-rain/app/res/layout/index.html');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.maximize();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})