import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';
import { messagesRouter } from './routes/messages.js';
import { videosRouter } from './routes/videos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Initialize database
const db = initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/messages', messagesRouter(db));
app.use('/api/videos', videosRouter());

// Serve video files — path is overridden by the Electron main process via
// VIDEOS_DIR so the packaged app can find videos outside the asar archive.
const videosPath = process.env.VIDEOS_DIR ?? path.resolve(__dirname, '../../public/videos');
app.use('/videos', express.static(videosPath));

// In production, serve the built React app
if (IS_PROD) {
  const clientPath = path.resolve(__dirname, '../client');
  app.use(express.static(clientPath));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🎪 D-Congress server running at http://localhost:${PORT}`);
  if (IS_PROD) {
    console.log(`📺 Open Chrome in kiosk mode: chrome --kiosk http://localhost:${PORT}`);
  }
  console.log(`📁 Videos directory: ${videosPath}\n`);
});

export default app;
