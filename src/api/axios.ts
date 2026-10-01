import axios from 'axios';
import { useAuthStore } from '../store/authStore';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/', headers: { 'Content-Type': 'application/json' } });
const publicAuthUrl = /\/api\/auth\/(login|register)/i;
api.interceptors.request.use((config) => { const token = useAuthStore.getState().user?.token; if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, (error: unknown) => { if (axios.isAxiosError(error) && error.response?.status === 401 && !publicAuthUrl.test(error.config?.url ?? '')) { const role = useAuthStore.getState().user?.role; useAuthStore.getState().clearUser(); if (!window.location.pathname.startsWith('/login')) window.location.href = role ? `/login?rol=${role}&expirada=1` : '/login'; } return Promise.reject(error); });
export const assetUrl = (path?: string | null): string | undefined => (!path ? undefined : /^(https?:|data:|blob:)/.test(path) ? path : `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`);
