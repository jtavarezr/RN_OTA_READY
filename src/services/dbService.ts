import { getDb } from '../utils/db';

export const dbService = {
  // Generic Upsert
  async upsert(table: string, id: string, data: any, lastSync: number = Date.now()) {
    const db = await getDb();

    const dataStr = JSON.stringify(data);
    
    if (table === 'progress') {
       const { courseId, userId, percentage, completedLessons, resumePoint } = data;
       await db.runAsync(
         `INSERT OR REPLACE INTO progress (courseId, userId, percentage, completedLessons, resumePoint, lastSync) 
          VALUES (?, ?, ?, ?, ?, ?)`,
         [courseId, userId, percentage, JSON.stringify(completedLessons), resumePoint, lastSync]
       );
       return;
    }

    if (table === 'wallet') {
      const { userId, balance } = data;
      await db.runAsync(
        `INSERT OR REPLACE INTO wallet (userId, balance, lastSync) VALUES (?, ?, ?)`,
        [userId, balance, lastSync]
      );
      return;
    }

    if (table === 'courses') {
      const { $id, title, provider, category, thumbnail } = data;
      await db.runAsync(
        `INSERT OR REPLACE INTO courses (id, title, provider, category, thumbnail, data, lastSync) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [$id || id, title, provider, category, thumbnail, dataStr, lastSync]
      );
      return;
    }

    if (table === 'questions') {
      const { $id, text, category, difficulty } = data;
      await db.runAsync(
        `INSERT OR REPLACE INTO questions (id, text, category, difficulty, data, lastSync) VALUES (?, ?, ?, ?, ?, ?)`,
        [$id || id, text, category, difficulty, dataStr, lastSync]
      );
      return;
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO ${table} (id, data, lastSync) VALUES (?, ?, ?)`,
      [id, dataStr, lastSync]
    );

  },

  async getById(table: string, id: string) {
    const db = await getDb();
    if (table === 'progress') {

        const [courseId, userId] = id.split(':');
        return await db.getFirstAsync<any>(
            `SELECT * FROM progress WHERE courseId = ? AND userId = ?`,
            [courseId, userId]
        );
    }
    
    if (table === 'wallet') {
        const result = await db.getFirstAsync<any>(`SELECT * FROM wallet WHERE userId = ?`, [id]);
        return result ? { balance: result.balance, userId: result.userId } : null;
    }


    const result = await db.getFirstAsync<any>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (result && result.data) {
      return JSON.parse(result.data);
    }
    return result;
  },

  async getAll(table: string, filter?: string, params: any[] = []) {
    const db = await getDb();
    const query = filter ? `SELECT * FROM ${table} WHERE ${filter}` : `SELECT * FROM ${table}`;
    const results = await db.getAllAsync<any>(query, params);
    return results.map(r => (r.data ? JSON.parse(r.data) : r));
  },

  // Action Log (Outbox) Operations
  async addAction(type: string, payload: any) {
    const db = await getDb();
    const id = Math.random().toString(36).substring(7);
    await db.runAsync(
      `INSERT INTO action_log (id, type, payload, timestamp) VALUES (?, ?, ?, ?)`,
      [id, type, JSON.stringify(payload), Date.now()]
    );
    return id;
  },

  async getPendingActions() {
    const db = await getDb();
    const results = await db.getAllAsync<any>(
      `SELECT * FROM action_log WHERE status != 'syncing' AND attempts < 5 ORDER BY timestamp ASC`
    );
    return results.map(r => ({ ...r, payload: JSON.parse(r.payload) }));
  },

  async updateActionStatus(id: string, status: string, attempts?: number) {
    const db = await getDb();
    if (attempts !== undefined) {
      await db.runAsync(`UPDATE action_log SET status = ?, attempts = ? WHERE id = ?`, [status, attempts, id]);
    } else {
      await db.runAsync(`UPDATE action_log SET status = ? WHERE id = ?`, [status, id]);
    }
  },

  async deleteAction(id: string) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM action_log WHERE id = ?`, [id]);
  },

  // System Stats (Key-Value)
  async setStat(key: string, value: any) {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO system_stats (key, value) VALUES (?, ?)`,
      [key, JSON.stringify(value)]
    );
  },

  async getStat(key: string, defaultValue: any = null) {
    const db = await getDb();
    const result = await db.getFirstAsync<any>(`SELECT value FROM system_stats WHERE key = ?`, [key]);
    if (result) return JSON.parse(result.value);
    return defaultValue;
  }
};

