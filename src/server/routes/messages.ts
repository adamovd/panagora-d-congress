import { Router } from 'express';
import type Database from 'better-sqlite3';

export function messagesRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/messages — Get all messages (optional category filter)
  router.get('/', (req, res) => {
    const { category } = req.query;

    let messages;
    if (category && ['normal', 'unusual', 'triggered'].includes(category as string)) {
      messages = db
        .prepare('SELECT * FROM messages WHERE category = ? ORDER BY id')
        .all(category);
    } else {
      messages = db.prepare('SELECT * FROM messages ORDER BY id').all();
    }

    res.json(messages);
  });

  // GET /api/messages/random — Get a random message
  // Optional query params:
  //   ?category=normal|unusual|triggered
  //   ?exclude=id (exclude a specific message to avoid repeats)
  router.get('/random', (req, res) => {
    const { category, exclude } = req.query;

    let query = 'SELECT * FROM messages';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (category && ['normal', 'unusual', 'triggered'].includes(category as string)) {
      conditions.push('category = ?');
      params.push(category as string);
    }

    if (exclude) {
      conditions.push('id != ?');
      params.push(Number(exclude));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const message = db.prepare(query).get(...params);

    if (!message) {
      res.status(404).json({ error: 'No messages found' });
      return;
    }

    res.json(message);
  });

  // GET /api/messages/config — Get display config
  router.get('/config', (_req, res) => {
    const config = db.prepare('SELECT key, value FROM config').all() as Array<{
      key: string;
      value: string;
    }>;

    const configMap: Record<string, string> = {};
    for (const row of config) {
      configMap[row.key] = row.value;
    }

    res.json(configMap);
  });

  return router;
}
