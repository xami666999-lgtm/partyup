export type EmulatorSource =
  | { kind: 'github'; repo: string; asset: string }
  | { kind: 'url'; url: string; version: string }
  | { kind: 'manual' };

export type EmulatorSpec = {
  id: string;
  name: string;
  exe: string[];
  exePattern?: string;
  systems: string[];
  source: EmulatorSource;
  note?: string;
};

export type RomSystem = {
  id: string;
  folder: string;
  label: string;
  extensions: string[];
  emulator: string;
};

export type BiosSpec = {
  id: string;
  label: string;
  folder: string;
  need: 'any' | 'all';
  files: string[];
  optional?: boolean;
  note: string;
};

export const RETROARCH_CORES = [
  'fceumm',
  'snes9x',
  'gambatte',
  'mgba',
  'genesis_plus_gx',
  'stella',
  'beetle_psx_hw',
  'beetle_saturn',
  'beetle_pce_fast',
  'flycast',
  'mupen64plus_next',
  'fbneo',
  'mednafen_ngp',
  'melonds',
];

export const EMULATORS: EmulatorSpec[] = [
  {
    id: 'retroarch',
    name: 'RetroArch',
    exe: ['retroarch.exe'],
    systems: ['nes', 'snes', 'gb', 'gbc', 'gba', 'mastersystem', 'megadrive', 'gamegear', 'segacd', 'n64', 'atari2600', 'arcade', 'saturn', 'pcengine'],
    source: { kind: 'url', url: 'https://buildbot.libretro.com/stable/1.22.2/windows/x86_64/RetroArch.7z', version: '1.22.2' },
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    exe: ['Dolphin.exe'],
    systems: ['gc', 'wii'],
    source: { kind: 'url', url: 'https://dl.dolphin-emu.org/releases/2609/dolphin-2609-x64.7z', version: '2609' },
    note: 'Also provides DolphinTool for RVZ compression.',
  },
  {
    id: 'pcsx2',
    name: 'PCSX2',
    exe: ['pcsx2-qt.exe', 'pcsx2.exe'],
    systems: ['ps2'],
    source: { kind: 'github', repo: 'PCSX2/pcsx2', asset: 'windows-x64-Qt\\.7z$' },
  },
  {
    id: 'duckstation',
    name: 'DuckStation',
    exe: ['duckstation-qt-x64-ReleaseLTCG.exe', 'duckstation-qt.exe'],
    exePattern: 'duckstation.*\\.exe$',
    systems: ['psx'],
    source: { kind: 'github', repo: 'stenzek/duckstation', asset: 'windows-x64-release\\.zip$' },
  },
  {
    id: 'ppsspp',
    name: 'PPSSPP',
    exe: ['PPSSPPWindows64.exe'],
    systems: ['psp'],
    source: { kind: 'github', repo: 'hrydgard/ppsspp', asset: 'Windows-x64\\.zip$' },
  },
  {
    id: 'rpcs3',
    name: 'RPCS3',
    exe: ['rpcs3.exe'],
    systems: ['ps3'],
    source: { kind: 'github', repo: 'RPCS3/rpcs3-binaries-win', asset: 'win64.*\\.7z$' },
  },
  {
    id: 'cemu',
    name: 'Cemu',
    exe: ['Cemu.exe'],
    systems: ['wiiu'],
    source: { kind: 'github', repo: 'cemu-project/Cemu', asset: 'windows-x64\\.zip$' },
  },
  {
    id: 'melonds',
    name: 'melonDS',
    exe: ['melonDS.exe'],
    systems: ['nds'],
    source: { kind: 'github', repo: 'melonDS-emu/melonDS', asset: 'windows-x86_64\\.zip$' },
  },
  {
    id: 'mgba',
    name: 'mGBA',
    exe: ['mGBA.exe'],
    systems: ['gba', 'gb', 'gbc'],
    source: { kind: 'github', repo: 'mgba-emu/mgba', asset: 'win64\\.7z$' },
  },
  {
    id: 'flycast',
    name: 'Flycast',
    exe: ['flycast.exe'],
    systems: ['dreamcast'],
    source: { kind: 'github', repo: 'flyinghead/flycast', asset: 'win64.*\\.zip$' },
  },
  {
    id: 'xemu',
    name: 'xemu',
    exe: ['xemu.exe'],
    systems: ['xbox'],
    source: { kind: 'github', repo: 'xemu-project/xemu', asset: '^xemu-win-x86_64-release\\.zip$' },
  },
  {
    id: 'xenia',
    name: 'Xenia Canary',
    exe: ['xenia_canary.exe', 'xenia.exe'],
    systems: ['xbox360'],
    source: { kind: 'github', repo: 'xenia-canary/xenia-canary', asset: 'windows\\.7z$' },
  },
  {
    id: 'vita3k',
    name: 'Vita3K',
    exe: ['Vita3K.exe'],
    systems: ['psvita'],
    source: { kind: 'github', repo: 'Vita3K/Vita3K', asset: '^windows-latest\\.zip$' },
  },
  {
    id: 'azahar',
    name: 'Azahar',
    exe: ['azahar.exe'],
    systems: ['n3ds'],
    source: { kind: 'github', repo: 'azahar-emu/azahar', asset: 'windows-msvc-.*\\.zip$' },
  },
  {
    id: 'scummvm',
    name: 'ScummVM',
    exe: ['scummvm.exe'],
    systems: ['scummvm'],
    source: { kind: 'url', url: 'https://downloads.scummvm.org/frs/scummvm/2026.3.0/scummvm-2026.3.0-win32-x86_64.zip', version: '2026.3.0' },
  },
  {
    id: 'mame',
    name: 'MAME',
    exe: ['mame.exe'],
    systems: ['arcade', 'mame'],
    source: { kind: 'github', repo: 'mamedev/mame', asset: 'b_x64\\.exe$' },
    note: 'Official MAME build. chdman.exe in this package is used to compress discs.',
  },
  {
    id: 'primehack',
    name: 'PrimeHack',
    exe: ['PrimeHack.exe', 'Dolphin.exe'],
    systems: ['wii'],
    source: { kind: 'github', repo: 'shiiion/dolphin', asset: '^PrimeHack.*\\.zip$' },
  },
  {
    id: 'ryujinx',
    name: 'Ryujinx',
    exe: ['Ryujinx.exe'],
    systems: ['switch'],
    source: { kind: 'manual' },
    note: 'Point this at a Ryujinx.exe you already installed. PartyUp does not download Switch emulators.',
  },
];

