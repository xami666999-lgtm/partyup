import type { IpcMain } from 'electron'
export class BigPictureService {
  register(ipc: IpcMain) { ipc.handle('bigpicture:toggle', () => true) }
}
