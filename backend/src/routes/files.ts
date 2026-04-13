import Router from '@koa/router';

const router = new Router({
  prefix: '/api/files',
});

// In-memory file storage for demo
const uploadedFiles = [
  { id: '1', name: 'resume.pdf', size: '2.5 MB', type: 'PDF' },
  { id: '2', name: 'certificate.jpg', size: '1.2 MB', type: 'Image' }
];

// Get all files
router.get('/', async (ctx) => {
  try {
    ctx.body = uploadedFiles;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch files' };
  }
});

// Upload file (simplified for demo - accepts file metadata in request body)
router.post('/upload', async (ctx) => {
  try {
    const body = ctx.request.body as { name?: string; size?: string; type?: string };
    const { name, size, type } = body;
    
    if (!name || !size || !type) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: name, size, type' };
      return;
    }

    const newFile = {
      id: Date.now().toString(),
      name,
      size,
      type
    };

    uploadedFiles.push(newFile);
    ctx.body = newFile;
    ctx.status = 201;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to upload file' };
  }
});

// Delete file
router.delete('/:id', async (ctx) => {
  try {
    const index = uploadedFiles.findIndex(f => f.id === ctx.params.id);
    if (index === -1) {
      ctx.status = 404;
      ctx.body = { error: 'File not found' };
      return;
    }

    uploadedFiles.splice(index, 1);
    ctx.status = 204;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to delete file' };
  }
});

export default router;
