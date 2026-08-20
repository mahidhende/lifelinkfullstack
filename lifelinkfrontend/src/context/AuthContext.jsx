import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('LIFELINK_USER');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('LIFELINK_THEME') || 'dark';
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('LIFELINK_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('LIFELINK_USER');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('LIFELINK_THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      theme,
      toggleTheme,
      notifications,
      setNotifications,
      unreadCount,
      setUnreadCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
