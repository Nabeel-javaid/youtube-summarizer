import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to handle CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

// Handle GET requests
export async function GET(req: NextRequest) {
    return NextResponse.json(
        { status: 'API is running' },
        { headers: corsHeaders() }
    );
}

// Handle POST requests
export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: 'This is a catch-all route. Please use a specific API endpoint.' },
        { status: 400, headers: corsHeaders() }
    );
} 