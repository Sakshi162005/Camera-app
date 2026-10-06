import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from a stored token on page load.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return setLoading(false);
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const applySession = ({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const login = useCallback(async (username, password) => {
    const r = await api.post('/auth/login', { username, password });
    applySession(r.data);
  }, []);

  const register = useCallback(async (username, password) => {
    const r = await api.post('/auth/register', { username, password });
    applySession(r.data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
