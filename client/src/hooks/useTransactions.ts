// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionService, TransactionFilters, CreateTransactionData } from "@/services/transaction.service"
import { toast } from "sonner"

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
            toast.success("Transaction added successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add transaction")
        },
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => transactionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
            toast.success("Transaction deleted")
        },
    })
}