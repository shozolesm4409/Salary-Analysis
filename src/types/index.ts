export interface Transaction {
  id?: string;
  userId: string;
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
  userId: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  hidden: boolean;
}

export interface Department {
  id?: string;
  userId: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  hidden: boolean;
}

export const DEPARTMENTS = ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales'];
export const INCOME_TYPES = ['Salary', 'Freelance', 'Investment', 'Sales', 'Other'];
export interface Project {
  id?: string;
  userId: string;
  heading: string;
  webLink: string;
  description: string;
  isLive: boolean;
  imageUrl?: string;
  isVisible: boolean;
  timestamp: number;
}

export interface ProfitRecord {
  id?: string;
  userId: string;
  year: string;
  months: number;
  present: number;
  ebfAmount: number;
  totalAmount: number;
  yearAmount: number;
  ebfAmounts: number;
  m: number;
  done: boolean;
  remark?: string;
  timestamp: number;
}
