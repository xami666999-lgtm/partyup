import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LibGame = {
  id: string;
  name: string;
  platform: string;
  hours: number;
  favorite: boolean;
  path: string;
  notes: string;
};

export type ModItem = { id: string; game: string; name: string; enabled: boolean };
export type Session = { id: string; game: string; host: string; slots: number; open: boolean };
export type OptProfile = { id: string; game: string; fullscreen: boolean; vsync: boolean; fps: number };
export type Achievement = { id: string; game: string; name: string; unlocked: boolean; platform: string };
export type Person = { id: string; name: string; color: string };
export type EmulatorPath = { id: string; name: string; path: string; ready: boolean };
export type ToolCheck = { id: string; name: string; on: boolean };
export type SaveSlot = { id: string; game: string; slot: string; note: string; at: string };
export type Friend = { id: string; name: string; status: 'online' | 'away' | 'offline'; playing: string };
export type PluginItem = { id: string; name: string; detail: string; enabled: boolean };
export type LocalFile = { id: string; name: string; path: string };

type Vault = {
  games: LibGame[];
  mods: ModItem[];
  sessions: Session[];
  profiles: OptProfile[];
  achievements: Achievement[];
  saves: SaveSlot[];
  friends: Friend[];
  plugins: PluginItem[];
  files: LocalFile[];
  people: Person[];
  activePerson: string;
  emulators: EmulatorPath[];
  tools: ToolCheck[];
  playing: { gameId: string | null; startedAt: number | null };
  setupDone: boolean;
  kit: Record<string, { on: boolean; path: string }>;
  setKit: (id: string, patch: Partial<{ on: boolean; path: string }>) => void;
  settings: {
    confirmLaunch: boolean;
    showHours: boolean;
    emulatorFolder: string;
    steamFolder: string;
    discord: boolean;
    lang: string;
  };
  addGame: (name: string, platform: string) => void;
  toggleFavorite: (id: string) => void;
  setGamePath: (id: string, path: string) => void;
  removeGame: (id: string) => void;
  addMod: (game: string, name: string) => void;
  toggleMod: (id: string) => void;
  addSession: (game: string, host: string) => void;
  toggleSession: (id: string) => void;
  addProfile: (game: string) => void;
  patchProfile: (id: string, patch: Partial<OptProfile>) => void;
  toggleAchievement: (id: string) => void;
  addSave: (game: string, slot: string) => void;
  removeSave: (id: string) => void;
  addFriend: (name: string) => void;
  cycleFriend: (id: string) => void;
  togglePlugin: (id: string) => void;
  addFile: (name: string, path: string) => void;
  removeFile: (id: string) => void;
  patchSettings: (patch: Partial<Vault['settings']>) => void;
  addPerson: (name: string) => void;
  finishSetup: (name: string) => void;
  setActivePerson: (id: string) => void;
  startPlay: (gameId: string) => void;
  stopPlay: () => void;
  setEmulatorPath: (id: string, path: string) => void;
  toggleEmulator: (id: string) => void;
  toggleTool: (id: string) => void;
  snapshotLibrary: () => void;
};

const id = () => Math.random().toString(36).slice(2, 9);

