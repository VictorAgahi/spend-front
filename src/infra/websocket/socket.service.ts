import { io, Socket } from 'socket.io-client';
import { WsEventPayloadMap, WsEventCallback } from './types';

const SOCKET_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  on<K extends keyof WsEventPayloadMap>(event: K, callback: WsEventCallback<K>): void {
    this.socket?.on(event as string, callback as (args: any) => void);
  }

  off<K extends keyof WsEventPayloadMap>(event: K, callback: WsEventCallback<K>): void {
    this.socket?.off(event as string, callback as (args: any) => void);
  }

  emit<K extends keyof WsEventPayloadMap>(event: K, data: WsEventPayloadMap[K]): void {
    this.socket?.emit(event as string, data);
  }
}

export const socketService = new SocketService();
