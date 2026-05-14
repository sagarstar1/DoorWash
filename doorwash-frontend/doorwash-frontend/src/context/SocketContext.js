import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

useEffect(() => {
  if (!user) return;

  const token = localStorage.getItem('doorwash_token');

  socketRef.current = io(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    {
      auth: { token },
      transports: ['websocket'],
    }
  );

  socketRef.current.on('connect', () => setConnected(true));
  socketRef.current.on('disconnect', () => setConnected(false));

  return () => socketRef.current?.disconnect();
}, [user]);

  const joinBooking = (id) => socketRef.current?.emit('join_booking', id);
  const leaveBooking = (id) => socketRef.current?.emit('leave_booking', id);
  const emitLocation = (data) => socketRef.current?.emit('worker_location', data);
  const on = (event, cb) => {
    socketRef.current?.on(event, cb);
    return () => socketRef.current?.off(event, cb);
  };

  return (
    <SocketContext.Provider value={{ connected, joinBooking, leaveBooking, emitLocation, on }}>
      {children}
    </SocketContext.Provider>
  );
}
