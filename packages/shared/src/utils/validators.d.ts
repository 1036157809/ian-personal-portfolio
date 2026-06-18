/**
 * 通用校验函数
 */
export declare const validators: {
    email: (email: string) => boolean;
    required: (value: string) => boolean;
    minLength: (value: string, min: number) => boolean;
    maxLength: (value: string, max: number) => boolean;
    fileType: (fileName: string, allowedTypes: string[]) => boolean;
    fileSize: (fileSize: number, maxSize: number) => boolean;
};
export default validators;
//# sourceMappingURL=validators.d.ts.map