import type { IpcMain } from 'electron'
export class SteamService {
  register(ipc: IpcMain) {
    ipc.handle('steam:status', () => ({ linked: false, library: 0, workshop: true, controllers: true }))
  }
}
