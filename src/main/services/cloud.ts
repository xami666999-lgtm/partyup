import type { IpcMain } from 'electron'
export class CloudGamingService {
  register(ipc: IpcMain) {
    ipc.handle('cloud:list', () => ['Moonlight', 'Sunshine', 'Chiaki', 'GeForce Now', 'Xbox Cloud'])
  }
}
