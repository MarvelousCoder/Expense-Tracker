// src/services/transaction.service.ts
import api from "@/lib/api"

export interface Transaction {
    id: string
    user_id: string
    account_id: string
    account_name: string
    category_id: string | null
    category_name: string | null
    category_icon: string | null
    category_color: string | null
    amount: number
    amount_display: number
    transaction_type: "income" | "expense" | "transfer"
    payment_method: string
    description: string
    notes: string | null
    date: string
    is_recurring: boolean
    is_verified: boolean
    created_at: string
}

export interface TransactionListResponse {
    items: Transaction[]
    total: number
    page: number
    per_page: number
    total_pages: number
}

export interface DashboardSummary {
    total_balance: number
    monthly_income: number
    monthly_expenses: number
    total_savings: number
    income_change_pct: number
    expense_change_pct: number
}

export interface AnalyticsSummary {
    year: number
    monthly: Array<{
        month: number
        income: number
        expense: number
    }>
    categories: Array<{
        name: string
        icon: string
        color: string
        amount: number
    }>
}

export interface CreateTransactionData {
    account_id: string
    amount: number
    transaction_type: "income" | "expense" | "transfer"
    payment_method: string
    description: string
    notes?: string
    date: string
    category_id?: string
    is_recurring?: boolean
}

export interface TransactionFilters {
    page?: number
    per_page?: number
    transaction_type?: string
    account_id?: string
    category_id?: string
    start_date?: string
    end_date?: string
    search?: string
}

export const transactionService = {
    getAll: (filters: TransactionFilters = {}) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params.append(key, String(value))
            }
        })
        const query = params.toString()
        return api.get<TransactionListResponse>(
            `/transactions${query ? `?${query}` : ""}`
        )
    },

    create: (data: CreateTransactionData) =>
        api.post<Transaction>("/transactions", {
            ...data,
            amount: Math.round(data.amount * 100), // convert to paise
        }),

    update: (id: string, data: Partial<CreateTransactionData>) =>
        api.patch<Transaction>(`/transactions/${id}`, data),

    delete: (id: string) => api.delete(`/transactions/${id}`),

    getDashboardSummary: () =>
        api.get<DashboardSummary>("/transactions/dashboard"),

    getAnalyticsSummary: (year?: number) =>
        api.get<AnalyticsSummary>(
            `/transactions/analytics/summary${year ? `?year=${year}` : ""}`
        ),

    exportCSV: async () => {
        const token = localStorage.getItem("access_token")
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/export/csv`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "transactions.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    },
}