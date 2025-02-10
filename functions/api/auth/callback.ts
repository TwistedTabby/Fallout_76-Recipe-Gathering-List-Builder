import { Context } from '../../src/types/cloudflare';

export async function onRequest(context: Context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return new Response('No code provided', { status: 400 });
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
    
    // Check if the response contains an error
    if (data.error) {
      console.error('GitHub OAuth error:', data);
      return new Response(`GitHub OAuth error: ${data.error_description || data.error}`, { 
        status: 400 
      });
    }

    if (!data.access_token) {
      console.error('No access token received:', data);
      return new Response('Invalid OAuth response', { status: 400 });
    }

    // Get the origin from the request URL
    const url = new URL(context.request.url);
    const redirectUrl = new URL(context.request.url).searchParams.get('state') || '/';

    // If successful, redirect to the main application with absolute URL
    return Response.redirect(`${redirectUrl}?auth_success=true`, 302);
  } catch (error) {
    // Log the actual error
    console.error('Authentication error:', error);
    return new Response(`Authentication failed: ${error.message}`, { 
      status: 500 
    });
  }
} 