import axios, { type InternalAxiosRequestConfig } from 'axios';

const skyshareApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.skyshareacademy.id',
});

skyshareApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authorization');
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isHandling401 = false;

skyshareApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!isHandling401) {
        isHandling401 = true;
        localStorage.removeItem('authorization');
        const pathname = window.location.pathname;
        if (pathname !== '/cms' && pathname !== '/cms/') {
          window.location.href = '/cms?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default skyshareApi;
