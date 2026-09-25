import { Database } from '../database/Database.js';

export interface Achievement {
  id: string;
  gameId: string;
  achievementId: string;
  name: string;
  description: string;
  icon?: string;
  rarity: number;
  unlocked: boolean;
  unlockedAt?: string;
  platform: string;
}

export interface GameAchievements {
  gameId: string;
  gameName: string;
  achievements: Achievement[];
  total: number;
  unlocked: number;
  completionRate: number;
}

export class AchievementService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async syncAchievements(gameId: string, platform: string, achievements: any[]): Promise<void> {
    for (const ach of achievements) {
      await this.database.run(
        `INSERT OR REPLACE INTO achievements (id, game_id, achievement_id, name, description, icon, rarity, unlocked, unlocked_at, platform)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${platform}-${gameId}-${ach.id}`,
          gameId,
          ach.id,
          ach.name,
          ach.description || '',
          ach.icon || null,
          ach.rarity || 0,
          ach.unlocked ? 1 : 0,
          ach.unlockedAt || null,
          platform,
        ]
      );
    }
  }

  async getGameAchievements(gameId: string): Promise<GameAchievements> {
    const rows = await this.database.all(
      `SELECT * FROM achievements WHERE game_id = ? ORDER BY rarity ASC`,
      [gameId]
    );

    const achievements = rows.map(this.mapRowToAchievement);
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;

    return {
      gameId,
      gameName: '',
      achievements,
      total,
      unlocked,
      completionRate: total > 0 ? (unlocked / total) * 100 : 0,
    };
  }

  async getAllAchievements(): Promise<GameAchievements[]> {
    const gameIds = await this.database.all<{ game_id: string }>(
      `SELECT DISTINCT game_id FROM achievements`
    ) as { game_id: string }[];

    const results: GameAchievements[] = [];
    for (const { game_id } of gameIds) {
      const stats = await this.getGameAchievements(game_id);
      const game = await this.database.get<{ name: string }>(`SELECT name FROM games WHERE id = ?`, [game_id]);
      stats.gameName = game?.name || game_id;
      results.push(stats);
    }
    return results;
  }

  async getRecentUnlocks(limit = 10): Promise<Achievement[]> {
    const rows = await this.database.all(
      `SELECT * FROM achievements WHERE unlocked = 1 ORDER BY unlocked_at DESC LIMIT ?`,
      [limit]
    );
    return rows.map(this.mapRowToAchievement);
  }

  async unlockAchievement(gameId: string, achievementId: string, platform: string): Promise<void> {
    const id = `${platform}-${gameId}-${achievementId}`;
    await this.database.run(
      `UPDATE achievements SET unlocked = 1, unlocked_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  }

  async getCompletionStats(): Promise<{
    totalGames: number;
    totalAchievements: number;
    unlockedAchievements: number;
    completionRate: number;
    rarestAchievements: Achievement[];
  }> {
    const allGames = await this.getAllAchievements();
    const totalGames = allGames.length;
    const totalAchievements = allGames.reduce((sum, g) => sum + g.total, 0);
    const unlockedAchievements = allGames.reduce((sum, g) => sum + g.unlocked, 0);

    const allAchievements = allGames.flatMap(g => g.achievements);
    const unlocked = allAchievements.filter(a => a.unlocked);
    const rarest = unlocked
      .sort((a, b) => a.rarity - b.rarity)
      .slice(0, 10);

    return {
      totalGames,
      totalAchievements,
      unlockedAchievements,
      completionRate: totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0,
      rarestAchievements: rarest,
    };
  }

  async getAchievementsByRarity(rarity: number): Promise<Achievement[]> {
    const rows = await this.database.all(
      `SELECT * FROM achievements WHERE rarity <= ? ORDER BY rarity ASC`,
      [rarity]
    );
    return rows.map(this.mapRowToAchievement);
  }

  private mapRowToAchievement(row: any): Achievement {
    return {
      id: row.id,
      gameId: row.game_id,
      achievementId: row.achievement_id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      rarity: row.rarity,
      unlocked: row.unlocked === 1,
      unlockedAt: row.unlocked_at,
      platform: row.platform,
    };
  }
}