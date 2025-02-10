import { Env } from '../../../src/types/cloudflare';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { GITHUB_CLIENT_ID, BASE_URL } = context.env;
    
    if (!GITHUB_CLIENT_ID || !BASE_URL) {
      throw new Error('Missing required environment variables');
    }

    const redirectUri = `${BASE_URL}/api/auth/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: githubAuthUrl
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    return new Response(JSON.stringify({ error: 'Authentication configuration error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 