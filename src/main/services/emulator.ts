import type { IpcMain } from 'electron'

export const EMULATORS = [
  { id: 'retroarch', name: 'RetroArch', systems: 'NES, SNES, Genesis, GBA, and more', url: 'https://www.retroarch.com/?page=platforms' },
  { id: 'dolphin', name: 'Dolphin', systems: 'GameCube, Wii', url: 'https://dolphin-emu.org/download/' },
  { id: 'rpcs3', name: 'RPCS3', systems: 'PlayStation 3', url: 'https://rpcs3.net/download' },
  { id: 'pcsx2', name: 'PCSX2', systems: 'PlayStation 2', url: 'https://pcsx2.net/downloads' },
  { id: 'duckstation', name: 'DuckStation', systems: 'PlayStation 1', url: 'https://github.com/stenzek/duckstation/releases' },
  { id: 'ppsspp', name: 'PPSSPP', systems: 'PSP', url: 'https://www.ppsspp.org/download/' },
  { id: 'melonds', name: 'melonDS', systems: 'Nintendo DS', url: 'https://melonds.kuribo64.net/downloads.php' },
  { id: 'cemu', name: 'Cemu', systems: 'Wii U', url: 'https://cemu.info/' },
  { id: 'vita3k', name: 'Vita3K', systems: 'PS Vita', url: 'https://vita3k.org/#download' },
  { id: 'xemu', name: 'xemu', systems: 'Xbox', url: 'https://xemu.app/#download' },
  { id: 'azahar', name: 'Azahar', systems: '3DS', url: 'https://github.com/azahar-emu/azahar/releases' },
  { id: 'ryujinx', name: 'Ryujinx', systems: 'Switch', url: 'https://ryujinx.app/' },
]

export class EmulatorService {
  register(ipc: IpcMain) {
    ipc.handle('emu:list', () => EMULATORS)
  }
}
