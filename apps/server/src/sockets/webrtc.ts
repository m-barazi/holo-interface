import type { Server as IOServer, Socket } from 'socket.io';

export function attachWebRTC(io: IOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('webrtc:offer', (s: { to: string; sdp: string }) =>
      io.to(s.to).emit('webrtc:offer', { from: socket.id, sdp: s.sdp }),
    );
    socket.on('webrtc:answer', (s: { to: string; sdp: string }) =>
      io.to(s.to).emit('webrtc:answer', { from: socket.id, sdp: s.sdp }),
    );
    socket.on('webrtc:ice', (s: { to: string; candidate: string }) =>
      io.to(s.to).emit('webrtc:ice', { from: socket.id, candidate: s.candidate }),
    );
  });
}