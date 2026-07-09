export interface FileMetadata {
  id: string;
  name: string;
  size: string;
  type: string;
  filePath: string;
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
  files?: { [key: string]: any };
}
