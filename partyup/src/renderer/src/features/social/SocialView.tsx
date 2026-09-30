import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function SocialView() {
  const friends = useVault((s) => s.friends);
  const games = useVault((s) => s.games);
  const addFriend = useVault((s) => s.addFriend);
  const cycleFriend = useVault((s) => s.cycleFriend);
  const [name, setName] = useState('');
  const playing = games.filter((game) => game.favorite);

  return (
    <div className="pu-page">
      <div>
        <h1>Social</h1>
        <p className="sub">Friends you add here. Status is manual. There is no account server.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addFriend(name.trim());
          setName('');
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Friend name" />
        <button className="btn btn-primary" type="submit">Add friend</button>
      </form>
      <div className="pu-list">
        {friends.map((friend) => (
          <article key={friend.id}>
            <div>
              <strong>{friend.name}</strong>
              <p>{friend.status}{friend.playing ? ` · ${friend.playing}` : ''}</p>
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => cycleFriend(friend.id)}>Status</button>
          </article>
        ))}
      </div>
      <section>
        <h2>Your favorites</h2>
        <p className="sub">{playing.map((game) => game.name).join(', ') || 'None yet.'}</p>
      </section>
    </div>
  );
}
