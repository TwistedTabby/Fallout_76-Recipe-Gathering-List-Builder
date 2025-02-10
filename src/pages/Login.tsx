import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyGitHubToken } from '../utils/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      // Check URL parameters for auth_success
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth_success') === 'true') {
        const userData = await verifyGitHubToken();
        if (userData) {
          localStorage.setItem('isAuthenticated', 'true');
          setIsAuthenticated(true);
          // Clean up URL
          navigate('/', { replace: true });
        }
      } else {
        // Check if already authenticated
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
          const userData = await verifyGitHubToken();
          setIsAuthenticated(!!userData);
        }
      }
      setIsLoading(false);
    }

    verifyAuth();
  }, [navigate]);

  // If authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check for session cookie
    const hasSession = document.cookie.includes('session=');
    setIsAuthenticated(hasSession);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // Or return <Navigate to="/import" /> if you want to redirect
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