/// <reference types="vite/client" />

export const config = {
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID as string,
}; 