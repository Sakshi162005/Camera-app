import axios from 'axios';

export const TOKEN_KEY = 'cam_token';

export const api = axios.create({ baseURL: '/api' });

// Attach the JWT to every request.
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// If the token is rejected, drop it and send the user to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(err);
  },
);

export const errorMessage = (err) =>
  err.response?.data?.error || err.message || 'Something went wrong';

// Build the WebSocket URL for a camera, carrying the JWT as a query param.
export function streamUrl(cameraId) {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const token = localStorage.getItem(TOKEN_KEY) || '';
  return `${proto}://${window.location.host}/ws/stream/${encodeURIComponent(cameraId)}?token=${encodeURIComponent(token)}`;
}
