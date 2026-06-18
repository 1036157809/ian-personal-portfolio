export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  chunkSize: 5 * 1024 * 1024, // 5MB
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: ['PDF', 'JPG', 'JPEG', 'PNG', 'DOC', 'DOCX', 'XLS', 'XLSX'],
};

export default config;
