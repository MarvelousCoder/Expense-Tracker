// src/services/account.service.ts
import api from "@/lib/api"

export interface Account {
    id: string
    name: string
    account_type: string
    balance: number
    balance_display: number
    currency: string
    color: string
    icon: string
    is_default: boolean
    is_active: boolean
}

export interface CreateAccountData {
    name: string
    account_type: string
    balance: number
    currency: string
    color: string
    icon: string
    is_default: boolean
}

export const accountService = {
    getAll: () => api.get<Account[]>("/accounts"),
    create: (data: CreateAccountData) => api.post<Account>("/accounts", data),
    update: (id: string, data: Partial<CreateAccountData>) =>
        api.patch<Account>(`/accounts/${id}`, data),
    delete: (id: string) => api.delete(`/accounts/${id}`),
}