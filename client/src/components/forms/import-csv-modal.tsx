// src/components/forms/import-csv-modal.tsx
"use client"

import { useState, useRef, useCallback } from "react"
import Papa from "papaparse"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { toast } from "sonner"
import { useAccounts, useCreateAccount } from "@/hooks/useAccounts"
import { useQueryClient } from "@tanstack/react-query"
import { TRANSACTION_KEYS } from "@/hooks/useTransactions"
import { BUDGET_KEYS } from "@/hooks/useBudgets"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedRow {
    id: number
    date: string
    description: string
    amount: number
    transaction_type: "income" | "expense"
    category_id: string | undefined
    category_name: string | undefined
    selected: boolean
    raw: Record<string, string>
}

interface ColumnMapping {
    date: string
    description: string
    amount: string
    debit: string
    credit: string
    type: string
    category: string
    mode: "single" | "split"  // single = one amount column, split = separate debit/credit
}

// ─── Smart column guesser ─────────────────────────────────────────────────────
// Tries to detect which CSV column maps to which field by matching common bank header names
function guessColumnMapping(headers: string[]): ColumnMapping {
    const lower = headers.map((h) => h.toLowerCase().trim())

    const find = (keywords: string[]) =>
        headers[lower.findIndex((h) => keywords.some((k) => h.includes(k)))] ?? ""

    const dateCol = find(["date"])
    const descCol = find(["narration", "description", "remarks", "particulars", "details", "transaction"])
    const amountCol = find(["amount"])
    const debitCol = find(["debit", "withdrawal", "dr"])
    const creditCol = find(["credit", "deposit", "cr"])
    const typeCol = find(["type", "txn type", "transaction type"])
    const categoryCol = find(["category", "cat"])

    // If both debit and credit columns exist → split mode
    const mode = debitCol && creditCol ? "split" : "single"

    return {
        date: dateCol,
        description: descCol,
        amount: amountCol,
        debit: debitCol,
        credit: creditCol,
        type: typeCol,
        category: categoryCol,
        mode,
    }
}

