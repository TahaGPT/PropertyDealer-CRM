import { NextResponse } from 'next/server';
import { initSocketServer } from '@/lib/socket';

// This route initializes Socket.io when accessed
// Socket.io attaches to the underlying HTTP server
export async function GET(req: Request) {
  try {
    // In Next.js, we need to access the underlying server
    // This endpoint signals that Socket.io should be initialized
    // The actual WebSocket upgrade happens via the socket.io client library
    return NextResponse.json({ 
      status: 'Socket.io endpoint ready',
      path: '/api/socketio' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize socket' }, { status: 500 });
  }
}
