import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware might not be needed if next.config.ts handles headers adequately.
// If kept, ensure it doesn't conflict with next.config.ts headers.
export function middleware(request: NextRequest) {
    // Example: Only log the request path
    console.log('Middleware processed request for:', request.nextUrl.pathname);

    // Allow the request to proceed without modifying headers here
    return NextResponse.next();
}

// Apply middleware to API routes if still needed for other purposes
export const config = {
    matcher: '/api/:path*',
}; 