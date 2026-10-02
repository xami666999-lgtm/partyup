import { spawnSync } from 'child_process';
import { chmodSync, copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { homedir } from 'os';
import { basename, dirname, extname, join, resolve, sep } from 'path';
import yauzl from 'yauzl';
import { BIOS_SPECS, EMULATORS, EmulatorSpec, ROM_SYSTEMS } from './catalog.js';
import { compressIsoToCso } from './cso.js';
import { readShortcutVdf, shortcutFor, ShortcutRecord, writeShortcutVdf } from './vdf.js';

export type Progress = { id: string; message: string; received?: number; total?: number };

export type InstalledEmulator = {
  id: string;
  version: string;
  exe: string;
  installedAt: string;
};

export type DeckManifest = {
  root: string;
  emulators: Record<string, InstalledEmulator>;
};

export type RomHit = {
  system: string;
  label: string;
  name: string;
  path: string;
  emulator: string;
};

export function suggestRoot(): string {
  if (process.platform === 'win32' && existsSync('D:\\')) return 'D:\\PartyUp\\Emulation';
  return join(homedir(), 'PartyUp', 'Emulation');
}

export function manifestPath(root: string): string {
  return join(root, 'partyup-emudeck.json');
}

export function readManifest(root: string): DeckManifest {
  const file = manifestPath(root);
  if (!existsSync(file)) return { root, emulators: {} };
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as DeckManifest;
    return { root, emulators: parsed.emulators || {} };
  } catch {
    return { root, emulators: {} };
  }
}

export function writeManifest(manifest: DeckManifest) {
  mkdirSync(manifest.root, { recursive: true });
  writeFileSync(manifestPath(manifest.root), JSON.stringify(manifest, null, 2));
}

export function folderPlan(root: string): string[] {
  const paths = [root, join(root, 'bios'), join(root, 'roms'), join(root, 'saves'), join(root, 'states'), join(root, 'emulators'), join(root, 'tools')];
  for (const system of ROM_SYSTEMS) {
    paths.push(join(root, 'roms', system.folder), join(root, 'saves', system.folder), join(root, 'states', system.folder), join(root, 'bios', system.folder));
  }
  for (const spec of BIOS_SPECS) paths.push(join(root, 'bios', spec.folder));
  return paths;
}

export function buildFolders(root: string): { created: string[]; root: string } {
  const created: string[] = [];
  for (const path of folderPlan(root)) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      created.push(path);
    }
  }
  const readme = join(root, 'bios', 'README.txt');
  if (!existsSync(readme)) {
    writeFileSync(
      readme,
      'PartyUp checks for BIOS files here. It does not download them.\r\nDump BIOS and keys only from hardware you own, then put the files in this folder or in the matching system folder.\r\n',
    );
    created.push(readme);
  }
  return { created, root };
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(path, out);
    else out.push(path);
  }
  return out;
}

export function scanBios(root: string) {
  const files = walkFiles(join(root, 'bios'));
  const byName = new Map<string, string>();
  for (const file of files) byName.set(basename(file).toLowerCase(), file);
  return BIOS_SPECS.map((spec) => {
    const found = spec.files.filter((name) => byName.has(name.toLowerCase()));
    const ok = spec.need === 'all' ? found.length === spec.files.length : found.length > 0;
    return {
      id: spec.id,
      label: spec.label,
      need: spec.need,
      optional: Boolean(spec.optional),
      note: spec.note,
      expected: spec.files,
      found,
      ok,
    };
  });
}

export function scanRoms(root: string): RomHit[] {
  const hits: RomHit[] = [];
  for (const system of ROM_SYSTEMS) {
    const dir = join(root, 'roms', system.folder);
    const allowed = new Set(system.extensions.map((ext) => ext.toLowerCase()));
    for (const file of walkFiles(dir)) {
      const ext = extname(file).slice(1).toLowerCase();
      if (!allowed.has(ext)) continue;
      if (basename(file).startsWith('.')) continue;
      hits.push({
        system: system.id,
        label: system.label,
        name: basename(file, extname(file)),
        path: file,
        emulator: system.emulator,
      });
    }
  }
  return hits;
}

export function pickAsset(assets: { name: string; browser_download_url: string }[], pattern: string) {
  const match = new RegExp(pattern, 'i');
  return assets.find((asset) => match.test(asset.name) && /\.(zip|7z|exe)$/i.test(asset.name)) || null;
}

