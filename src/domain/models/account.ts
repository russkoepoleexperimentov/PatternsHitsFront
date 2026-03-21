export interface Account {
  id: string;
  userId: string;
  balance: number;
  closedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  sourceId: string | null;
  sourceType: string;
  targetId: string | null;
  targetType: string;
  amount: number;
  description: string;
  displayType: TransactionDisplayType;
  status: TransactionStatus;
  createdAt: string;
}

export type TransactionDisplayType =
  | 'Unclassified'
  | 'Deposit'
  | 'Withdrawal'
  | 'Transfer'
  | 'CreditPayment'
  | 'CreditIncoming';

export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';

export interface CreateTransactionRequest {
  sourceId: string | null;
  sourceType: string;
  targetId: string | null;
  targetType: string;
  amount: number;
  description: string;
}

export interface DepositWithdrawRequest {
  amount: number;
  description: string;
}
