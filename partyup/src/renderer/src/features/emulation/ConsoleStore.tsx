import { useEffect, useMemo, useState } from 'react';
import { ConsoleLogo } from './logos';
import { ALL_GAMES, STORE_SYSTEMS, StoreGame } from './store-data';
import './store.scss';

export type UiTheme = 'ps5' | 'x360' | 'ps2';

type Owned = { system: string; label: string; name: string; path: string; emulator: string };

const INSTALLED_KEY = 'partyup-store-installed';

function loadInstalled(): string[] {
  try {
    const raw = localStorage.getItem(INSTALLED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function deck() {
  return (window as unknown as {
    api?: { emudeck?: { scan?: () => Promise<{ roms?: Owned[] }>; install?: (id: string) => Promise<unknown>; play?: (rom: string) => Promise<unknown> } };
    electron?: { ipc?: { on?: (channel: string, cb: (payload: { message?: string }) => void) => () => void } };
  });
}

function sameGame(rom: Owned, game: StoreGame) {
  const fold = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = fold(rom.name);
  return rom.system === game.system && (name.includes(fold(game.short)) || fold(game.name).includes(name));
}

export function ConsoleStore({
  theme,
  onTheme,
  onClassic,
  onSetup,
  onClose,
}: {
  theme: UiTheme;
  onTheme: (theme: UiTheme) => void;
  onClassic: () => void;
  onSetup: () => void;
  onClose: () => void;
}) {
  const [systemId, setSystemId] = useState(STORE_SYSTEMS[0].id);
  const [index, setIndex] = useState(0);
  const [installed, setInstalled] = useState<string[]>(loadInstalled);
  const [roms, setRoms] = useState<Owned[]>([]);
  const [notice, setNotice] = useState('Install adds the game to your library and sets up its emulator. PartyUp does not download the game.');
  const [busy, setBusy] = useState('');

  const system = STORE_SYSTEMS.find((item) => item.id === systemId) || STORE_SYSTEMS[0];
  const games = system.games;
  const selected = games[Math.min(index, games.length - 1)];

  useEffect(() => {
    localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed));
  }, [installed]);

  useEffect(() => {
    void deck().api?.emudeck?.scan?.().then((result) => setRoms(result?.roms || [])).catch(() => undefined);
    return deck().electron?.ipc?.on?.('emudeck:progress', (payload) => {
      if (payload?.message) setNotice(payload.message);
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) event.preventDefault();
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % games.length);
      if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + games.length) % games.length);
      if (event.key === 'ArrowDown') {
        const at = STORE_SYSTEMS.findIndex((item) => item.id === systemId);
        const next = STORE_SYSTEMS[(at + 1) % STORE_SYSTEMS.length];
        setSystemId(next.id);
        setIndex(0);
      }
      if (event.key === 'ArrowUp') {
        const at = STORE_SYSTEMS.findIndex((item) => item.id === systemId);
        const next = STORE_SYSTEMS[(at - 1 + STORE_SYSTEMS.length) % STORE_SYSTEMS.length];
        setSystemId(next.id);
        setIndex(0);
      }
      if (event.key === 'Enter') void install(selected);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [games.length, selected, systemId, onClose]);

  const ready = useMemo(() => roms.find((rom) => sameGame(rom, selected)), [roms, selected]);

  const install = async (game: StoreGame) => {
    setInstalled((current) => (current.includes(game.id) ? current : [...current, game.id]));
    setBusy(game.id);
    try {
      await deck().api?.emudeck?.install?.(game.emulator);
      setNotice(`${game.name} is in your library. ${game.emulator} is the emulator. Put your own copy in the ${game.system} folder to play it.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `${game.name} is in your library. The emulator still needs Setup.`);
    } finally {
      setBusy('');
    }
  };

  const play = async (game: StoreGame) => {
    const rom = roms.find((item) => sameGame(item, game));
    if (!rom) {
      setNotice(`${game.name} is not a file PartyUp can fetch. Copy the game you own into roms/${game.system}.`);
      return;
    }
    try {
      await deck().api?.emudeck?.play?.(rom.path);
      setNotice(`Playing ${game.name}. Close it to come back.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not start the game.');
    }
  };

  const playRom = async (rom: Owned) => {
    try {
      await deck().api?.emudeck?.play?.(rom.path);
      setNotice(`Playing ${rom.name}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not start the game.');
    }
  };

  return (
    <div className={`shop theme-${theme}`}>
      <header className="shop-bar">
        <div className="shop-tabs">
          <strong>{theme === 'ps5' ? 'PlayStation Store' : theme === 'x360' ? 'Xbox Marketplace' : 'Browser'}</strong>
          <span>Games</span>
          <span>Library</span>
        </div>
        <div className="shop-themes">
          <button type="button" className={theme === 'ps5' ? 'on' : ''} onClick={() => onTheme('ps5')}>PS5</button>
          <button type="button" className={theme === 'x360' ? 'on' : ''} onClick={() => onTheme('x360')}>Xbox 360</button>
          <button type="button" className={theme === 'ps2' ? 'on' : ''} onClick={() => onTheme('ps2')}>PS2</button>
          <button type="button" onClick={onClassic}>Classic</button>
          <button type="button" onClick={onSetup}>Setup</button>
          <button type="button" onClick={onClose}>Leave</button>
        </div>
      </header>

      {theme === 'x360' ? (
        <div className="blades">
          <i className="orb" />
          <button type="button" className="blade on">Marketplace</button>
          <button type="button" className="blade" onClick={() => setNotice(`${installed.length} games saved in this library.`)}>Games</button>
          <button type="button" className="blade" onClick={onSetup}>System</button>
        </div>
      ) : null}

      {theme === 'ps2' ? <div className="ps2-head">Browser <small>Memory Card</small></div> : null}

      <div className="logo-row">
        {STORE_SYSTEMS.map((item) => (
          <button key={item.id} type="button" className={item.id === systemId ? 'on' : ''} onClick={() => { setSystemId(item.id); setIndex(0); }}>
            <ConsoleLogo id={item.id} title={item.name} />
          </button>
        ))}
      </div>

      <section className="hero" style={{ ['--h' as string]: selected.hue }}>
        <Cover game={selected} large />
        <div>
          <ConsoleLogo id={selected.system} title={system.name} />
          <h1>{selected.name}</h1>
          <p>{selected.blurb}</p>
          <em>{selected.publisher} · {selected.year}</em>
          <div className="hero-actions">
            <button type="button" className="install" disabled={busy === selected.id} onClick={() => void install(selected)}>
              {busy === selected.id ? 'Installing' : installed.includes(selected.id) ? 'Installed' : 'Install'}
            </button>
            <button type="button" className="play" onClick={() => void play(selected)}>{ready ? 'Play' : 'Your copy'}</button>
          </div>
        </div>
      </section>
      <p className="shop-note">{notice}</p>

      {roms.length ? (
        <section className="row-block">
          <h2>On this PC</h2>
          <div className="row-scroller">
            {roms.map((rom) => (
              <button key={rom.path} type="button" className="card" onClick={() => void playRom(rom)}>
                <span className="mini-cover" style={{ ['--h' as string]: 200 }}><b>{rom.name}</b></span>
                <small>{rom.label}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {theme === 'ps2' ? (
        <div className="ps2-columns">
          {STORE_SYSTEMS.map((item) => (
            <div key={item.id} className="ps2-col">
              <ConsoleLogo id={item.id} title={item.name} />
              {item.games.map((game) => (
                <button key={game.id} type="button" className={game.id === selected.id ? 'disc on' : 'disc'} onClick={() => { setSystemId(item.id); setIndex(item.games.indexOf(game)); }}>
                  <i />
                  {game.short}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        STORE_SYSTEMS.map((item) => (
          <section className="row-block" key={item.id}>
            <h2><ConsoleLogo id={item.id} title={item.name} /> {item.name}</h2>
            <div className="row-scroller">
              {item.games.map((game, gameIndex) => (
                <button
                  key={game.id}
                  type="button"
                  className={`card${game.id === selected.id ? ' on' : ''}`}
                  onClick={() => { setSystemId(item.id); setIndex(gameIndex); }}
                >
                  <Cover game={game} />
                  <small>{installed.includes(game.id) ? 'In library' : game.year}</small>
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      <footer className="shop-foot">
        <span>{ALL_GAMES.length} games in the store</span>
        <span>{theme === 'ps2' ? 'Cross install  ·  Circle back' : 'Enter installs  ·  Esc leaves'}</span>
      </footer>
    </div>
  );
}

function Cover({ game, large = false }: { game: StoreGame; large?: boolean }) {
  return (
    <span className={large ? 'cover large' : 'cover'} style={{ ['--h' as string]: game.hue }}>
      <small>{game.publisher}</small>
      <b>{game.short}</b>
      <small>{game.year}</small>
    </span>
  );
}
