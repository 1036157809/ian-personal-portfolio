export interface Project {
  id: number;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  technologies: string[];
  imageUrl?: string;
  mobileImageUrl?: string;
  additionalImages?: string[];
  demoUrl?: string;
  githubUrl?: string;
  order: number;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface FileUploadProgress {
  fileName: string;
  percentage: number;
  speed?: string;
  paused?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
