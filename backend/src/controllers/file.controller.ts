import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import fileService from 'src/services/file.service';
import { ensureDirectories } from 'src/services/file.service';

export class FileController {
  constructor() {
    ensureDirectories();
  }

  async getAllFiles(ctx: Context) {
    try {
      const files = await fileService.getAllFiles();
      ctx.body = files;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch files' };
    }
  }

  async uploadFile(ctx: Context) {
    try {
      const files = (ctx.request as any).files;
      const body = ctx.request.body as any;
      
      if (!files || !files.file) {
        ctx.status = 400;
        ctx.body = { error: 'No file provided' };
        return;
      }

      const file = await fileService.uploadFile(files.file, body);
      ctx.body = file;
      ctx.status = 201;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to upload file' };
    }
  }

  async uploadChunk(ctx: Context) {
    try {
      const body = ctx.request.body as any;
      const files = (ctx.request as any).files;
      
      if (!files || !files.file) {
        ctx.status = 400;
        ctx.body = { error: 'No file chunk provided' };
        return;
      }

      const result = await fileService.uploadChunk(files.file, body);
      ctx.body = result;
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to upload chunk' };
    }
  }

  async completeUpload(ctx: Context) {
    try {
      const body = ctx.request.body as { fileName?: string };
      const { fileName } = body;

      if (!fileName) {
        ctx.status = 400;
        ctx.body = { error: 'Missing fileName' };
        return;
      }

      const file = await fileService.completeUpload(fileName);
      ctx.body = { success: true, file };
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to complete upload', details: (error as Error).message };
    }
  }

  async deleteFile(ctx: Context) {
    try {
      const { id } = ctx.params;
      await fileService.deleteFile(id);
      ctx.body = { message: 'File deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async downloadFile(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { filePath, fileName } = await fileService.downloadFile(id);
      
      const stats = await fs.promises.stat(filePath);
      const encodedFileName = encodeURIComponent(fileName);
      
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
      ctx.set('Content-Length', stats.size.toString());
      ctx.body = fs.createReadStream(filePath);
    } catch (error) {
      ctx.status = 404;
      ctx.body = { error: (error as Error).message };
    }
  }

  async previewFile(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { filePath, fileName, mimeType } = await fileService.previewFile(id);
      
      const encodedFileName = encodeURIComponent(fileName);
      
      ctx.set('Content-Type', mimeType);
      ctx.set('Cache-Control', 'public, max-age=3600');
      ctx.set('ETag', `"${id}-${Date.now()}"`);
      ctx.set('Content-Disposition', `inline; filename*=UTF-8''${encodedFileName}`);
      ctx.body = fs.createReadStream(filePath);
    } catch (error) {
      ctx.status = 404;
      ctx.body = { error: (error as Error).message };
    }
  }
}

export default new FileController();
