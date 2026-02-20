import type Database from 'better-sqlite3';

export function createSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('normal', 'unusual', 'triggered')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('transition', 'idle')),
      duration_seconds INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert default config if not exists
  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
  `);

  insertConfig.run('idle_timeout_seconds', '60');
  insertConfig.run('message_display_seconds', '8');
}
