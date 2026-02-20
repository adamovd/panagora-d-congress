import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_DIR = path.resolve(__dirname, '../../../public/videos');

function getVideoFiles(subdir: string): string[] {
  const dir = path.join(VIDEOS_DIR, subdir);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => /\.(mp4|webm|mov|avi)$/i.test(f));
}

export function videosRouter(): Router {
  const router = Router();

  // GET /api/videos/transition — Get a random transition video filename
  router.get('/transition', (_req, res) => {
    const files = getVideoFiles('transitions');

    if (files.length === 0) {
      res.status(404).json({ error: 'No transition videos found' });
      return;
    }

    const random = files[Math.floor(Math.random() * files.length)];
    res.json({
      filename: random,
      url: `/videos/transitions/${random}`,
    });
  });

  // GET /api/videos/idle — Get a random idle video filename
  router.get('/idle', (_req, res) => {
    const files = getVideoFiles('idle');

    if (files.length === 0) {
      res.status(404).json({ error: 'No idle videos found' });
      return;
    }

    const random = files[Math.floor(Math.random() * files.length)];
    res.json({
      filename: random,
      url: `/videos/idle/${random}`,
    });
  });

  // GET /api/videos/list — List all available videos
  router.get('/list', (_req, res) => {
    res.json({
      transitions: getVideoFiles('transitions'),
      idle: getVideoFiles('idle'),
    });
  });

  return router;
}
