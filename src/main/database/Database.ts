import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';

export class Database {
  private db: Database.Database | null = null;

  async initialize() {
    const dbPath = join(app.getPath('userData'), 'partyup.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    await this.runMigrations();
  }

  private async runMigrations() {
    const migrations = [
      `CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT,
        path TEXT,
        executable TEXT,
        args TEXT,
        cover TEXT,
        background TEXT,
        icon TEXT,
        playtime INTEGER DEFAULT 0,
        lastPlayed TEXT,
        installed INTEGER DEFAULT 1,
        hidden INTEGER DEFAULT 0,
        favorite INTEGER DEFAULT 0,
        tags TEXT,
        customFields TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS views (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        filters TEXT,
        sort TEXT,
        columns TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS backlog (
        gameId TEXT PRIMARY KEY,
        addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        priority INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS ratings (
        gameId TEXT PRIMARY KEY,
        rating INTEGER NOT NULL,
        ratedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS notes (
        gameId TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS saves (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        platform TEXT,
        size INTEGER,
        modifiedAt TEXT,
        backedUp INTEGER DEFAULT 0,
        backupPath TEXT,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS save_backups (
        id TEXT PRIMARY KEY,
        saveId TEXT NOT NULL,
        path TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (saveId) REFERENCES saves(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS mods (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        sourceId TEXT NOT NULL,
        sourceModId TEXT NOT NULL,
        name TEXT NOT NULL,
        version TEXT,
        description TEXT,
        enabled INTEGER DEFAULT 0,
        loadOrder INTEGER DEFAULT 0,
        installedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS mod_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        apiUrl TEXT,
        authToken TEXT,
        enabled INTEGER DEFAULT 1,
        config TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS torrents (
        hash TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        magnet TEXT,
        path TEXT,
        progress REAL DEFAULT 0,
        status TEXT DEFAULT 'stopped',
        downloadSpeed INTEGER DEFAULT 0,
        uploadSpeed INTEGER DEFAULT 0,
        peers INTEGER DEFAULT 0,
        seeds INTEGER DEFAULT 0,
        downloadDir TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        completedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS emulator_configs (
        id TEXT PRIMARY KEY,
        emulatorId TEXT NOT NULL,
        system TEXT,
        path TEXT,
        args TEXT,
        biosPath TEXT,
        config TEXT,
        UNIQUE(emulatorId, system)
      )`,
      `CREATE TABLE IF NOT EXISTS roms (
        id TEXT PRIMARY KEY,
        system TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        crc32 TEXT,
        md5 TEXT,
        sha1 TEXT,
        cover TEXT,
        metadata TEXT,
        emulatorId TEXT,
        core TEXT,
        lastPlayed TEXT,
        playtime INTEGER DEFAULT 0,
        favorite INTEGER DEFAULT 0,
        tags TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS optimization_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        settings TEXT,
        games TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS achievement_notifications (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        achievementId TEXT NOT NULL,
        platform TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        rarity REAL,
        unlockedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        shown INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        author TEXT,
        version TEXT,
        installedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT,
        author TEXT,
        description TEXT,
        main TEXT,
        enabled INTEGER DEFAULT 0,
        installedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        config TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS social_friends (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        platformId TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        status TEXT,
        currentGame TEXT,
        lastSeen TEXT,
        FOREIGN KEY (platform, platformId) REFERENCES platforms(id)
      )`,
      `CREATE TABLE IF NOT EXISTS social_activity (
        id TEXT PRIMARY KEY,
        friendId TEXT NOT NULL,
        type TEXT NOT NULL,
        gameId TEXT,
        gameName TEXT,
        details TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (friendId) REFERENCES social_friends(id) ON DELETE CASCADE
      )`,
`CREATE TABLE IF NOT EXISTS hoard_blobs (
        hash TEXT PRIMARY KEY,
        size INTEGER NOT NULL,
        refCount INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS hoard_snapshots (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        gameName TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        totalSize INTEGER DEFAULT 0,
        compressedSize INTEGER DEFAULT 0,
        fileCount INTEGER DEFAULT 0,
        FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS hoard_snapshot_files (
        id TEXT PRIMARY KEY,
        snapshotId TEXT NOT NULL,
        path TEXT NOT NULL,
        hash TEXT NOT NULL,
        size INTEGER NOT NULL,
        FOREIGN KEY (snapshotId) REFERENCES hoard_snapshots(id) ON DELETE CASCADE,
        FOREIGN KEY (hash) REFERENCES hoard_blobs(hash)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_hoard_snapshots_gameId ON hoard_snapshots(gameId)`,
      `CREATE INDEX IF NOT EXISTS idx_hoard_snapshot_files_snapshotId ON hoard_snapshot_files(snapshotId)`,
      `CREATE INDEX IF NOT EXISTS idx_hoard_snapshot_files_hash ON hoard_snapshot_files(hash)`,
      `CREATE INDEX IF NOT EXISTS idx_hoard_blobs_hash ON hoard_blobs(hash)`,
    ];

    for (const migration of migrations) {
      this.db!.exec(migration);
    }
  }

  getDb() {
    return this.db;
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Game operations
  getGames() {
    return this.db!.prepare('SELECT * FROM games WHERE hidden = 0 ORDER BY name').all();
  }

  getGame(id: string) {
    return this.db!.prepare('SELECT * FROM games WHERE id = ?').get(id);
  }

  addGame(game: any) {
    const stmt = this.db!.prepare(`
      INSERT INTO games (id, name, platform, path, executable, args, cover, background, icon, tags, customFields, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(game.id, game.name, game.platform, game.path, game.executable, game.args,
      game.cover, game.background, game.icon, JSON.stringify(game.tags || []),
      JSON.stringify(game.customFields || {}), JSON.stringify(game.metadata || {}));
    return game;
  }

  updateGame(id: string, data: any) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(f => data[f]);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const stmt = this.db!.prepare(`UPDATE games SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return this.getGame(id);
  }

  removeGame(id: string) {
    this.db!.prepare('DELETE FROM games WHERE id = ?').run(id);
  }

  // View operations
  getViews() {
    return this.db!.prepare('SELECT * FROM views').all();
  }

  addView(view: any) {
    const stmt = this.db!.prepare(`
      INSERT INTO views (id, name, type, filters, sort, columns)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(view.id, view.name, view.type, JSON.stringify(view.filters || {}), view.sort, JSON.stringify(view.columns || []));
    return view;
  }

  // Backlog operations
  getBacklog() {
    return this.db!.prepare(`
      SELECT g.*, b.priority, b.notes, b.addedAt as backlogAddedAt
      FROM games g
      JOIN backlog b ON g.id = b.gameId
      ORDER BY b.priority DESC, b.addedAt
    `).all();
  }

  addToBacklog(gameId: string, priority = 0) {
    this.db!.prepare('INSERT OR IGNORE INTO backlog (gameId, priority) VALUES (?, ?)').run(gameId, priority);
  }

  removeFromBacklog(gameId: string) {
    this.db!.prepare('DELETE FROM backlog WHERE gameId = ?').run(gameId);
  }

  // Ratings
  rateGame(gameId: string, rating: number) {
    this.db!.prepare('INSERT OR REPLACE INTO ratings (gameId, rating) VALUES (?, ?)').run(gameId, rating);
  }

  getRating(gameId: string) {
    return this.db!.prepare('SELECT rating FROM ratings WHERE gameId = ?').get(gameId)?.rating;
  }

  // Notes
  addNote(gameId: string, content: string) {
    this.db!.prepare('INSERT OR REPLACE INTO notes (gameId, content) VALUES (?, ?)').run(gameId, content);
  }

  getNote(gameId: string) {
    return this.db!.prepare('SELECT content FROM notes WHERE gameId = ?').get(gameId)?.content;
  }

  // Saves
  getSaves(gameId: string) {
    return this.db!.prepare('SELECT * FROM saves WHERE gameId = ?').all(gameId);
  }

  addSave(save: any) {
    this.db!.prepare(`
      INSERT INTO saves (id, gameId, name, path, platform, size, modifiedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(save.id, save.gameId, save.name, save.path, save.platform, save.size, save.modifiedAt);
  }

  backupSave(saveId: string, backupPath: string) {
    const backupId = crypto.randomUUID();
    this.db!.prepare('INSERT INTO save_backups (id, saveId, path) VALUES (?, ?, ?)').run(backupId, saveId, backupPath);
    this.db!.prepare('UPDATE saves SET backedUp = 1, backupPath = ? WHERE id = ?').run(backupPath, saveId);
    return backupId;
  }

  // Mods
  getMods(gameId: string) {
    return this.db!.prepare('SELECT * FROM mods WHERE gameId = ? ORDER BY loadOrder').all(gameId);
  }

  addMod(mod: any) {
    this.db!.prepare(`
      INSERT INTO mods (id, gameId, sourceId, sourceModId, name, version, description, enabled, loadOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(mod.id, mod.gameId, mod.sourceId, mod.sourceModId, mod.name, mod.version, mod.description, mod.enabled ? 1 : 0, mod.loadOrder);
  }

  updateMod(id: string, data: any) {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(f => data[f]);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    this.db!.prepare(`UPDATE mods SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
  }

  removeMod(id: string) {
    this.db!.prepare('DELETE FROM mods WHERE id = ?').run(id);
  }

  // Torrents
  getTorrents() {
    return this.db!.prepare('SELECT * FROM torrents ORDER BY createdAt DESC').all();
  }

  addTorrent(torrent: any) {
    this.db!.prepare(`
      INSERT INTO torrents (hash, name, magnet, path, downloadDir)
      VALUES (?, ?, ?, ?, ?)
    `).run(torrent.hash, torrent.name, torrent.magnet, torrent.path, torrent.downloadDir);
  }

  updateTorrent(hash: string, data: any) {
    const fields = Object.keys(data);
    const values = fields.map(f => data[f]);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    this.db!.prepare(`UPDATE torrents SET ${setClause} WHERE hash = ?`).run(...values, hash);
  }

  // Emulators
  getEmulatorConfigs() {
    return this.db!.prepare('SELECT * FROM emulator_configs').all();
  }

  setEmulatorConfig(config: any) {
    this.db!.prepare(`
      INSERT OR REPLACE INTO emulator_configs (id, emulatorId, system, path, args, biosPath, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(config.id || crypto.randomUUID(), config.emulatorId, config.system, config.path, config.args, config.biosPath, JSON.stringify(config.config || {}));
  }

  // ROMs
  getRoms(system?: string) {
    if (system) {
      return this.db!.prepare('SELECT * FROM roms WHERE system = ? ORDER BY name').all(system);
    }
    return this.db!.prepare('SELECT * FROM roms ORDER BY system, name').all();
  }

  addRom(rom: any) {
    this.db!.prepare(`
      INSERT INTO roms (id, system, name, path, size, crc32, md5, sha1, cover, metadata, emulatorId, core, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rom.id, rom.system, rom.name, rom.path, rom.size, rom.crc32, rom.md5, rom.sha1,
      rom.cover, JSON.stringify(rom.metadata || {}), rom.emulatorId, rom.core, JSON.stringify(rom.tags || []));
  }

  // Optimization profiles
  getOptimizationProfiles() {
    return this.db!.prepare('SELECT * FROM optimization_profiles').all();
  }

  addOptimizationProfile(profile: any) {
    this.db!.prepare(`
      INSERT INTO optimization_profiles (id, name, description, settings, games)
      VALUES (?, ?, ?, ?, ?)
    `).run(profile.id, profile.name, profile.description, JSON.stringify(profile.settings || {}), JSON.stringify(profile.games || []));
  }

  // Themes
  getThemes() {
    return this.db!.prepare('SELECT * FROM themes').all();
  }

  addTheme(theme: any) {
    this.db!.prepare(`
      INSERT INTO themes (id, name, type, data, author, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(theme.id, theme.name, theme.type, JSON.stringify(theme.data), theme.author, theme.version);
  }

  setActiveTheme(themeId: string) {
    this.db!.prepare('UPDATE themes SET active = 0').run();
    this.db!.prepare('UPDATE themes SET active = 1 WHERE id = ?').run(themeId);
  }

  getActiveTheme() {
    return this.db!.prepare('SELECT * FROM themes WHERE active = 1').get();
  }

  // Plugins
  getPlugins() {
    return this.db!.prepare('SELECT * FROM plugins').all();
  }

  addPlugin(plugin: any) {
    this.db!.prepare(`
      INSERT INTO plugins (id, name, version, author, description, main, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(plugin.id, plugin.name, plugin.version, plugin.author, plugin.description, plugin.main, JSON.stringify(plugin.config || {}));
  }

  setPluginEnabled(id: string, enabled: boolean) {
    this.db!.prepare('UPDATE plugins SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
  }

  // Social
  getFriends() {
    return this.db!.prepare('SELECT * FROM social_friends').all();
  }

  addFriend(friend: any) {
    this.db!.prepare(`
      INSERT INTO social_friends (id, platform, platformId, name, avatar, status, currentGame)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(friend.id, friend.platform, friend.platformId, friend.name, friend.avatar, friend.status, friend.currentGame);
  }

  getActivity(limit = 50) {
    return this.db!.prepare('SELECT * FROM social_activity ORDER BY timestamp DESC LIMIT ?').all(limit);
  }

  addActivity(activity: any) {
    this.db!.prepare(`
      INSERT INTO social_activity (id, friendId, type, gameId, gameName, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(activity.id, activity.friendId, activity.type, activity.gameId, activity.gameName, activity.details);
  }

  // Achievements
  addAchievementNotification(notification: any) {
    this.db!.prepare(`
      INSERT INTO achievement_notifications (id, gameId, achievementId, platform, title, description, icon, rarity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(notification.id, notification.gameId, notification.achievementId, notification.platform,
      notification.title, notification.description, notification.icon, notification.rarity);
  }

  getUnshownNotifications() {
    return this.db!.prepare('SELECT * FROM achievement_notifications WHERE shown = 0 ORDER BY unlockedAt').all();
  }

markNotificationShown(id: string) {
    this.db!.prepare('UPDATE achievement_notifications SET shown = 1 WHERE id = ?').run(id);
  }

  // Hoard Sync methods
  saveSnapshot(snapshot: any) {
    const stmt = this.db!.prepare(`
      INSERT INTO hoard_snapshots (id, gameId, gameName, timestamp, totalSize, compressedSize, fileCount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(snapshot.id, snapshot.gameId, snapshot.gameName, snapshot.timestamp, 
      snapshot.totalSize, snapshot.compressedSize, snapshot.files.length);

    for (const file of snapshot.files) {
      // Insert blob reference
      this.db!.prepare(`
        INSERT OR IGNORE INTO hoard_blobs (hash, size, refCount)
        VALUES (?, ?, 0)
      `).run(file.hash, file.size);

      this.db!.prepare(`
        UPDATE hoard_blobs SET refCount = refCount + 1 WHERE hash = ?
      `).run(file.hash);

      // Insert snapshot file reference
      this.db!.prepare(`
        INSERT INTO hoard_snapshot_files (id, snapshotId, path, hash, size)
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), snapshot.id, file.path, file.hash, file.size);
    }
  }

  getSnapshot(id: string) {
    const snapshot = this.db!.prepare('SELECT * FROM hoard_snapshots WHERE id = ?').get(id);
    if (!snapshot) return null;

    const files = this.db!.prepare('SELECT * FROM hoard_snapshot_files WHERE snapshotId = ?').all(id);
    return { ...snapshot, files };
  }

  getGameSnapshots(gameId: string) {
    return this.db!.prepare('SELECT * FROM hoard_snapshots WHERE gameId = ? ORDER BY timestamp DESC').all(gameId);
  }

  deleteSnapshot(id: string) {
    const files = this.db!.prepare('SELECT hash FROM hoard_snapshot_files WHERE snapshotId = ?').all(id);
    
    for (const file of files) {
      const refCount = this.db!.prepare('SELECT refCount FROM hoard_blobs WHERE hash = ?').get(file.hash)?.refCount || 0;
      if (refCount <= 1) {
        this.db!.prepare('DELETE FROM hoard_blobs WHERE hash = ?').run(file.hash);
      } else {
        this.db!.prepare('UPDATE hoard_blobs SET refCount = refCount - 1 WHERE hash = ?').run(file.hash);
      }
    }

    this.db!.prepare('DELETE FROM hoard_snapshot_files WHERE snapshotId = ?').run(id);
    this.db!.prepare('DELETE FROM hoard_snapshots WHERE id = ?').run(id);
  }

  getStorageStats() {
    const totalGames = this.db!.prepare('SELECT COUNT(DISTINCT gameId) as count FROM hoard_snapshots').get()?.count || 0;
    const totalSnapshots = this.db!.prepare('SELECT COUNT(*) as count FROM hoard_snapshots').get()?.count || 0;
    const totalSize = this.db!.prepare('SELECT SUM(totalSize) as size FROM hoard_snapshots').get()?.size || 0;
    const uniqueBlobs = this.db!.prepare('SELECT COUNT(*) as count FROM hoard_blobs').get()?.count || 0;
    const deduplicatedSize = this.db!.prepare('SELECT SUM(size * refCount) as size FROM hoard_blobs').get()?.size || 0;

    return {
      totalGames,
      totalSnapshots,
      totalSize,
      deduplicatedSize,
      uniqueBlobs,
    };
  }
}
