import { z } from "zod";
import api from "@/shared/services/api";

export interface Responsible {
  id: number;
  userId: number;
  name: string;
  color?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const createResponsibleSchema = z.object({
  userId: z.number(),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  color: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateResponsibleSchema = z.object({
  userId: z.number(),
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100)
    .optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateResponsibleDTO = z.infer<typeof createResponsibleSchema>;
export type UpdateResponsibleDTO = z.infer<typeof updateResponsibleSchema>;

export async function getResponsibles(userId: number): Promise<Responsible[]> {
  const response = await api.get(`/responsibles/${userId}`);
  return response.data;
}

export async function createResponsible(data: CreateResponsibleDTO): Promise<Responsible> {
  const response = await api.post("/responsibles", data);
  return response.data;
}

export async function updateResponsible(
  id: number,
  data: UpdateResponsibleDTO
): Promise<Responsible> {
  const response = await api.put(`/responsibles/${id}`, data);
  return response.data;
}

export async function deleteResponsible(id: number, userId: number): Promise<void> {
  const response = await api.delete(`/responsibles/${id}`, {
    data: { userId },
  });
  return response.data;
}
