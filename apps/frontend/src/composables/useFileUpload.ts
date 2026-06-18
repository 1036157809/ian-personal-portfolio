import { ref } from 'vue';
import { fileApi } from 'src/api/file.api';
import { config } from 'src/config';
import type { FileUploadProgress } from 'src/types';

export function useFileUpload() {
  const uploadProgress = ref<FileUploadProgress[]>([]);
  const isLoading = ref(false);
  const error = ref('');

  const uploadFile = async (file: File, fileName?: string) => {
    try {
      isLoading.value = true;
      error.value = '';

      // Use chunked upload for large files
      if (file.size > config.chunkSize) {
        await uploadFileInChunks(file, fileName);
      } else {
        await uploadFileDirect(file, fileName);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      isLoading.value = false;
    }
  };

  const uploadFileDirect = async (file: File, fileName?: string) => {
    const result = await fileApi.upload(file, fileName);
    return result;
  };

  const uploadFileInChunks = async (file: File, fileName?: string) => {
    const totalChunks = Math.ceil(file.size / config.chunkSize);
    const finalFileName = fileName || file.name;
    const progressItem: FileUploadProgress = {
      fileName: finalFileName,
      percentage: 0,
    };
    uploadProgress.value.push(progressItem);

    try {
      for (let i = 0; i < totalChunks; i++) {
        if (progressItem.paused) return;

        const start = i * config.chunkSize;
        const end = Math.min(start + config.chunkSize, file.size);
        const chunk = file.slice(start, end) as File;

        await fileApi.uploadChunk({
          file: chunk,
          fileName: finalFileName,
          chunkIndex: i,
          totalChunks,
        });

        progressItem.percentage = Math.round(((i + 1) / totalChunks) * 100);
      }

      const result = await fileApi.completeUpload(finalFileName);
      return result.file as any;
    } finally {
      uploadProgress.value = uploadProgress.value.filter(p => p.fileName !== finalFileName);
    }
  };

  const deleteFile = async (id: string) => {
    await fileApi.delete(id);
  };

  return {
    uploadProgress,
    isLoading,
    error,
    uploadFile,
    deleteFile,
  };
}

export default useFileUpload;
