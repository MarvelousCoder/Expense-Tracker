// // src/components/forms/add-transaction-modal.tsx
// "use client"

// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import {
//     Dialog, DialogContent, DialogHeader,
//     DialogTitle, DialogFooter,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//     Select, SelectContent, SelectItem,
//     SelectTrigger, SelectValue,
// } from "@/components/ui/select"
// import { Loader2 } from "lucide-react"
// import { aiService } from "@/services/ai.service"
// import { Sparkles } from "lucide-react"
// import { useCallback, useRef, useState } from "react"
// import { useCreateTransaction } from "@/hooks/useTransactions"
// import { useAccounts } from "@/hooks/useAccounts"
// import { useCategories } from "@/hooks/useCategories"
// import { useAuthStore } from "@/store/auth.store"
// import { cn } from "@/lib/utils"
// import { format } from "date-fns"
// import { DialogDescription } from "@/components/ui/dialog"
// import { motion } from "framer-motion"

// const schema = z.object({
//     description: z.string().min(1, "Description is required"),
//     amount: z.coerce
//     .number()
//     .positive("Amount must be positive"),
//     transaction_type: z.enum(["income", "expense", "transfer"]),
//     payment_method: z.enum(["cash", "upi", "card", "net_banking", "wallet", "other"]),
//     account_id: z.string().min(1, "Select an account"),
//     category_id: z.string().optional(),
//     date: z.string().min(1, "Date is required"),
//     notes: z.string().optional(),
// })

// type FormData = z.infer<typeof schema>

// interface Props {
//     open: boolean
//     onOpenChange: (open: boolean) => void
// }

// export function AddTransactionModal({ open, onOpenChange }: Props) {
//     const { user } = useAuthStore()
//     const { data: accounts = [] } = useAccounts()
//     const { data: categories = [] } = useCategories()
//     const { mutate: createTransaction, isPending } = useCreateTransaction()
//     const symbol = user?.currency === "USD" ? "$" : "₹"
//     const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
//     const [aiLoading, setAiLoading] = useState(false)
//     const debounceRef = useRef<NodeJS.Timeout>()

//     const {
//         register,
//         handleSubmit,
//         setValue,
//         watch,
//         reset,
//         formState: { errors },
//     } = useForm<FormData>({
//         resolver: zodResolver(schema) as any,
//         defaultValues: {
//             transaction_type: "expense",
//             payment_method: "upi",
//             date: format(new Date(), "yyyy-MM-dd"),
//         },
//     })

//     const transactionType = watch("transaction_type")

//     const onSubmit = (data: FormData) => {
//         createTransaction(
//             {
//                 ...data,
//                 amount: data.amount,
//                 category_id: data.category_id || undefined,
//             },
//             {
//                 onSuccess: () => {
//                     reset()
//                     onOpenChange(false)
//                 },
//             }
//         )
//     }


// const handleDescriptionChange = useCallback(
//     async (value: string) => {
//         if (value.length < 3) return
//         clearTimeout(debounceRef.current)
//         debounceRef.current = setTimeout(async () => {
//             setAiLoading(true)
//             try {
//                 // FIXED: Pass "amount" into watch to explicitly fetch the amount field value
//                 const amount = watch("amount") || 0
//                 const result = await aiService.categorize(value, amount)
//                 setAiSuggestion(result.category)
//             } catch {
//                 // silent fail
//             } finally {
//                 setAiLoading(false)
//             }
//         }, 600)
//     },
//     [watch]
// )

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-md">
//                 <DialogHeader>
//                     <DialogTitle>Add Transaction</DialogTitle>
//                     <DialogDescription>
//                         Fill in the details below to record a new transaction.
//                     </DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     {/* Transaction type toggle */}
//                     <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
//                         {(["expense", "income", "transfer"] as const).map((type) => (
//                             <button
//                                 key={type}
//                                 type="button"
//                                 onClick={() => setValue("transaction_type", type)}
//                                 className={cn(
//                                     "py-1.5 px-2 rounded-md text-sm font-medium capitalize transition-all",
//                                     transactionType === type
//                                         ? "bg-background shadow-sm text-foreground"
//                                         : "text-muted-foreground hover:text-foreground"
//                                 )}
//                             >
//                                 {type}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Amount */}
//                     <div className="space-y-1.5">
//                         <Label>Amount ({symbol})</Label>
//                         <Input
//                             type="number"
//                             step="0.01"
//                             placeholder="0.00"
//                             {...register("amount", { valueAsNumber: true })}
//                             className={errors.amount ? "border-destructive" : ""}
//                         />
//                         {errors.amount && (
//                             <p className="text-destructive text-xs">{errors.amount.message}</p>
//                         )}
//                     </div>

