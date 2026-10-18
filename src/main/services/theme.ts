import type { IpcMain } from 'electron'
export class ThemeService {
  register(ipc: IpcMain) { ipc.handle('theme:list', () => ['PartyUp', 'RetroArch']) }
}
