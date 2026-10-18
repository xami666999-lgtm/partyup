import type { IpcMain } from 'electron'
export class HoardSyncService {
  register(ipc: IpcMain) {
    ipc.handle('hoard:stats', () => ({ snapshots: 0, deduped: 0, compression: 'zstd' }))
  }
}
