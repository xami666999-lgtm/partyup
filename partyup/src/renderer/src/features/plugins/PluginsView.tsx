import { useVault } from '../local/vault';
import '../local/pages.scss';

export function PluginsView() {
  const plugins = useVault((s) => s.plugins);
  const toggle = useVault((s) => s.togglePlugin);

  return (
    <div className="pu-page">
      <div>
        <h1>Plugins</h1>
        <p className="sub">Built-in switches. They change the library and settings on this PC.</p>
      </div>
      <div className="pu-list">
        {plugins.map((plugin) => (
          <article key={plugin.id}>
            <div>
              <strong>{plugin.name}</strong>
              <p>{plugin.detail}</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => toggle(plugin.id)}>
              {plugin.enabled ? 'On' : 'Off'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
