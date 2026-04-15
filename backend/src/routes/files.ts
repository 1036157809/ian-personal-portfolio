import Router from '@koa/router';
import fs from 'fs';
import path from 'path';

const router = new Router({
  prefix: '/api/files',
});

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to get file type
function getFileType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'XLS';
  return 'File';
}

// Uploads directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const CHUNKS_DIR = path.join(UPLOADS_DIR, 'chunks');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

// In-memory file metadata storage
const uploadedFiles: { id: string; name: string; size: string; type: string; filePath: string }[] = [];

// Get all files
router.get('/', async (ctx) => {
  try {
    ctx.body = uploadedFiles;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch files' };
  }
});

// Upload file with actual file content
router.post('/upload', async (ctx) => {
  try {
    const files = (ctx.request as any).files;
    const body = ctx.request.body as any;
    
    if (!files || !files.file) {
      ctx.status = 400;
      ctx.body = { error: 'No file provided' };
      return;
    }

    const file = files.file;
    const fileName = body.name || file.originalFilename || file.name;
    const fileSize = body.size || file.size;
    const fileType = body.type || file.mimetype;

    // Save file to disk
    const filePath = path.join(UPLOADS_DIR, fileName);
    const reader = fs.createReadStream(file.filepath);
    const writer = fs.createWriteStream(filePath);
    
    await new Promise<void>((resolve, reject) => {
      reader.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });

    // Save metadata
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      size: formatBytes(fileSize),
      type: getFileType(fileType),
      filePath: fileName
    };

    uploadedFiles.push(newFile);
    ctx.body = newFile;
    ctx.status = 201;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to upload file' };
  }
});

// Upload chunk for large files (requires @koa/body middleware)
router.post('/upload-chunk', async (ctx) => {
  try {
    const body = ctx.request.body as any;
    const files = (ctx.request as any).files;
    
    if (!files || !files.file) {
      ctx.status = 400;
      ctx.body = { error: 'No file chunk provided - requires @koa/body middleware' };
      return;
    }

    const chunk = files.file;
    const fileName = body.fileName;
    const chunkIndex = parseInt(body.chunkIndex);
    const totalChunks = parseInt(body.totalChunks);

    if (!fileName || isNaN(chunkIndex) || isNaN(totalChunks)) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: fileName, chunkIndex, totalChunks' };
      return;
    }

    // Save chunk to temporary directory
    const chunkPath = path.join(CHUNKS_DIR, `${fileName}.chunk${chunkIndex}`);
    const reader = fs.createReadStream(chunk.filepath);
    const writer = fs.createWriteStream(chunkPath);
    
    await new Promise<void>((resolve, reject) => {
      reader.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });

    ctx.body = { success: true, chunkIndex };
    ctx.status = 200;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to upload chunk' };
  }
});

// Complete chunked upload and merge chunks
router.post('/complete-upload', async (ctx) => {
  try {
    const body = ctx.request.body as { fileName?: string };
    const { fileName } = body;

    if (!fileName) {
      ctx.status = 400;
      ctx.body = { error: 'Missing fileName' };
      return;
    }

    // Find all chunks
    const chunkFiles = fs.readdirSync(CHUNKS_DIR)
      .filter(f => f.startsWith(fileName))
      .sort();

    if (chunkFiles.length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'No chunks found' };
      return;
    }

    // Merge chunks
    const finalPath = path.join(UPLOADS_DIR, fileName);
    const writeStream = fs.createWriteStream(finalPath);

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(CHUNKS_DIR, chunkFile);
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', () => resolve());
        readStream.on('error', reject);
      });
    }

    writeStream.end();

    // Clean up chunks
    for (const chunkFile of chunkFiles) {
      fs.unlinkSync(path.join(CHUNKS_DIR, chunkFile));
    }

    // Add file metadata
    const stats = fs.statSync(finalPath);
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
      type: fileName.split('.').pop()?.toUpperCase() || 'Unknown',
      filePath: `/uploads/${fileName}`
    };

    uploadedFiles.push(newFile);

    ctx.body = { success: true, file: newFile };
    ctx.status = 200;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to complete upload' };
  }
});

// Delete file
router.delete('/:id', async (ctx) => {
  try {
    const file = uploadedFiles.find(f => f.id === ctx.params.id);
    if (!file) {
      ctx.status = 404;
      ctx.body = { error: 'File not found' };
      return;
    }

    // Delete physical file
    const filePath = path.join(UPLOADS_DIR, file.filePath || file.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    const index = uploadedFiles.findIndex(f => f.id === ctx.params.id);
    uploadedFiles.splice(index, 1);

    ctx.status = 204;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to delete file' };
  }
});

// Download file
router.get('/download/:id', async (ctx) => {
  try {
    const file = uploadedFiles.find(f => f.id === ctx.params.id);
    if (!file) {
      ctx.status = 404;
      ctx.body = { error: 'File not found' };
      return;
    }

    const filePath = path.join(UPLOADS_DIR, file.filePath || file.name);
    console.log('Download request for file:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      console.log('Available files:', fs.readdirSync(UPLOADS_DIR));
      ctx.status = 404;
      ctx.body = { error: 'File not found on disk' };
      return;
    }

    // Stream file
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.set('Content-Disposition', `attachment; filename="${file.name}"`);
    ctx.body = fs.createReadStream(filePath);
  } catch (error) {
    console.error('Download error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to download file' };
  }
});

// Preview file
router.get('/preview/:id', async (ctx) => {
  try {
    const file = uploadedFiles.find(f => f.id === ctx.params.id);
    if (!file) {
      ctx.status = 404;
      ctx.body = { error: 'File not found' };
      return;
    }

    const filePath = path.join(UPLOADS_DIR, file.filePath || file.name);
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      console.log('Available files:', fs.readdirSync(UPLOADS_DIR));
      ctx.status = 404;
      ctx.body = { error: 'File not found on disk' };
      return;
    }

    // Stream file for preview
    const ext = (file.filePath || file.name).split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };

    ctx.set('Content-Type', contentTypes[ext || ''] || 'application/octet-stream');
    ctx.body = fs.createReadStream(filePath);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to preview file' };
  }
});

export default router;
