import { EventTag } from "../components/molecules/TransactionItem";

export interface CreateTransactionRequest {
  name: string;
  price: number;
  tag: EventTag;
  userId: string;
  address: string;
}

export interface TransactionResponse {
  id: string;
  name: string;
  price: number;
  tag: EventTag;
  userId: string;
  createdAt: string;
}

export interface ListTransactionsResponse {
  transactions: TransactionResponse[];
}
