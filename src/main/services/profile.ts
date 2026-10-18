import type { IpcMain } from 'electron'
export class ProfileService {
  register(ipc: IpcMain) { ipc.handle('profile:me', () => ({ name: 'You', avatar: '' })) }
}
