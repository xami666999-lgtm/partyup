import { BrowserWindow, app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

const OWNER = 'xami666999-lgtm';
const REPO = 'partyup';
const RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${OWNER}/${REPO}/releases`;

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdateState {
  status: UpdateStatus;
  currentVersion: string;
  latestVersion: string | null;
  releaseName: string | null;
  releaseNotes: string | null;
  releaseUrl: string | null;
  downloadPath: string | null;
  percent: number;
  message: string;
  packaged: boolean;
}

let state: UpdateState = {
  status: 'idle',
  currentVersion: app.getVersion(),
  latestVersion: null,
  releaseName: null,
  releaseNotes: null,
  releaseUrl: RELEASES_PAGE,
  downloadPath: null,
  percent: 0,
  message: 'Idle',
  packaged: app.isPackaged,
};

function emit(win: BrowserWindow | null) {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update:status', state);
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

async function checkGitHubLatest(): Promise<{
  tag: string;
  name: string;
  notes: string;
  url: string;
} | null> {
  const res = await fetch(RELEASES_API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'PartyUp' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub releases HTTP ${res.status}`);
  const json = (await res.json()) as {
    tag_name?: string;
    name?: string;
    body?: string;
    html_url?: string;
  };
  if (!json.tag_name) return null;
  return {
    tag: json.tag_name.replace(/^v/i, ''),
    name: json.name || json.tag_name,
    notes: json.body || '',
    url: json.html_url || RELEASES_PAGE,
  };
}

export function getUpdateState(): UpdateState {
  return { ...state, currentVersion: app.getVersion(), packaged: app.isPackaged };
}

export async function checkForUpdates(win: BrowserWindow | null): Promise<UpdateState> {
  state = {
    ...getUpdateState(),
    status: 'checking',
    message: 'Checking GitHub releases…',
    percent: 0,
  };
  emit(win);

  try {
    const latest = await checkGitHubLatest();
    if (!latest) {
      state = {
        ...getUpdateState(),
        status: 'not-available',
        latestVersion: null,
        message: 'No GitHub releases published yet. Packaged updates need a Release with an installer.',
      };
      emit(win);
      return getUpdateState();
    }

    const newer = compareVersions(latest.tag, app.getVersion()) > 0;
    state = {
      ...getUpdateState(),
      status: newer ? 'available' : 'not-available',
      latestVersion: latest.tag,
      releaseName: latest.name,
      releaseNotes: latest.notes,
      releaseUrl: latest.url,
      message: newer
        ? `Version ${latest.tag} is available.`
        : `You are on the latest version (${app.getVersion()}).`,
    };
    emit(win);

    if (newer && app.isPackaged) {
      try {
        await autoUpdater.checkForUpdates();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        state = {
          ...getUpdateState(),
          message: `${state.message} Installer check failed: ${message}`,
        };
        emit(win);
      }
    }

    return getUpdateState();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    state = { ...getUpdateState(), status: 'error', message };
    emit(win);
    return getUpdateState();
  }
}

export async function downloadUpdate(win: BrowserWindow | null): Promise<UpdateState> {
  if (!app.isPackaged) {
    state = {
      ...getUpdateState(),
      status: 'available',
      message: 'Dev build cannot install updates. Open the GitHub release page instead.',
    };
    emit(win);
    return getUpdateState();
  }

  state = { ...getUpdateState(), status: 'downloading', percent: 0, message: 'Downloading update…' };
  emit(win);
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    state = { ...getUpdateState(), status: 'error', message };
    emit(win);
  }
  return getUpdateState();
}

export function installUpdate(): void {
  if (app.isPackaged) {
    autoUpdater.quitAndInstall();
  }
}

export function openReleases(): void {
  void shell.openExternal(state.releaseUrl || RELEASES_PAGE);
}

export function setupAutoUpdater(
  win: BrowserWindow | null,
  store: { get: (key: string) => unknown },
  logger: { error: (...args: unknown[]) => void }
): void {
  autoUpdater.logger = logger as any;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: OWNER,
    repo: REPO,
  });

  autoUpdater.on('checking-for-update', () => {
    state = { ...getUpdateState(), status: 'checking', message: 'Checking installer feed…' };
    emit(win);
  });

  autoUpdater.on('update-available', (info) => {
    state = {
      ...getUpdateState(),
      status: 'available',
      latestVersion: info.version,
      message: `Installer ${info.version} is available.`,
    };
    emit(win);
  });

  autoUpdater.on('update-not-available', () => {
    if (state.status === 'checking') {
      state = {
        ...getUpdateState(),
        status: 'not-available',
        message: `No packaged update. Running ${app.getVersion()}.`,
      };
      emit(win);
    }
  });

  autoUpdater.on('download-progress', (progress) => {
    state = {
      ...getUpdateState(),
      status: 'downloading',
      percent: Math.round(progress.percent),
      message: `Downloading ${Math.round(progress.percent)}%`,
    };
    emit(win);
  });

  autoUpdater.on('update-downloaded', (info) => {
    state = {
      ...getUpdateState(),
      status: 'downloaded',
      latestVersion: info.version,
      percent: 100,
      message: `Update ${info.version} downloaded. Restart to install.`,
    };
    emit(win);
  });

  autoUpdater.on('error', (err) => {
    logger.error('autoUpdater error', err);
    state = {
      ...getUpdateState(),
      status: 'error',
      message: err?.message || String(err),
    };
    emit(win);
  });

  const updates = (store.get('updates') as { autoCheck?: boolean } | undefined) || {};
  if (updates.autoCheck !== false) {
    setTimeout(() => {
      void checkForUpdates(win);
    }, 4000);
  }
}
