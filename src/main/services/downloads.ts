import type { IpcMain } from 'electron'
export class DownloadService {
  register(ipc: IpcMain) { ipc.handle('dl:queue', () => []) }
}
