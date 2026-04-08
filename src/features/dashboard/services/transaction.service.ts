import { z } from "zod";
import api from "@/shared/services/api";

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
  ADJUSTMENT: "ADJUSTMENT",
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  RECONCILED: "RECONCILED",
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export interface Transaction {
  id: number;
  userId: number;
  accountId: number;
  categoryId: number;
  responsibleId: number;
  description?: string | null;
  amount: number;
  date: string;
  paymentDate: string;
  type: TransactionType;
  status: TransactionStatus;
  statementId?: number | null;
  installmentNum?: number | null;
  installmentTotal?: number | null;
  parentTransactionId?: number | null;
  recurrenceId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export const createTransactionSchema = z.object({
  userId: z.coerce.number(),
  accountId: z.coerce.number(),
  categoryId: z.coerce.number(),
  responsibleId: z.coerce.number(),
  description: z
    .string()
    .max(250, "A descrição não pode ultrapassar de 250 caracteres")
    .optional()
    .nullable(),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  date: z.coerce.date(),
  paymentDate: z.coerce.date(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT"]),
  status: z.enum(["PENDING", "CONFIRMED", "RECONCILED"]),
  installmentNum: z.coerce.number().nullable().optional(),
  installmentTotal: z.coerce.number().nullable().optional(),
  parentTransactionId: z.coerce.number().nullable().optional(),
  recurrenceId: z.coerce.number().nullable().optional(),
});

export const createCreditCardTransactionSchema = z.object({
  userId: z.coerce.number(),
  accountId: z.coerce.number(),
  categoryId: z.coerce.number(),
  responsibleId: z.coerce.number(),
  description: z
    .string()
    .max(250, "A descrição não pode ultrapassar de 250 caracteres")
    .nullable()
    .optional(),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  date: z.coerce.date(),
  paymentDate: z.coerce.date(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT"]),
  status: z.enum(["PENDING", "CONFIRMED", "RECONCILED"]),
  installmentNum: z.coerce.number().nullable().optional(),
  installmentTotal: z.coerce
    .number()
    .min(1, "Deve haver ao menos 1 parcela")
    .optional(),
  parentTransactionId: z.coerce.number().nullable().optional(),
  recurrenceId: z.coerce.number().nullable().optional(),
});

export const updateTransactionSchema = z.object({
  userId: z.coerce.number(),
  accountId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  responsibleId: z.coerce.number().optional(),
  description: z
    .string()
    .max(250, "A descrição não pode ultrapassar de 250 caracteres")
    .optional()
    .nullable(),
  amount: z.coerce
    .number()
    .min(0.01, "O valor deve ser maior que zero")
    .optional(),
  status: z.enum(["PENDING", "CONFIRMED", "RECONCILED"]).optional(),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;

export async function getTransactions(userId: number): Promise<Transaction[]> {
  const response = await api.get(`/transactions/${userId}`);
  return response.data;
}

export async function createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
  const response = await api.post("/transactions", data);
  return response.data;
}

export async function updateTransaction(
  id: number,
  data: UpdateTransactionDTO
): Promise<Transaction> {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
}

export async function deleteTransaction(id: number, userId: number): Promise<void> {
  const response = await api.delete(`/transactions/${id}`, {
    data: { userId },
  });
  return response.data;
}
