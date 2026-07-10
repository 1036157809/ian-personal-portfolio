const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RequestOptions extends RequestInit {
  responseType?: 'blob' | 'json';
}

export const request = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  // Don't set Content-Type for FormData (browser sets it automatically with boundary)
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? options.headers
    : { 'Content-Type': 'application/json', ...options.headers };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  // Handle Blob response for file downloads
  if (options.responseType === 'blob') {
    return response.blob() as T;
  }

  return response.json();
}

export default request;
