import { useEffect, useState } from 'react';

type EmulatorRow = {
  id: string;
  name: string;
  source: string;
  note: string;
  version: string;
  exe: string;
  installed: boolean;
};

type BiosRow = {
  id: string;
  label: string;
  optional?: boolean;
  note: string;
  expected: string[];
  found: string[];
  ok: boolean;
};

type RomRow = { system: string; label: string; name: string; path: string; emulator: string };

type Status = {
  root: string;
  foldersReady: boolean;
  emulators: EmulatorRow[];
  bios: BiosRow[];
  romCount: number;
  tools: { chdman: string; dolphin: string };
};

type DeckApi = {
  status: () => Promise<Status>;
  setRoot: (root: string) => Promise<Status>;
  buildFolders: () => Promise<unknown>;
  scan: () => Promise<{ roms: RomRow[] }>;
  bios: () => Promise<{ checks: BiosRow[] }>;
  install: (id: string) => Promise<unknown>;
  installCore: (core: string) => Promise<unknown>;
  compress: (kind: 'cso' | 'chd' | 'rvz') => Promise<{ converted: unknown[]; skipped: number }>;
  steamAdd: () => Promise<{ added: number; warning?: string; missing?: string[] }>;
  setEmulator: (id: string, exe: string) => Promise<unknown>;
  openRoot: () => Promise<unknown>;
};

function deckApi(): DeckApi | null {
  const api = (window as unknown as { api?: { emudeck?: DeckApi; system?: { launch?: (exe: string, args?: string[]) => Promise<unknown> } } }).api;
  return api?.emudeck || null;
}

