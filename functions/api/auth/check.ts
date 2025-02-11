export async function onRequestGet(context) {
  const cookie = context.request.headers.get('Cookie');
  const token = cookie?.match(/github_token=([^;]+)/)?.[1];
  const GITHUB_COLLAB_ACCESS_TOKEN = context.env.GITHUB_COLLAB_ACCESS_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify the token is still valid and user is still a collaborator
  try {
    const collaboratorResponse = await fetch(
      `https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators/${context.user.username}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_COLLAB_ACCESS_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const isAuthenticated = collaboratorResponse.status === 200;

    return new Response(JSON.stringify({ isAuthenticated }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 