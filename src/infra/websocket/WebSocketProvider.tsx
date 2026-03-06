import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { socketService } from './socket.service';
import { WsEventPayloadMap, WsEventCallback } from './types';

interface WebSocketContextType {
  isConnected: boolean;
  emit: <K extends keyof WsEventPayloadMap>(event: K, data: WsEventPayloadMap[K]) => void;
  on: <K extends keyof WsEventPayloadMap>(event: K, callback: WsEventCallback<K>) => void;
  off: <K extends keyof WsEventPayloadMap>(event: K, callback: WsEventCallback<K>) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();
    const socket = socketService.getSocket();

    if (socket) {
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
