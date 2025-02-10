import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

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