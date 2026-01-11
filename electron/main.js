const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const log = require('electron-log');
const Store = require('electron-store');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Configuration store
const store = new Store({
  name: 'siren-config',
  defaults: {
    setupCompleted: false,
    paths: {
      ghcipath: '',
      sclang: '',
      scsynth: '',
      sclang_conf: '',
      tidal_boot: '',
      scd_start: ''
    },
    window: {
      width: 1600,
      height: 900
    }
  }
});

// Determine if running in development
const isDev = !app.isPackaged;

let mainWindow = null;
let splashWindow = null;
let serverProcess = null;

// Get the correct resource path
function getResourcePath(...paths) {
  if (isDev) {
    return path.join(__dirname, '..', ...paths);
  }
  return path.join(process.resourcesPath, ...paths);
}

// Get vendor path for bundled dependencies
function getVendorPath(...paths) {
  if (isDev) {
    return path.join(__dirname, '..', 'vendor', process.platform, process.arch, ...paths);
  }
  return path.join(process.resourcesPath, 'vendor', ...paths);
}

// Create splash/loading window
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.center();
}

// Create main application window
function createMainWindow() {
  const windowConfig = store.get('window');

  mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1a1a2e',
    show: false,
    icon: path.join(__dirname, '..', 'build-resources', 'icon.png'),
    fullscreenable: true,
    title: 'Siren',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  // Create application menu
  createMenu();

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();
  });

  // Save window size on resize
  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    store.set('window', { width, height });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Scene',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-action', 'new-scene')
        },
        {
          label: 'Open Scene',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-action', 'open-scene')
        },
        {
          label: 'Save Scene',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-action', 'save-scene')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow.webContents.send('menu-action', 'settings')
        },
        { type: 'separator' },
        { role: 'quit' }
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
      label: 'Audio',
      submenu: [
        {
          label: 'Restart SuperCollider',
          click: () => mainWindow.webContents.send('menu-action', 'restart-sc')
        },
        {
          label: 'Restart TidalCycles',
          click: () => mainWindow.webContents.send('menu-action', 'restart-tidal')
        },
        { type: 'separator' },
        {
          label: 'Hush All',
          accelerator: 'CmdOrCtrl+.',
          click: () => mainWindow.webContents.send('menu-action', 'hush')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/cannc4/Siren#readme')
        },
        {
          label: 'TidalCycles Documentation',
          click: () => shell.openExternal('https://tidalcycles.org/docs/')
        },
        {
          label: 'SuperCollider Documentation',
          click: () => shell.openExternal('https://doc.sccode.org/')
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/cannc4/Siren/issues')
        },
        { type: 'separator' },
        {
          label: 'About Siren',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Siren',
              message: 'Siren',
              detail: `Version: ${app.getVersion()}\nLive Coding Music Interface\n\nA tracker-based sequencer for TidalCycles and SuperCollider.`
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => mainWindow.webContents.send('menu-action', 'settings')
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Start the backend server
function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, '..', 'server', 'start.js');

    log.info('Starting backend server...');

    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        SIREN_RESOURCE_PATH: getResourcePath(),
        SIREN_VENDOR_PATH: getVendorPath()
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      log.info('[Server]', output);
      if (output.includes('Server started')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      log.error('[Server Error]', data.toString());
    });

    serverProcess.on('error', (err) => {
      log.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      log.info(`Server process exited with code ${code}`);
    });

    // Resolve after timeout if server doesn't signal ready
    setTimeout(() => resolve(), 3000);
  });
}

// Stop the backend server
function stopServer() {
  if (serverProcess) {
    log.info('Stopping backend server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// IPC Handlers
ipcMain.handle('get-paths', () => {
  return store.get('paths');
});

ipcMain.handle('set-paths', (event, paths) => {
  store.set('paths', paths);
  return true;
});

ipcMain.handle('get-setup-completed', () => {
  return store.get('setupCompleted');
});

ipcMain.handle('set-setup-completed', (event, completed) => {
  store.set('setupCompleted', completed);
  return true;
});

ipcMain.handle('get-resource-path', () => {
  return getResourcePath();
});

ipcMain.handle('get-vendor-path', () => {
  return getVendorPath();
});

ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || []
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

// App lifecycle
app.whenReady().then(async () => {
  log.info('Siren starting...');
  log.info(`Running in ${isDev ? 'development' : 'production'} mode`);
  log.info(`Platform: ${process.platform}, Arch: ${process.arch}`);

  // Show splash screen in production
  if (!isDev) {
    createSplashWindow();
  }

  try {
    // Start backend server
    await startServer();
    log.info('Backend server started');

    // Create main window
    createMainWindow();
  } catch (err) {
    log.error('Failed to start application:', err);
    dialog.showErrorBox('Startup Error', `Failed to start Siren: ${err.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An unexpected error occurred: ${error.message}`);
});
