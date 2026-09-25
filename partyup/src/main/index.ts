import { app, BrowserWindow, dialog } from 'electron';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import windowStateKeeper from 'electron-window-state';
import { isDev } from './utils/env.js';
import { setupIpcHandlers } from './ipc/index.js';
import { initializeServices, shutdownServices, type Services } from './services/index.js';
import { PluginManager } from './plugins/PluginManager.js';
import { ThemeManager } from './theme/ThemeManager.js';
import { Database } from './database/Database.js';
import { setupAutoUpdater } from './services/UpdateService.js';

const store = new Store<Record<string, unknown>>({
  name: 'partyup-config',
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    theme: 'partyup-dark',
    language: 'en',
    updates: { autoCheck: true, autoDownload: false },
  },
});

log.initialize({ preload: true });
log.info('PartyUp starting...');

let mainWindow: BrowserWindow | null = null;
let pluginManager: PluginManager | null = null;
let themeManager: ThemeManager | null = null;
let database: Database | null = null;
let services: Services | null = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

async function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1400,
    defaultHeight: 900,
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1000,
    minHeight: 600,
    title: 'PartyUp',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a2e',
      symbolColor: '#ffffff',
      height: 36,
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
    backgroundColor: '#0f0f1a',
    icon: join(__dirname, '../../build/icon.ico'),
  });

  mainWindowState.manage(mainWindow);

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000');
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

async function initializeApp() {
  try {
    database = new Database();
    try {
      await database.initialize();
    } catch (dbError) {
      log.error('Database failed to initialize, continuing without persistence:', dbError);
    }

    pluginManager = new PluginManager();
    await pluginManager.loadPlugins();

    themeManager = new ThemeManager();
    await themeManager.initialize();

    services = await initializeServices(store as any, database as Database, pluginManager);

    await createWindow();

    if (mainWindow && themeManager) {
      (themeManager as any).mainWindow = mainWindow;
    }

    setupIpcHandlers(
      mainWindow!,
      services as any,
      store as any,
      database as Database,
      pluginManager,
      themeManager
    );

    setupAutoUpdater(mainWindow, store as any, log);

    log.info('PartyUp initialized');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('Failed to initialize app:', error);
    dialog.showErrorBox('PartyUp Error', `Failed to start: ${message}`);
    app.quit();
  }
}

app.whenReady().then(() => {
  void initializeApp();
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  log.info('Shutting down...');
  if (services) {
    try {
      await shutdownServices(services);
    } catch (e) {
      log.error('Service shutdown error:', e);
    }
  }
  try {
    await pluginManager?.shutdown();
  } catch (e) {
    log.error('Plugin shutdown error:', e);
  }
  try {
    await database?.close();
  } catch (e) {
    log.error('Database close error:', e);
  }
});

export { mainWindow, services, store, database, pluginManager, themeManager, autoUpdater };
