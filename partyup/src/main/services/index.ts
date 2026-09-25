import type { Database } from '../database/Database.js';
import type { PluginManager } from '../plugins/PluginManager.js';
import Store from 'electron-store';
import { SteamService } from './SteamService.js';
import { TorrentService } from './TorrentService.js';
import { EmulatorService } from './EmulatorService.js';
import { ModManagerService } from './ModManagerService.js';
import { MultiplayerService } from './MultiplayerService.js';
import { CloudGamingService } from './CloudGamingService.js';
import { OptimizationService } from './OptimizationService.js';
import { AchievementService } from './AchievementService.js';
import { SaveManagerService } from './SaveManagerService.js';
import { LibraryService } from './LibraryService.js';
import { SocialService } from './SocialService.js';
import { DiscordService } from './DiscordService.js';
import { MetadataService } from './MetadataService.js';
import { DownloadService } from './DownloadService.js';
import { HoardSyncService } from './HoardSyncService.js';
import { ProfileService } from './ProfileService.js';
import { PlaytimeService } from './PlaytimeService.js';
import { FriendsService } from './FriendsService.js';
import { BigPictureService } from './BigPictureService.js';
import { ThemeMarketplaceService } from './ThemeMarketplaceService.js';

type StoreType = InstanceType<typeof Store>;

export interface Services {
  steam: SteamService;
  torrent: TorrentService;
  emulator: EmulatorService;
  modManager: ModManagerService;
  multiplayer: MultiplayerService;
  cloudGaming: CloudGamingService;
  optimization: OptimizationService;
  achievement: AchievementService;
  saveManager: SaveManagerService;
  library: LibraryService;
  social: SocialService;
  discord: DiscordService;
  metadata: MetadataService;
  download: DownloadService;
  hoardSync: HoardSyncService;
  profile: ProfileService;
  playtime: PlaytimeService;
  friends: FriendsService;
  bigPicture: BigPictureService;
  themeMarketplace: ThemeMarketplaceService;
}

type ServiceConstructor = new (...args: any[]) => any;

export async function initializeServices(
  store: StoreType,
  database: Database,
  pluginManager: PluginManager
): Promise<Services> {
  const services: Partial<Services> = {
    steam: new SteamService(),
    torrent: new TorrentService(),
    emulator: new EmulatorService(),
    modManager: new ModManagerService(),
    multiplayer: new MultiplayerService(),
    cloudGaming: new CloudGamingService(),
    optimization: new OptimizationService(),
    achievement: new (AchievementService as any)(database),
    saveManager: new (SaveManagerService as any)(database),
    library: new (LibraryService as any)(database),
    social: new (SocialService as any)(database),
    discord: new DiscordService(),
    metadata: new MetadataService(),
    download: new DownloadService(),
    hoardSync: new HoardSyncService(database) as HoardSyncService,
    profile: new ProfileService(database) as ProfileService,
    playtime: new PlaytimeService(database) as PlaytimeService,
    friends: new FriendsService(database) as FriendsService,
    bigPicture: new BigPictureService(database) as BigPictureService,
    themeMarketplace: new ThemeMarketplaceService(database) as ThemeMarketplaceService,
  };

  const initPromises = Object.entries(services).map(async ([name, service]) => {
    if (service && typeof (service as any).initialize === 'function') {
      try {
        await (service as any).initialize();
        console.log(`Service ${name} initialized`);
      } catch (error) {
        console.error(`Failed to initialize ${name}:`, error);
      }
    }
  });

  await Promise.all(initPromises);

  return services as Services;
}

export async function shutdownServices(services: Services): Promise<void> {
  const shutdownPromises = Object.entries(services).map(async ([name, service]) => {
    if (service && typeof service.shutdown === 'function') {
      try {
        await service.shutdown();
        console.log(`Service ${name} shut down`);
      } catch (error) {
        console.error(`Failed to shut down ${name}:`, error);
      }
    }
  });

  await Promise.all(shutdownPromises);
}