import cron from 'node-cron';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (apps/backend/src → ../../../.env)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { createApp } from 'src/app/app';
import 'src/services/file.service';
import { cleanupUploads } from 'src/utils/fileCleanup';

const PORT = process.env.PORT || 3001;

const start = async  ()  => {
  try {
    const app = await createApp();
    await cleanupUploads();

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
