import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const CHUNKS_DIR = path.join(UPLOADS_DIR, 'chunks');

// Size constants in bytes
const MAX_TOTAL_SIZE_500MB = 500 * 1024 * 1024;
const MAX_TOTAL_SIZE_300MB = 300 * 1024 * 1024;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Calculate the total size of a directory recursively
 */
function getDirectorySize(dirPath: string): number {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return totalSize;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
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
 * Clear all files in the uploads directory
 */
function clearUploadsDirectory(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('Uploads directory does not exist');
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  
  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Remove directory recursively
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      // Remove file
      fs.unlinkSync(filePath);
    }
  }
  
  console.log(`Cleared uploads directory: ${files.length} items removed`);
}

/**
 * Delete files older than specified days
 */
function deleteFilesOlderThan(days: number): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('Uploads directory does not exist');
    return;
  }

  const maxAge = days * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let deletedCount = 0;

  function deleteOldFiles(dirPath: string): void {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        deleteOldFiles(filePath);
        // Try to remove empty directory
        try {
          fs.rmdirSync(filePath);
        } catch (e) {
          // Directory not empty, skip
        }
      } else {
        const fileAge = now - stats.mtimeMs;
        
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old file: ${filePath} (${formatBytes(stats.size)}, ${Math.floor(fileAge / (24 * 60 * 60 * 1000))} days old)`);
        }
      }
    }
  }

  deleteOldFiles(UPLOADS_DIR);
  console.log(`Deleted ${deletedCount} files older than ${days} days`);
}

/**
 * Main cleanup function based on size thresholds
 */
export function cleanupUploads(): void {
  console.log('=== Starting file cleanup ===');
  
  const totalSize = getDirectorySize(UPLOADS_DIR);
  console.log(`Current uploads directory size: ${formatBytes(totalSize)}`);

  if (totalSize > MAX_TOTAL_SIZE_500MB) {
    console.log(`Size exceeds 500MB (${formatBytes(MAX_TOTAL_SIZE_500MB)}), clearing entire uploads directory`);
    clearUploadsDirectory();
  } else if (totalSize > MAX_TOTAL_SIZE_300MB) {
    console.log(`Size exceeds 300MB (${formatBytes(MAX_TOTAL_SIZE_300MB)}), deleting files older than 3 days`);
    deleteFilesOlderThan(3);
  } else {
    console.log('Size is within acceptable limits, no cleanup needed');
  }

  const newSize = getDirectorySize(UPLOADS_DIR);
  console.log(`New uploads directory size: ${formatBytes(newSize)}`);
  console.log('=== File cleanup completed ===');
}

/**
 * Manual cleanup function for testing
 */
export function forceCleanupOldFiles(days: number): void {
  console.log(`=== Force deleting files older than ${days} days ===`);
  deleteFilesOlderThan(days);
  console.log('=== Force cleanup completed ===');
}

/**
 * Manual cleanup function for testing
 */
export function forceClearAll(): void {
  console.log('=== Force clearing entire uploads directory ===');
  clearUploadsDirectory();
  console.log('=== Force clear completed ===');
}
