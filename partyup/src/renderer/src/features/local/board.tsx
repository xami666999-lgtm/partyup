import { useState, type ReactNode } from 'react';
import { useVault } from './vault';
import { t } from './i18n';
import './pages.scss';

type Row = {
  id: string;
  name: string;
  detail: string;
  href?: string;
  launch?: boolean;
  verify?: boolean;
  backup?: boolean;
  hash?: boolean;
};

function system() {
  return window.api?.system as
    | {
        openExternal: (url: string) => Promise<void>;
        openPath: (path: string) => Promise<string>;
        exists: (target: string) => Promise<{ ok: boolean; size?: number }>;
        launch: (exe: string, args?: string[]) => Promise<{ ok: boolean; error?: string }>;
        hash: (target: string) => Promise<{ ok: boolean; hash?: string; error?: string }>;
        backup: (target: string) => Promise<{ ok: boolean; dest?: string; error?: string }>;
        download: (url: string) => Promise<{ ok: boolean; dest?: string; error?: string }>;
        setFullscreen: (on: boolean) => Promise<void>;
      }
    | undefined;
}

export function ServiceBoard({ title, blurb, rows, extra }: { title: string; blurb: string; rows: Row[]; extra?: ReactNode }) {
  const lang = useVault((s) => s.settings.lang);
  const kit = useVault((s) => s.kit);
  const setKit = useVault((s) => s.setKit);
  const [msg, setMsg] = useState('');

  const run = async (row: Row, action: 'open' | 'launch' | 'verify' | 'backup' | 'hash') => {
    const api = system();
    const path = kit[row.id]?.path || '';
    if (!api) {
      setMsg('Open the desktop app to use files on this PC.');
      return;
    }
    if (action === 'open' && row.href) {
      await api.openExternal(row.href);
      setMsg(row.name);
      return;
    }
    if (!path) {
      setMsg('Set a path first.');
      return;
    }
    if (action === 'launch') {
      const result = await api.launch(path);
      setMsg(result.ok ? `Started ${row.name}` : result.error || 'Could not start it.');
    } else if (action === 'verify') {
      const result = await api.exists(path);
      setMsg(result.ok ? `${row.name} is there (${result.size ?? 0} bytes).` : `${row.name} was not found.`);
    } else if (action === 'backup') {
      const result = await api.backup(path);
      setMsg(result.ok ? `Copied to ${result.dest}` : result.error || 'Backup failed.');
    } else if (action === 'hash') {
      const result = await api.hash(path);
      setMsg(result.ok ? result.hash || '' : result.error || 'No hash.');
    }
  };

  return (
    <div className="pu-page">
      <div>
        <h1>{title}</h1>
        <p className="sub">{blurb}</p>
      </div>
      {extra}
      {msg ? <p className="sub">{msg}</p> : null}
      <div className="pu-list">
        {rows.map((row) => (
          <article key={row.id}>
            <div style={{ flex: 1 }}>
              <strong>{row.name}</strong>
              <p>{row.detail}</p>
              <input
                value={kit[row.id]?.path || ''}
                placeholder="Path on this PC"
                aria-label={`${row.name} path`}
                onChange={(event) => setKit(row.id, { path: event.target.value })}
                style={{ marginTop: 8, width: '100%' }}
              />
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setKit(row.id, { on: !kit[row.id]?.on })}>
              {kit[row.id]?.on ? t(lang, 'on') : t(lang, 'off')}
            </button>
            {row.href ? (
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => run(row, 'open')}>{t(lang, 'open')}</button>
            ) : null}
            {row.launch ? (
              <button className="btn btn-primary btn-sm" type="button" onClick={() => run(row, 'launch')}>{t(lang, 'launch')}</button>
            ) : null}
            {row.verify ? (
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => run(row, 'verify')}>{t(lang, 'verify')}</button>
            ) : null}
            {row.backup ? (
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => run(row, 'backup')}>{t(lang, 'backup')}</button>
            ) : null}
            {row.hash ? (
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => run(row, 'hash')}>{t(lang, 'hash')}</button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export function SteamView() {
  return (
    <ServiceBoard
      title="Steam"
      blurb="Point PartyUp at the Steam install you already have. It can open Steam, check that a file is really there, and store a controller note. It does not sign in, download depots, or install DLC unlockers."
      rows={[
        { id: 'steam-client', name: 'Steam client', detail: 'steam.exe. Launch and verify the install.', launch: true, verify: true },
        { id: 'steam-workshop', name: 'Workshop', detail: 'Opens the Steam Workshop in your browser.', href: 'https://steamcommunity.com/workshop/' },
        { id: 'steam-controller', name: 'Controller config', detail: 'Path to a local controller config you want to keep.', verify: true },
        { id: 'steam-verify', name: 'Game file check', detail: 'A game exe or folder you own. Verify checks it is on disk.', verify: true },
      ]}
    />
  );
}

export function DownloadsView() {
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <ServiceBoard
      title="Downloads"
      blurb="HTTP and HTTPS only, to this PC's PartyUp downloads folder. Pause is the Off switch on a row. There is no torrent client and no Hydra."
      extra={
        <form
          className="pu-row"
          onSubmit={async (event) => {
            event.preventDefault();
            const api = system();
            if (!api || !url.trim()) return;
            const result = await api.download(url.trim());
            setMsg(result.ok ? `Saved ${result.dest}` : result.error || 'Failed');
            if (result.ok) setUrl('');
          }}
        >
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." aria-label="Download URL" />
          <button className="btn btn-primary" type="submit">Download</button>
          {msg ? <span>{msg}</span> : null}
        </form>
      }
      rows={[
        { id: 'dl-folder', name: 'Download folder', detail: 'Optional extra folder. Open shows it in Explorer.', launch: true },
      ]}
    />
  );
}

export function ModsView() {
  return (
    <ServiceBoard
      title="Mods"
      blurb="Load order is the list you keep here. Links open the official sites. PartyUp does not install mod packs for you."
      rows={[
        { id: 'mod-workshop', name: 'Steam Workshop', detail: 'Official workshop.', href: 'https://steamcommunity.com/workshop/' },
        { id: 'mod-nexus', name: 'Nexus Mods', detail: 'Official site.', href: 'https://www.nexusmods.com/' },
        { id: 'mod-thunder', name: 'Thunderstore', detail: 'Official site.', href: 'https://thunderstore.io/' },
        { id: 'mod-modio', name: 'mod.io', detail: 'Official site.', href: 'https://mod.io/' },
        { id: 'mod-wabbajack', name: 'Wabbajack', detail: 'Path to Wabbajack.exe if you installed it.', launch: true, verify: true },
        { id: 'mod-order', name: 'Load order file', detail: 'A text file you edit. Verify checks it exists.', verify: true },
      ]}
    />
  );
}

export function MultiplayerView() {
  const names = ['ZeroTier', 'Hamachi', 'FiveM', 'Evolve'];
  return (
    <ServiceBoard
      title="Multiplayer"
      blurb="Launch clients you already installed. PartyUp does not download them."
      rows={names.map((name) => ({
        id: `mp-${name.toLowerCase()}`,
        name,
        detail: 'Path to the program on this PC.',
        launch: true,
        verify: true,
      }))}
    />
  );
}

export function CloudGamingView() {
  return (
    <ServiceBoard
      title="Cloud Gaming"
      blurb="Official web apps open in the browser. Moonlight, Sunshine, and Chiaki launch only if you set their path."
      rows={[
        { id: 'cloud-gfn', name: 'GeForce Now', detail: 'Official site.', href: 'https://play.geforcenow.com/' },
        { id: 'cloud-xcloud', name: 'Xbox Cloud', detail: 'Official site.', href: 'https://www.xbox.com/play' },
        { id: 'cloud-boosteroid', name: 'Boosteroid', detail: 'Official site.', href: 'https://boosteroid.com/' },
        { id: 'cloud-moonlight', name: 'Moonlight', detail: 'Local Moonlight.exe.', launch: true, verify: true },
        { id: 'cloud-sunshine', name: 'Sunshine', detail: 'Local Sunshine.exe.', launch: true, verify: true },
        { id: 'cloud-chiaki', name: 'Chiaki', detail: 'Local Chiaki.exe.', launch: true, verify: true },
      ]}
    />
  );
}

export function OptimizationView() {
  const names = ['Special K', 'Lossless Scaling', 'ReShade', 'MangoHud', 'RTSS', 'MSI Afterburner', 'Process Lasso', 'ParkControl', 'ISLC'];
  return (
    <ServiceBoard
      title="Optimization"
      blurb="Paths and on/off notes for tools you installed. Nothing here is downloaded."
      rows={names.map((name) => ({
        id: `opt-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        detail: 'Optional program on this PC.',
        launch: true,
        verify: true,
      }))}
    />
  );
}

export function AchievementsView() {
  const platforms = ['Steam', 'Xbox', 'PlayStation', 'Epic', 'GOG', 'RetroAchievements'];
  return (
    <ServiceBoard
      title="Achievements"
      blurb="Track what you have unlocked on this PC. PartyUp does not change achievements on those services."
      rows={platforms.map((name) => ({
        id: `ach-${name.toLowerCase()}`,
        name,
        detail: 'Optional export or notes file.',
        verify: true,
      }))}
    />
  );
}

export function SavesView() {
  return (
    <ServiceBoard
      title="Saves"
      blurb="Backup copies one save file into PartyUp's save-backups folder. Restore by opening that folder and copying it back."
      rows={[
        { id: 'save-file', name: 'Save file', detail: 'The file you want copied.', backup: true, verify: true, hash: true },
      ]}
    />
  );
}

export function HoardSyncView() {
  return (
    <ServiceBoard
      title="Hoard Sync"
      blurb="SHA256 is computed on this PC for a file under 80 MB. Snapshots stay local."
      rows={[{ id: 'hoard-file', name: 'Snapshot file', detail: 'A save or notes file to hash and back up.', hash: true, backup: true }]}
    />
  );
}

export function SocialView() {
  return (
    <ServiceBoard
      title="Friends"
      blurb="Presence is stored on this PC. There is no online account."
      rows={[{ id: 'friends-note', name: 'Presence note', detail: 'A text file with who is playing, if you keep one.', verify: true }]}
    />
  );
}

export function PluginsView() {
  return (
    <ServiceBoard
      title="Plugins"
      blurb="Enable a local plugin folder. PartyUp does not install plugins from the internet."
      rows={[{ id: 'plugin-dir', name: 'Plugin folder', detail: 'Folder of extra files you already have.', launch: true, verify: true }]}
    />
  );
}

export function BigPictureView() {
  return (
    <ServiceBoard
      title="Big Picture"
      blurb="Fullscreen uses the desktop window. Consoles is the 10-foot screen."
      extra={
        <button className="btn btn-primary" type="button" onClick={() => system()?.setFullscreen(true)}>
          Enter fullscreen
        </button>
      }
      rows={[{ id: 'bp-theme', name: 'Theme file', detail: 'Optional local theme JSON.', verify: true }]}
    />
  );
}

export function MetadataView() {
  const [query, setQuery] = useState('');
  return (
    <ServiceBoard
      title="Metadata"
      blurb="Search opens the official public pages. Artwork is not scraped into the app."
      extra={
        <form
          className="pu-row"
          onSubmit={(event) => {
            event.preventDefault();
            const q = encodeURIComponent(query.trim() || 'mario');
            system()?.openExternal(`https://www.igdb.com/search?q=${q}`);
          }}
        >
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Game name" aria-label="Metadata search" />
          <button className="btn btn-primary" type="submit">Search IGDB</button>
        </form>
      }
      rows={[
        { id: 'meta-igdb', name: 'IGDB', detail: 'Official site.', href: 'https://www.igdb.com/' },
        { id: 'meta-rawg', name: 'RAWG', detail: 'Official site.', href: 'https://rawg.io/' },
        { id: 'meta-steamgrid', name: 'SteamGridDB', detail: 'Official site.', href: 'https://www.steamgriddb.com/' },
      ]}
    />
  );
}

export function DiscordCard() {
  const lang = useVault((s) => s.settings.lang);
  const kit = useVault((s) => s.kit);
  const setKit = useVault((s) => s.setKit);
  return (
    <article>
      <div style={{ flex: 1 }}>
        <strong>Discord presence</strong>
        <p>The line PartyUp would show. It is saved here. PartyUp does not connect to Discord.</p>
        <input
          value={kit['discord-line']?.path || ''}
          placeholder="Playing PartyUp"
          aria-label="Discord status"
          onChange={(event) => setKit('discord-line', { path: event.target.value, on: true })}
          style={{ marginTop: 8, width: '100%' }}
        />
      </div>
      <button className="btn btn-secondary btn-sm" type="button" onClick={() => setKit('discord-line', { on: !kit['discord-line']?.on })}>
        {kit['discord-line']?.on ? t(lang, 'on') : t(lang, 'off')}
      </button>
    </article>
  );
}
