import cron from 'node-cron';
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
