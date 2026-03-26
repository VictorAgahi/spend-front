import { api } from './api.service';
import {
  GetNearbyTransactionsRequest,
  GetNearbyTransactionsResponse
} from '@clement.pasteau/contracts';
import { GetMapZonesResponse } from '@clement.pasteau/shared';

export const GeolocationService = {
  async getNearbyTransactions(params: GetNearbyTransactionsRequest): Promise<GetNearbyTransactionsResponse> {
    const { data } = await api.get<GetNearbyTransactionsResponse>('/geolocation/nearby', { params });
    return data;
  },

  async getMapZones(params: { latitude: number; longitude: number; radiusKm: number; tag?: string }): Promise<GetMapZonesResponse> {
    const { data } = await api.get<GetMapZonesResponse>('/geolocation/zones', { params });
    return data;
  },

  async trackTransaction(params: { transactionId: string; userId: string; address: string; amount: number; provider?: string; tag: string }): Promise<any> {
    const { data } = await api.post('/geolocation/track', params);
    return data;
  }
};
