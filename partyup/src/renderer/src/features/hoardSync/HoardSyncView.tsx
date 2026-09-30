import { Link } from 'react-router-dom';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function HoardSyncView() {
  const saves = useVault((s) => s.saves);
  const games = new Set(saves.map((save) => save.game)).size;

  return (
    <div className="pu-page">
      <div>
        <h1>Save sync</h1>
        <p className="sub">{saves.length} snapshots across {games} games, stored on this PC only.</p>
      </div>
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
