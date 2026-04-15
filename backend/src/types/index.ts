export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
}

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
