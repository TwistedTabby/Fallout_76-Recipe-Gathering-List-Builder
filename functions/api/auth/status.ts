import { Env } from '../../../src/types/cloudflare'

export const onRequest: PagesFunction<Env> = async (context) => {
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