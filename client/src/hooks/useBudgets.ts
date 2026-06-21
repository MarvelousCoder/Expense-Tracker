// src/hooks/useBudgets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { budgetService, CreateBudgetData } from "@/services/budget.service"
import { toast } from "sonner"

export const BUDGET_KEYS = {
    all: ["budgets"] as const,
}

export function useBudgets() {
    return useQuery({
        queryKey: BUDGET_KEYS.all,
        queryFn: budgetService.getAll,
    })
}

export function useCreateBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateBudgetData) => budgetService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            toast.success("Budget created")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create budget")
        },
    })
}

// Only name, amount, and alert_threshold are editable —
// category and period are fixed at creation since changing them
// would invalidate the existing spent/remaining calculation.
export function useUpdateBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetData> }) =>
            budgetService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            toast.success("Budget updated")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update budget")
        },
    })
}

export function useDeleteBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => budgetService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            toast.success("Budget deleted")
        },
    })
}