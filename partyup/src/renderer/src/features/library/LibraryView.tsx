import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function LibraryView() {
  const games = useVault((s) => s.games);
  const plugins = useVault((s) => s.plugins);
  const addGame = useVault((s) => s.addGame);
  const toggleFavorite = useVault((s) => s.toggleFavorite);
  const setGamePath = useVault((s) => s.setGamePath);
  const removeGame = useVault((s) => s.removeGame);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('PC');
  const [query, setQuery] = useState('');
  const hoursOn = plugins.find((p) => p.id === 'pl1')?.enabled !== false;
  const favoritesFirst = plugins.find((p) => p.id === 'pl2')?.enabled !== false;
  const shown = games
    .filter((game) => game.name.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((a, b) => (favoritesFirst && a.favorite !== b.favorite ? Number(b.favorite) - Number(a.favorite) : 0));

  return (
    <div className="pu-page">
      <div>
        <h1>Library</h1>
        <p className="sub">{games.length} games you added. PartyUp launches a path on this PC. It does not fetch games.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addGame(name.trim(), platform);
          setName('');
        }}
      >
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search library" />
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Add a game you own" aria-label="Game name" />
        <select value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Platform">
          <option>PC</option>
          <option>Steam</option>
          <option>Epic</option>
          <option>GOG</option>
        </select>
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      <div className="pu-grid">
        {shown.map((game) => (
          <article key={game.id} className="pu-card">
            <h2>{game.favorite ? '★ ' : ''}{game.name}</h2>
            <p>{game.platform}{hoursOn ? ` · ${game.hours}h` : ''}</p>
            <input
              value={game.path}
              placeholder="Path to the game on this PC"
              aria-label={`${game.name} path`}
              onChange={(event) => setGamePath(game.id, event.target.value)}
            />
            <div className="pu-row">
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => toggleFavorite(game.id)}>
                {game.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => removeGame(game.id)}>Remove</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
