import '../local/pages.scss';

const THEMES = [
  { id: 'hydra-dark', name: 'Hydra Dark', group: 'Marketplace', colors: { background: '#0f0f1a', surface: '#1a1a2e', primary: '#6366f1', text: '#f1f1f5' } },
  { id: 'hydra-light', name: 'Hydra Light', group: 'Marketplace', colors: { background: '#f6f7fb', surface: '#ffffff', primary: '#4f46e5', text: '#111827' } },
  { id: 'playnite', name: 'Playnite', group: 'Marketplace', colors: { background: '#1b1b1b', surface: '#2d2d2d', primary: '#f47b20', text: '#f5f5f5' } },
  { id: 'playnite-metro', name: 'Playnite Metro', group: 'Marketplace', colors: { background: '#111318', surface: '#1c2230', primary: '#3b82f6', text: '#e5e7eb' } },
  { id: 'paper', name: 'Paper', group: 'Extra', colors: { background: '#f4f1ea', surface: '#fff', primary: '#9a3412', text: '#1c1917' } },
  { id: 'pine', name: 'Pine', group: 'Extra', colors: { background: '#071410', surface: '#10241c', primary: '#34d399', text: '#ecfdf5' } },
];

export function ThemesView() {
  return (
    <div className="pu-page">
      <div>
        <h1>Themes</h1>
        <p className="sub">Hydra and Playnite palettes, plus extras. Applying one sticks in this window.</p>
      </div>
      <div className="pu-grid">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className="pu-card"
            onClick={() => {
              const root = document.documentElement;
              root.style.setProperty('--color-background', theme.colors.background);
              root.style.setProperty('--color-surface', theme.colors.surface);
              root.style.setProperty('--color-primary', theme.colors.primary);
              root.style.setProperty('--color-text', theme.colors.text);
              localStorage.setItem('partyup-theme-choice', theme.id);
            }}
          >
            <h2>{theme.name}</h2>
            <p>{theme.group}</p>
            <span style={{ display: 'flex', gap: 6 }}>
              {Object.values(theme.colors).map((color) => (
                <i key={color} style={{ width: 18, height: 18, borderRadius: 4, background: color }} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
