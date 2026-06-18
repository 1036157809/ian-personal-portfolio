import { request } from 'src/utils/request';
import type { FileMetadata } from '@ianportfolio/shared';

export interface ChunkUploadParams {
  file: File;
  fileName: string;
  chunkIndex: number;
  totalChunks: number;
}

export const fileApi = {
  async getAll(): Promise<FileMetadata[]> {
    return request<FileMetadata[]>('/files');
  },

  async upload(file: File, name?: string): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    return request<FileMetadata>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadChunk(params: ChunkUploadParams): Promise<{ success: boolean; chunkIndex: number }> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('fileName', params.fileName);
    formData.append('chunkIndex', params.chunkIndex.toString());
    formData.append('totalChunks', params.totalChunks.toString());

    return request<{ success: boolean; chunkIndex: number }>('/files/upload-chunk', {
      method: 'POST',
      body: formData,
    });
  },

  async completeUpload(fileName: string): Promise<{ success: boolean; file: FileMetadata }> {
    return request<{ success: boolean; file: FileMetadata }>('/files/complete-upload', {
      method: 'POST',
      body: JSON.stringify({ fileName }),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/files/${id}`, {
      method: 'DELETE',
    });
  },

  async download(id: string): Promise<Blob> {
    return request<Blob>(`/files/download/${id}`, { responseType: 'blob' });
  },

  getDownloadUrl(id: string): string {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${API_BASE_URL}/files/download/${id}`;
  },

  getPreviewUrl(id: string): string {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${API_BASE_URL}/files/preview/${id}`;
  },
};
