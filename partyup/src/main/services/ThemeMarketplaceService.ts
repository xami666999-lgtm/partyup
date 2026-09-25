import { Database } from '../database/Database.js';
import { join } from 'path';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { app } from 'electron';

export interface ThemeMarketplaceItem {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  previewImage?: string;
  downloadUrl: string;
  source: 'hydra' | 'playnite' | 'custom';
  category: string;
  rating: number;
  downloads: number;
  tags: string[];
  data: any;
  createdAt: string;
  updatedAt: string;
}

export class ThemeMarketplaceService {
  private database: Database;
  private themesPath: string;

  constructor(database: Database) {
    this.database = database;
    this.themesPath = join(app.getPath('userData'), 'themes');
  }

  async initialize(): Promise<void> {
    await mkdir(this.themesPath, { recursive: true });
    await this.seedBuiltinThemes();
  }

  private async seedBuiltinThemes(): Promise<void> {
    const builtinThemes = [
      {
        id: 'partyup-dark',
        name: 'PartyUp Dark',
        author: 'PartyUp Team',
        version: '1.0.0',
        description: 'Default dark theme for PartyUp',
        source: 'hydra' as const,
        category: 'builtin',
        data: {
          colors: {
            primary: '#6366f1',
            primaryHover: '#4f46e5',
            background: '#0f0f1a',
            surface: '#1a1a2e',
            surfaceHover: '#252542',
            border: '#2d2d4a',
            text: '#f1f1f5',
            textSecondary: '#a1a1b5',
            textMuted: '#6b6b8a',
            accent: '#f43f5e',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
          },
        },
      },
      {
        id: 'partyup-light',
        name: 'PartyUp Light',
        author: 'PartyUp Team',
        version: '1.0.0',
        description: 'Default light theme for PartyUp',
        source: 'hydra' as const,
        category: 'builtin',
        data: {
          colors: {
            primary: '#4f46e5',
            primaryHover: '#4338ca',
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceHover: '#f1f5f9',
            border: '#e2e8f0',
            text: '#0f172a',
            textSecondary: '#475569',
            textMuted: '#94a3b8',
            accent: '#ec4899',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
            info: '#2563eb',
          },
        },
      },
      {
        id: 'ps2-browser',
        name: 'PS2 Browser',
        author: 'PartyUp Team',
        version: '1.0.0',
        description: 'PlayStation 2 Browser style theme',
        source: 'hydra' as const,
        category: 'retro',
        data: {
          colors: {
            primary: '#0070c0',
            primaryHover: '#005aa0',
            background: '#001a3a',
            surface: '#002550',
            surfaceHover: '#003060',
            border: '#004080',
            text: '#e0e0e0',
            textSecondary: '#a0a0a0',
            textMuted: '#606060',
            accent: '#ff6600',
            success: '#00cc00',
            warning: '#ffcc00',
            error: '#ff3333',
            info: '#0099ff',
          },
        },
      },
      {
        id: 'ps3-xmb',
        name: 'PS3 XMB',
        author: 'PartyUp Team',
        version: '1.0.0',
        description: 'PlayStation 3 XMB style theme',
        source: 'hydra' as const,
        category: 'retro',
        data: {
          colors: {
            primary: '#0066cc',
            primaryHover: '#0055aa',
            background: '#0a1a2a',
            surface: '#14283c',
            surfaceHover: '#1e3a5c',
            border: '#2a4a6e',
            text: '#ffffff',
            textSecondary: '#b0c4d8',
            textMuted: '#7890a8',
            accent: '#ffcc00',
            success: '#00cc66',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#00aaff',
          },
        },
      },
      {
        id: 'xbox360-dashboard',
        name: 'Xbox 360 Dashboard',
        author: 'PartyUp Team',
        version: '1.0.0',
        description: 'Xbox 360 Dashboard style theme',
        source: 'hydra' as const,
        category: 'retro',
        data: {
          colors: {
            primary: '#107c10',
            primaryHover: '#0e6b0e',
            background: '#0a1f0a',
            surface: '#142d14',
            surfaceHover: '#1e3d1e',
            border: '#284a28',
            text: '#ffffff',
            textSecondary: '#c8e0c8',
            textMuted: '#8aad8a',
            accent: '#ff8c00',
            success: '#44cc44',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#00aaff',
          },
        },
      },
    ];

    for (const theme of builtinThemes) {
      const existing = await this.database.get(
        `SELECT id FROM theme_marketplace WHERE id = ?`,
        [theme.id]
      );
      if (!existing) {
        await this.database.run(
          `INSERT INTO theme_marketplace (id, name, author, version, description, source, category, data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            theme.id,
            theme.name,
            theme.author,
            theme.version,
            theme.description,
            theme.source,
            theme.category,
            JSON.stringify(theme.data),
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }
    }
  }

  async getThemes(filters?: { source?: string; category?: string; search?: string }): Promise<ThemeMarketplaceItem[]> {
    let sql = `SELECT * FROM theme_marketplace WHERE 1=1`;
    const params: any[] = [];

    if (filters?.source) {
      sql += ` AND source = ?`;
      params.push(filters.source);
    }
    if (filters?.category) {
      sql += ` AND category = ?`;
      params.push(filters.category);
    }
    if (filters?.search) {
      sql += ` AND (name LIKE ? OR author LIKE ? OR description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ` ORDER BY downloads DESC, rating DESC`;

    const rows = await this.database.all(sql, params);
    return rows.map(this.mapRowToTheme);
  }

  async getTheme(id: string): Promise<ThemeMarketplaceItem | null> {
    const row = await this.database.get(`SELECT * FROM theme_marketplace WHERE id = ?`, [id]);
    return row ? this.mapRowToTheme(row) : null;
  }

  async installTheme(theme: ThemeMarketplaceItem): Promise<void> {
    const existing = await this.database.get(`SELECT id FROM theme_marketplace WHERE id = ?`, [theme.id]);
    if (!existing) {
      await this.database.run(
        `INSERT INTO theme_marketplace (id, name, author, version, description, preview_image, download_url, source, category, rating, downloads, tags, data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          theme.id,
          theme.name,
          theme.author,
          theme.version,
          theme.description,
          theme.previewImage || null,
          theme.downloadUrl,
          theme.source,
          theme.category,
          theme.rating,
          theme.downloads,
          JSON.stringify(theme.tags),
          JSON.stringify(theme.data),
          theme.createdAt,
          theme.updatedAt,
        ]
      );
    }

    const themeFile = join(this.themesPath, `${theme.id}.json`);
    await writeFile(themeFile, JSON.stringify(theme, null, 2));
  }

  async uninstallTheme(id: string): Promise<void> {
    await this.database.run(`DELETE FROM theme_marketplace WHERE id = ?`, [id]);
    
    const themeFile = join(this.themesPath, `${id}.json`);
    try {
      const fs = await import('fs/promises');
      await fs.unlink(themeFile);
    } catch {}
  }

  async getInstalledThemes(): Promise<ThemeMarketplaceItem[]> {
    return this.getThemes({ source: 'hydra' });
  }

  async getCustomThemes(): Promise<ThemeMarketplaceItem[]> {
    return this.getThemes({ category: 'custom' });
  }

  async createCustomTheme(data: any, name: string, author: string): Promise<ThemeMarketplaceItem> {
    const id = `custom-${Date.now()}`;
    const theme: ThemeMarketplaceItem = {
      id,
      name,
      author,
      version: '1.0.0',
      description: 'Custom theme created by user',
      source: 'custom',
      category: 'custom',
      rating: 0,
      downloads: 0,
      tags: [],
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadUrl: '',
    };

    await this.installTheme(theme);
    return theme;
  }

  async updateTheme(id: string, updates: Partial<ThemeMarketplaceItem>): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.name) { fields.push('name = ?'); params.push(updates.name); }
    if (updates.description) { fields.push('description = ?'); params.push(updates.description); }
    if (updates.data) { fields.push('data = ?'); params.push(JSON.stringify(updates.data)); }
    if (updates.tags) { fields.push('tags = ?'); params.push(JSON.stringify(updates.tags)); }
    if (updates.version) { fields.push('version = ?'); params.push(updates.version); }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await this.database.run(
      `UPDATE theme_marketplace SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.database.run(
      `UPDATE theme_marketplace SET downloads = downloads + 1 WHERE id = ?`,
      [id]
    );
  }

  async rateTheme(id: string, rating: number): Promise<void> {
    const theme = await this.getTheme(id);
    if (!theme) return;

    const newRating = ((theme.rating * theme.downloads) + rating) / (theme.downloads + 1);
    await this.database.run(
      `UPDATE theme_marketplace SET rating = ?, downloads = downloads + 1 WHERE id = ?`,
      [newRating, id]
    );
  }

  async importFromPlaynite(playniteThemePath: string): Promise<ThemeMarketplaceItem | null> {
    try {
      const content = await readFile(playniteThemePath, 'utf-8');
      const playniteTheme = JSON.parse(content);
      
      const theme: ThemeMarketplaceItem = {
        id: `playnite-${Date.now()}`,
        name: playniteTheme.Name || 'Imported Playnite Theme',
        author: playniteTheme.Author || 'Playnite User',
        version: playniteTheme.Version || '1.0.0',
        description: `Imported from Playnite: ${playniteTheme.Description || 'No description'}`,
        source: 'playnite',
        category: 'imported',
        rating: 0,
        downloads: 0,
        tags: ['playnite', 'imported'],
        data: this.convertPlayniteToPartyUp(playniteTheme),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadUrl: '',
      };

      await this.installTheme(theme);
      return theme;
    } catch (error) {
      console.error('Failed to import Playnite theme:', error);
      return null;
    }
  }

  private convertPlayniteToPartyUp(playniteTheme: any): any {
    return {
      colors: {
        primary: playniteTheme.PrimaryColor || '#6366f1',
        primaryHover: playniteTheme.PrimaryHoverColor || '#4f46e5',
        background: playniteTheme.BackgroundColor || '#0f0f1a',
        surface: playniteTheme.SurfaceColor || '#1a1a2e',
        surfaceHover: playniteTheme.SurfaceHoverColor || '#252542',
        border: playniteTheme.BorderColor || '#2d2d4a',
        text: playniteTheme.TextColor || '#f1f1f5',
        textSecondary: playniteTheme.TextSecondaryColor || '#a1a1b5',
        textMuted: playniteTheme.TextMutedColor || '#6b6b8a',
        accent: playniteTheme.AccentColor || '#f43f5e',
        success: playniteTheme.SuccessColor || '#22c55e',
        warning: playniteTheme.WarningColor || '#f59e0b',
        error: playniteTheme.ErrorColor || '#ef4444',
        info: playniteTheme.InfoColor || '#3b82f6',
      },
    };
  }

  async fetchHydraThemes(): Promise<ThemeMarketplaceItem[]> {
    try {
      const response = await fetch('https://hydrathemes.shop/api/themes');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json() as { themes?: any[] };
      
      const themes: ThemeMarketplaceItem[] = (data.themes || []).map((t: any) => ({
        id: `hydra-${t.id}`,
        name: t.name,
        author: t.author,
        version: t.version,
        description: t.description,
        previewImage: t.previewImage,
        downloadUrl: t.downloadUrl,
        source: 'hydra',
        category: t.category || 'hydra',
        rating: t.rating || 0,
        downloads: t.downloads || 0,
        tags: t.tags || [],
        data: t.data,
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
      })) || [];

      for (const theme of themes) {
        await this.installTheme(theme);
      }

      return themes;
    } catch (error) {
      console.error('Failed to fetch Hydra themes:', error);
      return [];
    }
  }

  async fetchPlayniteThemes(): Promise<ThemeMarketplaceItem[]> {
    try {
      const response = await fetch('https://raw.githubusercontent.com/scowalt/PlayniteExtensionList/master/Extensions/Themes/themes.json');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      const themes: ThemeMarketplaceItem[] = (Array.isArray(data) ? data : []).map((t: any) => ({
        id: `playnite-${t.Id || t.id}`,
        name: t.Name || t.name,
        author: t.Author || t.author,
        version: t.Version || t.version || '1.0.0',
        description: t.Description || t.description || 'Playnite theme',
        source: 'playnite',
        category: 'playnite',
        rating: 0,
        downloads: 0,
        tags: ['playnite'],
        data: this.convertPlayniteToPartyUp(t),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadUrl: '',
      })) || [];

      for (const theme of themes) {
        await this.installTheme(theme);
      }

      return themes;
    } catch (error) {
      console.error('Failed to fetch Playnite themes:', error);
      return [];
    }
  }

  private mapRowToTheme(row: any): ThemeMarketplaceItem {
    return {
      id: row.id,
      name: row.name,
      author: row.author,
      version: row.version,
      description: row.description,
      previewImage: row.preview_image,
      downloadUrl: row.download_url,
      source: row.source,
      category: row.category,
      rating: row.rating,
      downloads: row.downloads,
      tags: JSON.parse(row.tags || '[]'),
      data: JSON.parse(row.data || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}