export function EmuDeckPanel({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [roms, setRoms] = useState<RomRow[]>([]);
  const [bios, setBios] = useState<BiosRow[]>([]);
  const [root, setRoot] = useState('');
  const [log, setLog] = useState('Installs the emulators. Does not download games or BIOS.');
  const [busy, setBusy] = useState('');

  const refresh = async () => {
    const api = deckApi();
    if (!api) {
      setLog('EmuDeck tools are available in the desktop app.');
      return;
    }
    const next = await api.status();
    setStatus(next);
    setRoot(next.root);
    setBios(next.bios || []);
    if (next.foldersReady) {
      const scanned = await api.scan();
      setRoms(scanned.roms || []);
    }
  };

  useEffect(() => {
    void refresh();
    const electron = (window as unknown as { electron?: { ipc?: { on?: (channel: string, cb: (payload: { message?: string }) => void) => () => void } } }).electron;
    const off = electron?.ipc?.on?.('emudeck:progress', (payload) => {
      if (payload?.message) setLog(payload.message);
    });
    return () => off?.();
  }, []);

  const run = async (id: string, work: () => Promise<void>) => {
    setBusy(id);
    try {
      await work();
      await refresh();
    } catch (error) {
      setLog(error instanceof Error ? error.message : 'That step failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="rb-setup">
      <div className="rb-setup-head">
        <div>
          <h2>EmuDeck setup</h2>
          <p>Install emulators, make the ROM folders, check BIOS, compress your dumps, and add them to Steam.</p>
        </div>
        <button type="button" onClick={onClose}>Back to consoles</button>
      </div>
      <p className="rb-log">{log}</p>
      <label className="rb-root">
        Library folder
        <input value={root} aria-label="Emulation folder" onChange={(event) => setRoot(event.target.value)} />
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('root', async () => { await deckApi()?.setRoot(root); setLog('Library folder saved.'); })}>Save</button>
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('folders', async () => { await deckApi()?.buildFolders(); setLog('ROM, BIOS, save, and tool folders are ready.'); })}>Create folders</button>
        <button type="button" disabled={Boolean(busy)} onClick={() => void deckApi()?.openRoot()}>Open</button>
      </label>

      <section>
        <h3>Emulators</h3>
        <div className="rb-rows">
          {(status?.emulators || []).map((item) => (
            <div className="rb-row" key={item.id}>
              <div>
                <b>{item.name}</b>
                <span>{item.installed ? item.version || 'installed' : item.source === 'manual' ? 'use your own install' : 'not installed'}</span>
                {item.note ? <small>{item.note}</small> : null}
              </div>
              {item.source === 'manual' ? (
                <input
                  aria-label={`${item.name} path`}
                  placeholder={`${item.name}.exe`}
                  defaultValue={item.exe}
                  onBlur={(event) => {
                    if (!event.target.value || event.target.value === item.exe) return;
                    void run(item.id, async () => {
                      await deckApi()?.setEmulator(item.id, event.target.value);
                      setLog(`${item.name} path saved.`);
                    });
                  }}
                />
              ) : (
                <button type="button" disabled={Boolean(busy)} onClick={() => void run(item.id, async () => { await deckApi()?.install(item.id); setLog(`${item.name} installed.`); })}>
                  {busy === item.id ? 'Working' : item.installed ? 'Reinstall' : 'Install'}
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void run('cores', async () => {
            await deckApi()?.installCore('snes9x');
            await deckApi()?.installCore('fceumm');
            await deckApi()?.installCore('genesis_plus_gx');
            await deckApi()?.installCore('gambatte');
            await deckApi()?.installCore('mgba');
            setLog('NES, Super NES, Mega Drive, Game Boy, and GBA cores are in RetroArch.');
          })}
        >
          Install common RetroArch cores
        </button>
      </section>

      <section>
        <h3>BIOS check</h3>
        <p>PartyUp never downloads BIOS or keys. Put dumps from hardware you own in the BIOS folder.</p>
        <button type="button" disabled={Boolean(busy)} onClick={() => void run('bios', async () => { const result = await deckApi()?.bios(); setBios(result?.checks || []); setLog('BIOS check finished.'); })}>Check BIOS</button>
        <div className="rb-rows">
          {bios.map((item) => (
            <div className={`rb-row${item.ok ? ' ok' : ''}`} key={item.id}>
              <div>
                <b>{item.label}</b>
                <span>{item.ok ? `found ${item.found.join(', ')}` : item.optional ? 'optional, missing' : 'missing'}</span>
                <small>{item.ok ? '' : item.expected.join(', ')}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Compression and Steam</h3>
        <p>{roms.length} games in the ROM folders. Original files stay where they are.</p>
        <div className="rb-actions">
          <button type="button" disabled={Boolean(busy)} onClick={() => void run('cso', async () => { const result = await deckApi()?.compress('cso'); setLog(`CSO finished. ${result?.converted.length || 0} converted, ${result?.skipped || 0} already done.`); })}>PSP ISO to CSO</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => void run('chd', async () => { const result = await deckApi()?.compress('chd'); setLog(`CHD finished. ${result?.converted.length || 0} converted. chdman comes from official MAME.`); })}>Discs to CHD</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => void run('rvz', async () => { const result = await deckApi()?.compress('rvz'); setLog(`RVZ finished. ${result?.converted.length || 0} converted.`); })}>GameCube and Wii to RVZ</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => void run('steam', async () => { const result = await deckApi()?.steamAdd(); setLog(result?.warning || `Added ${result?.added || 0} games to Steam.`); })}>Add to Steam</button>
        </div>
        <div className="rb-rows">
          {roms.slice(0, 12).map((rom) => (
            <div className="rb-row" key={rom.path}>
              <div>
                <b>{rom.name}</b>
                <span>{rom.label}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const exe = status?.emulators.find((item) => item.id === rom.emulator)?.exe;
                  const launch = (window as unknown as { api?: { system?: { launch?: (exe: string, args?: string[]) => Promise<unknown> } } }).api?.system?.launch;
                  if (!exe || !launch) {
                    setLog(`Install ${rom.emulator} before launching ${rom.name}.`);
                    return;
                  }
                  void launch(exe, [rom.path]);
                  setLog(`Started ${rom.name}`);
                }}
              >
                Play
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
