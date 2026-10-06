import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CamerasContext = createContext(null);

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export function CamerasProvider({ children }) {
  const { user } = useAuth();
  const wallKey = `wall:${user.id}`;
  const layoutKey = `wall-layout:${user.id}`;

  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wall, setWall] = useState(() => read(wallKey, []));
  const [layout, setLayoutState] = useState(() => read(layoutKey, 'auto'));

  const refresh = useCallback(async () => {
    try {
      const r = await api.get('/cameras');
      setCameras(r.data.cameras);
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load plus a slow poll for live/viewer status.
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  // Drop wall entries for cameras that no longer exist (or are no longer visible).
  useEffect(() => {
    if (loading) return;
    const ids = new Set(cameras.map((c) => c.id));
    setWall((w) => {
      const next = w.filter((id) => ids.has(id));
      return next.length === w.length ? w : next;
    });
  }, [cameras, loading]);

  useEffect(() => write(wallKey, wall), [wall, wallKey]);
  useEffect(() => write(layoutKey, layout), [layout, layoutKey]);

  const value = useMemo(() => ({
    cameras,
    loading,
    error,
    refresh,
    byId: (id) => cameras.find((c) => c.id === id) || null,
    wall,
    layout,
    setLayout: setLayoutState,
    isOnWall: (id) => wall.includes(id),
    addToWall: (id) => setWall((w) => (w.includes(id) ? w : [...w, id])),
    removeFromWall: (id) => setWall((w) => w.filter((x) => x !== id)),
    toggleWall: (id) => setWall((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    clearWall: () => setWall([]),
  }), [cameras, loading, error, refresh, wall, layout]);

  return <CamerasContext.Provider value={value}>{children}</CamerasContext.Provider>;
}

export const useCameras = () => useContext(CamerasContext);
