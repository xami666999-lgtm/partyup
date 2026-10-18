import type { IpcMain } from 'electron'
export class PlaytimeService {
  register(ipc: IpcMain) { ipc.handle('play:stats', () => ({ week: 0, month: 0, now: null })) }
}
