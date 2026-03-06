export enum WsEvent {
  PING_FROM_GEOLOC = 'ping_from_geoloc',
  USER_LOGGED_IN = 'user_logged_in',
  NOTIFICATION_RECEIVED = 'notification_received',
}

export interface GeolocationPingPayload {
  message: string;
  timestamp: string;
}

export interface UserLoggedInPayload {
  userId: string;
  username: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
}

export interface WsEventPayloadMap {
  [WsEvent.PING_FROM_GEOLOC]: GeolocationPingPayload;
  [WsEvent.USER_LOGGED_IN]: UserLoggedInPayload;
  [WsEvent.NOTIFICATION_RECEIVED]: NotificationPayload;
}

export type WsEventCallback<T extends keyof WsEventPayloadMap> = (data: WsEventPayloadMap[T]) => void;
