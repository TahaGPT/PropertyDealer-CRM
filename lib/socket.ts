import { Server as SocketIOServer } from 'socket.io';

// Singleton pattern for Socket.io server in Next.js dev mode
let io: SocketIOServer | null = null;

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: any): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    // Join room based on user role
    socket.on('join', (data: { userId: string; role: string }) => {
      socket.join(data.userId);
      if (data.role === 'ADMIN') {
        socket.join('admins');
      }
      socket.join('agents');
      console.log(`[Socket.io] ${data.userId} joined (${data.role})`);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
}

// Event emitter functions for use in server actions
export type LeadEvent = {
  type: 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_ASSIGNED' | 'LEAD_DELETED' | 'LEAD_STATUS_CHANGED';
  leadId: string;
  leadName: string;
  details: string;
  timestamp: string;
  assignedTo?: string;
};

export function emitLeadEvent(event: LeadEvent) {
  if (!io) return;

  // Broadcast to all connected clients
  io.emit('lead-update', event);
  console.log(`[Socket.io] Emitted ${event.type}: ${event.leadName}`);
}
