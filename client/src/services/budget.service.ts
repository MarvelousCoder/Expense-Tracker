// src/services/budget.service.ts
import api from "@/lib/api"

export interface Budget {
    id: string
    name: string
    amount: number
    amount_display: number
    period: string
    category_id: string | null
    category_name: string | null
    category_icon: string | null
    category_color: string | null
    month: number | null
    year: number | null
    alert_threshold: number
    spent: number
    remaining: number
    percentage: number
    is_exceeded: boolean
    is_alert: boolean
    is_active: boolean
}

export interface CreateBudgetData {
    name: string
    amount: number       // in paise
    period: string
    category_id?: string
    month?: number
    year?: number
    alert_threshold?: number
}

export const budgetService = {
    getAll: () => api.get<Budget[]>("/budgets"),
    create: (data: CreateBudgetData) => api.post<Budget>("/budgets", data),
    update: (id: string, data: Partial<CreateBudgetData>) =>
        api.patch<Budget>(`/budgets/${id}`, data),
    delete: (id: string) => api.delete(`/budgets/${id}`),
}