import type { IpcMain } from 'electron'
export class AchievementService {
  register(ipc: IpcMain) {
    ipc.handle('ach:platforms', () => ['Steam', 'Xbox', 'PlayStation', 'Epic', 'GOG', 'RetroAchievements'])
  }
}
