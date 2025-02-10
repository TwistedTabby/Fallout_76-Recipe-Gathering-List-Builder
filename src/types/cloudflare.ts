export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BASE_URL: string;
  // Add other environment variables as needed
}

export interface Context {
  env: Env;
  request: Request;
  // Add other context properties as needed
} 