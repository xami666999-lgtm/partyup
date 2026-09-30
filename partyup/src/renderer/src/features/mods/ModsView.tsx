import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function ModsView() {
  const mods = useVault((s) => s.mods);
  const games = useVault((s) => s.games);
  const addMod = useVault((s) => s.addMod);
  const toggleMod = useVault((s) => s.toggleMod);
  const [game, setGame] = useState(games[0]?.name ?? '');
  const [name, setName] = useState('');

  return (
    <div className="pu-page">
      <div>
        <h1>Mods</h1>
        <p className="sub">Turn mods you already installed on or off. Nothing is fetched.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !game.trim()) return;
          addMod(game.trim(), name.trim());
          setName('');
        }}
      >
        <input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Game" aria-label="Game" list="mod-games" />
        <datalist id="mod-games">{games.map((item) => <option key={item.id} value={item.name} />)}</datalist>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mod name" aria-label="Mod name" />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      <div className="pu-list">
        {mods.map((mod) => (
          <article key={mod.id}>
            <div>
              <strong>{mod.name}</strong>
              <p>{mod.game}</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => toggleMod(mod.id)}>
              {mod.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
