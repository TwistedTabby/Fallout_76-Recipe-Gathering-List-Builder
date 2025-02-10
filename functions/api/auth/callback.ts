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
    
    // Store the token or handle the authentication response
    // Redirect to the main application
    return Response.redirect('/', 302);
  } catch (error) {
    return new Response('Authentication failed', { status: 500 });
  }
} 