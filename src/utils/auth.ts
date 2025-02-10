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

    // First check our status endpoint
    const statusResponse = await fetch('/api/auth/status');
    if (!statusResponse.ok) {
      throw new Error('Not authenticated');
    }

    // If status check passes, verify with GitHub
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

const apiUrl = import.meta.env.VITE_BASE_URL;

const GITHUB_CLIENT_ID = apiUrl;
const REDIRECT_URI = `${apiUrl}/api/auth/callback`;

export function initiateGitHubLogin() {
  // We'll make a request to our own API endpoint to get the auth URL
  window.location.href = '/api/auth/github';
}

export async function handleAuthCallback(code: string): Promise<void> {
  try {
    const response = await fetch(`/api/auth/github?code=${code}`);
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    const data = await response.json();
    setAuthToken(data.access_token);
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error;
  }
}

export const setAuthToken = (token: string) => {
  document.cookie = `session=${token}; Path=/;`;
  localStorage.setItem('isAuthenticated', 'true');
}; 