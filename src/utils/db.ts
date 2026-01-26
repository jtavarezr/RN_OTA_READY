import * as SQLite from 'expo-sqlite';

const DB_NAME = 'app_main.db';

const initDatabase = async () => {
  console.log('[SQLite] Opening database (app_main.db)...');
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  console.log('[SQLite] Database opened.');

  try {
    // Skip PRAGMA for now to test stability
    console.log('[SQLite] Checking user_version...');


    const result = await db.getFirstAsync<{user_version: number}>('PRAGMA user_version;');
    const currentVersion = result?.user_version || 0;
    console.log(`[SQLite] Current version: ${currentVersion}`);

    const TARGET_VERSION = 2;
    if (currentVersion < TARGET_VERSION) {
      console.log(`[SQLite] Upgrading to version ${TARGET_VERSION}...`);
      const tables = ['profiles', 'courses', 'questions', 'progress', 'wallet', 'action_log', 'system_stats'];
      for (const table of tables) {
        console.log(`[SQLite] Dropping table ${table}...`);
        await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
      }
      await db.execAsync(`PRAGMA user_version = ${TARGET_VERSION};`);
      console.log(`[SQLite] Upgrade to ${TARGET_VERSION} complete.`);
    }

    console.log('[SQLite] Creating tables...');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, data TEXT NOT NULL, lastSync INTEGER NOT NULL);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, title TEXT NOT NULL, provider TEXT, category TEXT, thumbnail TEXT, data TEXT NOT NULL, lastSync INTEGER NOT NULL);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, text TEXT NOT NULL, category TEXT, difficulty TEXT, data TEXT NOT NULL, lastSync INTEGER NOT NULL);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS progress (courseId TEXT, userId TEXT, percentage INTEGER DEFAULT 0, completedLessons TEXT, resumePoint TEXT, lastSync INTEGER NOT NULL, PRIMARY KEY (courseId, userId));`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS wallet (userId TEXT PRIMARY KEY, balance INTEGER DEFAULT 0, lastSync INTEGER NOT NULL);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS action_log (id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT NOT NULL, attempts INTEGER DEFAULT 0, status TEXT CHECK(status IN ('pending', 'syncing', 'failed')) DEFAULT 'pending', timestamp INTEGER NOT NULL);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS system_stats (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    
    console.log('[SQLite] Database initialization finished successfully.');
  } catch (err) {
    console.error('[SQLite] Initialization error:', err);
    throw err;
  }

  return db;
};

let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (databaseInstance) return databaseInstance;
  
  if (!initPromise) {
    initPromise = initDatabase().then(db => {
      databaseInstance = db;
      return db;
    }).catch(err => {
      initPromise = null; // Allow retry
      throw err;
    });
  }
  return initPromise;
};
