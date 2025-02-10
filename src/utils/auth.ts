export const logout = () => {
  localStorage.removeItem('isAuthenticated');
  // Clear the session cookie by setting it to expire
  document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  // Redirect to login
  window.location.href = '/login';
};

export const verifyGitHubToken = async () => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${getSessionToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear invalid auth state
    logout();
    return null;
  }
};

// Helper to get session token from cookie
export const getSessionToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('session='))
    ?.split('=')[1];
}; 