import Router from '@koa/router';
import fileController from 'src/controllers/file.controller';

const router = new Router({
  prefix: '/api/files',
});

router.get('/', fileController.getAllFiles.bind(fileController));
router.post('/upload', fileController.uploadFile.bind(fileController));
router.post('/upload-chunk', fileController.uploadChunk.bind(fileController));
router.post('/complete-upload', fileController.completeUpload.bind(fileController));
router.delete('/:id', fileController.deleteFile.bind(fileController));
router.get('/download/:id', fileController.downloadFile.bind(fileController));
router.get('/preview/:id', fileController.previewFile.bind(fileController));

export default router;
