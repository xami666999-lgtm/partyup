import { useState } from 'react';
import { useVault } from '../local/vault';
import '../local/pages.scss';

export function SavesView() {
  const saves = useVault((s) => s.saves);
  const addSave = useVault((s) => s.addSave);
  const removeSave = useVault((s) => s.removeSave);
  const [game, setGame] = useState('');
  const [slot, setSlot] = useState('Slot 1');

  return (
    <div className="pu-page">
      <div>
        <h1>Saves</h1>
        <p className="sub">A list of save slots you care about. Copy the files yourself. PartyUp stores the note.</p>
      </div>
      <form
        className="pu-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!game.trim()) return;
          addSave(game.trim(), slot.trim() || 'Slot');
          setGame('');
        }}
      >
        <input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Game" aria-label="Save game" />
        <input value={slot} onChange={(event) => setSlot(event.target.value)} placeholder="Slot" aria-label="Slot" />
        <button className="btn btn-primary" type="submit">Add snapshot</button>
      </form>
      <div className="pu-list">
        {saves.map((save) => (
          <article key={save.id}>
            <div>
              <strong>{save.game}</strong>
              <p>{save.slot} · {save.note} · {save.at}</p>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => removeSave(save.id)}>Remove</button>
          </article>
        ))}
      </div>
    </div>
  );
}
