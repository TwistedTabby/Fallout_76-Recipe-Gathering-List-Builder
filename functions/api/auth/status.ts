import { Env } from '../../../src/types/cloudflare'

interface PagesEnv {
  Bindings: Env
}

export const onRequest: import('@cloudflare/workers-types').PagesFunction<PagesEnv> = async (context) => {
  try {
    // Log the incoming request details
    console.log('Checking auth status');
    
    // Check if context and request exist
    if (!context || !context.request) {
      console.error('Missing context or request');
      throw new Error('Invalid context');
    }

    // Safely try to get cookies
    let session;
    try {
      session = context.request.cookies.get('session');
      console.log('Session cookie status:', session ? 'found' : 'not found');
    } catch (cookieError) {
      console.error('Error accessing cookies:', cookieError);
      throw cookieError;
    }
    
    if (!session) {
      return new Response(JSON.stringify({ 
        authenticated: false,
        reason: 'no_session'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({ 
      authenticated: true,
      token: session.value 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 