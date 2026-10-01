import { useEffect, useState } from 'react';
import { useVault } from '../local/vault';
import { DiscordCard, MetadataView } from '../local/board';
import { LANGS, t } from '../local/i18n';
import '../local/pages.scss';

export function SettingsView() {
  const settings = useVault((s) => s.settings);
  const patch = useVault((s) => s.patchSettings);
  const plugins = useVault((s) => s.plugins);
  const togglePlugin = useVault((s) => s.togglePlugin);
  const discord = plugins.find((plugin) => plugin.id === 'pl3');
  const emulators = useVault((s) => s.emulators);
  const setEmulatorPath = useVault((s) => s.setEmulatorPath);
  const [update, setUpdate] = useState({ status: 'idle', version: '', remote: '', percent: 0, message: '' });
  const [shortcut, setShortcut] = useState('');

  useEffect(() => {
    const ipc = window.electron?.ipc;
    if (!ipc) return;
    void ipc.invoke('updater:state').then((state) => setUpdate(state as typeof update));
    return ipc.on('updater:state', (state) => setUpdate(state as typeof update));
  }, []);

  const lang = settings.lang || 'en';

  return (
    <div className="pu-page">
      <div>
        <h1>{t(lang, 'settings')}</h1>
        <p className="sub">Stored on this PC. Nine languages. Discord presence is local.</p>
      </div>
      <div className="pu-list">
        <article>
          <div style={{ flex: 1 }}>
            <strong>{t(lang, 'language')}</strong>
            <select value={lang} aria-label={t(lang, 'language')} onChange={(event) => patch({ lang: event.target.value })} style={{ marginTop: 8 }}>
              {LANGS.map((code) => (
                <option key={code} value={code}>{code.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </article>
        <DiscordCard />
        <article>
          <div style={{ flex: 1 }}>
            <strong>Updates</strong>
            <p>
              {update.status === 'checking'
                ? 'Checking GitHub…'
                : update.status === 'downloading'
                  ? `Downloading ${update.percent}%`
                  : update.status === 'ready'
                    ? `Version ${update.remote} is ready.`
                    : update.status === 'current'
                      ? 'You are on the latest version.'
                      : update.status === 'error'
                        ? update.message || 'The update did not finish.'
                        : update.status === 'dev'
                          ? 'Updates install in the packaged app.'
                          : `Version ${update.version || '2.5.3'}. PartyUp checks GitHub when it opens.`}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                disabled={update.status === 'checking' || update.status === 'downloading'}
                onClick={() => void window.electron?.ipc.invoke('updater:check').then((state) => setUpdate(state as typeof update))}
              >
                Check for updates
              </button>
              {update.status === 'ready' ? (
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => void window.electron?.ipc.invoke('updater:install')}>
                  Install and restart
                </button>
              ) : null}
            </div>
          </div>
        </article>
        <article>
          <div style={{ flex: 1 }}>
            <strong>Desktop shortcut</strong>
            <p>{shortcut || 'A PartyUp shortcut is placed on the desktop when the app opens.'}</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => void window.electron?.ipc.invoke('updater:shortcut').then((result) => setShortcut(`Saved ${(result as { path?: string }).path || ''}`))}
          >
            Create shortcut
          </button>
        </article>
        <article>
          <div>
            <strong>Confirm before launch</strong>
            <p>Ask before you start a game from a saved path.</p>
          </div>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => patch({ confirmLaunch: !settings.confirmLaunch })}>
            {settings.confirmLaunch ? 'On' : 'Off'}
          </button>
        </article>
        <article>
          <div>
            <strong>Show hours</strong>
            <p>Also toggled by the Playtime plugin.</p>
          </div>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => patch({ showHours: !settings.showHours })}>
            {settings.showHours ? 'On' : 'Off'}
          </button>
        </article>
        <article>
          <div>
            <strong>Discord status</strong>
            <p>Remember that you want a status line. PartyUp does not talk to Discord yet.</p>
          </div>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => discord && togglePlugin(discord.id)}>
            {discord?.enabled ? 'On' : 'Off'}
          </button>
        </article>
        <article>
          <div style={{ flex: 1 }}>
            <strong>Steam library folder</strong>
            <p>Where Steam is installed on this PC.</p>
            <input
              value={settings.steamFolder}
              placeholder="C:\\Program Files (x86)\\Steam"
              aria-label="Steam folder"
              onChange={(event) => patch({ steamFolder: event.target.value })}
              style={{ marginTop: 8, width: '100%' }}
            />
          </div>
        </article>
        {emulators.map((emulator) => (
          <article key={emulator.id}>
            <div style={{ flex: 1 }}>
              <strong>{emulator.name}</strong>
              <p>{emulator.ready ? 'Path set' : 'Not set'}</p>
              <input
                value={emulator.path}
                placeholder="Path to the emulator"
                aria-label={`${emulator.name} path`}
                onChange={(event) => setEmulatorPath(emulator.id, event.target.value)}
                style={{ marginTop: 8, width: '100%' }}
              />
            </div>
          </article>
        ))}
      </div>
      <MetadataView />
    </div>
  );
}
