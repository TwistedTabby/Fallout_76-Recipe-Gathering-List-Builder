import React from 'react';
import { initiateGitHubLogin } from '../utils/auth';

export function Login() {
  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={initiateGitHubLogin}>
        Login with GitHub
      </button>
    </div>
  );
} 