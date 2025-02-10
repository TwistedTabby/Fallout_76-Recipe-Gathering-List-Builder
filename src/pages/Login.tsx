import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { verifyGitHubToken } from '../utils/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // First check for session cookie
      const hasSession = document.cookie.includes('session=');
      
      if (hasSession) {
        const userData = await verifyGitHubToken();
        if (userData) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }
      
      setIsAuthenticated(false);
      setIsLoading(false);
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/import" replace />;
  }

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="login-page">
      <h1>Login Required</h1>
      <p>You need to be a project collaborator to access this page.</p>
      <button onClick={handleGitHubLogin}>Login with GitHub</button>
    </div>
  );
} 