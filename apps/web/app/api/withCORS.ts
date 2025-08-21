// Reusable CORS middleware for Next.js API routes
import { NextResponse } from 'next/server';

export function withCORS(handler: any) {
  return async (req: Request, ...args: any[]) => {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-usage-track',
        },
      });
    }
    try {
      const response = await handler(req, ...args);
      if (response instanceof Response) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-usage-track');
        return response;
      }
      // If handler returned non-Response, wrap it
      return new NextResponse(JSON.stringify(response), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-usage-track',
          'Content-Type': 'application/json',
        },
      });
    } catch (err: any) {
      // Always return CORS headers even on error
      return new NextResponse(
        JSON.stringify({ error: err?.message || 'Internal Server Error' }),
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-usage-track',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}