//                     {/* Description */}
//                     <div className="space-y-1.5">
//                         <Label>Description</Label>
//                         <Input
//                             placeholder="e.g. Swiggy order, Salary"
//                             {...register("description")}
//                             onChange={(e) => {
//                                 register("description").onChange(e)
//                                 handleDescriptionChange(e.target.value)
//                             }}
//                             className={errors.description ? "border-destructive" : ""}
//                         />

//                         {/* AI suggestion badge */}
//                         {aiSuggestion && (
//                             <motion.div
//                                 initial={{ opacity: 0, y: -4 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="flex items-center gap-1.5 mt-1"
//                             >
//                                 <Sparkles className="w-3 h-3 text-primary" />
//                                 <span className="text-xs text-muted-foreground">
//                                     AI suggests:{" "}
//                                     <button
//                                         type="button"
//                                         className="text-primary font-medium hover:underline"
//                                         onClick={() => {
//                                             setValue("category_id",
//                                                 categories.find(c => c.name === aiSuggestion)?.id || ""
//                                             )
//                                         }}
//                                     >
//                                         {aiSuggestion}
//                                     </button>
//                                 </span>
//                                 {aiLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
//                             </motion.div>
//                         )}
//                         {errors.description && (
//                             <p className="text-destructive text-xs">{errors.description.message}</p>
//                         )}
//                     </div>

//                     {/* Account + Category */}
//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1.5">
//                             <Label>Account</Label>
//                             <Select onValueChange={(v) => setValue("account_id", v)}>
//                                 <SelectTrigger className={errors.account_id ? "border-destructive" : ""}>
//                                     <SelectValue placeholder="Select" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {accounts.map((a) => (
//                                         <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             {errors.account_id && (
//                                 <p className="text-destructive text-xs">{errors.account_id.message}</p>
//                             )}
//                         </div>

//                         <div className="space-y-1.5">
//                             <Label>Category</Label>
//                             <Select onValueChange={(v) => setValue("category_id", v)}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {categories.map((c) => (
//                                         <SelectItem key={c.id} value={c.id}>
//                                             {c.icon} {c.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     {/* Date + Payment method */}
//                     <div className="grid grid-cols-2 gap-3">
//                         <div className="space-y-1.5">
//                             <Label>Date</Label>
//                             <Input
//                                 type="date"
//                                 {...register("date")}
//                                 className={errors.date ? "border-destructive" : ""}
//                             />
//                         </div>

//                         <div className="space-y-1.5">
//                             <Label>Payment method</Label>
//                             <Select
//                                 defaultValue="upi"
//                                 onValueChange={(v) => setValue("payment_method", v as any)}
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {["cash", "upi", "card", "net_banking", "wallet", "other"].map((m) => (
//                                         <SelectItem key={m} value={m} className="capitalize">
//                                             {m.replace("_", " ")}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     {/* Notes */}
//                     <div className="space-y-1.5">
//                         <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
//                         <Input placeholder="Any additional notes" {...register("notes")} />
//                     </div>

//                     <DialogFooter>
//                         <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => onOpenChange(false)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button type="submit" disabled={isPending}>
//                             {isPending
//                                 ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
//                                 : "Add Transaction"
//                             }
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }

// client/src/components/forms/add-transaction-modal.tsx
"use client"

import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { aiService } from "@/services/ai.service"
import { Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useCreateTransaction } from "@/hooks/useTransactions"
import { useAccounts } from "@/hooks/useAccounts"
import { useCategories } from "@/hooks/useCategories"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DialogDescription } from "@/components/ui/dialog"
import { AnimatePresence, motion } from "framer-motion"
import { CATEGORY_SORT_ORDER, PAYMENT_METHODS } from "@/constants"

// Payment method values must match backend enum
const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value) as
    ["upi", "card", "net_banking", "cash", "bank"]

