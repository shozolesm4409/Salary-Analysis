export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  date: string; // ISO string YYYY-MM-DD
  category: string;
  amount: number;
  department: string;
  description?: string;
  timestamp: number;
  month: string; // YYYY-MM
  deletedAt?: number; // Timestamp when deleted
}

export interface Category {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  hidden: boolean;
}

export interface Department {
  id?: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  hidden: boolean;
}

export const DEPARTMENTS = ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales'];
export const INCOME_TYPES = ['Salary', 'Freelance', 'Investment', 'Sales', 'Other'];
export const EXPENSE_TYPES = ['Rent', 'Utilities', 'Salaries', 'Equipment', 'Marketing', 'Software', 'Travel', 'Other'];
