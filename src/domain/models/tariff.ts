export interface Tariff {
  id: string;
  name: string;
  interestRate: number;
  maxAmount: number;
  maxTermDays: number;
  currency: string;
}

export interface CreateTariffRequest {
  name: string;
  interestRate: number;
  maxAmount: number;
  maxTermDays: number;
  currency: string;
}

export type UpdateTariffRequest = CreateTariffRequest;
