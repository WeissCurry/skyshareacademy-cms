import axios, { type InternalAxiosRequestConfig } from 'axios';

const skyshareApi = axios.create({
  // baseURL: 'http://localhost:3000',
  // headers: { Authorization: `${localStorage.getItem('authorization')}` },
  baseURL: 'https://api.skyshareacademy.id'
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

// Optional: Add request/response interceptors here if needed

export default skyshareApi;