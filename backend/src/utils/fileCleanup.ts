import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');
const CHUNKS_DIR = path.join(UPLOADS_DIR, 'chunks');

// Size constants in bytes
const MAX_TOTAL_SIZE_500MB = 500 * 1024 * 1024;
const MAX_TOTAL_SIZE_300MB = 300 * 1024 * 1024;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Cache for directory size to avoid repeated calculations
let cachedSize: number | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Calculate the total size of a directory recursively (async)
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  // Use cache if available and fresh
  if (cachedSize !== null && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedSize;
  }

  let totalSize = 0;
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    // Update cache
    cachedSize = totalSize;
    cacheTime = Date.now();
  } catch (error) {
    console.error('Error calculating directory size:', error);
  }
  
  return totalSize;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Clear all files in the uploads directory (async)
 */
async function clearUploadsDirectory(): Promise<void> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // Remove directory recursively
        await fs.rm(filePath, { recursive: true, force: true });
      } else {
        // Remove file
        await fs.unlink(filePath);
      }
    }
    
    console.log(`Cleared uploads directory: ${files.length} items removed`);
  } catch (error) {
    console.error('Error clearing uploads directory:', error);
  }
}

/**
 * Delete files older than specified days (async)
 */
async function deleteFilesOlderThan(days: number): Promise<void> {
  try {
    const maxAge = days * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;

    async function deleteOldFiles(dirPath: string): Promise<void> {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          await deleteOldFiles(filePath);
          // Try to remove empty directory
          try {
            await fs.rmdir(filePath);
          } catch (e) {
            // Directory not empty, skip
          }
        } else {
          const fileAge = now - stats.mtimeMs;
          
          if (fileAge > maxAge) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }
    }

    await deleteOldFiles(UPLOADS_DIR);
    console.log(`Deleted ${deletedCount} files older than ${days} days`);
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
}

/**
 * Main cleanup function based on size thresholds (async)
 */
export async function cleanupUploads(): Promise<void> {
  try {
    const totalSize = await getDirectorySize(UPLOADS_DIR);
    
    if (totalSize > MAX_TOTAL_SIZE_500MB) {
      console.log(`Size exceeds 500MB, clearing uploads directory`);
      await clearUploadsDirectory();
    } else if (totalSize > MAX_TOTAL_SIZE_300MB) {
      console.log(`Size exceeds 300MB, deleting files older than 3 days`);
      await deleteFilesOlderThan(3);
    } else {
      // Silent success - no cleanup needed
    }
    
    // Invalidate cache after cleanup
    cachedSize = null;
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

/**
 * Manual cleanup function for testing (async)
 */
export async function forceCleanupOldFiles(days: number): Promise<void> {
  console.log(`=== Force deleting files older than ${days} days ===`);
  await deleteFilesOlderThan(days);
  cachedSize = null; // Invalidate cache
  console.log('=== Force cleanup completed ===');
}

/**
 * Manual cleanup function for testing (async)
 */
export async function forceClearAll(): Promise<void> {
  console.log('=== Force clearing entire uploads directory ===');
  await clearUploadsDirectory();
  cachedSize = null; // Invalidate cache
  console.log('=== Force clear completed ===');
}