const schema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.preprocess((val) => Number(val), z.number().positive("Amount must be positive")),
    transaction_type: z.enum(["income", "expense", "transfer"]),
    payment_method: z.enum(PAYMENT_METHOD_VALUES),
    account_id: z.string().min(1, "Select an account"),
    category_id: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// Pre-fill data shape — used when opening this modal from OCR receipt scan
// or any other source that wants to pre-populate the form.
export interface InitialTransactionData {
    description?: string
    amount?: number
    date?: string
    category_hint?: string  // category NAME from OCR, matched to category_id below
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: InitialTransactionData | null
}

export function AddTransactionModal({ open, onOpenChange, initialData }: Props) {
    const { user } = useAuthStore()
    const { data: accounts = [] } = useAccounts()
    const { data: categories = [] } = useCategories()
    const { mutate: createTransaction, isPending } = useCreateTransaction()
    const symbol = user?.currency === "USD" ? "$" : "₹"
    // const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
    // AI description suggestions — list of suggested description strings
    const [descSuggestions, setDescSuggestions] = useState<string[]>([])
    const [aiLoading, setAiLoading] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // FIXED: Explicitly typed the resolver and useForm hook structure together
    const form = useForm<FormData>({
        resolver: zodResolver(schema) as Resolver<FormData>,
        defaultValues: {
            transaction_type: "expense",
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
            account_id: "",
            category_id: "",
            notes: ""
        },
    })

    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = form
    const transactionType = watch("transaction_type")
    const descriptionValue = watch("description")

    // Pre-fill form whenever the modal opens with initialData (e.g. from OCR scan).
    // Category is matched by name since OCR only returns a category hint string,
    // not a real category_id — falls back to no category if no match found.
    useEffect(() => {
        if (open && initialData) {
            const matchedCategory = initialData.category_hint
                ? categories.find(
                    (c) => c.name.toLowerCase() === initialData.category_hint?.toLowerCase()
                )
                : undefined

            reset({
                transaction_type: "expense",
                date: initialData.date || format(new Date(), "yyyy-MM-dd"),
                description: initialData.description || "",
                amount: initialData.amount,
                account_id: "",
                category_id: matchedCategory?.id || "",
                notes: "",
            } as FormData)
        } else if (open && !initialData) {
            // Normal "Add Transaction" open with no pre-fill — reset to blank
            reset({
                transaction_type: "expense",
                date: format(new Date(), "yyyy-MM-dd"),
                description: "",
                account_id: "",
                category_id: "",
                notes: "",
            })
        }
    }, [open, initialData, categories, reset])

    // Sort categories by fixed priority order
    const sortedCategories = [...categories].sort((a, b) => {
        const ai = CATEGORY_SORT_ORDER.indexOf(a.name as any)
        const bi = CATEGORY_SORT_ORDER.indexOf(b.name as any)
        // Unknown categories go to end
        const aIndex = ai === -1 ? 999 : ai
        const bIndex = bi === -1 ? 999 : bi
        return aIndex - bIndex
    })

    const onSubmit = (data: FormData) => {
        createTransaction(
            {
                ...data,
                amount: data.amount,
                category_id: data.category_id || undefined,
            },
            {
                onSuccess: () => {
                    reset()
                    setDescSuggestions([])
                    onOpenChange(false)
                },
            }
        )
    }

    // Fetch AI description suggestions as user types
    const handleDescriptionChange = useCallback(
        async (value: string) => {
            if (value.length < 3) {
                setDescSuggestions([])
                return
            }
            clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(async () => {
                setAiLoading(true)
                try {
                    const amount = Number(form.getValues("amount")) || 0
                    const result = await aiService.categorize(value, amount)

                    // Auto-select the suggested category in the dropdown silently
                    if (result.category) {
                        const matched = categories.find((c) => c.name === result.category)
                        if (matched) setValue("category_id", matched.id)
                    }

                    // Build description suggestions based on the category returned
                    // These are contextual completions the user might want to pick
                    const suggestions = buildDescriptionSuggestions(value, result.category)
                    setDescSuggestions(suggestions)
                } catch {
                    // silent fail — suggestions are a nice-to-have
                } finally {
                    setAiLoading(false)
                }
            }, 600)
        },
        [form, categories, setValue]
    )

    // Click a suggestion → fills the description field and clears the list
    const handleSuggestionClick = (suggestion: string) => {
        setValue("description", suggestion)
        setDescSuggestions([])
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v) { reset(); setDescSuggestions([]) }
            onOpenChange(v)
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Confirm Scanned Transaction" : "Add Transaction"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Review and edit the scanned details before saving."
                            : "Fill in the details below to record a new transaction."}
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

                    {/* Description with AI suggestions */}
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <div className="relative">
                            <Input
                                placeholder="e.g. Swiggy order, Petrol, Salary"
                                {...register("description")}
                                onChange={(e) => {
                                    register("description").onChange(e)
                                    handleDescriptionChange(e.target.value)
                                }}
                                className={errors.description ? "border-destructive" : ""}
                                autoComplete="off"
                            />
                            {aiLoading && (
                                <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        {/* AI description suggestion chips */}
                        <AnimatePresence>
                            {descSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="flex flex-wrap gap-1.5 pt-1"
                                >
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        AI suggests:
                                    </span>
                                    {descSuggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleSuggestionClick(s)}
                                            className="text-xs px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {errors.description && (
                            <p className="text-destructive text-xs">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Account + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Account</Label>
                            <Select onValueChange={(v) => setValue("account_id", v)}>
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
                            <Select onValueChange={(v) => setValue("payment_method", v as any)}>
                                <SelectTrigger className={errors.payment_method ? "border-destructive" : ""}>
                                    {/* No defaultValue — user must explicitly choose */}
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
                            {errors.payment_method && (
                                <p className="text-destructive text-xs">Select a payment method</p>
                            )}
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
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
                                : "Add Transaction"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Helper ────────────────────────────────────────────────────────────────────
// Generates contextual description suggestions based on what the user typed
// and the AI-detected category. These are clickable chips that auto-fill the field.
function buildDescriptionSuggestions(partial: string, category: string): string[] {
    const p = partial.toLowerCase()

    const categoryMap: Record<string, string[]> = {
        "Food & Dining": ["Swiggy order", "Zomato order", "Restaurant dinner", "Cafe coffee", "Food delivery"],
        "Groceries": ["BigBasket order", "DMart shopping", "Blinkit order", "Zepto order", "Grocery shopping"],
        "Fuel": ["Petrol refill", "Diesel refill", "HP petrol pump", "Indian Oil fuel"],
        "Travel": ["Uber ride", "Ola cab", "Metro card recharge", "Bus ticket", "Auto fare"],
        "Shopping": ["Amazon order", "Flipkart order", "Myntra shopping", "Mall shopping"],
        "Bills & Utilities": ["Electricity bill", "Internet bill", "Gas bill", "Water bill", "DTH recharge"],
        "Rent": ["Monthly rent", "House rent", "PG rent", "Flat rent"],
        "EMI": ["Loan EMI", "Credit card EMI", "Home loan EMI", "Car loan EMI"],
        "Subscriptions": ["Netflix subscription", "Spotify premium", "Amazon Prime", "YouTube Premium"],
        "Health": ["Medical bill", "Pharmacy", "Doctor consultation", "Gym membership"],
        "Entertainment": ["Movie ticket", "Concert ticket", "Gaming", "Streaming subscription"],
        "Education": ["Course fee", "Book purchase", "Tuition fee", "Online course"],
        "Investment": ["SIP investment", "Mutual fund", "Stock purchase", "FD deposit"],
        "Salary": ["Monthly salary", "Freelance payment", "Bonus received", "Stipend"],
        "Other": ["Miscellaneous expense", "Other payment"],
    }

    const suggestions = categoryMap[category] || categoryMap["Other"]

    // Filter suggestions that start with or contain what the user typed, prefer starts-with
    const startsWith = suggestions.filter((s) => s.toLowerCase().startsWith(p))
    const contains = suggestions.filter((s) => !s.toLowerCase().startsWith(p) && s.toLowerCase().includes(p))

    // Merge and return max 3 suggestions
    return [...startsWith, ...contains].slice(0, 3)
}