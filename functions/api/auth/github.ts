import { Context } from '../../../src/types/cloudflare';

export async function onRequest(context: Context) {
  try {
    const clientId = context.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'GitHub client ID not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const redirectUri = 'https://fo76-gather.twistedtabby.com/api/auth/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
    
    return Response.redirect(githubAuthUrl, 302);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 