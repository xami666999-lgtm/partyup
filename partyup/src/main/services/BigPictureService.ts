import { Database } from '../database/Database.js';

export interface BigPictureSettings {
  id: string;
  enabled: boolean;
  controllerConfig?: string;
  themeId?: string;
  autoLaunch: boolean;
  fullscreen: boolean;
  lastUsed?: string;
}

export interface ControllerMapping {
  id: string;
  name: string;
  vendorId: string;
  productId: string;
  mappings: Record<string, string>;
}

export class BigPictureService {
  private database: Database;
  private isBigPictureMode = false;

  constructor(database: Database) {
    this.database = database;
  }

  async initialize(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings) {
      await this.createDefaultSettings();
    }
  }

  async getSettings(): Promise<BigPictureSettings | null> {
    const row = await this.database.get(`SELECT * FROM big_picture_settings WHERE id = 'default'`);
    if (!row) return null;
    return this.mapRowToSettings(row);
  }

  private async createDefaultSettings(): Promise<BigPictureSettings> {
    const defaults: BigPictureSettings = {
      id: 'default',
      enabled: false,
      controllerConfig: JSON.stringify({}),
      autoLaunch: false,
      fullscreen: true,
    };
    await this.database.run(
      `INSERT INTO big_picture_settings (id, enabled, controller_config, auto_launch, fullscreen)
       VALUES (?, ?, ?, ?, ?)`,
      [defaults.id, defaults.enabled ? 1 : 0, defaults.controllerConfig, defaults.autoLaunch ? 1 : 0, defaults.fullscreen ? 1 : 0]
    );
    return defaults;
  }

  async getSettingsOrDefault(): Promise<BigPictureSettings> {
    const settings = await this.getSettings();
    return settings || this.createDefaultSettings();
  }

  async updateSettings(updates: Partial<BigPictureSettings>): Promise<BigPictureSettings> {
    const current = await this.getSettingsOrDefault();
    const updated = { ...current, ...updates };

    await this.database.run(
      `UPDATE big_picture_settings SET 
        enabled = ?, controller_config = ?, theme_id = ?, 
        auto_launch = ?, fullscreen = ?, last_used = ?
       WHERE id = 'default'`,
      [
        updated.enabled ? 1 : 0,
        updated.controllerConfig || null,
        updated.themeId || null,
        updated.autoLaunch ? 1 : 0,
        updated.fullscreen ? 1 : 0,
        new Date().toISOString(),
      ]
    );

    return updated;
  }

  async enableBigPictureMode(): Promise<void> {
    await this.updateSettings({ enabled: true, lastUsed: new Date().toISOString() });
    this.isBigPictureMode = true;
  }

  async disableBigPictureMode(): Promise<void> {
    await this.updateSettings({ enabled: false });
    this.isBigPictureMode = false;
  }

  async toggleBigPictureMode(): Promise<boolean> {
    const settings = await this.getSettingsOrDefault();
    if (settings.enabled) {
      await this.disableBigPictureMode();
      return false;
    } else {
      await this.enableBigPictureMode();
      return true;
    }
  }

  async setTheme(themeId: string): Promise<void> {
    await this.updateSettings({ themeId });
  }

  async setAutoLaunch(enabled: boolean): Promise<void> {
    await this.updateSettings({ autoLaunch: enabled });
  }

  async setFullscreen(enabled: boolean): Promise<void> {
    await this.updateSettings({ fullscreen: enabled });
  }

  async updateControllerConfig(config: Record<string, any>): Promise<void> {
    await this.updateSettings({ controllerConfig: JSON.stringify(config) });
  }

  async getControllerConfig(): Promise<Record<string, any>> {
    const settings = await this.getSettingsOrDefault();
    try {
      return JSON.parse(settings.controllerConfig || '{}');
    } catch {
      return {};
    }
  }

  isBigPictureActive(): boolean {
    return this.isBigPictureMode;
  }

  private mapRowToSettings(row: any): BigPictureSettings {
    return {
      id: row.id,
      enabled: row.enabled === 1,
      controllerConfig: row.controller_config,
      themeId: row.theme_id,
      autoLaunch: row.auto_launch === 1,
      fullscreen: row.fullscreen === 1,
      lastUsed: row.last_used,
    };
  }
}