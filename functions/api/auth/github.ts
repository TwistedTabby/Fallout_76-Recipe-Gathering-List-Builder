export async function onRequestGet(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = `${context.env.BASE_URL}/api/auth/callback`;
  
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:org`;
  
  return Response.redirect(url, 302);
} 