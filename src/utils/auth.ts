export const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authData'); // Also clear stored auth data
  // Clear the session cookie by setting it to expire
  document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  // Redirect to login
  window.location.href = '/login';
};

interface StoredAuthData {
  timestamp: number;
  userData: any;
}

export const verifyGitHubToken = async () => {
  try {
    // Check if we have cached verification within last hour
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      const authData: StoredAuthData = JSON.parse(storedData);
      const minutesSinceLastCheck = (Date.now() - authData.timestamp) / (1000 * 60);
      
      if (minutesSinceLastCheck < 60) { // Cache for 1 hour
        return authData.userData;
      }
    }

    // If no cached data or expired, check with GitHub
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${getSessionToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    const userData = await response.json();
    
    // Store the verification result and timestamp
    const authData: StoredAuthData = {
      timestamp: Date.now(),
      userData
    };
    localStorage.setItem('authData', JSON.stringify(authData));
    
    return userData;
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