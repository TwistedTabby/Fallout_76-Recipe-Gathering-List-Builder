import { Context } from '../../src/types/cloudflare';

export async function onRequest(context: Context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://fo76-gather.twistedtabby.com/api/auth/callback';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
  
  return Response.redirect(githubAuthUrl, 302);
} 