// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionService, TransactionFilters, CreateTransactionData, AnalyticsSummary } from "@/services/transaction.service"
import { toast } from "sonner"
import { BUDGET_KEYS } from "./useBudgets"

export const TRANSACTION_KEYS = {
    all: ["transactions"] as const,
    list: (filters: TransactionFilters) => ["transactions", "list", filters] as const,
    dashboard: ["transactions", "dashboard"] as const,
}

export function useDashboardSummary() {
    return useQuery({
        queryKey: TRANSACTION_KEYS.dashboard,
        queryFn: transactionService.getDashboardSummary,
    })
}

export function useTransactions(filters: TransactionFilters = {}) {
    return useQuery({
        queryKey: TRANSACTION_KEYS.list(filters),
        queryFn: () => transactionService.getAll(filters),
    })
}

export function useCreateTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateTransactionData) => transactionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
            // Refresh budgets so spent/remaining reflects the new transaction immediately
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            toast.success("Transaction added successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add transaction")
        },
    })
}

// Invalidates transactions, dashboard, analytics, and budgets,
// since amount/type/category/date can all change and affect every screen.
export function useUpdateTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) =>
            transactionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            queryClient.invalidateQueries({ queryKey: ["analytics"] })
            toast.success("Transaction updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update transaction")
        },
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => transactionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
            // Refresh budgets so spent reflects the deletion
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            toast.success("Transaction deleted")
        },
    })
}

export function useAnalyticsSummary(year?: number) {
    return useQuery({
        queryKey: ["analytics", "summary", year],
        queryFn: () => transactionService.getAnalyticsSummary(year),
    })
}