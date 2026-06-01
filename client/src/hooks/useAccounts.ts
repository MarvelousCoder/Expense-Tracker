// src/hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { accountService, CreateAccountData } from "@/services/account.service"
import { toast } from "sonner"

export const ACCOUNT_KEYS = {
    all: ["accounts"] as const,
}

export function useAccounts() {
    return useQuery({
        queryKey: ACCOUNT_KEYS.all,
        queryFn: accountService.getAll,
    })
}

export function useCreateAccount() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateAccountData) => accountService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all })
            toast.success("Account created")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create account")
        },
    })
}