// ─── Date parser ──────────────────────────────────────────────────────────────
// Handles common Indian bank date formats: DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, YYYY-MM-DD
function parseDate(raw: string): string {
    if (!raw) return new Date().toISOString().split("T")[0]
    const clean = raw.trim()

    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean

    // DD/MM/YYYY or DD-MM-YYYY (most Indian banks)
    const parts = clean.split(/[\/\-]/)
    if (parts.length === 3) {
        const [a, b, c] = parts
        if (c.length === 4) {
            // DD/MM/YYYY
            return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`
        }
        if (a.length === 4) {
            // YYYY-MM-DD
            return `${a}-${b.padStart(2, "0")}-${c.padStart(2, "0")}`
        }
    }
    // Fallback
    return new Date().toISOString().split("T")[0]
}

// ─── Amount parser ────────────────────────────────────────────────────────────
function parseAmount(raw: string): number {
    if (!raw || raw.trim() === "") return 0
    // Remove currency symbols, commas, spaces
    const clean = raw.replace(/[₹$,\s]/g, "").trim()
    return Math.abs(parseFloat(clean) || 0)
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ["Upload", "Account", "Map Columns", "Preview", "Done"] as const
type Step = typeof STEPS[number]

export function ImportCSVModal({ open, onOpenChange }: Props) {
    const { data: accounts = [] } = useAccounts()
    const { data: categories = [] } = useCategories()
    const { mutateAsync: createAccount } = useCreateAccount()
    const queryClient = useQueryClient()

    // Step tracking
    const [step, setStep] = useState<Step>("Upload")

    // Step 1 — Upload
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvRawData, setCsvRawData] = useState<Record<string, string>[]>([])
    const [fileName, setFileName] = useState("")
    const fileRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)

    // Step 2 — Account
    const [selectedAccountId, setSelectedAccountId] = useState("")
    const [creatingAccount, setCreatingAccount] = useState(false)
    const [newAccountName, setNewAccountName] = useState("")
    const [newAccountType, setNewAccountType] = useState("savings")
    const [showNewAccountForm, setShowNewAccountForm] = useState(false)

    // Step 3 — Column mapping
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: "", description: "", amount: "", debit: "", credit: "",
        type: "", category: "", mode: "single"
    })

    // Step 4 — Preview
    const [rows, setRows] = useState<ParsedRow[]>([])

    // Step 5 — Importing
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null)

    const reset = () => {
        setStep("Upload")
        setCsvHeaders([])
        setCsvRawData([])
        setFileName("")
        setSelectedAccountId("")
        setNewAccountName("")
        setNewAccountType("savings")
        setShowNewAccountForm(false)
        setMapping({ date: "", description: "", amount: "", debit: "", credit: "", type: "", category: "", mode: "single" })
        setRows([])
        setImportResult(null)
    }

    // ── Step 1: Parse CSV file ────────────────────────────────────────────────
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file")
            return
        }

        setUploading(true)
        setFileName(file.name)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = (results.meta.fields ?? []).filter((h) => h.trim() !== "")
                const data = results.data as Record<string, string>[]

                if (headers.length === 0 || data.length === 0) {
                    toast.error("CSV file is empty or has no headers")
                    setUploading(false)
                    return
                }

                setCsvHeaders(headers)
                setCsvRawData(data)
                setMapping(guessColumnMapping(headers))
                setUploading(false)
                setStep("Account")
            },
            error: () => {
                toast.error("Failed to parse CSV file")
                setUploading(false)
            }
        })
    }

    // ── Step 2: Create new account inline ────────────────────────────────────
    const handleCreateAccount = async () => {
        if (!newAccountName.trim()) return
        setCreatingAccount(true)
        try {
            const created = await createAccount({
                name: newAccountName.trim(),
                account_type: newAccountType,
                balance: 0,
                currency: "INR",
                color: "#6366F1",
                icon: "wallet",
                is_default: false,
            })
            setSelectedAccountId((created as any).id)
            setShowNewAccountForm(false)
            setNewAccountName("")
            toast.success(`Account "${newAccountName.trim()}" created`)
        } catch {
            toast.error("Failed to create account")
        } finally {
            setCreatingAccount(false)
        }
    }

    // ── Step 3 → 4: Apply mapping and parse all rows ──────────────────────────
    // Normalize mapping values — "__none__" from the Select "None" option 
    // is treated as empty/unset throughout the parsing logic
    const getCol = (col: string) => (col === "__none__" ? "" : col)
    const applyMappingAndPreview = () => {
        const dateCol = getCol(mapping.date)
        const descCol = getCol(mapping.description)
        const amountCol = getCol(mapping.amount)
        const debitCol = getCol(mapping.debit)
        const creditCol = getCol(mapping.credit)
        const typeCol = getCol(mapping.type)
        const categoryCol = getCol(mapping.category)

        if (!dateCol || !descCol) {
            toast.error("Please map at least the Date and Description columns")
            return
        }
        if (mapping.mode === "single" && !amountCol) {
            toast.error("Please map the Amount column")
            return
        }
        if (mapping.mode === "split" && (!debitCol || !creditCol)) {
            toast.error("Please map both Debit and Credit columns")
            return
        }

        const categoryMap = new Map(
            categories.map((c) => [c.name.toLowerCase().trim(), c.id])
        )

        const parsed: ParsedRow[] = csvRawData.map((row, i) => {
            const date = parseDate(row[dateCol] ?? "")
            const description = (row[descCol] ?? "").trim() || "Imported transaction"

            let amount = 0
            let transaction_type: "income" | "expense" = "expense"

            if (mapping.mode === "split") {
                const debit = parseAmount(row[debitCol] ?? "")
                const credit = parseAmount(row[creditCol] ?? "")
                if (credit > 0 && debit === 0) {
                    amount = credit
                    transaction_type = "income"
                } else {
                    amount = debit
                    transaction_type = "expense"
                }
            } else {
                const raw = row[amountCol] ?? ""
                amount = parseAmount(raw)
                const isCredit = raw.includes("Cr") || raw.trim().startsWith("-")
                transaction_type = isCredit ? "income" : "expense"
            }

            // Override type from explicit Type column if present
            // This fixes income rows being detected as expense when the
            // amount has no special formatting to indicate direction
            if (typeCol && row[typeCol]) {
                const rawType = row[typeCol].toLowerCase().trim()
                if (rawType === "income" || rawType === "credit") {
                    transaction_type = "income"
                } else if (rawType === "expense" || rawType === "debit") {
                    transaction_type = "expense"
                }
            }

            // Match category name from CSV to real category ID
            let category_id: string | undefined
            let category_name: string | undefined
            if (categoryCol && row[categoryCol]) {
                const csvCatName = row[categoryCol].trim()
                const matchedId = categoryMap.get(csvCatName.toLowerCase())
                if (matchedId) {
                    category_id = matchedId
                    category_name = csvCatName
                }
            }

            return {
                id: i,
                date,
                description,
                amount,
                transaction_type,
                category_id,
                category_name,
                selected: amount > 0,
                raw: row,
            }
        }).filter((r) => r.amount > 0)

        if (parsed.length === 0) {
            toast.error("No valid transactions found. Check your column mapping.")
            return
        }

        setRows(parsed)
        setStep("Preview")
    }

    // ── Step 4 → 5: Import selected rows ─────────────────────────────────────
    const handleImport = async () => {
        const selected = rows.filter((r) => r.selected)
        if (selected.length === 0) {
            toast.error("Select at least one transaction to import")
            return
        }

        setImporting(true)
        try {
            const payload = {
                transactions: selected.map((r) => ({
                    account_id: selectedAccountId,
                    amount: Math.round(r.amount * 100),  // convert to paise
                    transaction_type: r.transaction_type,
                    payment_method: "bank",
                    description: r.description,
                    date: r.date,
                    category_id: r.category_id,
                }))
            }

            const result = await api.post<any>("/transactions/bulk", payload)
            setImportResult({ imported: result.imported, failed: result.failed })

            // Refresh transactions, dashboard, budgets
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
            queryClient.invalidateQueries({ queryKey: ["analytics"] })

            setStep("Done")
        } catch {
            toast.error("Import failed. Please try again.")
        } finally {
            setImporting(false)
        }
    }

    const selectedCount = rows.filter((r) => r.selected).length

    // All column mapping fields including the new type and category
    const mappingFields = [
        { key: "date", label: "Date column", required: true },
        { key: "description", label: "Description column", required: true },
        ...(mapping.mode === "single"
            ? [{ key: "amount", label: "Amount column", required: true }]
            : [
                { key: "debit", label: "Debit column", required: true },
                { key: "credit", label: "Credit column", required: true },
            ]
        ),
        { key: "type", label: "Type column (optional)", required: false },
        { key: "category", label: "Category column (optional)", required: false },
    ]

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Bank Statement</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file from any bank to import transactions
                    </DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-1 py-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-1">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                step === s
                                    ? "bg-primary text-primary-foreground"
                                    : STEPS.indexOf(step) > i
                                        ? "bg-green-500 text-white"
                                        : "bg-muted text-muted-foreground"
                            )}>
                                {STEPS.indexOf(step) > i ? <Check className="w-3 h-3" /> : i + 1}
                            </div>
                            <span className={cn(
                                "text-xs hidden sm:block",
                                step === s ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>{s}</span>
                            {i < STEPS.length - 1 && (
                                <div className={cn(
                                    "h-px w-4 mx-1",
                                    STEPS.indexOf(step) > i ? "bg-green-500" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto py-2 space-y-4">

                    {/* ── Step 1: Upload ── */}
                    {step === "Upload" && (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                            onClick={() => fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                                aria-label="Upload CSV Bank Statement"
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Reading file...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Click to upload a CSV file</p>
                                    <p className="text-xs text-muted-foreground">
                                        Works with HDFC, SBI, ICICI, Axis, Kotak, or any bank CSV export
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Account ── */}
                    {step === "Account" && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-1">
                                    {csvRawData.length} rows detected from {fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Which account do these transactions belong to?
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Select account</Label>
                                <Select value={selectedAccountId} onValueChange={(v) => {
                                    if (v === "__new__") {
                                        setShowNewAccountForm(true)
                                        setSelectedAccountId("")
                                    } else {
                                        setSelectedAccountId(v)
                                        setShowNewAccountForm(false)
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name} ({a.account_type})
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__new__">
                                            + Create new account
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {showNewAccountForm && (
                                <Card className="p-4 space-y-3 border-primary/30">
                                    <p className="text-sm font-medium">New account</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Account name</Label>
                                            <Input
                                                placeholder="e.g. HDFC Savings"
                                                value={newAccountName}
                                                onChange={(e) => setNewAccountName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Account type</Label>
                                            <Select value={newAccountType} onValueChange={setNewAccountType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="savings">Savings</SelectItem>
                                                    <SelectItem value="current">Current</SelectItem>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                                    <SelectItem value="investment">Investment</SelectItem>
                                                    <SelectItem value="wallet">Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleCreateAccount}
                                        disabled={creatingAccount || !newAccountName.trim()}
                                    >
                                        {creatingAccount
                                            ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Creating...</>
                                            : "Create Account"
                                        }
                                    </Button>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: Column Mapping ── */}
                    {step === "Map Columns" && (
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                {/* We auto-detected column mappings based on your bank's header names.
                                Review and adjust if anything looks wrong. */}
                                We auto-detected column mappings based on your bank&apos;s header names.
                            </p>

                            {/* Mode toggle */}
                            <div className="flex items-center gap-3">
                                <Label>Amount format</Label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={mapping.mode === "single" ? "default" : "outline"}
                                        onClick={() => setMapping((m) => ({ ...m, mode: "single" }))}
                                    >
                                        Single column
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={mapping.mode === "split" ? "default" : "outline"}
                                        onClick={() => setMapping((m) => ({ ...m, mode: "split" }))}
                                    >
                                        Debit / Credit
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: "date", label: "Date column" },
                                    { key: "description", label: "Description column" },
                                    ...(mapping.mode === "single"
                                        ? [{ key: "amount", label: "Amount column" }]
                                        : [
                                            { key: "debit", label: "Debit column" },
                                            { key: "credit", label: "Credit column" },
                                        ]
                                    ),
                                    { key: "type", label: "Type column (optional)" },
                                    { key: "category", label: "Category column (optional)" },
                                ].map(({ key, label }) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label>{label}</Label>
                                        <Select
                                            value={(mapping as any)[key]}
                                            onValueChange={(v) => setMapping((m) => ({ ...m, [key]: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">None</SelectItem>
                                                {csvHeaders.filter((h) => h.trim() !== "").map((h) => (
                                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>

                            {/* Preview of first 3 raw rows */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    First 3 rows from your file:
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="text-xs w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                {csvHeaders.filter((h) => h.trim() !== "").map((h) => (
                                                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvRawData.slice(0, 3).map((row, i) => (
                                                <tr key={i} className="border-b border-border last:border-0">
                                                    {csvHeaders.filter((h) => h.trim() !== "").map((h) => (
                                                        <td key={h} className="px-3 py-2 text-muted-foreground whitespace-nowrap max-w-32 truncate">
                                                            {row[h]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Preview ── */}
                    {step === "Preview" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {selectedCount} of {rows.length} transactions selected
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRows((r) => r.map((row) => ({ ...row, selected: true })))}
                                    >
                                        Select all
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRows((r) => r.map((row) => ({ ...row, selected: false })))}
                                    >
                                        Deselect all
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-border max-h-80">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-background">
                                        <tr className="border-b border-border">
                                            <th className="px-3 py-2 w-8"></th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                                        </tr>
                                        
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className={cn(
                                                    "border-b border-border last:border-0 cursor-pointer transition-colors",
                                                    row.selected ? "hover:bg-muted/30" : "opacity-40 hover:opacity-60"
                                                )}
                                                onClick={() => setRows((r) =>
                                                    r.map((r2) => r2.id === row.id ? { ...r2, selected: !r2.selected } : r2)
                                                )}
                                            >
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={row.selected}
                                                        onChange={() => { }}
                                                        className="rounded"
                                                        aria-label={`Select transaction: ${row.description}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                                                    {row.date}
                                                </td>
                                                <td className="px-3 py-2 max-w-48 truncate">
                                                    {row.description}
                                                </td>
                                                <td className="px-3 py-2 text-xs text-muted-foreground">
                                                    {row.category_name ?? (
                                                        <span className="text-muted-foreground/50">Uncategorized</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-xs border-0 capitalize",
                                                            row.transaction_type === "income"
                                                                ? "bg-green-500/10 text-green-600"
                                                                : "bg-red-500/10 text-red-600"
                                                        )}
                                                    >
                                                        {row.transaction_type}
                                                    </Badge>
                                                </td>
                                                <td className={cn(
                                                    "px-3 py-2 text-right font-medium whitespace-nowrap",
                                                    row.transaction_type === "income"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                )}>
                                                    ₹{row.amount.toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Step 5: Done ── */}
                    {step === "Done" && importResult && (
                        <div className="text-center py-8 space-y-3">
                            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <Check className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="text-lg font-semibold">Import complete</p>
                            <p className="text-sm text-muted-foreground">
                                {importResult.imported} transactions imported successfully
                                {importResult.failed > 0 && ` · ${importResult.failed} failed`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <DialogFooter className="flex-row gap-2 sm:justify-between">
                    <div>
                        {step !== "Upload" && step !== "Done" && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const idx = STEPS.indexOf(step)
                                    setStep(STEPS[idx - 1])
                                }}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
                            {step === "Done" ? "Close" : "Cancel"}
                        </Button>

                        {step === "Account" && (
                            <Button
                                onClick={() => setStep("Map Columns")}
                                disabled={!selectedAccountId}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}

                        {step === "Map Columns" && (
                            <Button onClick={applyMappingAndPreview}>
                                Preview
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}

                        {step === "Preview" && (
                            <Button
                                onClick={handleImport}
                                disabled={importing || selectedCount === 0}
                            >
                                {importing
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</>
                                    : `Import ${selectedCount} transactions`
                                }
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}