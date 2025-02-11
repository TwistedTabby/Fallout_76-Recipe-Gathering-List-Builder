export async function onRequestGet(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = `${context.env.BASE_URL}/api/auth/callback`;
  
  // Get the state parameter from the request URL
  const url = new URL(context.request.url);
  const state = url.searchParams.get('state');
  
  // Construct GitHub OAuth URL with state if present
  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', 'read:org');
  if (state) {
    githubUrl.searchParams.set('state', state);
  }
  
  return Response.redirect(githubUrl.toString(), 302);
} 