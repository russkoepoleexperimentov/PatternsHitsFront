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
