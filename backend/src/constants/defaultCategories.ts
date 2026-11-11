import type { TransactionType } from '../generated/prisma/client.js';

export interface DefaultCategory {
  name: string;
  color: string; // Hex color
  icon: string; // Icon name (Lucide) used by the frontend
  type: TransactionType;
}

// Categories every new user starts with. Single source of truth: used by the
// register flow and by the development seed. After that they belong to the user,
// who can edit or delete them freely
export const DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  // Expenses
  { name: 'Vivienda', color: '#3b82f6', icon: 'home', type: 'EXPENSE' },
  { name: 'Supermercado', color: '#22c55e', icon: 'shopping-cart', type: 'EXPENSE' },
  { name: 'Restaurantes', color: '#f97316', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Transporte', color: '#f59e0b', icon: 'bus', type: 'EXPENSE' },
  { name: 'Coche', color: '#64748b', icon: 'car', type: 'EXPENSE' },
  { name: 'Suscripciones', color: '#8b5cf6', icon: 'repeat', type: 'EXPENSE' },
  { name: 'Ocio', color: '#ec4899', icon: 'gamepad-2', type: 'EXPENSE' },
  { name: 'Salud', color: '#ef4444', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Ropa', color: '#a855f7', icon: 'shirt', type: 'EXPENSE' },
  { name: 'Regalos', color: '#f43f5e', icon: 'gift', type: 'EXPENSE' },
  { name: 'Otros', color: '#94a3b8', icon: 'circle-ellipsis', type: 'EXPENSE' },

  // Income
  { name: 'Nómina', color: '#10b981', icon: 'briefcase', type: 'INCOME' },
  { name: 'Extras', color: '#06b6d4', icon: 'sparkles', type: 'INCOME' },
  { name: 'Otros ingresos', color: '#84cc16', icon: 'piggy-bank', type: 'INCOME' },
];
