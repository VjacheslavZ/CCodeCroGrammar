import { AuthTokens } from '@cro/shared';
import axios from 'axios';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './token-storage';

import { store } from '@/store';
import { clearUser } from '@/store/auth.slice';

// TODO: move to env/config when deploying
const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from secure store
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — try refresh, then retry original request
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await setTokens(data.accessToken, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(original);
        } catch {
          await clearTokens();
          store.dispatch(clearUser());
        }
      }
    }
    return Promise.reject(error);
  },
);
