import { Env } from '../../../src/types/cloudflare'

interface PagesEnv {
  Bindings: Env
}

export const onRequest: import('@cloudflare/workers-types').PagesFunction<PagesEnv> = async (context) => {
  try {
    const session = context.request.cookies.get('session')
    
    if (!session) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Return success response
    return new Response(JSON.stringify({ 
      authenticated: true,
      token: session.value 
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Status check error:', error); // Add logging
    return new Response(JSON.stringify({ 
      authenticated: false,
      error: 'Authentication check failed' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 