export const ROM_SYSTEMS: RomSystem[] = [
  { id: 'nes', folder: 'nes', label: 'NES', extensions: ['nes', 'zip', '7z'], emulator: 'retroarch' },
  { id: 'snes', folder: 'snes', label: 'Super NES', extensions: ['sfc', 'smc', 'zip', '7z'], emulator: 'retroarch' },
  { id: 'gb', folder: 'gb', label: 'Game Boy', extensions: ['gb', 'zip', '7z'], emulator: 'retroarch' },
  { id: 'gbc', folder: 'gbc', label: 'Game Boy Color', extensions: ['gbc', 'zip', '7z'], emulator: 'retroarch' },
  { id: 'gba', folder: 'gba', label: 'Game Boy Advance', extensions: ['gba', 'zip', '7z'], emulator: 'mgba' },
  { id: 'nds', folder: 'nds', label: 'Nintendo DS', extensions: ['nds', 'zip', '7z'], emulator: 'melonds' },
  { id: 'n3ds', folder: 'n3ds', label: 'Nintendo 3DS', extensions: ['3ds', 'cci', 'cia', 'zip'], emulator: 'azahar' },
  { id: 'n64', folder: 'n64', label: 'Nintendo 64', extensions: ['z64', 'n64', 'v64', 'zip'], emulator: 'retroarch' },
  { id: 'gc', folder: 'gc', label: 'GameCube', extensions: ['iso', 'gcm', 'rvz', 'ciso'], emulator: 'dolphin' },
  { id: 'wii', folder: 'wii', label: 'Wii', extensions: ['iso', 'wbfs', 'rvz', 'wad'], emulator: 'dolphin' },
  { id: 'wiiu', folder: 'wiiu', label: 'Wii U', extensions: ['wud', 'wux', 'rpx'], emulator: 'cemu' },
  { id: 'switch', folder: 'switch', label: 'Nintendo Switch', extensions: ['nsp', 'xci'], emulator: 'ryujinx' },
  { id: 'mastersystem', folder: 'mastersystem', label: 'Master System', extensions: ['sms', 'zip'], emulator: 'retroarch' },
  { id: 'megadrive', folder: 'megadrive', label: 'Mega Drive', extensions: ['md', 'gen', 'zip'], emulator: 'retroarch' },
  { id: 'gamegear', folder: 'gamegear', label: 'Game Gear', extensions: ['gg', 'zip'], emulator: 'retroarch' },
  { id: 'segacd', folder: 'segacd', label: 'Sega CD', extensions: ['chd', 'cue', 'iso'], emulator: 'retroarch' },
  { id: 'saturn', folder: 'saturn', label: 'Saturn', extensions: ['chd', 'cue', 'iso'], emulator: 'retroarch' },
  { id: 'dreamcast', folder: 'dreamcast', label: 'Dreamcast', extensions: ['chd', 'gdi', 'cdi', 'cue'], emulator: 'flycast' },
  { id: 'psx', folder: 'psx', label: 'PlayStation', extensions: ['chd', 'cue', 'bin', 'iso', 'pbp', 'm3u'], emulator: 'duckstation' },
  { id: 'ps2', folder: 'ps2', label: 'PlayStation 2', extensions: ['iso', 'chd', 'cso'], emulator: 'pcsx2' },
  { id: 'ps3', folder: 'ps3', label: 'PlayStation 3', extensions: ['ps3'], emulator: 'rpcs3' },
  { id: 'psp', folder: 'psp', label: 'PSP', extensions: ['iso', 'cso', 'pbp'], emulator: 'ppsspp' },
  { id: 'psvita', folder: 'psvita', label: 'PS Vita', extensions: ['vpk'], emulator: 'vita3k' },
  { id: 'xbox', folder: 'xbox', label: 'Xbox', extensions: ['iso', 'xiso'], emulator: 'xemu' },
  { id: 'xbox360', folder: 'xbox360', label: 'Xbox 360', extensions: ['iso', 'zar'], emulator: 'xenia' },
  { id: 'atari2600', folder: 'atari2600', label: 'Atari 2600', extensions: ['a26', 'bin', 'zip'], emulator: 'retroarch' },
  { id: 'arcade', folder: 'arcade', label: 'Arcade', extensions: ['zip'], emulator: 'mame' },
  { id: 'pcengine', folder: 'pcengine', label: 'PC Engine', extensions: ['pce', 'zip'], emulator: 'retroarch' },
  { id: 'scummvm', folder: 'scummvm', label: 'ScummVM', extensions: ['scummvm'], emulator: 'scummvm' },
];

