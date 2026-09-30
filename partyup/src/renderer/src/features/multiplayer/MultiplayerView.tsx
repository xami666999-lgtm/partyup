import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function MultiplayerView() {
  const sessions = useVault((s) => s.sessions);
  const addSession = useVault((s) => s.addSession);
  const toggleSession = useVault((s) => s.toggleSession);
  const [game, setGame] = useState('');
  const [host, setHost] = useState('You');

  return (
    <div className="pu-page">
      <div>
        <h1>Multiplayer</h1>
        <p className="sub">Rooms you host on this PC. PartyUp does not install unofficial clients.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!game.trim()) return;
          addSession(game.trim(), host.trim() || 'You');
          setGame('');
        }}
      >
        <input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Game" aria-label="Session game" />
        <input value={host} onChange={(event) => setHost(event.target.value)} placeholder="Host" aria-label="Host" />
        <button className="btn btn-primary" type="submit">Open room</button>
      </form>
      <div className="pu-list">
        {sessions.map((session) => (
          <article key={session.id}>
            <div>
              <strong>{session.game}</strong>
              <p>{session.host} · {session.slots} slots</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => toggleSession(session.id)}>
              {session.open ? 'Open' : 'Closed'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
