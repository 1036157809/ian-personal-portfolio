/**
 * 数据模型类型（前后端共享）
 */

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  filePath: string;
}

export interface RequestContext {
  body: any;
  files?: { [key: string]: any };
}
