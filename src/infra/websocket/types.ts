import {
  ZoneUpdatedPayload,
  TransactionPingedPayload
} from '@clement.pasteau/shared';

export enum WsEvent {
  ZONE_UPDATE = 'zone-update',
  TRANSACTION_PING = 'transaction-ping',
}

export interface WsEventPayloadMap {
  [WsEvent.ZONE_UPDATE]: ZoneUpdatedPayload;
  [WsEvent.TRANSACTION_PING]: TransactionPingedPayload;
}

export type WsEventCallback<T extends keyof WsEventPayloadMap> = (data: WsEventPayloadMap[T]) => void;
