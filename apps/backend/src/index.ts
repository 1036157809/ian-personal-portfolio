import cron from 'node-cron';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (apps/backend/src → ../../../.env)
const envPath = path.join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

import { createApp } from 'src/app/app';
import 'src/services/file.service'; // ensureDirectories called in FileController constructor
import { cleanupUploads } from 'src/utils/fileCleanup';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    const app = await createApp();

    // Run cleanup silently on startup (only if needed)
    await cleanupUploads();

    // Schedule file cleanup to run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled file cleanup...');
      await cleanupUploads();
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
