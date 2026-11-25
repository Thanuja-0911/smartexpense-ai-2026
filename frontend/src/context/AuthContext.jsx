import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartexpense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartexpense_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('smartexpense_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Auth verification fallback:', err.message);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('smartexpense_token', res.data.token);
      localStorage.setItem('smartexpense_user', JSON.stringify(res.data));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('smartexpense_token', res.data.token);
      localStorage.setItem('smartexpense_user', JSON.stringify(res.data));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('smartexpense_token');
    localStorage.removeItem('smartexpense_user');
  };

  const updateUserData = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('smartexpense_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
