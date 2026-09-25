import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, ExternalLink, RotateCcw } from 'lucide-react';
import { api } from '../utils/api';

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  currentVersion: string;
  latestVersion: string | null;
  releaseName: string | null;
  releaseNotes: string | null;
  releaseUrl: string | null;
  percent: number;
  message: string;
  packaged: boolean;
}

const empty: UpdateState = {
  status: 'idle',
  currentVersion: '',
  latestVersion: null,
  releaseName: null,
  releaseNotes: null,
  releaseUrl: null,
  percent: 0,
  message: '',
  packaged: false,
};

export function UpdatePanel() {
  const [state, setState] = useState<UpdateState>(empty);
  const [autoCheck, setAutoCheck] = useState(true);

  useEffect(() => {
    let off: (() => void) | undefined;
    void api.update.getState().then((s: UpdateState) => s && setState(s));
    void api.settings.get('updates').then((u: { autoCheck?: boolean } | null) => {
      if (u && typeof u.autoCheck === 'boolean') setAutoCheck(u.autoCheck);
    });
    if (window.electron?.ipc?.on) {
      off = window.electron.ipc.on('update:status', (next: UpdateState) => setState(next));
    }
    return () => {
      if (off) off();
    };
  }, []);

  const busy = state.status === 'checking' || state.status === 'downloading';

  return (
    <div className="settings-grid">
      <div className="setting-group">
        <h3 className="setting-group-title">Updates</h3>
        <p className="setting-hint">
          Current version {state.currentVersion || '…'}. Feed is GitHub xami666999-lgtm/partyup releases.
        </p>
        <div className="setting-row">
          <div>
            <div className="setting-label">Auto-check on startup</div>
            <div className="setting-description">Look for a newer GitHub release a few seconds after launch</div>
          </div>
          <label>
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={async (e) => {
                const next = e.target.checked;
                setAutoCheck(next);
                await api.settings.set('updates', { autoCheck: next, autoDownload: false });
              }}
            />
          </label>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Status</div>
            <div className="setting-description">{state.message || 'Idle'}</div>
          </div>
          {state.status === 'downloading' && <span>{state.percent}%</span>}
        </div>
        {state.releaseNotes && (
          <pre className="setting-hint" style={{ whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>
            {state.releaseNotes.slice(0, 1200)}
          </pre>
        )}
        <div className="form-row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" disabled={busy} onClick={() => api.update.check()}>
            <RefreshCw size={16} /> Check now
          </button>
          {state.status === 'available' && state.packaged && (
            <button className="btn btn-primary" onClick={() => api.update.download()}>
              <Download size={16} /> Download
            </button>
          )}
          {state.status === 'downloaded' && (
            <button className="btn btn-primary" onClick={() => api.update.install()}>
              <RotateCcw size={16} /> Restart and install
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => api.update.openReleases()}>
            <ExternalLink size={16} /> Releases
          </button>
        </div>
      </div>
    </div>
  );
}

export function UpdateBanner() {
  const [state, setState] = useState<UpdateState>(empty);

  useEffect(() => {
    let off: (() => void) | undefined;
    void api.update.getState().then((s: UpdateState) => s && setState(s));
    if (window.electron?.ipc?.on) {
      off = window.electron.ipc.on('update:status', (next: UpdateState) => setState(next));
    }
    return () => {
      if (off) off();
    };
  }, []);

  if (state.status !== 'available' && state.status !== 'downloaded' && state.status !== 'error') {
    return null;
  }

  return (
    <div
      className="update-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 16px',
        background: state.status === 'error' ? '#3b1d1d' : '#1d2a3b',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: 13,
      }}
    >
      <span>{state.message}</span>
      <span style={{ display: 'flex', gap: 8 }}>
        {state.status === 'available' && (
          <button className="btn btn-primary btn-sm" onClick={() => (state.packaged ? api.update.download() : api.update.openReleases())}>
            {state.packaged ? 'Download' : 'Open release'}
          </button>
        )}
        {state.status === 'downloaded' && (
          <button className="btn btn-primary btn-sm" onClick={() => api.update.install()}>
            Restart
          </button>
        )}
      </span>
    </div>
  );
}
