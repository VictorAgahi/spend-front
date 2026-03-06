export enum WsEvent {
  PING_FROM_GEOLOC = 'ping_from_geoloc',
  USER_LOGGED_IN = 'user_logged_in',
  NOTIFICATION_RECEIVED = 'notification_received',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  PING_ROOM = 'ping_room',
  ROOM_MEMBERS = 'room_members',
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

export interface JoinRoomPayload {
  room: string;
  username: string;
}

export interface PingRoomPayload {
  message: string;
  sender: string;
  timestamp: string;
}

export interface WsEventPayloadMap {
  [WsEvent.PING_FROM_GEOLOC]: GeolocationPingPayload;
  [WsEvent.USER_LOGGED_IN]: UserLoggedInPayload;
  [WsEvent.NOTIFICATION_RECEIVED]: NotificationPayload;
  [WsEvent.JOIN_ROOM]: JoinRoomPayload;
  [WsEvent.LEAVE_ROOM]: { room: string };
  [WsEvent.PING_ROOM]: PingRoomPayload;
  [WsEvent.ROOM_MEMBERS]: string[];
}

export type WsEventCallback<T extends keyof WsEventPayloadMap> = (data: WsEventPayloadMap[T]) => void;
