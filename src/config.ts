/// <reference types="vite/client" />

// Debug logging for environment variables
console.log('Vite env vars:', {
  VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

export const config = {
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID as string,
};

// Warn if GitHub client ID is missing
if (!import.meta.env.VITE_GITHUB_CLIENT_ID) {
  console.warn('VITE_GITHUB_CLIENT_ID is not set in environment variables');
} 