export const BIOS_SPECS: BiosSpec[] = [
  {
    id: 'psx',
    label: 'PlayStation',
    folder: 'psx',
    need: 'any',
    files: ['scph5500.bin', 'scph5501.bin', 'scph5502.bin', 'scph1001.bin', 'scph7001.bin'],
    note: 'Dump the BIOS from a PlayStation you own. One region file is enough.',
  },
  {
    id: 'ps2',
    label: 'PlayStation 2',
    folder: 'ps2',
    need: 'any',
    files: ['ps2-0230a-20080220.bin', 'SCPH-70012.bin', 'scph39001.bin', 'ps2bios.bin'],
    note: 'PCSX2 needs a BIOS dumped from your own console. Any one of these names is accepted.',
  },
  {
    id: 'segacd',
    label: 'Sega CD',
    folder: 'segacd',
    need: 'any',
    files: ['bios_CD_U.bin', 'bios_CD_E.bin', 'bios_CD_J.bin'],
    note: 'One regional Sega CD BIOS from hardware you own.',
  },
  {
    id: 'saturn',
    label: 'Saturn',
    folder: 'saturn',
    need: 'any',
    files: ['saturn_bios.bin', 'sega_101.bin', 'mpr-17933.bin'],
    note: 'Saturn BIOS dumped from a console you own.',
  },
  {
    id: 'dreamcast',
    label: 'Dreamcast',
    folder: 'dc',
    need: 'all',
    files: ['dc_boot.bin', 'dc_flash.bin'],
    note: 'Both boot and flash files. Flycast can also use the BIOS folder above.',
  },
  {
    id: 'nds',
    label: 'Nintendo DS',
    folder: 'nds',
    need: 'all',
    files: ['bios7.bin', 'bios9.bin', 'firmware.bin'],
    optional: true,
    note: 'Optional. melonDS boots many games without these dumps.',
  },
  {
    id: 'gba',
    label: 'Game Boy Advance',
    folder: 'gba',
    need: 'any',
    files: ['gba_bios.bin'],
    optional: true,
    note: 'Optional. mGBA and the mGBA core run without it.',
  },
  {
    id: 'neogeo',
    label: 'Neo Geo',
    folder: 'neogeo',
    need: 'any',
    files: ['neogeo.zip'],
    note: 'The Neo Geo BIOS zip used by MAME and FBNeo. Not included with PartyUp.',
  },
  {
    id: 'switch',
    label: 'Switch keys',
    folder: 'switch',
    need: 'any',
    files: ['prod.keys'],
    note: 'prod.keys comes from a Switch you own. PartyUp will not fetch keys.',
  },
  {
    id: 'xbox',
    label: 'Original Xbox',
    folder: 'xbox',
    need: 'all',
    files: ['mcpx_1.0.bin', 'Complex_4627.bin'],
    note: 'xemu needs the MCPX and flash images dumped from hardware you own.',
  },
];
