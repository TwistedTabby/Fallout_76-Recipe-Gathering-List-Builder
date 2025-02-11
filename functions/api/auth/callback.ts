import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
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
        'User-Agent': 'FO76-Recipe-Builder',
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID,
        client_secret: context.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    // Debug logging
    console.log('Token response status:', tokenResponse.status);
    const responseText = await tokenResponse.text();
    console.log('Token response text:', responseText);

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return new Response(`Failed to parse GitHub response: ${responseText.slice(0, 100)}...`, {
        status: 500
      });
    }

    if (tokenData.error) {
      return new Response(`GitHub OAuth error: ${tokenData.error}`, { 
        status: 400 
      });
    }

    if (!tokenData.access_token) {
      return new Response(`Invalid GitHub response - no access token received: ${JSON.stringify(tokenData)}`, {
        status: 400
      });
    }

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'FO76-Recipe-Builder',
      },
    });

    if (!userResponse.ok) {
      const userErrorText = await userResponse.text();
      console.error('User data fetch failed:', userErrorText);
      return new Response(`Failed to fetch user data: ${userResponse.status} ${userErrorText}`, {
        status: 500
      });
    }

    const userData = await userResponse.json();

    // Check if user is a collaborator
    const collaboratorResponse = await fetch(
      'https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
          'User-Agent': 'FO76-Recipe-Builder',
        },
      }
    );

    if (!collaboratorResponse.ok) {
      const collabErrorText = await collaboratorResponse.text();
      console.error('Collaborator check failed:', collabErrorText);
      return new Response(`Failed to check collaborator status: ${collaboratorResponse.status} ${collabErrorText}`, {
        status: 500
      });
    }

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