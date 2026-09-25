import { Database } from '../database/Database.js';
import { app } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  themeId?: string;
  bigPictureEnabled: boolean;
  controllerConfig?: string;
  privacySettings?: string;
}

export class ProfileService {
  private database: Database;
  private currentProfile: UserProfile | null = null;

  constructor(database: Database) {
    this.database = database;
  }

  async initialize() {
    await this.loadOrCreateDefaultProfile();
  }

  private async loadOrCreateDefaultProfile(): Promise<UserProfile> {
    const profile = await this.getProfile('default');
    if (profile) {
      this.currentProfile = profile;
      return profile;
    }

    const defaultProfile: UserProfile = {
      id: 'default',
      username: 'Player',
      displayName: 'Player',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bigPictureEnabled: false,
      privacySettings: JSON.stringify({
        showPlaytime: true,
        showAchievements: true,
        showFriends: true,
        showOnlineStatus: true,
      }),
    };

    await this.createProfile(defaultProfile);
    this.currentProfile = defaultProfile;
    return defaultProfile;
  }

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    await this.database.run(
      `INSERT INTO user_profiles (id, username, display_name, avatar, bio, created_at, updated_at, theme_id, big_picture_enabled, controller_config, privacy_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.username,
        profile.displayName || null,
        profile.avatar || null,
        profile.bio || null,
        profile.createdAt,
        profile.updatedAt,
        profile.themeId || null,
        profile.bigPictureEnabled ? 1 : 0,
        profile.controllerConfig || null,
        profile.privacySettings || null,
      ]
    );
    return profile;
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const row = await this.database.get(
      `SELECT * FROM user_profiles WHERE id = ?`,
      [id]
    );
    if (!row) return null;
    return this.mapRowToProfile(row);
  }

  async getCurrentProfile(): Promise<UserProfile> {
    if (!this.currentProfile) {
      await this.loadOrCreateDefaultProfile();
    }
    return this.currentProfile!;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getCurrentProfile();
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    
    await this.database.run(
      `UPDATE user_profiles SET 
        username = ?, display_name = ?, avatar = ?, bio = ?, 
        updated_at = ?, theme_id = ?, big_picture_enabled = ?, 
        controller_config = ?, privacy_settings = ?
       WHERE id = ?`,
      [
        updated.username,
        updated.displayName || null,
        updated.avatar || null,
        updated.bio || null,
        updated.updatedAt,
        updated.themeId || null,
        updated.bigPictureEnabled ? 1 : 0,
        updated.controllerConfig || null,
        updated.privacySettings || null,
        updated.id,
      ]
    );

    this.currentProfile = updated;
    return updated;
  }

  async setTheme(themeId: string): Promise<void> {
    await this.updateProfile({ themeId });
  }

  async setBigPictureMode(enabled: boolean): Promise<void> {
    await this.updateProfile({ bigPictureEnabled: enabled });
  }

  async updateControllerConfig(config: string): Promise<void> {
    await this.updateProfile({ controllerConfig: config });
  }

  async updatePrivacySettings(settings: object): Promise<void> {
    await this.updateProfile({ privacySettings: JSON.stringify(settings) });
  }

  private mapRowToProfile(row: any): UserProfile {
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      avatar: row.avatar,
      bio: row.bio,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      themeId: row.theme_id,
      bigPictureEnabled: row.big_picture_enabled === 1,
      controllerConfig: row.controller_config,
      privacySettings: row.privacy_settings,
    };
  }

  async exportProfile(): Promise<string> {
    const profile = await this.getCurrentProfile();
    return JSON.stringify(profile, null, 2);
  }

  async importProfile(json: string): Promise<UserProfile> {
    const profile = JSON.parse(json) as UserProfile;
    profile.id = 'default';
    profile.updatedAt = new Date().toISOString();
    await this.updateProfile(profile);
    return profile;
  }
}