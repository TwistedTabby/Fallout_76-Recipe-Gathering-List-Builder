import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  GITHUB_COLLAB_ACCESS_TOKEN: string;
}

const USER_AGENT = 'FO76-Recipe-Builder/1.0.0 (+https://fo76-gather.twistedtabby.com)';

export const onRequestGet = async (context: EventContext<Env, any, Record<string, unknown>>): Promise<Response> => {
  try {
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const encodedState = url.searchParams.get('state');
    
    // Default to home if no state is provided
    let redirectUri = '/';
    
    if (encodedState) {
      try {
        const stateJson = atob(encodedState);
        const state = JSON.parse(stateJson);
        redirectUri = state.returnTo || '/';
      } catch (error) {
        console.error('Failed to parse state:', error);
        // Fall back to default redirect if state parsing fails
      }
    }

    if (!code) {
      return new Response('No code provided', { status: 400 });
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID,
        client_secret: context.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    // Debug logging
    
    const responseText = await tokenResponse.text();
    

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
        'User-Agent': USER_AGENT,
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

    // Check if user is a collaborator using the specific user check endpoint
    const collaboratorResponse = await fetch(
      `https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators/${userData.login}`,
      {
        headers: {
          'Authorization': `Bearer ${context.env.GITHUB_COLLAB_ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': USER_AGENT,
          'X-GitHub-Api-Version': '2022-11-28'
        },
      }
    );

    // Handle different response status codes
    if (collaboratorResponse.status === 404) {
      return new Response('Not authorized - must be a project collaborator with write access or higher', { 
        status: 403 
      });
    }

    // Both 200 and 204 indicate the user is a collaborator
    if (collaboratorResponse.status === 200 || collaboratorResponse.status === 204) {
      // Get the user's permissions through a separate API call
      const permissionsResponse = await fetch(
        `https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators/${userData.login}/permission`,
        {
          headers: {
            'Authorization': `Bearer ${context.env.GITHUB_COLLAB_ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': USER_AGENT,
            'X-GitHub-Api-Version': '2022-11-28'
          },
        }
      );

      if (!permissionsResponse.ok) {
        const permissionsErrorText = await permissionsResponse.text();
        console.error('Permissions check failed:', permissionsErrorText);
        return new Response(`Failed to check permissions: ${permissionsResponse.status} ${permissionsErrorText}`, {
          status: 500
        });
      }

      const permissionData = await permissionsResponse.json();
      const permission = permissionData.permission;

      // Check if user has sufficient permissions (write access or higher)
      const hasAccess = ['admin', 'maintain', 'write'].includes(permission);

      if (!hasAccess) {
        return new Response('Not authorized - must be a project collaborator with write access or higher', { 
          status: 403 
        });
      }

      // Create a session token
      const sessionToken = btoa(JSON.stringify({
        user: userData.login,
        avatar: userData.avatar_url,
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        isCollaborator: true,
        permission: permission
      }));

      // Update the redirect location to use the stored redirect URI
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUri,
          'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      });
    }

    // If we get here, something unexpected happened
    const errorText = await collaboratorResponse.text();
    console.error('Unexpected collaborator response:', errorText);
    return new Response(`Unexpected response checking collaborator status: ${collaboratorResponse.status}`, {
      status: 500
    });

  } catch (error) {
    console.error('Auth callback error:', error);
    return new Response(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    });
  }
}; 