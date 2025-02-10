import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresCollaborator?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresCollaborator = false 
}) => {
  const { isAuthenticated, isCollaborator } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiresCollaborator && !isCollaborator) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}; 