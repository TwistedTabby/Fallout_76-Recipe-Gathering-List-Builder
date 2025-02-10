import { Context } from '../../../src/types/cloudflare';

export async function onRequest(context: Context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID,
        client_secret: context.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenResponse.json();
    
    if (data.error) {
      console.error('GitHub OAuth error:', data);
      return new Response(JSON.stringify({ 
        error: 'GitHub OAuth error',
        details: data.error_description || data.error 
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (!data.access_token) {
      console.error('No access token received:', data);
      return new Response(JSON.stringify({ error: 'Invalid OAuth response' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const url = new URL(context.request.url);
    const redirectUrl = new URL("/import", url);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Set-Cookie': `session=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error.message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 