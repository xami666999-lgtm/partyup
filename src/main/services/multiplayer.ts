import type { IpcMain } from 'electron'
export class MultiplayerService {
  register(ipc: IpcMain) {
    ipc.handle('mp:clients', () => ['Party Up rooms', 'Friends invite', 'LAN'])
  }
}
