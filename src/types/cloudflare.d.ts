interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BASE_URL: string;
}

export interface Context {
  env: Env;
  request: Request;
} 