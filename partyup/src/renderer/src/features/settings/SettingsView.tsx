import { useVault } from '../local/vault';
import '../local/pages.scss';

export function SettingsView() {
  const settings = useVault((s) => s.settings);
  const patch = useVault((s) => s.patchSettings);
  const plugins = useVault((s) => s.plugins);
  const togglePlugin = useVault((s) => s.togglePlugin);
  const discord = plugins.find((plugin) => plugin.id === 'pl3');

  return (
    <div className="pu-page">
      <div>
        <h1>Settings</h1>
        <p className="sub">Stored on this PC.</p>
      </div>
      <div className="pu-list">
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
            <strong>Emulator folder</strong>
            <p>Where you keep Dolphin, PCSX2, and the rest.</p>
            <input
              value={settings.emulatorFolder}
              placeholder="C:\\Emulators"
              aria-label="Emulator folder"
              onChange={(event) => patch({ emulatorFolder: event.target.value })}
              style={{ marginTop: 8, width: '100%' }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
