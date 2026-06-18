/**
 * 数据模型类型（前后端共享）
 */
export interface Contact {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt?: Date;
}
export interface Feedback {
    id: string;
    type: 'bug' | 'feature' | 'content' | 'interview' | 'other';
    content: string;
    contactEmail?: string;
    nickname?: string;
    isRead: boolean;
    createdAt?: Date;
}
export interface UploadedFile {
    id: string;
    name: string;
    size: string;
    type: string;
    filePath: string;
}
export interface RequestContext {
    body: any;
    files?: {
        [key: string]: any;
    };
}
//# sourceMappingURL=models.d.ts.map