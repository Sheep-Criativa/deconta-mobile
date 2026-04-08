import api from "@/shared/services/api";

export interface Category {
    id: number;
    userId: number;
    name: string;
    icon?: string | null;
    color?: string | null;
    parentCategoryId?: number | null;
    type: "INCOME" | "EXPENSE";
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryDTO {
    userId: number;
    name: string;
    icon?: string;
    color?: string;
    parentCategoryId?: number;
    type: "INCOME" | "EXPENSE";
}

export interface UpdateCategoryDTO {
    name?: string;
    icon?: string;
    color?: string;
    parentCategoryId?: number;
    type?: "INCOME" | "EXPENSE";
}

export async function getCategories(userId: number): Promise<Category[]> {
    console.log('[category.service] getCategories - userId:', userId);
    const response = await api.get(`/categories/${userId}`);
    console.log('[category.service] getCategories - response.data:', JSON.stringify(response.data));
    return response.data;
}

export async function createCategory(data: CreateCategoryDTO): Promise<Category> {
    console.log('[category.service] createCategory - data:', JSON.stringify(data));
    const response = await api.post("/categories", data);
    console.log('[category.service] createCategory - response.data:', JSON.stringify(response.data));
    return response.data;
}

export async function updateCategory(id: number, data: UpdateCategoryDTO): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
}

export async function deleteCategory(id: number, userId: number): Promise<void> {
    await api.delete(`/categories/${id}`, {
        data: { userId }, // Delete schema requires userId in body
    });
}