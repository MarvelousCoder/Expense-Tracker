// src/components/forms/edit-transaction-modal.tsx
"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useUpdateTransaction } from "@/hooks/useTransactions"
import { useAccounts } from "@/hooks/useAccounts"
import { useCategories } from "@/hooks/useCategories"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CATEGORY_SORT_ORDER, PAYMENT_METHODS } from "@/constants"
import { Transaction } from "@/services/transaction.service"

const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value) as
    ["upi", "card", "net_banking", "cash", "bank"]

const schema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.preprocess(
        (val) => Number(val),
        z.number().positive("Amount must be positive")
    ),
    transaction_type: z.enum(["income", "expense", "transfer"]),
    payment_method: z.enum(PAYMENT_METHOD_VALUES),
    account_id: z.string().min(1, "Select an account"),
    category_id: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
    transaction: Transaction | null
    onOpenChange: (open: boolean) => void
}

export function EditTransactionModal({ transaction, onOpenChange }: Props) {
    const { user } = useAuthStore()
    const { data: accounts = [] } = useAccounts()
    const { data: categories = [] } = useCategories()
    const { mutate: updateTransaction, isPending } = useUpdateTransaction()
    const symbol = user?.currency === "USD" ? "$" : "₹"

    const form = useForm<FormData>({
        resolver: zodResolver(schema) as Resolver<FormData>,
        defaultValues: {
            transaction_type: "expense",
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
            account_id: "",
            category_id: "",
            notes: "",
        },
    })

    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = form
    const transactionType = watch("transaction_type")

    // Pre-fill form whenever a transaction is selected for editing
    useEffect(() => {
        if (transaction) {
            reset({
                description: transaction.description,
                amount: transaction.amount_display,
                transaction_type: transaction.transaction_type,
                payment_method: transaction.payment_method as FormData["payment_method"],
                account_id: transaction.account_id,
                category_id: transaction.category_id ?? "",
                date: transaction.date,
                notes: transaction.notes ?? "",
            })
        }
    }, [transaction, reset])

    // Sort categories by fixed priority order — same as Add modal
    const sortedCategories = [...categories].sort((a, b) => {
        const ai = CATEGORY_SORT_ORDER.indexOf(a.name as any)
        const bi = CATEGORY_SORT_ORDER.indexOf(b.name as any)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })

    const onSubmit = (data: FormData) => {
        if (!transaction) return
        updateTransaction(
            {
                id: transaction.id,
                data: {
                    ...data,
                    category_id: data.category_id || undefined,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={!!transaction} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Update the details of this transaction.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Transaction type toggle */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
                        {(["expense", "income", "transfer"] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setValue("transaction_type", type)}
                                className={cn(
                                    "py-1.5 px-2 rounded-md text-sm font-medium capitalize transition-all",
                                    transactionType === type
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label>Amount ({symbol})</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register("amount", { valueAsNumber: true })}
                            className={errors.amount ? "border-destructive" : ""}
                        />
                        {errors.amount && (
                            <p className="text-destructive text-xs">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g. Swiggy order, Salary"
                            {...register("description")}
                            className={errors.description ? "border-destructive" : ""}
                        />
                        {errors.description && (
                            <p className="text-destructive text-xs">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Account + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Account</Label>
                            <Select
                                value={watch("account_id")}
                                onValueChange={(v) => setValue("account_id", v)}
                            >
                                <SelectTrigger className={errors.account_id ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_id && (
                                <p className="text-destructive text-xs">{errors.account_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select
                                value={watch("category_id")}
                                onValueChange={(v) => setValue("category_id", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortedCategories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.icon} {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date + Payment method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                {...register("date")}
                                className={errors.date ? "border-destructive" : ""}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Payment method</Label>
                            <Select
                                value={watch("payment_method")}
                                onValueChange={(v) => setValue("payment_method", v as any)}
                            >
                                <SelectTrigger className={errors.payment_method ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                        <Input placeholder="Any additional notes" {...register("notes")} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                                : "Save Changes"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}