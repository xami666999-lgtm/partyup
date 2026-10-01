import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, session, protocol } from 'electron';
import { execFile, spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import log from 'electron-log';
import Store from 'electron-store';
import windowStateKeeper from 'electron-window-state';
import { isDev } from './utils/env.js';
import { setupIpcHandlers } from './ipc/index.js';
import { initializeServices, Services, shutdownServices } from './services/index.js';
import { PluginManager } from './plugins/PluginManager.js';
import { ThemeManager } from './theme/ThemeManager.js';
import { Database } from './database/Database.js';

declare const __dirname: string;

app.setPath('userData', join(app.getPath('appData'), 'PartyUpDesktop'));
const gotInstanceLock = app.requestSingleInstanceLock();

const store = new Store<any>({
  name: 'partyup-config',
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    theme: 'partyup-dark',
    language: 'en',
    steam: { enabled: true, apiKey: '', autoLogin: true },
    torrent: { enabled: true, downloadPath: '', maxConnections: 100 },
    emulators: { paths: {}, autoDetect: true },
    library: { paths: [], autoScan: true },
    cloudGaming: { services: {} },
    optimization: { profiles: {} },
    social: { enabled: true, platforms: [] },
    discord: { enabled: true, richPresence: true },
    updates: { autoCheck: true, autoDownload: true },
    plugins: { enabled: [], marketplace: true },
  },
});

log.initialize({ preload: true });
log.info('PartyUp starting...');

let mainWindow: BrowserWindow | null = null;
let pluginManager: PluginManager;
let themeManager: ThemeManager;
let database: Database;
let services: any = null;

async function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: store.get('windowBounds.width') as number,
    defaultHeight: store.get('windowBounds.height') as number,
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1000,
    minHeight: 600,
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
      webSecurity: !isDev,
      allowRunningInsecureContent: isDev,
      experimentalFeatures: true,
    },
    show: true,
    skipTaskbar: false,
    backgroundColor: '#0f0f1a',
    icon: join(__dirname, '../../build/icon.ico'),
  });

  mainWindowState.manage(mainWindow);

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow?.getBounds());
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
    await database.initialize();

    pluginManager = new PluginManager();
    await pluginManager.loadPlugins();

    themeManager = new ThemeManager();
    await themeManager.initialize();

    services = await initializeServices(store, database, pluginManager);

    await app.whenReady();

    await createWindow();
    ensureDesktopShortcut('PartyUp');

    // Now set the mainWindow reference in ThemeManager
    if (mainWindow) {
      (themeManager as any).mainWindow = mainWindow;
    }

    setupIpcHandlers(mainWindow!, services, store, database, pluginManager, themeManager);

    setupAutoUpdater();

    app.on('second-instance', () => {
      if (!mainWindow) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    });

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });

    app.on('before-quit', async () => {
      if (services) {
        await shutdownServices(services);
      }
    });

    log.info('PartyUp initialized successfully');
  } catch (error) {
    log.error('Failed to initialize app:', error);
    dialog.showErrorBox('PartyUp Error', `Failed to start: ${error.message}`);
    app.quit();
  }
}

function ensureDesktopShortcut(name: string) {
  if (process.platform !== 'win32') return;
  const desktop = app.getPath('desktop');
  const lnk = join(desktop, `${name}.lnk`);
  const exe = process.execPath;
  const work = dirname(exe);
  const quote = (value: string) => value.replace(/'/g, "''");
  const script = [
    '$shell = New-Object -ComObject WScript.Shell',
    `$shortcut = $shell.CreateShortcut('${quote(lnk)}')`,
    `$shortcut.TargetPath = '${quote(exe)}'`,
    `$shortcut.WorkingDirectory = '${quote(work)}'`,
    `$shortcut.IconLocation = '${quote(exe)}'`,
    '$shortcut.Save()',
  ].join('; ');
  execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], { windowsHide: true });
}

type UpdateState = { status: string; version: string; remote: string; percent: number; message: string };
let installerPath = '';
let checking = false;
let updateState: UpdateState = { status: 'idle', version: '', remote: '', percent: 0, message: '' };

function sendUpdate(patch: Partial<UpdateState>) {
  updateState = { ...updateState, ...patch, version: app.getVersion() };
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('updater:state', updateState);
}

