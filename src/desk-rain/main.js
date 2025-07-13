const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let settingsWindow = null;

const defaultSettings = {
  rainSpeed: 7,
  rainDensity: 200,
  rainColor: '#ffffff',
  minOpacity: 0.1,
  maxOpacity: 0.4,
  rainDirection: -9,
  splashEnabled: true,
  splashIntensity: 3,
  soundEnabled: false
};

let currentSettings = {...defaultSettings};

function createWindow() {
  mainWindow = new BrowserWindow({
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

  mainWindow.loadFile('src/desk-rain/app/res/layout/index.html');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.maximize();
  
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript('window.showToast("Press Alt+Q to stop the rain, Alt+, for settings");');
    mainWindow.webContents.send('update-settings', currentSettings);
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 550,
    height: 700,
    resizable: false,
    minimizable: true,
    maximizable: false,
    parent: mainWindow,
    modal: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'settings-preload.js')
    }
  });

  settingsWindow.loadFile('src/desk-rain/app/res/layout/settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.webContents.send('settings-updated', currentSettings);
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Alt+Q', () => {
    app.quit();
  });

  globalShortcut.register('Alt+,', () => {
    createSettingsWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('save-settings', (event, settings) => {
  currentSettings = settings;

  if (mainWindow) {
    mainWindow.webContents.send('update-settings', currentSettings);
  }

  if (settingsWindow) {
    settingsWindow.webContents.send('settings-updated', currentSettings);
  }
});

ipcMain.on('request-settings', (event) => {
  event.sender.send('update-settings', currentSettings);
});