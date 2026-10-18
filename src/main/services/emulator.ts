import type { IpcMain } from 'electron'

const EMULATORS = ['RetroArch', 'Dolphin', 'PCSX2', 'DuckStation', 'PPSSPP', 'melonDS', 'Cemu', 'RPCS3', 'Citra', 'Vita3K']

export class EmulatorService {
  register(ipc: IpcMain) {
    ipc.handle('emu:list', () => EMULATORS)
  }
}