async function githubAsset(repo: string, pattern: string): Promise<{ url: string; name: string; version: string }> {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { 'User-Agent': 'PartyUp', Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) throw new Error(`GitHub ${repo} returned ${response.status}.`);
  const body = (await response.json()) as { tag_name?: string; assets?: { name: string; browser_download_url: string }[] };
  const asset = pickAsset(body.assets || [], pattern);
  if (!asset) throw new Error(`No Windows build matched ${pattern} in ${repo} ${body.tag_name || ''}.`);
  return { url: asset.browser_download_url, name: asset.name, version: body.tag_name || '' };
}

export async function downloadFile(url: string, dest: string, onProgress?: (received: number, total: number) => void) {
  mkdirSync(dirname(dest), { recursive: true });
  const response = await fetch(url, { headers: { 'User-Agent': 'PartyUp' }, redirect: 'follow' });
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}) for ${url}`);
  const total = Number(response.headers.get('content-length') || 0);
  const file = createWriteStream(dest);
  const reader = response.body.getReader();
  let received = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const buf = Buffer.from(chunk.value);
      if (!file.write(buf)) await new Promise<void>((resolve) => file.once('drain', () => resolve()));
      received += buf.length;
      onProgress?.(received, total);
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      file.on('error', reject);
      file.end(() => resolve());
    });
  }
}

function sevenZipBin(): string | null {
  try {
    const nodeRequire = createRequire(__filename);
    const bin = nodeRequire('7zip-bin') as { path7za?: string };
    if (!bin.path7za || !existsSync(bin.path7za)) return null;
    try {
      chmodSync(bin.path7za, 0o755);
    } catch {
      /* Windows does not need the executable bit. */
    }
    return bin.path7za;
  } catch {
    return null;
  }
}

function assertInside(root: string, target: string) {
  const base = resolve(root);
  const next = resolve(target);
  if (next !== base && !next.startsWith(base + sep)) throw new Error(`Blocked a path outside the extract folder: ${target}`);
}

export function extractZip(archive: string, dest: string): Promise<void> {
  mkdirSync(dest, { recursive: true });
  return new Promise((resolvePromise, reject) => {
    yauzl.open(archive, { lazyEntries: true }, (error, zip) => {
      if (error || !zip) {
        reject(error || new Error('Could not open the zip.'));
        return;
      }
      zip.on('error', reject);
      zip.on('end', () => resolvePromise());
      zip.on('entry', (entry: any) => {
        const target = join(dest, entry.fileName);
        try {
          assertInside(dest, target);
        } catch (err) {
          reject(err);
          return;
        }
        if (/\/$/.test(entry.fileName)) {
          mkdirSync(target, { recursive: true });
          zip.readEntry();
          return;
        }
        mkdirSync(dirname(target), { recursive: true });
        zip.openReadStream(entry, (streamError, stream) => {
          if (streamError || !stream) {
            reject(streamError || new Error('Could not read a zip entry.'));
            return;
          }
          const output = createWriteStream(target);
          stream.pipe(output);
          output.on('finish', () => zip.readEntry());
          output.on('error', reject);
        });
      });
      zip.readEntry();
    });
  });
}

export function extractArchive(archive: string, dest: string) {
  const ext = extname(archive).toLowerCase();
  if (ext === '.zip') return extractZip(archive, dest);
  const bin = sevenZipBin();
  if (!bin) throw new Error('7-Zip is required for this package and is not available in the app.');
  mkdirSync(dest, { recursive: true });
  const result = spawnSync(bin, ['x', '-y', `-o${dest}`, archive], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Could not extract the archive.');
}

export function findExecutable(dir: string, names: string[], pattern?: string): string | null {
  const wanted = names.map((name) => name.toLowerCase());
  const files = walkFiles(dir);
  for (const name of wanted) {
    const hit = files.find((file) => basename(file).toLowerCase() === name);
    if (hit) return hit;
  }
  if (!pattern) return null;
  const match = new RegExp(pattern, 'i');
  return files.find((file) => match.test(basename(file))) || null;
}

export async function resolveEmulatorDownload(spec: EmulatorSpec): Promise<{ url: string; name: string; version: string }> {
  if (spec.source.kind === 'manual') throw new Error(spec.note || `${spec.name} has to be installed by you.`);
  if (spec.source.kind === 'url') {
    const name = basename(new URL(spec.source.url).pathname);
    return { url: spec.source.url, name, version: spec.source.version };
  }
  return githubAsset(spec.source.repo, spec.source.asset);
}

export async function installEmulator(
  root: string,
  id: string,
  onProgress?: (progress: Progress) => void,
): Promise<InstalledEmulator> {
  const spec = EMULATORS.find((item) => item.id === id);
  if (!spec) throw new Error(`Unknown emulator ${id}.`);
  if (spec.source.kind === 'manual') throw new Error(spec.note || `Choose ${spec.name} on this PC.`);
  buildFolders(root);
  onProgress?.({ id, message: `Looking up the latest ${spec.name} Windows build` });
  const remote = await resolveEmulatorDownload(spec);
  const archive = join(root, 'emulators', '_downloads', remote.name);
  onProgress?.({ id, message: `Downloading ${spec.name} ${remote.version}` });
  let lastNote = 0;
  await downloadFile(remote.url, archive, (received, total) => {
    const now = Date.now();
    if (received !== total && now - lastNote < 400) return;
    lastNote = now;
    const pct = total ? Math.round((received / total) * 100) : 0;
    onProgress?.({ id, message: `Downloading ${spec.name} ${pct}%`, received, total });
  });
  const dest = join(root, 'emulators', spec.id);
  mkdirSync(dest, { recursive: true });
  onProgress?.({ id, message: `Extracting ${spec.name}` });
  extractArchive(archive, dest);
  const exe = findExecutable(dest, spec.exe, spec.exePattern);
  if (!exe) throw new Error(`${spec.name} extracted, but none of ${spec.exe.join(', ')} was inside.`);
  const installed: InstalledEmulator = { id: spec.id, version: remote.version, exe, installedAt: new Date().toISOString() };
  const manifest = readManifest(root);
  manifest.emulators[spec.id] = installed;
  if (spec.id === 'mame') {
    const chdman = findExecutable(dest, ['chdman.exe']);
    if (chdman) copyFileSync(chdman, join(root, 'tools', 'chdman.exe'));
  }
  if (spec.id === 'dolphin') {
    const tool = findExecutable(dest, ['DolphinTool.exe']);
    if (tool) copyFileSync(tool, join(root, 'tools', 'DolphinTool.exe'));
  }
  if (spec.id === 'retroarch') writeRetroArchConfig(root, exe);
  writeManifest(manifest);
  onProgress?.({ id, message: `${spec.name} is ready` });
  return installed;
}

export function writeRetroArchConfig(root: string, exe: string) {
  const dir = dirname(exe);
  const config = join(dir, 'retroarch.cfg');
  if (existsSync(config)) return;
  const line = (key: string, value: string) => `${key} = "${value.replace(/\\/g, '/')}"\n`;
  writeFileSync(
    config,
    [
      line('libretro_directory', join(dir, 'cores')),
      line('libretro_info_path', join(dir, 'info')),
      line('savefile_directory', join(root, 'saves')),
      line('savestate_directory', join(root, 'states')),
      line('system_directory', join(root, 'bios')),
      line('rgui_browser_directory', join(root, 'roms')),
      'input_menu_toggle_btn = "8"\n',
      'input_exit_emulator_btn = "9"\n',
    ].join(''),
  );
}

export async function installRetroArchCore(root: string, core: string, onProgress?: (progress: Progress) => void) {
  const manifest = readManifest(root);
  const retro = manifest.emulators.retroarch;
  if (!retro?.exe) throw new Error('Install RetroArch first.');
  const safe = core.replace(/[^a-z0-9_]/gi, '');
  const url = `https://buildbot.libretro.com/nightly/windows/x86_64/latest/${safe}_libretro.dll.zip`;
  const archive = join(root, 'emulators', '_downloads', `${safe}_libretro.dll.zip`);
  const cores = join(dirname(retro.exe), 'cores');
  mkdirSync(cores, { recursive: true });
  onProgress?.({ id: 'retroarch', message: `Downloading ${safe}` });
  await downloadFile(url, archive, (received, total) => onProgress?.({ id: 'retroarch', message: `Downloading ${safe}`, received, total }));
  await extractZip(archive, cores);
  const dll = join(cores, `${safe}_libretro.dll`);
  if (!existsSync(dll)) throw new Error(`${safe} downloaded, but the core dll was not in the zip.`);
  return { core: safe, path: dll };
}

