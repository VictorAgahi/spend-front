import { useEffect } from 'react';
import { useWebSocketContext } from './WebSocketProvider';
import { WsEventPayloadMap, WsEventCallback } from './types';

export const useWebSocket = <K extends keyof WsEventPayloadMap>(
  event: K,
  callback: WsEventCallback<K>
) => {
  const { on, off } = useWebSocketContext();

  useEffect(() => {
    on(event, callback);
    return () => {
      off(event, callback);
    };
  }, [event, callback, on, off]);
};
