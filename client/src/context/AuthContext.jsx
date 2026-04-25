import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Default user — no login required
const DEFAULT_USER = {
  name: 'Shop Operator',
  role: 'admin',
  shopNumber: '0806015',
  token: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If a stored session exists (e.g. from old login), use its token for API calls
    const stored = localStorage.getItem('rationUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        setUser({ ...DEFAULT_USER, ...parsed });
      }
    }
  }, []);

  const login = (userData) => {
    const merged = { ...DEFAULT_USER, ...userData };
    setUser(merged);
    localStorage.setItem('rationUser', JSON.stringify(merged));
    if (userData.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem('rationUser');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