const DEFAULT_REPO = 'xami666999-lgtm/partyup';

function cleanRepo(value: unknown) {
  const repo = String(value ?? '').trim();
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ? repo : DEFAULT_REPO;
}

let updateRepo = cleanRepo(store.get('updateRepo'));

function isNewer(remote: string, local: string) {
  const parse = (value: string) => value.replace(/^v/, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const next = parse(remote);
  const current = parse(local);
  const length = Math.max(next.length, current.length);
  for (let i = 0; i < length; i += 1) {
    if ((next[i] || 0) !== (current[i] || 0)) return (next[i] || 0) > (current[i] || 0);
  }
  return false;
}

async function checkForUpdates() {
  updateState = { ...updateState, version: app.getVersion() };
  if (isDev) {
    sendUpdate({ status: 'dev', message: 'Updates install in the packaged app.' });
    return updateState;
  }
  if (checking) return updateState;
  checking = true;
  sendUpdate({ status: 'checking', message: '' });
  try {
    const response = await fetch(`https://api.github.com/repos/${updateRepo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'PartyUp' },
    });
    if (!response.ok) throw new Error('GitHub did not answer.');
    const release = await response.json() as { tag_name?: string; assets?: { name: string; browser_download_url: string; size?: number }[] };
    const remote = String(release.tag_name || '').replace(/^v/, '');
    const asset = (release.assets || []).find((item) => item.name.endsWith('.exe'));
    if (!asset || !isNewer(remote, app.getVersion())) {
      sendUpdate({ status: 'current', remote, percent: 0 });
      return updateState;
    }
    sendUpdate({ status: 'downloading', remote, percent: 0 });
    const dir = join(app.getPath('temp'), 'partyup-updates');
    await mkdir(dir, { recursive: true });
    installerPath = join(dir, asset.name);
    const download = await fetch(asset.browser_download_url, { headers: { Accept: 'application/octet-stream', 'User-Agent': 'PartyUp' } });
    if (!download.ok || !download.body) throw new Error('The update did not download.');
    const total = Number(download.headers.get('content-length') || asset.size || 0);
    const file = createWriteStream(installerPath);
    const reader = download.body.getReader();
    let received = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      received += chunk.value.byteLength;
      if (total) sendUpdate({ percent: Math.min(99, Math.round((received / total) * 100)) });
      if (!file.write(Buffer.from(chunk.value))) await new Promise<void>((resolve) => file.once('drain', () => resolve()));
    }
    await new Promise<void>((resolve, reject) => {
      file.on('error', reject);
      file.end(() => resolve());
    });
    sendUpdate({ status: 'ready', remote, percent: 100 });
  } catch (error) {
    installerPath = '';
    sendUpdate({ status: 'error', message: error instanceof Error ? error.message : 'Update failed.' });
  } finally {
    checking = false;
  }
  return updateState;
}

function installUpdate() {
  if (!installerPath) return;
  const child = spawn(installerPath, [], { detached: true, stdio: 'ignore' });
  child.unref();
  app.quit();
}

function setupAutoUpdater() {
  ipcMain.handle('updater:state', () => ({ ...updateState, version: app.getVersion(), repo: updateRepo }));
  ipcMain.handle('updater:repo', (_event, value: string) => {
    updateRepo = cleanRepo(value);
    store.set('updateRepo', updateRepo);
    return updateRepo;
  });
  ipcMain.handle('updater:check', () => checkForUpdates());
  ipcMain.handle('updater:install', () => installUpdate());
  ipcMain.handle('updater:shortcut', () => {
    ensureDesktopShortcut('PartyUp');
    return { ok: true, path: join(app.getPath('desktop'), 'PartyUp.lnk') };
  });
  if (!isDev) void checkForUpdates();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  log.info('Shutting down...');
  for (const [name, service] of Object.entries(services)) {
    if (service && typeof (service as any).shutdown === 'function') {
      try {
        await (service as any).shutdown();
      } catch (e) {
        log.error(`Error shutting down ${name}:`, e);
      }
    }
  }
  await pluginManager.shutdown();
  await database.close();
});

if (gotInstanceLock) {
  initializeApp();
} else {
  app.quit();
}

export { mainWindow, services, store, database, pluginManager, themeManager };
