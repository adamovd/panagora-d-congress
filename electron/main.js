import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import net from 'net';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const IS_DEV = !app.isPackaged;

// ─── Path helpers ────────────────────────────────────────────────────────────

function getUserDataDir() {
  const dir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getDbPath() {
  return path.join(getUserDataDir(), 'congress.db');
}

function getVideosDir() {
  if (IS_DEV) {
    return path.join(__dirname, '..', 'public', 'videos');
  }
  return path.join(process.resourcesPath, 'videos');
}

function getResourcePath(...segments) {
  if (IS_DEV) {
    return path.join(__dirname, '..', ...segments);
  }
  return path.join(process.resourcesPath, ...segments);
}

// ─── Database initialisation ─────────────────────────────────────────────────

function ensureDatabase() {
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) return;

  // First launch: copy the pre-built seed database shipped with the app
  const seedDbPath = getResourcePath('data', 'congress.db');
  if (fs.existsSync(seedDbPath)) {
    fs.copyFileSync(seedDbPath, dbPath);
    console.log(`[electron] Database initialised at ${dbPath}`);
  } else {
    // No seed DB found – the server will create an empty one
    console.warn('[electron] No seed database found; starting with empty database.');
  }
}

// ─── Wait for Express to accept connections ──────────────────────────────────

function waitForServer(port, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const attempt = () => {
      const socket = new net.Socket();
      socket.setTimeout(200);

      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });

      const retry = () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start within ${timeoutMs / 1000}s`));
        } else {
          setTimeout(attempt, 200);
        }
      };

      socket.once('error', retry);
      socket.once('timeout', retry);
      socket.connect(port, '127.0.0.1');
    };

    // Give Node a moment to begin evaluating the server module
    setTimeout(attempt, 400);
  });
}

// ─── Start the Express server inside this process ────────────────────────────

async function startServer() {
  ensureDatabase();

  // Set env vars BEFORE importing the server so module-level constants pick
  // them up at evaluation time.
  process.env.NODE_ENV = 'production';
  process.env.PORT = String(PORT);
  process.env.DB_PATH = getDbPath();
  process.env.VIDEOS_DIR = getVideosDir();

  const serverEntry = IS_DEV
    ? path.join(__dirname, '..', 'dist', 'server', 'index.js')
    : path.join(__dirname, '..', 'dist', 'server', 'index.js');

  await import(pathToFileURL(serverEntry).href);
  await waitForServer(PORT);
}

// ─── Browser window ──────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    // Kiosk mode: fullscreen, no OS chrome, cannot be closed with keyboard
    kiosk: !IS_DEV,
    fullscreen: !IS_DEV,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.loadURL(`http://localhost:${PORT}`);

  // Only open DevTools in development
  if (IS_DEV) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

// ─── App lifecycle ───────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox(
      'D-Congress 2026 – Startup Error',
      `The application server failed to start.\n\n${err}`
    );
    app.quit();
  }
});

// Quit when all windows are closed (works on Windows/Linux; macOS keeps running
// until explicitly quit with Cmd+Q).
app.on('window-all-closed', () => {
  app.quit();
});
