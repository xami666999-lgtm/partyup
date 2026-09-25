import { Database } from '../database/Database.js';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  status: 'online' | 'offline' | 'in-game' | 'away';
  lastSeen?: string;
  gameId?: string;
  gameName?: string;
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  fromAvatar?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export class FriendsService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async addFriend(friendId: string, friendName: string, friendAvatar?: string): Promise<Friend> {
    const userId = 'default';
    const existing = await this.database.get(
      `SELECT * FROM friends WHERE user_id = ? AND friend_id = ?`,
      [userId, friendId]
    );
    if (existing) {
      return this.mapRowToFriend(existing);
    }

    const friend: Friend = {
      id: crypto.randomUUID(),
      userId,
      friendId,
      friendName,
      friendAvatar,
      status: 'offline',
      addedAt: new Date().toISOString(),
    };

    await this.database.run(
      `INSERT INTO friends (id, user_id, friend_id, friend_name, friend_avatar, status, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [friend.id, friend.userId, friend.friendId, friend.friendName, friend.friendAvatar || null, friend.status, friend.addedAt]
    );

    return friend;
  }

  async removeFriend(friendId: string): Promise<void> {
    await this.database.run(
      `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`,
      ['default', friendId]
    );
  }

  async getFriends(): Promise<Friend[]> {
    const rows = await this.database.all(
      `SELECT * FROM friends WHERE user_id = ? ORDER BY friend_name`,
      ['default']
    );
    return rows.map(this.mapRowToFriend);
  }

  async getOnlineFriends(): Promise<Friend[]> {
    const friends = await this.getFriends();
    return friends.filter(f => f.status !== 'offline');
  }

  async updateFriendStatus(friendId: string, status: Friend['status'], gameId?: string, gameName?: string): Promise<void> {
    await this.database.run(
      `UPDATE friends SET status = ?, last_seen = ?, game_id = ?, game_name = ? WHERE user_id = ? AND friend_id = ?`,
      [status, new Date().toISOString(), gameId || null, gameName || null, 'default', friendId]
    );
  }

  async getFriend(friendId: string): Promise<Friend | null> {
    const row = await this.database.get(
      `SELECT * FROM friends WHERE user_id = ? AND friend_id = ?`,
      ['default', friendId]
    );
    return row ? this.mapRowToFriend(row) : null;
  }

  async searchUsers(query: string): Promise<Friend[]> {
    const rows = await this.database.all(
      `SELECT * FROM friends WHERE user_id = ? AND (friend_name LIKE ? OR friend_id LIKE ?)`,
      ['default', `%${query}%`, `%${query}%`]
    );
    return rows.map(this.mapRowToFriend);
  }

  async getFriendCount(): Promise<number> {
    const result = await this.database.get<{ count: number }>(`SELECT COUNT(*) as count FROM friends WHERE user_id = ?`, ['default']);
    return result?.count || 0;
  }

  async getOnlineCount(): Promise<number> {
    const result = await this.database.get<{ count: number }>(`SELECT COUNT(*) as count FROM friends WHERE user_id = ? AND status != 'offline'`, ['default']);
    return result?.count || 0;
  }

  private mapRowToFriend(row: any): Friend {
    return {
      id: row.id,
      userId: row.user_id,
      friendId: row.friend_id,
      friendName: row.friend_name,
      friendAvatar: row.friend_avatar,
      status: row.status,
      lastSeen: row.last_seen,
      gameId: row.game_id,
      gameName: row.game_name,
      addedAt: row.added_at,
    };
  }

  async sendFriendRequest(friendId: string, friendName: string, friendAvatar?: string): Promise<FriendRequest> {
    const request: FriendRequest = {
      id: crypto.randomUUID(),
      fromUserId: 'default',
      toUserId: friendId,
      fromName: 'Player',
      fromAvatar: undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return request;
  }

  async getPendingRequests(): Promise<FriendRequest[]> {
    return [];
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
  }

  async declineFriendRequest(requestId: string): Promise<void> {
  }
}