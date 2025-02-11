export async function onRequestGet(context) {
  const { code } = context.request.query;
  
  // Exchange code for access token
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

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Get user information
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  
  const user = await userResponse.json();

  // Check if user is a collaborator
  const collaboratorResponse = await fetch(
    'https://api.github.com/repos/TwistedTabby/Fallout_76-Recipe-Gathering-List-Builder/collaborators', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const collaborators = await collaboratorResponse.json();
  const isCollaborator = collaborators.some(
    collaborator => collaborator.login === user.login
  );

  if (!isCollaborator) {
    return Response.redirect(`${context.env.BASE_URL}/import?error=not_collaborator`, 302);
  }

  // Set session cookie
  const headers = new Headers({
    'Set-Cookie': `github_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    'Location': `${context.env.BASE_URL}/import`,
  });

  return new Response(null, {
    status: 302,
    headers,
  });
} 