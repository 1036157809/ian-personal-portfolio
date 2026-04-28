const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:3001';

export interface FileMetadata {
  id: string;
  name: string;
  size: string;
  type: string;
  filePath: string;
}

export interface ChunkUploadParams {
  file: File;
  fileName: string;
  chunkIndex: number;
  totalChunks: number;
}

export const fileApi = {
  async getAll(): Promise<FileMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/api/files`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  },

  async upload(file: File, name?: string): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  },

  async uploadChunk(params: ChunkUploadParams): Promise<{ success: boolean; chunkIndex: number }> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('fileName', params.fileName);
    formData.append('chunkIndex', params.chunkIndex.toString());
    formData.append('totalChunks', params.totalChunks.toString());

    const response = await fetch(`${API_BASE_URL}/api/files/upload-chunk`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload chunk');
    }

    return response.json();
  },

  async completeUpload(fileName: string): Promise<{ success: boolean; file: FileMetadata }> {
    const response = await fetch(`${API_BASE_URL}/api/files/complete-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete upload');
    }

    return response.json();
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/files/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return response.json();
  },

  async download(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/files/download/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  getDownloadUrl(id: string): string {
    return `${API_BASE_URL}/api/files/download/${id}`;
  },

  getPreviewUrl(id: string): string {
    return `${API_BASE_URL}/api/files/preview/${id}`;
  },
};
