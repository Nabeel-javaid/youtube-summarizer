import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if it's an API route
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Get the origin that made the request
        const origin = request.headers.get('origin') || '*';

        // Create response object
        const response = NextResponse.next();

        // Add the CORS headers to the response
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');

        return response;
    }

    return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
    matcher: '/api/:path*',
}; 