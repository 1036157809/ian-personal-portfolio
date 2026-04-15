import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { FileMetadata, UploadedFile } from '../types';

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');
const CHUNKS_DIR = path.join(UPLOADS_DIR, 'chunks');

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

// Ensure directories exist
export async function ensureDirectories() {
  try {
    await fsPromises.mkdir(UPLOADS_DIR, { recursive: true });
    await fsPromises.mkdir(CHUNKS_DIR, { recursive: true });
    await fsPromises.mkdir(path.join(process.cwd(), 'uploads', 'temp'), { recursive: true });
    
    console.log('=== File Upload Configuration ===');
    console.log(`UPLOADS_DIR: ${UPLOADS_DIR}`);
    console.log(`CHUNKS_DIR: ${CHUNKS_DIR}`);
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

export class FileService {
  private uploadedFiles: UploadedFile[] = [];

  async uploadFile(file: any, body: any): Promise<UploadedFile> {
    const originalFileName = body.name || file.originalFilename || file.name;
    const fileSize = body.size || file.size;
    const fileType = body.type || file.mimetype;

    // Generate unique filename
    const fileExtension = originalFileName.split('.').pop() || '';
    const uniqueFileName = `${Date.now()}.${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Save file to disk
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    const reader = fs.createReadStream(file.filepath);
    const writer = fs.createWriteStream(filePath);
    
    await new Promise<void>((resolve, reject) => {
      reader.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
    
    // Clean up temp file
    try {
      await fsPromises.unlink(file.filepath);
      console.log(`Cleaned up temp file: ${file.filepath}`);
    } catch (error) {
      console.log(`Failed to clean up temp file: ${file.filepath}`);
    }

    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: originalFileName,
      size: formatBytes(fileSize),
      type: getFileType(fileType),
      filePath: uniqueFileName
    };
    
    console.log(`File uploaded: ${originalFileName} -> ${uniqueFileName}`);
    this.uploadedFiles.push(newFile);
    
    return newFile;
  }

  async uploadChunk(chunk: any, body: any): Promise<{ success: boolean; chunkIndex: number }> {
    const fileName = body.fileName;
    const chunkIndex = parseInt(body.chunkIndex);

    // Save chunk
    const chunkPath = path.join(CHUNKS_DIR, `${fileName}.chunk${chunkIndex}`);
    const reader = fs.createReadStream(chunk.filepath);
    const writer = fs.createWriteStream(chunkPath);
    
    await new Promise<void>((resolve, reject) => {
      reader.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
    
    // Clean up temp file
    try {
      await fsPromises.unlink(chunk.filepath);
      console.log(`Cleaned up chunk temp file: ${chunk.filepath}`);
    } catch (error) {
      console.log(`Failed to clean up chunk temp file: ${chunk.filepath}`);
    }

    return { success: true, chunkIndex };
  }

  async completeUpload(fileName: string): Promise<UploadedFile> {
    // Find all chunks
    const chunkFiles = await fsPromises.readdir(CHUNKS_DIR)
      .then(files => files.filter(f => f.startsWith(fileName)).sort());

    if (chunkFiles.length === 0) {
      throw new Error('No chunks found');
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop() || '';
    const uniqueFileName = `${Date.now()}.${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const finalPath = path.join(UPLOADS_DIR, uniqueFileName);
    const writeStream = fs.createWriteStream(finalPath);

    // Merge chunks
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
      await fsPromises.unlink(path.join(CHUNKS_DIR, chunkFile));
    }

    // Add metadata
    const stats = await fsPromises.stat(finalPath);
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: fileName,
      size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
      type: fileExtension.toUpperCase() || 'Unknown',
      filePath: uniqueFileName
    };
    
    console.log(`Chunked upload completed: ${fileName} -> ${uniqueFileName}`);
    this.uploadedFiles.push(newFile);

    return newFile;
  }

  async getAllFiles(): Promise<UploadedFile[]> {
    return this.uploadedFiles;
  }

  async getFileById(id: string): Promise<UploadedFile | null> {
    return this.uploadedFiles.find(f => f.id === id) || null;
  }

  async deleteFile(id: string): Promise<void> {
    const file = this.uploadedFiles.find(f => f.id === id);
    if (!file) {
      throw new Error('File not found');
    }

    const fileName = file.filePath?.replace('/uploads/', '') || file.name;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    console.log(`=== Delete Operation ===`);
    console.log(`Attempting to delete file: ${filePath}`);
    
    try {
      await fsPromises.access(filePath);
      console.log(`File exists at path: ${filePath}`);
    } catch (accessError) {
      console.log(`File does not exist at path: ${filePath}`);
    }
    
    try {
      await fsPromises.unlink(filePath);
      console.log(`✓ Successfully deleted file: ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to delete file: ${filePath}`);
      throw new Error('Failed to delete file from disk');
    }

    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== id);
  }

  async downloadFile(id: string): Promise<{ filePath: string; fileName: string }> {
    const file = this.uploadedFiles.find(f => f.id === id);
    if (!file) {
      throw new Error('File not found');
    }

    const filePath = path.join(UPLOADS_DIR, file.filePath || file.name);
    
    try {
      await fsPromises.stat(filePath);
      return { filePath, fileName: file.name };
    } catch (error) {
      throw new Error('File not found on disk');
    }
  }

  async previewFile(id: string): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const file = this.uploadedFiles.find(f => f.id === id);
    if (!file) {
      throw new Error('File not found');
    }

    const filePath = path.join(UPLOADS_DIR, file.filePath || file.name);
    const ext = filePath.split('.').pop() || '';
    
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };

    try {
      await fsPromises.stat(filePath);
      return {
        filePath,
        fileName: file.name,
        mimeType: contentTypes[ext] || 'application/octet-stream'
      };
    } catch (error) {
      throw new Error('File not found on disk');
    }
  }
}

export default new FileService();