export const useVault = create<Vault>()(
  persist(
    (set) => ({
      games: [
        { id: 'g1', name: 'Hades', platform: 'Steam', hours: 42, favorite: true, path: '', notes: 'Runs from your own install.' },
        { id: 'g2', name: 'Celeste', platform: 'PC', hours: 18, favorite: false, path: '', notes: '' },
        { id: 'g3', name: 'Stardew Valley', platform: 'PC', hours: 63, favorite: true, path: '', notes: '' },
      ],
      mods: [
        { id: 'm1', game: 'Stardew Valley', name: 'UI Info Suite', enabled: true },
        { id: 'm2', game: 'Celeste', name: 'Extra variants', enabled: false },
      ],
      sessions: [{ id: 's1', game: 'Celeste', host: 'You', slots: 4, open: true }],
      profiles: [
        { id: 'p1', game: 'Hades', fullscreen: true, vsync: true, fps: 144 },
        { id: 'p2', game: 'Celeste', fullscreen: true, vsync: true, fps: 60 },
      ],
      achievements: [
        { id: 'a1', game: 'Hades', name: 'Escaped', unlocked: true, platform: 'Steam' },
        { id: 'a2', game: 'Hades', name: 'Fully bonded', unlocked: false, platform: 'Steam' },
        { id: 'a3', game: 'Celeste', name: 'Summit', unlocked: true, platform: 'PC' },
        { id: 'a4', game: 'Stardew Valley', name: 'Community center', unlocked: false, platform: 'GOG' },
      ],
      saves: [
        { id: 'sv1', game: 'Hades', slot: 'Slot 1', note: 'Heat 8', at: 'Today' },
        { id: 'sv2', game: 'Stardew Valley', slot: 'Farm', note: 'Year 2, spring', at: 'Yesterday' },
      ],
      friends: [
        { id: 'f1', name: 'Alex', status: 'online', playing: 'Hades' },
        { id: 'f2', name: 'Rin', status: 'away', playing: '' },
      ],
      plugins: [
        { id: 'pl1', name: 'Playtime', detail: 'Show hours on library cards.', enabled: true },
        { id: 'pl2', name: 'Favorites first', detail: 'Pin favorite games to the top.', enabled: true },
        { id: 'pl3', name: 'Discord status', detail: 'Show the current game while PartyUp is open.', enabled: false },
      ],
      files: [],
      people: [{ id: 'me', name: 'You', color: '#6366f1' }],
      activePerson: 'me',
      emulators: [
        { id: 'retro', name: 'RetroArch', path: '', ready: false },
        { id: 'dolphin', name: 'Dolphin', path: '', ready: false },
        { id: 'rpcs3', name: 'RPCS3', path: '', ready: false },
        { id: 'pcsx2', name: 'PCSX2', path: '', ready: false },
        { id: 'cemu', name: 'Cemu', path: '', ready: false },
        { id: 'ryujinx', name: 'Ryujinx', path: '', ready: false },
        { id: 'ppsspp', name: 'PPSSPP', path: '', ready: false },
        { id: 'duck', name: 'DuckStation', path: '', ready: false },
        { id: 'melonds', name: 'melonDS', path: '', ready: false },
        { id: 'vita3k', name: 'Vita3K', path: '', ready: false },
        { id: 'flycast', name: 'Flycast', path: '', ready: false },
        { id: 'xenia', name: 'Xenia', path: '', ready: false },
      ],
      tools: [
        { id: 'reshade', name: 'ReShade', on: false },
        { id: 'specialk', name: 'Special K', on: false },
        { id: 'lossless', name: 'Lossless Scaling', on: false },
        { id: 'rtss', name: 'RTSS', on: false },
      ],
      playing: { gameId: null, startedAt: null },
      setupDone: false,
      kit: {},
      settings: { confirmLaunch: true, showHours: true, emulatorFolder: '', steamFolder: '', discord: false, lang: 'en' },
      addGame: (name, platform) =>
        set((s) => ({ games: [{ id: id(), name, platform, hours: 0, favorite: false, path: '', notes: '' }, ...s.games] })),
      toggleFavorite: (gameId) =>
        set((s) => ({ games: s.games.map((g) => (g.id === gameId ? { ...g, favorite: !g.favorite } : g)) })),
      setGamePath: (gameId, path) => set((s) => ({ games: s.games.map((g) => (g.id === gameId ? { ...g, path } : g)) })),
      removeGame: (gameId) => set((s) => ({ games: s.games.filter((g) => g.id !== gameId) })),
      addMod: (game, name) => set((s) => ({ mods: [{ id: id(), game, name, enabled: true }, ...s.mods] })),
      toggleMod: (modId) => set((s) => ({ mods: s.mods.map((m) => (m.id === modId ? { ...m, enabled: !m.enabled } : m)) })),
      addSession: (game, host) => set((s) => ({ sessions: [{ id: id(), game, host, slots: 4, open: true }, ...s.sessions] })),
      toggleSession: (sessionId) =>
        set((s) => ({ sessions: s.sessions.map((item) => (item.id === sessionId ? { ...item, open: !item.open } : item)) })),
      addProfile: (game) =>
        set((s) => ({ profiles: [{ id: id(), game, fullscreen: true, vsync: true, fps: 60 }, ...s.profiles] })),
      patchProfile: (profileId, patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === profileId ? { ...p, ...patch } : p)) })),
      toggleAchievement: (achievementId) =>
        set((s) => ({
          achievements: s.achievements.map((a) => (a.id === achievementId ? { ...a, unlocked: !a.unlocked } : a)),
        })),
      addSave: (game, slot) =>
        set((s) => ({ saves: [{ id: id(), game, slot, note: 'Manual snapshot', at: 'Just now' }, ...s.saves] })),
      removeSave: (saveId) => set((s) => ({ saves: s.saves.filter((item) => item.id !== saveId) })),
      addFriend: (name) => set((s) => ({ friends: [{ id: id(), name, status: 'offline', playing: '' }, ...s.friends] })),
      cycleFriend: (friendId) =>
        set((s) => ({
          friends: s.friends.map((friend) => {
            if (friend.id !== friendId) return friend;
            const status = friend.status === 'online' ? 'away' : friend.status === 'away' ? 'offline' : 'online';
            return { ...friend, status };
          }),
        })),
      togglePlugin: (pluginId) =>
        set((s) => ({ plugins: s.plugins.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p)) })),
      addFile: (name, path) => set((s) => ({ files: [{ id: id(), name, path }, ...s.files] })),
      removeFile: (fileId) => set((s) => ({ files: s.files.filter((file) => file.id !== fileId) })),
      patchSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      addPerson: (name) =>
        set((s) => ({ people: [...s.people, { id: id(), name, color: '#34d399' }] })),
      finishSetup: (name) =>
        set(() => {
          const person = { id: id(), name, color: '#7eb6ff' };
          return { people: [person], activePerson: person.id, setupDone: true };
        }),
      setKit: (kitId, patch) =>
        set((s) => ({ kit: { ...s.kit, [kitId]: { on: false, path: '', ...s.kit[kitId], ...patch } } })),
      setActivePerson: (personId) => set({ activePerson: personId }),
      startPlay: (gameId) => set({ playing: { gameId, startedAt: Date.now() } }),
      stopPlay: () =>
        set((s) => {
          if (!s.playing.gameId || !s.playing.startedAt) return { playing: { gameId: null, startedAt: null } };
          const added = (Date.now() - s.playing.startedAt) / 3600000;
          return {
            playing: { gameId: null, startedAt: null },
            games: s.games.map((game) =>
              game.id === s.playing.gameId ? { ...game, hours: Math.round((game.hours + added) * 10) / 10 } : game,
            ),
          };
        }),
      setEmulatorPath: (emulatorId, path) =>
        set((s) => ({ emulators: s.emulators.map((item) => (item.id === emulatorId ? { ...item, path, ready: path.length > 0 } : item)) })),
      toggleEmulator: (emulatorId) =>
        set((s) => ({ emulators: s.emulators.map((item) => (item.id === emulatorId ? { ...item, ready: !item.ready } : item)) })),
      toggleTool: (toolId) => set((s) => ({ tools: s.tools.map((tool) => (tool.id === toolId ? { ...tool, on: !tool.on } : tool)) })),
      snapshotLibrary: () =>
        set((s) => ({
          saves: [
            ...s.games.map((game) => ({
              id: id(),
              game: game.name,
              slot: 'Hoard',
              note: `${game.hours}h on ${s.people.find((person) => person.id === s.activePerson)?.name ?? 'You'}`,
              at: 'Just now',
            })),
            ...s.saves,
          ],
        })),
    }),
    {
      name: 'partyup-vault',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<Vault>),
        settings: { ...current.settings, ...((persisted as Partial<Vault>)?.settings ?? {}) },
        kit: { ...current.kit, ...((persisted as Partial<Vault>)?.kit ?? {}) },
        people: (persisted as Partial<Vault>)?.people?.length ? (persisted as Vault).people : current.people,
        emulators: [
          ...current.emulators.map((item) => {
            const saved = (persisted as Partial<Vault>)?.emulators?.find((entry) => entry.id === item.id);
            return saved ? { ...item, ...saved } : item;
          }),
          ...((persisted as Partial<Vault>)?.emulators ?? []).filter((entry) => !current.emulators.some((item) => item.id === entry.id)),
        ],
        tools: (persisted as Partial<Vault>)?.tools?.length ? (persisted as Vault).tools : current.tools,
      }),
    },
  ),
);
