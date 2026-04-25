import cron from 'node-cron';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from backend directory
const envPath = path.join(__dirname, '../.env');
const envConfig = dotenv.config({ path: envPath });

console.log('=== Environment Config ===');
console.log('ENV Path:', envPath);
console.log('ENV Loaded:', envConfig.error ? 'Error' : 'Success');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

import { createApp } from 'src/app/app';
import { ensureDirectories } from 'src/services/file.service';
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
