import '../local/pages.scss';

const THEMES = [
  { id: 'hydra-dark', name: 'Night', colors: { background: '#0f0f1a', surface: '#1a1a2e', primary: '#6366f1', text: '#f1f1f5' } },
  { id: 'paper', name: 'Paper', colors: { background: '#f4f1ea', surface: '#fff', primary: '#9a3412', text: '#1c1917' } },
  { id: 'pine', name: 'Pine', colors: { background: '#071410', surface: '#10241c', primary: '#34d399', text: '#ecfdf5' } },
  { id: 'sunset', name: 'Sunset', colors: { background: '#1a0d12', surface: '#2a1520', primary: '#fb7185', text: '#fff1f2' } },
];

export function ThemesView() {
  return (
    <div className="pu-page">
      <div>
        <h1>Themes</h1>
        <p className="sub">Pick a palette. It sticks for this window.</p>
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
