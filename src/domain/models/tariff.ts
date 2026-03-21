export interface Tariff {
  id: string;
  name: string;
  interestRate: number;
  maxAmount: number;
  maxTermDays: number;
}

export interface CreateTariffRequest {
  name: string;
  interestRate: number;
  maxAmount: number;
  maxTermDays: number;
}

export type UpdateTariffRequest = CreateTariffRequest;
