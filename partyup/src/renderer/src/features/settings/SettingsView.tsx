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
