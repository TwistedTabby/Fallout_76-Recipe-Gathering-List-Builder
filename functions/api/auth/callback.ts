import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Get the code from the URL search params instead of context.request.query
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('No code provided', { status: 400 });
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID,
        client_secret: context.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(`GitHub OAuth error: ${tokenData.error}`, { 
        status: 400 
      });
    }

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const userData = await userResponse.json();

    // Check if user is a collaborator
    const collaboratorResponse = await fetch(
      'https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      }
    );

    const collaborators = await collaboratorResponse.json();
    const isCollaborator = collaborators.some(
      (collaborator: { login: string }) => collaborator.login === userData.login
    );

    if (!isCollaborator) {
      return new Response('Not authorized - must be a project collaborator', { 
        status: 403 
      });
    }

    // Create a session token
    // Note: In a production environment, you should use a proper JWT library
    const sessionToken = btoa(JSON.stringify({
      user: userData.login,
      avatar: userData.avatar_url,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isCollaborator: true
    }));

    // Redirect back to the frontend with the session token
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      },
    });

  } catch (error) {
    console.error('Auth callback error:', error);
    return new Response(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    });
  }
}; 