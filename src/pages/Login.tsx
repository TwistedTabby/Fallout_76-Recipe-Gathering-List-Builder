import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for auth_success parameter
    const authSuccess = new URLSearchParams(location.search).get('auth_success');
    if (authSuccess === 'true') {
      navigate('/import');
    }
  }, [location, navigate]);

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