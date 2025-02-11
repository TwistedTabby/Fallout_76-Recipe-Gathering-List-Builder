export async function onRequestGet(context) {
  const cookie = context.request.headers.get('Cookie');
  const sessionToken = cookie?.match(/session=([^;]+)/)?.[1];

  if (!sessionToken) {
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Decode the session token
    const session = JSON.parse(atob(sessionToken));
    
    // Check if session is expired
    if (session.exp < Date.now()) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is still a collaborator
    const collaboratorResponse = await fetch(
      `https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators/${session.user}`, {
      headers: {
        'Authorization': `Bearer ${context.env.GITHUB_COLLAB_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'User-Agent': 'FO76-Recipe-Builder/1.0.0 (+https://fo76-gather.twistedtabby.com)',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    const isAuthenticated = collaboratorResponse.status === 200 || collaboratorResponse.status === 204;

    return new Response(JSON.stringify({ 
      isAuthenticated,
      user: isAuthenticated ? session.user : null 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(JSON.stringify({ 
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 