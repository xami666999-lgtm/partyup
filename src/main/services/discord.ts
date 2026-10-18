import type { IpcMain } from 'electron'
export class DiscordService {
  register(ipc: IpcMain) { ipc.handle('discord:presence', (_e, text: string) => ({ ok: true, text })) }
}
