import { initDatabase } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PATH = path.resolve(__dirname, '../../../data/seed.json');

interface SeedData {
  messages: Array<{
    text: string;
    category: 'normal' | 'unusual' | 'triggered';
  }>;
  videos: Array<{
    filename: string;
    type: 'transition' | 'idle';
    duration_seconds?: number;
  }>;
}

function seed() {
  console.log('🌱 Seeding database...\n');

  const db = initDatabase();

  // Read seed data
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const data: SeedData = JSON.parse(raw);

  // Clear existing data
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM videos');

  // Insert messages
  const insertMessage = db.prepare(
    'INSERT INTO messages (text, category) VALUES (?, ?)'
  );

  const insertMessages = db.transaction((messages: SeedData['messages']) => {
    for (const msg of messages) {
      insertMessage.run(msg.text, msg.category);
    }
  });

  insertMessages(data.messages);
  console.log(`  ✅ Inserted ${data.messages.length} messages`);

  // Insert videos
  const insertVideo = db.prepare(
    'INSERT INTO videos (filename, type, duration_seconds) VALUES (?, ?, ?)'
  );

  const insertVideos = db.transaction((videos: SeedData['videos']) => {
    for (const vid of videos) {
      insertVideo.run(vid.filename, vid.type, vid.duration_seconds ?? null);
    }
  });

  insertVideos(data.videos);
  console.log(`  ✅ Inserted ${data.videos.length} videos`);

  // Show summary
  const msgCount = db.prepare('SELECT category, COUNT(*) as count FROM messages GROUP BY category').all();
  console.log('\n📊 Messages by category:');
  for (const row of msgCount as Array<{ category: string; count: number }>) {
    console.log(`   ${row.category}: ${row.count}`);
  }

  const vidCount = db.prepare('SELECT type, COUNT(*) as count FROM videos GROUP BY type').all();
  console.log('\n🎬 Videos by type:');
  for (const row of vidCount as Array<{ type: string; count: number }>) {
    console.log(`   ${row.type}: ${row.count}`);
  }

  db.close();
  console.log('\n✨ Seed complete!\n');
}

seed();
