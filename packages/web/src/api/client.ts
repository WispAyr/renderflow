import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Generic fetcher for react-query
export async function fetcher<T>(url: string): Promise<T> {
  const response = await api.get(url);
  return (response as ApiResponse<T>).data;
}
