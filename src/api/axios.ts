// src/api/axios.ts
import axios from 'axios';
import { oidc } from '../auth/oidc';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (cfg) => {
  const user = await oidc.getUser();
  if (user && !user.expired)
    cfg.headers.Authorization = `Bearer ${user.access_token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await oidc.removeUser();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
