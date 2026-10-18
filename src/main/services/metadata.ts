import type { IpcMain } from 'electron'
export class MetadataService {
  register(ipc: IpcMain) {
    ipc.handle('meta:sources', () => ['IGDB', 'RAWG', 'SteamGridDB', 'MobyGames', 'GameFAQs'])
  }
}
