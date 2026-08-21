export type TransactionType = 'CREDIT' | 'REPAYMENT';
export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'WAVE' | 'ORANGE_MONEY' | 'MTN' | 'MOOV' | 'OTHER';

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO string
  dueDate?: string; // Optional due date
  paymentMethod?: PaymentMethod;
  items?: string[]; // Optional itemized details
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address?: string;
  category?: 'FIDEL' | 'REGULIER' | 'NOUVEAU' | 'PASSAGER';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithStats extends Client {
  totalCredit: number; // Sum of all credit (debts taken)
  totalRepayment: number; // Sum of all repayments
  balance: number; // totalCredit - totalRepayment (>0 means customer owes money)
  lastTransactionDate?: string;
  isOverdue?: boolean;
  transactionCount: number;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  city: string;
  currency: string; // e.g. "FCFA", "MAD", "DZD", "GNF", "EUR", "$"
  reminderTemplate: string;
  receiptHeader: string;
}

export type StatusFilter = 'ALL' | 'HAS_DEBT' | 'SETTLED' | 'OVERDUE';
export type SortOption = 'DEBT_DESC' | 'NAME_ASC' | 'RECENT_ACTIVITY';

