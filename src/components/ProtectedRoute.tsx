import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyGitHubToken } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresCollaborator?: boolean;
}

export function ProtectedRoute({ children, requiresCollaborator = false }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const storedAuth = localStorage.getItem('isAuthenticated');
      if (storedAuth === 'true') {
        const userData = await verifyGitHubToken();
        setIsAuthenticated(!!userData);
      } else {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiresCollaborator && !isCollaborator) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 