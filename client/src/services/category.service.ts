// src/services/category.service.ts
import api from "@/lib/api"

export interface Category {
    id: string
    name: string
    icon: string
    color: string
    user_id: string | null
}

export const categoryService = {
    getAll: () => api.get<Category[]>("/categories"),
}