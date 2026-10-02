import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './retro.scss';
import { EmuDeckPanel } from './EmuDeckPanel';
import { ConsoleLogo } from './logos';
import { ConsoleStore, UiTheme } from './ConsoleStore';

type Game = {
  id: string;
  name: string;
  short: string;
  year: number;
  publisher: string;
  region: string;
  players: string;
  blurb: string;
  hue: number;
  stars: number;
  romPath?: string;
  emulatorId?: string;
};

type System = {
  id: string;
  word: string;
  className: string;
  year: number;
  games: Game[];
};

type Maker = {
  id: string;
  name: string;
  line: string;
  year: number;
  systems: System[];
};

const MAKERS: Maker[] = [
  {
    id: 'nintendo',
    name: 'Nintendo',
    line: 'Nintendo Entertainment System - Famicom',
    year: 1983,
    systems: [
      {
        id: 'nes',
        word: 'NES',
        className: 'nes',
        year: 1983,
        games: [
          game('nes-mario', 'Super Mario Bros.', 'Mario', 1985, 'Nintendo', 12, 5, 'Run, jump, and clear eight worlds. A second player can take the next life.'),
          game('nes-zelda', 'The Legend of Zelda', 'Zelda', 1986, 'Nintendo', 90, 5, 'Explore an overworld, find the pieces of the Triforce, and bring down Ganon.'),
          game('nes-metroid', 'Metroid', 'Metroid', 1986, 'Nintendo', 200, 4, 'Samus hunts Metroids through a maze of corridors on Zebes.'),
          game('nes-kirby', 'Kirby’s Adventure', 'Kirby', 1993, 'Nintendo', 310, 4, 'Inhale enemies, copy their ability, and put the dream fountain back together.'),
          game('nes-punch', 'Punch-Out!!', 'Punch-Out', 1987, 'Nintendo', 28, 4, 'Dodge, block, and land a star punch before the round ends.'),
          game('nes-mega', 'Mega Man 2', 'Mega Man', 1988, 'Capcom', 210, 5, 'Eight robot masters, then the fortress. The weapons you win come with you.'),
          game('nes-contra', 'Contra', 'Contra', 1988, 'Konami', 0, 4, 'A side-scrolling run. Spread shot, and do not stop moving.'),
          game('nes-excite', 'Excitebike', 'Excitebike', 1984, 'Nintendo', 25, 3, 'Time trial motocross. Heat on the engine is the thing that stops you.'),
        ],
      },
      {
        id: 'snes',
        word: 'Super NES',
        className: 'snes',
        year: 1990,
        games: [
          game('snes-mario', 'Super Mario World', 'Mario World', 1990, 'Nintendo', 140, 5, 'Yoshi, a world map, and secret exits off the main path.'),
          game('snes-link', 'A Link to the Past', 'Zelda', 1991, 'Nintendo', 48, 5, 'Two worlds, one light and one dark, and a master sword between them.'),
          game('snes-chrono', 'Chrono Trigger', 'Chrono', 1995, 'Square', 265, 5, 'A fair, a portal, and a future you can still change.'),
          game('snes-dkc', 'Donkey Kong Country', 'DK Country', 1994, 'Nintendo', 18, 4, 'Barrels, mine carts, and a map full of levels.'),
        ],
      },
      {
        id: 'gb',
        word: 'Game Boy',
        className: 'gb',
        year: 1989,
        games: [
          game('gb-tetris', 'Tetris', 'Tetris', 1989, 'Nintendo', 55, 5, 'Four squares at a time. Clear a line before the stack reaches the top.'),
          game('gb-pokemon', 'Pokémon Red', 'Pokémon', 1996, 'Nintendo', 0, 5, 'A handheld journey. Catch, train, and take on the league.'),
        ],
      },
    ],
  },
  {
    id: 'sega',
    name: 'Sega',
    line: 'Sega Master System and Mega Drive',
    year: 1986,
    systems: [
      {
        id: 'ms',
        word: 'Master System',
        className: 'ms',
        year: 1986,
        games: [
          game('ms-cloud', 'Cloud Master', 'Cloud Master', 1989, 'Sega', 18, 3, 'Ride the clouds and clear the path. A short action game from the Master System library.'),
          game('ms-columns', 'Columns', 'Columns', 1990, 'Sega', 280, 4, 'Stack jewels so three of the same color touch. They can meet sideways, up and down, or on a diagonal.'),
          game('ms-cyborg', 'Cyborg Hunter', 'Cyborg Hunter', 1988, 'Sega', 210, 3, 'A side-view hunt through a base full of machines.'),
        ],
      },
      {
        id: 'md',
        word: 'Mega Drive',
        className: 'md',
        year: 1988,
        games: [
          game('md-sonic', 'Sonic the Hedgehog', 'Sonic', 1991, 'Sega', 200, 5, 'Loops, springs, and a two-act rush. Do not stop on the spikes.'),
          game('md-streets', 'Streets of Rage', 'Streets', 1991, 'Sega', 12, 4, 'Three characters, a street, and a boss at the end of the stage.'),
          game('md-gunstar', 'Gunstar Heroes', 'Gunstar', 1993, 'Treasure', 8, 5, 'A run-and-gun with dice bosses and a weapon you can mix.'),
          game('md-shinobi', 'Shinobi III', 'Shinobi', 1993, 'Sega', 220, 4, 'Wall jumps, a horse, and a last tower.'),
          game('md-altered', 'Altered Beast', 'Altered Beast', 1988, 'Sega', 350, 3, 'Rise from the grave, collect spirit balls, and change form.'),
          game('md-world', 'Another World', 'Another World', 1991, 'Delphine', 260, 4, 'A scientist falls through a particle test into somewhere else.'),
          game('md-aof', 'Art of Fighting', 'Art of Fighting', 1992, 'SNK', 15, 3, 'A one-on-one fighter. The spirit gauge decides how hard you hit.'),
          game('md-alex', 'Alex Kidd', 'Alex Kidd', 1989, 'Sega', 40, 3, 'Alex punches blocks and rides through the Enchanted Castle.'),
        ],
      },
      {
        id: 'gg',
        word: 'Game Gear',
        className: 'gg',
        year: 1990,
        games: [
          game('gg-columns', 'Columns', 'Columns', 1990, 'Sega', 280, 4, 'The same jewel puzzle, on the handheld.'),
          game('gg-sonic', 'Sonic Drift', 'Drift', 1994, 'Sega', 48, 3, 'A short circuit racer with the blue hedgehog.'),
        ],
      },
    ],
  },
];

