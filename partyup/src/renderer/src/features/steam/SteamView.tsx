import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function SteamView() {
  const games = useVault((s) => s.games);
  const settings = useVault((s) => s.settings);
  const patch = useVault((s) => s.patchSettings);
  const addGame = useVault((s) => s.addGame);
  const setGamePath = useVault((s) => s.setGamePath);
  const startPlay = useVault((s) => s.startPlay);
  const stopPlay = useVault((s) => s.stopPlay);
  const playing = useVault((s) => s.playing);
  const [name, setName] = useState('');
  const steamGames = games.filter((game) => game.platform === 'Steam');
  const hours = steamGames.reduce((sum, game) => sum + game.hours, 0);

  return (
    <div className="pu-page">
      <div>
        <h1>Steam</h1>
        <p className="sub">{steamGames.length} games in your list · {hours}h. PartyUp does not sign into Steam or download depots.</p>
      </div>
      <label className="pu-card">
        <strong>Steam library folder</strong>
        <input
          value={settings.steamFolder}
          placeholder="C:\\Program Files (x86)\\Steam"
          aria-label="Steam folder"
          onChange={(event) => patch({ steamFolder: event.target.value })}
        />
      </label>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addGame(name.trim(), 'Steam');
          setName('');
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Game you own on Steam" aria-label="Steam game" />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      <div className="pu-list">
        {steamGames.map((game) => (
          <article key={game.id}>
            <div>
              <strong>{game.name}</strong>
              <p>{game.hours}h</p>
              <input value={game.path} placeholder="Local install path" aria-label={`${game.name} path`} onChange={(event) => setGamePath(game.id, event.target.value)} />
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => (playing.gameId === game.id ? stopPlay() : startPlay(game.id))}>
              {playing.gameId === game.id ? 'Stop' : 'Playtime'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
