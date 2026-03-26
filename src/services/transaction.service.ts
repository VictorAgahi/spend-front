import { api } from './api.service';
import { CreateTransactionRequest, TransactionResponse, ListTransactionsResponse } from '../types/transaction.types';

export const TransactionService = {
  async getTransactions(): Promise<ListTransactionsResponse> {
    const { data } = await api.get<ListTransactionsResponse>('/transactions');
    return data;
  },

  async createTransaction(request: Omit<CreateTransactionRequest, 'userId'>): Promise<TransactionResponse> {
    const { data } = await api.post<TransactionResponse>('/transactions', request);
    return data;
  }
};
