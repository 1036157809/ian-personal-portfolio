"use strict";
/**
 * 通用校验函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = void 0;
exports.validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    required: (value) => {
        return !!value && value.trim().length > 0;
    },
    minLength: (value, min) => {
        return !!value && value.length >= min;
    },
    maxLength: (value, max) => {
        return !!value && value.length <= max;
    },
    fileType: (fileName, allowedTypes) => {
        const fileExtension = fileName.split('.').pop()?.toUpperCase() || '';
        return allowedTypes.includes(fileExtension || '');
    },
    fileSize: (fileSize, maxSize) => {
        return fileSize <= maxSize;
    },
};
exports.default = exports.validators;
//# sourceMappingURL=validators.js.map