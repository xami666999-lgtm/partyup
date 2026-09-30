import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function OptimizationView() {
  const profiles = useVault((s) => s.profiles);
  const addProfile = useVault((s) => s.addProfile);
  const patchProfile = useVault((s) => s.patchProfile);
  const [game, setGame] = useState('');

  return (
    <div className="pu-page">
      <div>
        <h1>Optimization</h1>
        <p className="sub">Per-game notes for fullscreen, vsync, and a frame cap. Applied by you in the game.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!game.trim()) return;
          addProfile(game.trim());
          setGame('');
        }}
      >
        <input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Game" aria-label="Profile game" />
        <button className="btn btn-primary" type="submit">New profile</button>
      </form>
      <div className="pu-grid">
        {profiles.map((profile) => (
          <article key={profile.id} className="pu-card">
            <h2>{profile.game}</h2>
            <label className="pu-row"><input type="checkbox" checked={profile.fullscreen} onChange={(event) => patchProfile(profile.id, { fullscreen: event.target.checked })} /> Fullscreen</label>
            <label className="pu-row"><input type="checkbox" checked={profile.vsync} onChange={(event) => patchProfile(profile.id, { vsync: event.target.checked })} /> VSync</label>
            <label className="pu-row">
              FPS
              <input type="number" min={30} max={360} value={profile.fps} aria-label={`${profile.game} fps`} onChange={(event) => patchProfile(profile.id, { fps: Number(event.target.value) || 60 })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  );
}
