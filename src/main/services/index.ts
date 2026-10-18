import type { IpcMain } from 'electron'
import { LibraryService } from './library'
import { EmulatorService } from './emulator'
import { MetadataService } from './metadata'
import { SaveManagerService } from './saves'
import { PlaytimeService } from './playtime'
import { ProfileService } from './profile'
import { FriendsService } from './friends'
import { BigPictureService } from './bigpicture'
import { ThemeService } from './theme'
import { AchievementService } from './achievements'
import { DownloadService } from './downloads'
import { DiscordService } from './discord'
import { SteamService } from './steam'
import { ModManagerService } from './mods'
import { MultiplayerService } from './multiplayer'
import { CloudGamingService } from './cloud'
import { OptimizationService } from './optimize'
import { HoardSyncService } from './hoard'

export function registerServices(ipc: IpcMain) {
  const services = [
    new LibraryService(), new EmulatorService(), new MetadataService(),
    new SaveManagerService(), new PlaytimeService(), new ProfileService(),
    new FriendsService(), new BigPictureService(), new ThemeService(),
    new AchievementService(), new DownloadService(), new DiscordService(),
    new SteamService(), new ModManagerService(), new MultiplayerService(),
    new CloudGamingService(), new OptimizationService(), new HoardSyncService(),
  ]
  for (const service of services) service.register(ipc)
}
