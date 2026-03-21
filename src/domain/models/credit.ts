export interface Credit {
  id: string;
  userId: string;
  amount: number;
  remainingDebt: number;
  termDays: number;
  status: CreditStatus;
  createdAt: string;
  approvedAmount?: number;
  approvedBy?: string;
  rejectionReason?: string;
  currency: string;
}

export interface CreditRating {
  userId: string;
  rating: number;
}

export type CreditStatus = 'Pending' | 'Approved' | 'Rejected' | 'Closed';

export interface ApproveCreditRequest {
  approvedAmount?: number;
  comment?: string;
}

export interface RejectCreditRequest {
  reason: string;
}

export type PaymentStatus = 'Pending' | 'Processed' | 'Failed' | 'Overdue';

export interface Payment {
  id: string;
  creditId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  dueDate?: string;
  currency: string;
}
