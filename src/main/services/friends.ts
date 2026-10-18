import type { IpcMain } from 'electron'
export class FriendsService {
  register(ipc: IpcMain) { ipc.handle('friends:list', () => []) }
}
