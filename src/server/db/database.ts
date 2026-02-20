import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../../data/congress.db');

export function initDatabase(): Database.Database {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  createSchema(db);

  return db;
}

export function getDatabase(): Database.Database {
  return new Database(DB_PATH);
}
