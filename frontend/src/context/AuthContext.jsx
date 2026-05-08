import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('univoid_token');
    if (token) {
      getMe()
        .then((res) => setUserState(res.data))
        .catch(() => {
          localStorage.removeItem('univoid_token');
          localStorage.removeItem('univoid_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('univoid_token', token);
    localStorage.setItem('univoid_user', JSON.stringify(userData));
    setUserState(userData);
  };

  const logout = () => {
    localStorage.removeItem('univoid_token');
    localStorage.removeItem('univoid_user');
    setUserState(null);
  };

  // Wrapper keeps localStorage in sync — called after profile updates (avatar, etc.)
  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem('univoid_user', JSON.stringify(userData));
    }
    setUserState(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
