import type Store from 'electron-store';
import {
  addRomsToSteam,
  buildFolders,
  deckStatus,
  installEmulator,
  installRetroArchCore,
  Progress,
  scanBios,
  scanRoms,
  setManualEmulator,
  startRom,
  suggestRoot,
} from './emudeck/engine.js';
import { compressLibrary } from './emudeck/engine.js';
import { RETROARCH_CORES } from './emudeck/catalog.js';

type StoreLike = { get: (key: string) => unknown; set: (key: string, value: unknown) => void };

export class EmuDeckService {
  root = suggestRoot();
  private store: StoreLike | null = null;
  private progress: (progress: Progress) => void = () => {};

  async initialize(store?: Store | StoreLike) {
    this.store = (store as StoreLike) || null;
    const saved = this.store?.get('emudeckRoot');
    if (typeof saved === 'string' && saved.trim()) this.root = saved.trim();
  }

  setProgress(progress: (progress: Progress) => void) {
    this.progress = progress;
  }

  private remember(root: string) {
    this.root = root;
    this.store?.set('emudeckRoot', root);
  }

  status() {
    return deckStatus(this.root);
  }

  setRoot(root: string) {
    if (!root || !root.trim()) throw new Error('Choose a folder for the emulation library.');
    this.remember(root.trim());
    return this.status();
  }

  buildFolders() {
    const built = buildFolders(this.root);
    return { ...built, created: built.created.length, status: this.status() };
  }

  scan() {
    return { roms: scanRoms(this.root), root: this.root };
  }

  bios() {
    buildFolders(this.root);
    return { checks: scanBios(this.root), root: this.root };
  }

  cores() {
    return RETROARCH_CORES;
  }

  async install(id: string) {
    const installed = await installEmulator(this.root, id, (progress) => this.progress(progress));
    return { installed, status: this.status() };
  }

  async installCore(core: string) {
    const result = await installRetroArchCore(this.root, core, (progress) => this.progress(progress));
    return result;
  }

  async compress(kind: 'cso' | 'chd' | 'rvz') {
    return compressLibrary(this.root, kind, (progress) => this.progress(progress));
  }

  play(romPath: string, onExit?: (code: number | null) => void) {
    return startRom(this.root, romPath, onExit);
  }

  steamAdd() {
    return addRomsToSteam(this.root);
  }

  setEmulatorPath(id: string, exe: string) {
    const installed = setManualEmulator(this.root, id, exe);
    return { installed, status: this.status() };
  }

  async shutdown() {}
}