function wrap(index: number, length: number) {
  return ((index % length) + length) % length;
}

function ownedGame(rom: { system: string; label: string; name: string; path: string; emulator: string }): Game {
  let hue = 0;
  for (const char of rom.name) hue = (hue + char.charCodeAt(0) * 17) % 360;
  return {
    id: `rom:${rom.path}`,
    name: rom.name,
    short: rom.name,
    year: 0,
    publisher: rom.label,
    region: 'Your copy',
    players: '1',
    hue,
    stars: 0,
    blurb: `Plays in PartyUp with ${rom.emulator}. Close the game and you are back on this screen.`,
    romPath: rom.path,
    emulatorId: rom.emulator,
  };
}

const CONSOLE_FOLDER: Record<string, string> = {
  nes: 'nes',
  snes: 'snes',
  gb: 'gb',
  ms: 'mastersystem',
  md: 'megadrive',
  gg: 'gamegear',
};

type OwnedRom = { system: string; label: string; name: string; path: string; emulator: string };

function game(
  id: string,
  name: string,
  short: string,
  year: number,
  publisher: string,
  hue: number,
  stars: number,
  blurb: string,
): Game {
  return { id, name, short, year, publisher, region: 'USA', players: '1–2', hue, stars, blurb };
}

function Hardware({ id }: { id: string }) {
  if (id === 'nes' || id === 'snes' || id === 'gb') {
    return (
      <svg className="rb-hardware" viewBox="0 0 280 140" aria-hidden="true">
        <rect x="78" y="28" width="150" height="62" rx="8" fill="#e7e7e7" />
        <rect x="92" y="40" width="78" height="28" rx="3" fill="#1c1c1c" />
        <rect x="178" y="46" width="34" height="16" rx="2" fill="#c8c8c8" />
        <rect x="108" y="90" width="36" height="18" rx="4" fill="#d0d0d0" />
        <path d="M126 99h28" stroke="#444" strokeWidth="2" />
        <rect x="70" y="108" width="22" height="14" rx="3" fill="#dedede" />
        <circle cx="76" cy="113" r="2" fill="#c0392b" />
        <circle cx="84" cy="113" r="2" fill="#c0392b" />
      </svg>
    );
  }
  return (
    <svg className="rb-hardware" viewBox="0 0 280 140" aria-hidden="true">
      <rect x="70" y="36" width="160" height="58" rx="6" fill="#1b1b1b" />
      <rect x="86" y="50" width="70" height="22" rx="2" fill="#111" />
      <circle cx="196" cy="64" r="10" fill="#222" stroke="#666" />
      <rect x="118" y="100" width="64" height="16" rx="3" fill="#2a2a2a" />
    </svg>
  );
}

