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

  fileType: (file: File, allowedTypes: string[]): boolean => {
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
    return allowedTypes.includes(fileExtension || '');
  },

  fileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },
};

export default validators;
