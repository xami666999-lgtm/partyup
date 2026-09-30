import { Link } from 'react-router-dom';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function HoardSyncView() {
  const saves = useVault((s) => s.saves);
  const games = useVault((s) => s.games);
  const snapshotLibrary = useVault((s) => s.snapshotLibrary);
  const hours = games.reduce((sum, game) => sum + game.hours, 0);

  return (
    <div className="pu-page">
      <div>
        <h1>Save sync</h1>
        <p className="sub">{saves.length} snapshots · {hours}h tracked across {games.length} games. Stored on this PC.</p>
      </div>
      <button className="btn btn-primary" type="button" onClick={snapshotLibrary}>Snapshot library</button>
      <div className="pu-grid">
        <article className="pu-card">
          <h2>Local</h2>
          <p>Snapshots stay in PartyUp. There is no cloud copy.</p>
          <Link className="btn btn-secondary btn-sm" to="/saves">Open saves</Link>
        </article>
        <article className="pu-card">
          <h2>Latest</h2>
          {saves.slice(0, 4).map((save) => (
            <p key={save.id}>{save.game} · {save.slot}</p>
          ))}
        </article>
      </div>
    </div>
  );
}
