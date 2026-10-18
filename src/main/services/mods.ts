import type { IpcMain } from 'electron'
export class ModManagerService {
  register(ipc: IpcMain) {
    ipc.handle('mods:sources', () => ['Steam Workshop', 'Nexus Mods', 'Thunderstore', 'Mod.io'])
  }
}
