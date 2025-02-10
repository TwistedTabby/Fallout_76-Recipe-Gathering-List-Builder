export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  // Add other environment variables as needed
}

export interface Context {
  env: Env;
  // Add other context properties as needed
} 