export function toolPath(root: string, name: string): string | null {
  const direct = join(root, 'tools', name);
  if (existsSync(direct)) return direct;
  const found = findExecutable(join(root, 'emulators'), [name]);
  return found;
}

export async function installChdman(root: string, onProgress?: (progress: Progress) => void) {
  const existing = toolPath(root, 'chdman.exe');
  if (existing) return { exe: existing, installed: false };
  await installEmulator(root, 'mame', onProgress);
  const exe = toolPath(root, 'chdman.exe');
  if (!exe) throw new Error('MAME installed, but chdman.exe was not in the official package.');
  return { exe, installed: true };
}

function runTool(bin: string, args: string[]) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.error) throw new Error(result.error.message);
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'The tool failed.').trim());
}

export async function compressLibrary(root: string, kind: 'cso' | 'chd' | 'rvz', onProgress?: (progress: Progress) => void) {
  buildFolders(root);
  const roms = scanRoms(root);
  const done: { from: string; to: string; bytesIn: number; bytesOut: number }[] = [];
  const skipped: string[] = [];
  if (kind === 'chd') {
    const waiting = roms.some((rom) => {
      const ext = extname(rom.path).toLowerCase();
      return ['.cue', '.gdi', '.toc', '.iso', '.img'].includes(ext) && ['psx', 'ps2', 'segacd', 'saturn', 'dreamcast', 'pcengine'].includes(rom.system);
    });
    if (!waiting) return { kind, converted: done, skipped: 0 };
    onProgress?.({ id: 'compress', message: 'Checking for chdman' });
    await installChdman(root, onProgress);
  }
  const chdman = toolPath(root, 'chdman.exe');
  const dolphin = toolPath(root, 'DolphinTool.exe');
  for (const rom of roms) {
    const ext = extname(rom.path).toLowerCase();
    if (kind === 'cso') {
      if (rom.system !== 'psp' || ext !== '.iso') continue;
      const output = rom.path.slice(0, -4) + '.cso';
      if (existsSync(output)) {
        skipped.push(rom.path);
        continue;
      }
      onProgress?.({ id: 'compress', message: `CSO ${rom.name}` });
      const result = compressIsoToCso(rom.path, output);
      done.push({ from: rom.path, to: output, ...result });
    } else if (kind === 'chd') {
      if (!['.cue', '.gdi', '.toc', '.iso', '.img'].includes(ext)) continue;
      if (!['psx', 'ps2', 'segacd', 'saturn', 'dreamcast', 'pcengine'].includes(rom.system)) continue;
      if (!chdman) throw new Error('chdman is not available.');
      const output = rom.path.replace(/\.[^.]+$/, '.chd');
      if (existsSync(output)) {
        skipped.push(rom.path);
        continue;
      }
      onProgress?.({ id: 'compress', message: `CHD ${rom.name}` });
      const mode = ext === '.cue' || ext === '.gdi' || ext === '.toc' ? 'createcd' : 'createdvd';
      const before = statSync(rom.path).size;
      runTool(chdman, [mode, '-f', '-i', rom.path, '-o', output]);
      done.push({ from: rom.path, to: output, bytesIn: before, bytesOut: statSync(output).size });
    } else if (kind === 'rvz') {
      if (!['gc', 'wii'].includes(rom.system) || !['.iso', '.gcm'].includes(ext)) continue;
      if (!dolphin) throw new Error('Install Dolphin first. RVZ conversion uses DolphinTool from the official Dolphin build.');
      const output = rom.path.replace(/\.[^.]+$/, '.rvz');
      if (existsSync(output)) {
        skipped.push(rom.path);
        continue;
      }
      onProgress?.({ id: 'compress', message: `RVZ ${rom.name}` });
      const before = statSync(rom.path).size;
      runTool(dolphin, ['convert', '-i', rom.path, '-o', output, '-f', 'rvz', '-b', '131072', '-c', 'zstd']);
      done.push({ from: rom.path, to: output, bytesIn: before, bytesOut: statSync(output).size });
    }
  }
  return { kind, converted: done, skipped: skipped.length };
}