function Cover({ item, tall = false }: { item: Game; tall?: boolean }) {
  return (
    <div className={`rb-cover${tall ? ' tall' : ''}`} style={{ ['--h' as string]: item.hue }}>
      <small>{item.publisher}</small>
      <b>{item.short}</b>
      <small>{item.year || ''}</small>
    </div>
  );
}

type PlayBook = { ratings: Record<string, number>; plays: Record<string, number>; last: Record<string, string>; roms: Record<string, string>; emulator: string };

const EMPTY_BOOK: PlayBook = { ratings: {}, plays: {}, last: {}, roms: {}, emulator: '' };

function loadBook(): PlayBook {
  try {
    const raw = localStorage.getItem('partyup-retro');
    return raw ? { ...EMPTY_BOOK, ...JSON.parse(raw) } : EMPTY_BOOK;
  } catch {
    return EMPTY_BOOK;
  }
}

export function EmulationView() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'console' | 'grid' | 'detail' | 'setup'>('console');
  const [makerIndex, setMakerIndex] = useState(0);
  const [systemIndex, setSystemIndex] = useState(0);
  const [gameIndex, setGameIndex] = useState(0);
  const [book, setBook] = useState<PlayBook>(loadBook);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [library, setLibrary] = useState<OwnedRom[]>([]);
  const [theme, setTheme] = useState<UiTheme | 'classic'>(() => {
    const saved = localStorage.getItem('partyup-ui-theme');
    if (saved === 'x360' || saved === 'ps2' || saved === 'classic' || saved === 'ps5') return saved;
    return 'ps5';
  });

  const chooseTheme = (next: UiTheme | 'classic') => {
    localStorage.setItem('partyup-ui-theme', next);
    setTheme(next);
  };

  const makers = useMemo(() => {
    const grouped = new Map<string, OwnedRom[]>();
    for (const rom of library) {
      const list = grouped.get(rom.system) || [];
      list.push(rom);
      grouped.set(rom.system, list);
    }
    const systems: System[] = grouped.size
      ? [...grouped.entries()].map(([id, hits]) => ({
          id,
          word: hits[0].label,
          className: id,
          year: 0,
          games: hits.map(ownedGame),
        }))
      : [
          {
            id: 'empty',
            word: 'Library',
            className: 'nes',
            year: 0,
            games: [
              game('empty', 'No games yet', 'Empty', 2026, 'PartyUp', 210, 0, 'Open Setup, create the ROM folders, and put a game you own in the matching folder. Play starts here.'),
            ],
          },
        ];
    return [...MAKERS, { id: 'yours', name: 'Your games', line: 'Play starts in PartyUp', year: new Date().getFullYear(), systems }];
  }, [library]);

  const maker = makers[Math.min(makerIndex, makers.length - 1)];
  const system = maker.systems[Math.min(systemIndex, maker.systems.length - 1)];
  const folder = CONSOLE_FOLDER[system.id] || system.id;
  const owned = library.filter((rom) => rom.system === folder).map(ownedGame);
  const games = owned.length ? owned : system.games;
  const selected = games[Math.min(gameIndex, Math.max(games.length - 1, 0))];
  const stars = book.ratings[selected.id] ?? selected.stars;

  useEffect(() => {
    localStorage.setItem('partyup-retro', JSON.stringify(book));
  }, [book]);

  useEffect(() => {
    if (screen === 'setup') return;
    const api = (window as unknown as { api?: { emudeck?: { scan?: () => Promise<{ roms?: OwnedRom[] }> } } }).api?.emudeck;
    void api?.scan?.()
      .then((result) => setLibrary(result?.roms || []))
      .catch(() => undefined);
    const off = (window as unknown as { electron?: { ipc?: { on?: (channel: string, cb: () => void) => () => void } } }).electron?.ipc?.on?.(
      'emudeck:exited',
      () => setNotice('Game closed. You are back in PartyUp.'),
    );
    return () => off?.();
  }, [screen]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      if (screen === 'setup' || theme !== 'classic') {
        if (screen === 'setup' && key === 'Escape') setScreen('console');
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Backspace', 'Escape'].includes(key)) {
        event.preventDefault();
      }
      if (key === 'Escape' || key === 'Backspace') {
        if (screen === 'detail') setScreen('grid');
        else if (screen === 'grid') setScreen('console');
        else navigate('/library');
        return;
      }
      if (key === 'Enter') {
        if (screen === 'console') {
          setGameIndex(0);
          setScreen('grid');
        } else if (screen === 'grid' && selected.romPath) void launchSelected();
        else if (screen === 'grid') setScreen('detail');
        else void launchSelected();
        return;
      }
      if (key === 'f' || key === 'F') {
        setBook((current) => ({ ...current, ratings: { ...current.ratings, [selected.id]: 5 } }));
        return;
      }
      if (screen === 'console') {
        if (key === 'ArrowRight') setSystemIndex((index) => (index + 1) % maker.systems.length);
        if (key === 'ArrowLeft') setSystemIndex((index) => (index - 1 + maker.systems.length) % maker.systems.length);
        if (key === 'ArrowDown') {
          setMakerIndex((index) => (index + 1) % makers.length);
          setSystemIndex(0);
        }
        if (key === 'ArrowUp') {
          setMakerIndex((index) => (index - 1 + makers.length) % makers.length);
          setSystemIndex(0);
        }
      } else if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp') {
        const columns = screen === 'grid' ? 4 : 1;
        const step =
          key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : key === 'ArrowDown' ? columns : -columns;
        setGameIndex((index) => wrap(index + step, games.length));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, maker.systems.length, games.length, navigate, selected.id, book, makers.length, theme]);

  const launchSelected = async () => {
    if (!selected.romPath) {
      setNotice('That cover is only a poster. Put your copy in the ROM folder, then play it from Your games.');
      return;
    }
    const api = (window as unknown as { api?: { emudeck?: { play?: (rom: string) => Promise<{ ok?: boolean; emulator?: string; error?: string }> } } }).api;
    try {
      const result = await api?.emudeck?.play?.(selected.romPath);
      if (result && result.ok === false) {
        setNotice(result.error || 'Could not start the game.');
        return;
      }
      const stamp = new Date().toLocaleString();
      setBook((current) => ({
        ...current,
        plays: { ...current.plays, [selected.id]: (current.plays[selected.id] || 0) + 1 },
        last: { ...current.last, [selected.id]: stamp },
      }));
      setNotice(`Playing ${selected.name} in PartyUp. Close the game to come back.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not start the game.');
    }
  };

  const playedIds = games.filter((item) => book.plays[item.id]);
  const mostPlayed = playedIds.slice().sort((a, b) => (book.plays[b.id] || 0) - (book.plays[a.id] || 0))[0];
  const lastPlayed = games
    .map((item) => ({ item, at: book.last[item.id] }))
    .filter((entry) => entry.at)
    .sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  const favorites = games.filter((item) => (book.ratings[item.id] ?? item.stars) >= 5).length;

  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rb">
      {screen === 'setup' ? (
        <EmuDeckPanel onClose={() => setScreen('console')} />
      ) : theme !== 'classic' ? (
        <ConsoleStore
          theme={theme}
          onTheme={chooseTheme}
          onClassic={() => chooseTheme('classic')}
          onSetup={() => setScreen('setup')}
          onClose={() => navigate('/library')}
        />
      ) : screen === 'console' ? (
        <>
          <div className="rb-top">
            <div className="rb-maker">
              <h1>{maker.name}</h1>
              <p>{maker.line}</p>
              <span>{maker.year}</span>
            </div>
            <Hardware id={system.id} />
            <Wifi />
          </div>
          <div className="rb-rule" />
          <div className="rb-logos">
            {maker.systems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`rb-logo${index === systemIndex ? ' selected' : ''}`}
                onClick={() => setSystemIndex(index)}
              >
                <ConsoleLogo id={item.className} title={item.word} />
              </button>
            ))}
          </div>
          <div className="rb-rule" />
          <div className="rb-stats">
            <div>Games : {games.length}</div>
            <div>Favorites : {favorites || 'None'}</div>
            <div>Games played : {playedIds.length || 'None'}</div>
            <div>Most played : {mostPlayed?.name || 'Unknown'}</div>
            <div>Last played : {lastPlayed?.item.name || 'Unknown'}</div>
          </div>
        </>
      ) : (
        <>
          <div className="rb-top" style={{ minHeight: 92, justifyContent: 'center' }}>
            <div className="rb-system-logo">
              <ConsoleLogo id={system.className} title={system.word} />
            </div>
            <div style={{ position: 'absolute', right: 28, top: 22 }}>
              <Wifi />
            </div>
          </div>
          <div className="rb-rule" />
          <div className="rb-stage">
            {screen === 'grid' ? (
              <div className="rb-grid-wrap">
                <div className="rb-grid">
                  {games.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`rb-tile${index === gameIndex ? ' selected' : ''}`}
                      onClick={() => {
                        setGameIndex(index);
                        setScreen('detail');
                      }}
                    >
                      <Cover item={item} />
                      <div className="rb-name">{item.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rb-detail">
                <div className="rb-carousel">
                  {[-1, 0, 1].map((offset) => {
                    const item = games[(gameIndex + offset + games.length) % games.length];
                    return (
                      <button
                        key={offset}
                        type="button"
                        className={`rb-box${offset === 0 ? ' center' : ''}`}
                        onClick={() => setGameIndex((gameIndex + offset + games.length) % games.length)}
                      >
                        <Cover item={item} tall />
                      </button>
                    );
                  })}
                </div>
                <div className="rb-panel">
                  <h2>{selected.name}</h2>
                  <div className="rb-shot">
                    <Cover item={selected} />
                  </div>
                  <p>{selected.blurb}</p>
                  <em>{selected.publisher}</em>
                  {selected.romPath ? (
                    <button type="button" onClick={() => void launchSelected()}>Play in PartyUp</button>
                  ) : (
                    <p>This is box art only. Add the ROM you own in Setup, then open Your games.</p>
                  )}
                  {notice ? <p>{notice}</p> : null}
                </div>
              </div>
            )}
            <aside className="rb-rail">
              <div className="rb-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= stars ? 'on' : ''}
                    aria-label={`${value} stars`}
                    onClick={() => setBook((current) => ({ ...current, ratings: { ...current.ratings, [selected.id]: value } }))}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Players" title="Players">🎮</button>
              <button type="button" aria-label="Manual" title="About this game" onClick={() => setScreen('detail')}>📖</button>
              <button type="button" aria-label="Favorite" title="Favorite" onClick={() => setBook((current) => ({ ...current, ratings: { ...current.ratings, [selected.id]: 5 } }))}>🏆</button>
              <button type="button" aria-label="Launch" title="Launch" onClick={() => void launchSelected()}>💾</button>
              <div className="rb-year">{selected.year || ''}</div>
              <div className="rb-flag" title={selected.region} />
            </aside>
          </div>
        </>
      )}
      <div className="rb-rule" />
      <footer className="rb-footer">
        <div className="rb-hints">
          {screen === 'console' ? (
            <>
              <span><i className="pad start" />MENU</span>
              <span><i className="pad dir" />NAVIGATION</span>
              <span><i className="pad y" />SEARCH</span>
              <span><i className="pad x" />SELECT</span>
              <span><i className="pad a" />CHOOSE</span>
            </>
          ) : (
            <>
              <span><i className="pad select" />OPTIONS</span>
              <span><i className="pad start" />MENU</span>
              <span><i className="pad b" />BACK</span>
              <span><i className="pad y" />SEARCH</span>
              <span><i className="pad x" />FAVORITE</span>
              <span><i className="pad a" />CHOOSE</span>
            </>
          )}
          <button type="button" onClick={() => chooseTheme('ps5')} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>PS5</button>
          <button type="button" onClick={() => chooseTheme('x360')} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>360</button>
          <button type="button" onClick={() => chooseTheme('ps2')} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>PS2</button>
          <button type="button" onClick={() => setScreen('setup')} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
            Setup
          </button>
          <button type="button" onClick={() => (screen === 'console' ? navigate('/library') : setScreen(screen === 'detail' ? 'grid' : 'console'))} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
            {screen === 'console' ? 'Leave' : 'Back'}
          </button>
        </div>
        <div className="rb-clock">{clock}</div>
      </footer>
    </div>
  );
}

function Wifi() {
  return (
    <svg className="rb-wifi" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M4 10c4.5-4 11.5-4 16 0M7 13c3-2.6 7-2.6 10 0M10 16c1.4-1.2 3.6-1.2 5 0" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}
