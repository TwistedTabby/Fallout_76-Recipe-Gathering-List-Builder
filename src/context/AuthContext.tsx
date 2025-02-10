import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isCollaborator: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);

  const login = async () => {
    window.location.href = '/api/auth/github';
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsCollaborator(false);
  };

  useEffect(() => {
    // Check auth status on mount
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.isAuthenticated);
        setIsCollaborator(data.isCollaborator);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isCollaborator, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 