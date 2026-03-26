import { api } from './api.service';
import {
  GetNearbyTransactionsRequest,
  GetNearbyTransactionsResponse
} from '@clement.pasteau/contracts';

export const GeolocationService = {
  async getNearbyTransactions(params: GetNearbyTransactionsRequest): Promise<GetNearbyTransactionsResponse> {
    const { data } = await api.get<GetNearbyTransactionsResponse>('/geolocation/nearby', { params });
    return data;
  }
};
