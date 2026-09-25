import { Database } from '../database/Database.js';

export interface PlaytimeSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  platform?: string;
}

export interface GamePlaytimeStats {
  gameId: string;
  totalPlaytime: number;
  sessionsCount: number;
  lastPlayed?: string;
  firstPlayed?: string;
  averageSession: number;
  playtimeByWeek: { week: string; minutes: number }[];
  playtimeByMonth: { month: string; minutes: number }[];
}

export class PlaytimeService {
  private database: Database;
  private activeSessions: Map<string, { startTime: Date; gameId: string; interval: NodeJS.Timeout }> = new Map();

  constructor(database: Database) {
    this.database = database;
  }

  async startSession(gameId: string, platform?: string): Promise<PlaytimeSession> {
    const userId = 'default';
    const existingSession = this.activeSessions.get(gameId);
    if (existingSession) {
      return this.getSession(existingSession);
    }

    const session: PlaytimeSession = {
      id: crypto.randomUUID(),
      gameId,
      userId,
      startTime: new Date().toISOString(),
      duration: 0,
      platform,
    };

    await this.database.run(
      `INSERT INTO playtime_sessions (id, game_id, user_id, start_time, duration, platform)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [session.id, session.gameId, session.userId, session.startTime, 0, platform || null]
    );

    const interval = setInterval(async () => {
      await this.updateSessionDuration(session.id);
    }, 60000);

    this.activeSessions.set(gameId, { startTime: new Date(), gameId, interval });

    return session;
  }

  async endSession(gameId: string): Promise<PlaytimeSession | null> {
    const sessionData = this.activeSessions.get(gameId);
    if (!sessionData) return null;

    clearInterval(sessionData.interval);
    this.activeSessions.delete(gameId);

    const session = await this.getSession({ ...sessionData, endTime: new Date() });
    if (session) {
      await this.database.run(
        `UPDATE playtime_sessions SET end_time = ?, duration = ? WHERE id = ?`,
        [session.endTime, session.duration, session.id]
      );
    }

    await this.updateGamePlaytime(gameId);
    return session;
  }

  private getSession(data: { startTime: Date; gameId: string; endTime?: Date }): PlaytimeSession {
    const endTime = data.endTime || new Date();
    const duration = Math.floor((endTime.getTime() - data.startTime.getTime()) / 1000 / 60);
    return {
      id: '',
      gameId: data.gameId,
      userId: 'default',
      startTime: data.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
    };
  }

  private async updateSessionDuration(sessionId: string): Promise<void> {
    const start = await this.database.get<{ start_time: string }>(`SELECT start_time FROM playtime_sessions WHERE id = ?`, [sessionId]);
    if (!start) return;
    
    const startTime = new Date(start.start_time).getTime();
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
    
    await this.database.run(
      `UPDATE playtime_sessions SET duration = ? WHERE id = ?`,
      [duration, sessionId]
    );
  }

  private async updateGamePlaytime(gameId: string): Promise<void> {
    const sessions = await this.database.all<{ total: number }>(
      `SELECT SUM(duration) as total FROM playtime_sessions WHERE game_id = ? AND end_time IS NOT NULL`,
      [gameId]
    );
    const total = sessions[0]?.total || 0;

    const lastSession = await this.database.get<{ end_time: string }>(
      `SELECT end_time FROM playtime_sessions WHERE game_id = ? AND end_time IS NOT NULL ORDER BY end_time DESC LIMIT 1`,
      [gameId]
    );

    await this.database.run(
      `UPDATE games SET playtime = ?, last_played = ? WHERE id = ?`,
      [total, lastSession?.end_time || null, gameId]
    );
  }

  async getGameStats(gameId: string): Promise<GamePlaytimeStats> {
    const sessions = await this.database.all<PlaytimeSession>(
      `SELECT * FROM playtime_sessions WHERE game_id = ? AND end_time IS NOT NULL ORDER BY start_time`,
      [gameId]
    );

    const totalPlaytime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const sessionsCount = sessions.length;
    const firstPlayed = sessions[0]?.startTime;
    const lastPlayed = sessions[sessions.length - 1]?.endTime;
    const averageSession = sessionsCount > 0 ? totalPlaytime / sessionsCount : 0;

    const playtimeByWeek = this.aggregateByWeek(sessions);
    const playtimeByMonth = this.aggregateByMonth(sessions);

    return {
      gameId,
      totalPlaytime,
      sessionsCount,
      firstPlayed,
      lastPlayed,
      averageSession,
      playtimeByWeek,
      playtimeByMonth,
    };
  }

  private aggregateByWeek(sessions: PlaytimeSession[]): { week: string; minutes: number }[] {
    const weeks: Map<string, number> = new Map();
    for (const session of sessions) {
      const date = new Date(session.startTime);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeks.set(weekKey, (weeks.get(weekKey) || 0) + (session.duration || 0));
    }
    return Array.from(weeks.entries())
      .map(([week, minutes]) => ({ week, minutes }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private aggregateByMonth(sessions: PlaytimeSession[]): { month: string; minutes: number }[] {
    const months: Map<string, number> = new Map();
    for (const session of sessions) {
      const date = new Date(session.startTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.set(monthKey, (months.get(monthKey) || 0) + (session.duration || 0));
    }
    return Array.from(months.entries())
      .map(([month, minutes]) => ({ month, minutes }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTotalPlaytime(): Promise<number> {
    const result = await this.database.get<{ total: number }>(`SELECT SUM(duration) as total FROM playtime_sessions WHERE end_time IS NOT NULL`);
    return result?.total || 0;
  }

  async getRecentSessions(limit = 10): Promise<PlaytimeSession[]> {
    return this.database.all<PlaytimeSession>(
      `SELECT * FROM playtime_sessions WHERE end_time IS NOT NULL ORDER BY end_time DESC LIMIT ?`,
      [limit]
    );
  }

  async getCurrentlyPlaying(): Promise<PlaytimeSession | null> {
    const [gameId] = this.activeSessions.keys();
    if (!gameId) return null;
    
    const session = await this.database.get<PlaytimeSession>(
      `SELECT * FROM playtime_sessions WHERE game_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
      [gameId]
    );
    return session || null;
  }

  async shutdown(): Promise<void> {
    for (const gameId of this.activeSessions.keys()) {
      await this.endSession(gameId);
    }
  }
}