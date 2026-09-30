import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../local/vault';

export function BigPictureView() {
  const games = useVault((s) => s.games);
  const people = useVault((s) => s.people);
  const active = useVault((s) => s.activePerson);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const person = people.find((item) => item.id === active)?.name ?? 'You';
  const game = games[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % Math.max(games.length, 1));
      if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + games.length) % Math.max(games.length, 1));
      if (event.key === 'Escape' || event.key === 'Backspace') navigate('/library');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [games.length, navigate]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: '#07080d', color: '#f5f5f5', display: 'flex', flexDirection: 'column', padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Big Picture</strong>
        <span>{person}</span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, alignContent: 'center' }}>
        {games.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(itemIndex)}
            style={{
              minHeight: 160,
              borderRadius: 16,
              border: itemIndex === index ? '3px solid #f47b20' : '1px solid #2a2a2a',
              background: '#161616',
              color: 'inherit',
              textAlign: 'left',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 22 }}>{item.name}</div>
            <div style={{ opacity: 0.7, marginTop: 8 }}>{item.platform} · {item.hours}h</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{game ? `${game.name}${game.path ? ` · ${game.path}` : ''}` : 'No games yet'}</span>
        <button type="button" onClick={() => navigate('/library')} style={{ background: 'transparent', color: 'inherit', border: 0, cursor: 'pointer' }}>
          Back
        </button>
      </div>
    </div>
  );
}
