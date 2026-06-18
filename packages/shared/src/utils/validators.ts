/**
 * 通用校验函数
 */

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  required: (value: string): boolean => {
    return !!value && value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return !!value && value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return !!value && value.length <= max;
  },

  fileType: (fileName: string, allowedTypes: string[]): boolean => {
    const fileExtension = fileName.split('.').pop()?.toUpperCase() || '';
    return allowedTypes.includes(fileExtension || '');
  },

  fileSize: (fileSize: number, maxSize: number): boolean => {
    return fileSize <= maxSize;
  },
};

export default validators;
