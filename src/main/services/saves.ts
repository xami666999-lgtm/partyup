import type { IpcMain } from 'electron'
export class SaveManagerService {
  register(ipc: IpcMain) { ipc.handle('saves:list', () => []) }
}
