import type { IpcMain } from 'electron'

export class LibraryService {
  private games = [
    { id: '1', title: 'Your game', platform: 'NES', cover: '' },
  ]
  register(ipc: IpcMain) {
    ipc.handle('library:list', () => this.games)
    ipc.handle('library:add', (_e, game) => { this.games.unshift(game); return this.games })
  }
}