const STEAM_ID64_BASE = 76561197960265728n;

export function parseMostRecentUser(text: string): string | null {
  const pattern = /"(\d{17})"\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  let fallback: string | null = null;
  while ((match = pattern.exec(text))) {
    fallback = match[1];
    if (/"MostRecent"\s+"1"/.test(match[2])) return match[1];
  }
  return fallback;
}

export function accountFolder(steamId64: string): string {
  return (BigInt(steamId64) - STEAM_ID64_BASE).toString();
}

export function shortcutsFile(steamRoot: string, loginText: string): string | null {
  const id = parseMostRecentUser(loginText);
  if (!id) return null;
  return join(steamRoot, 'userdata', accountFolder(id), 'config', 'shortcuts.vdf');
}

export function detectSteamRoot(): string | null {
  const found: string[] = [];
  if (process.platform === 'win32') {
    const query = spawnSync('reg', ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'], { encoding: 'utf8' });
    const match = query.stdout?.match(/SteamPath\s+REG_SZ\s+(.+)/i);
    if (match) found.push(match[1].trim().replace(/\//g, '\\'));
    found.push('C:\\Program Files (x86)\\Steam', 'C:\\Program Files\\Steam');
  } else {
    const home = homedir();
    found.push(join(home, '.steam', 'steam'), join(home, '.steam', 'root'), join(home, '.local', 'share', 'Steam'));
  }
  return found.find((path) => path && (existsSync(join(path, 'config')) || existsSync(join(path, 'steam.exe')) || existsSync(join(path, 'steam.sh')))) || null;
}

export function steamIsRunning(): boolean {
  if (process.platform === 'win32') {
    const result = spawnSync('tasklist', ['/FI', 'IMAGENAME eq steam.exe'], { encoding: 'utf8' });
    return /steam\.exe/i.test(result.stdout || '');
  }
  const result = spawnSync('ps', ['-A'], { encoding: 'utf8' });
  return /(^|\s)steam(\s|$)/im.test(result.stdout || '');
}

export function addShortcuts(file: string, records: ShortcutRecord[]) {
  mkdirSync(dirname(file), { recursive: true });
  const current = existsSync(file) ? readShortcutVdf(readFileSync(file)) : { shortcuts: {} };
  const shortcuts = ((current.shortcuts as Record<string, ShortcutRecord>) || {}) as Record<string, ShortcutRecord>;
  const kept = Object.values(shortcuts).filter((item) => item && item.AppName);
  for (const record of records) {
    const index = kept.findIndex((item) => item.AppName === record.AppName && item.Exe === record.Exe);
    if (index >= 0) kept[index] = record;
    else kept.push(record);
  }
  const next: Record<string, ShortcutRecord> = {};
  kept.forEach((item, index) => {
    next[String(index)] = item;
  });
  writeFileSync(file, writeShortcutVdf(next));
  return { file, count: kept.length };
}

export function addRomsToSteam(root: string, steamRoot?: string | null) {
  const rootPath = steamRoot === undefined ? detectSteamRoot() : steamRoot;
  if (!rootPath) throw new Error('Steam is not installed, or PartyUp could not find it.');
  const login = join(rootPath, 'config', 'loginusers.vdf');
  if (!existsSync(login)) throw new Error('Steam has no loginusers.vdf yet. Sign in to Steam once, then try again.');
  const file = shortcutsFile(rootPath, readFileSync(login, 'utf8'));
  if (!file) throw new Error('Could not tell which Steam account to use.');
  const manifest = readManifest(root);
  const roms = scanRoms(root);
  if (!roms.length) throw new Error('No ROMs were in the ROM folders yet.');
  const records: ShortcutRecord[] = [];
  const missing: string[] = [];
  for (const rom of roms) {
    const installed = manifest.emulators[rom.emulator];
    if (!installed?.exe || !existsSync(installed.exe)) {
      missing.push(`${rom.name} (${rom.emulator})`);
      continue;
    }
    records.push(shortcutFor(rom.name, installed.exe, rom.path, dirname(installed.exe)));
  }
  if (!records.length) throw new Error('Install the emulator for those ROMs before adding them to Steam.');
  const written = addShortcuts(file, records);
  return {
    ...written,
    added: records.length,
    missing,
    steamRunning: steamIsRunning(),
    warning: steamIsRunning() ? 'Steam is open. Quit Steam and start it again so the new shortcuts load.' : '',
  };
}

export function emulatorStatus(root: string) {
  const manifest = readManifest(root);
  return EMULATORS.map((spec) => {
    const installed = manifest.emulators[spec.id];
    const exe = installed?.exe && existsSync(installed.exe) ? installed.exe : '';
    return {
      id: spec.id,
      name: spec.name,
      systems: spec.systems,
      source: spec.source.kind,
      note: spec.note || '',
      version: installed?.version || '',
      exe,
      installed: Boolean(exe),
    };
  });
}

export function setManualEmulator(root: string, id: string, exe: string) {
  const spec = EMULATORS.find((item) => item.id === id);
  if (!spec) throw new Error(`Unknown emulator ${id}.`);
  if (!exe || !existsSync(exe)) throw new Error('That executable does not exist.');
  buildFolders(root);
  const manifest = readManifest(root);
  manifest.emulators[id] = { id, version: 'manual', exe, installedAt: new Date().toISOString() };
  writeManifest(manifest);
  return manifest.emulators[id];
}

export function deckStatus(root: string) {
  const bios = existsSync(join(root, 'bios')) ? scanBios(root) : [];
  const roms = existsSync(join(root, 'roms')) ? scanRoms(root) : [];
  return {
    root,
    foldersReady: existsSync(join(root, 'roms')),
    emulators: emulatorStatus(root),
    bios,
    romCount: roms.length,
    tools: {
      chdman: toolPath(root, 'chdman.exe') || '',
      dolphin: toolPath(root, 'DolphinTool.exe') || '',
    },
  };
}
