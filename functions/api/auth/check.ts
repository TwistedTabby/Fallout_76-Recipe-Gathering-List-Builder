export async function onRequestGet(context) {
  const cookie = context.request.headers.get('Cookie');
  const token = cookie?.match(/github_token=([^;]+)/)?.[1];

  if (!token) {
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify the token is still valid and user is still a collaborator
  try {
    const collaboratorResponse = await fetch(
      'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/collaborators', {
      headers: {
        'Authorization': `Bearer ${token}`,
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