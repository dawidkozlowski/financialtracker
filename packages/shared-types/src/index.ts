export type TransactionKind = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  kind: TransactionKind;
  amount: number;
  category: string;
  tags: string[];
  date: string;
  note?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly";
  nextChargeDate: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  month: string;
  limitAmount: number;
}
