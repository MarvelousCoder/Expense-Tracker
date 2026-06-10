// src/app/(dashboard)/budgets/page.tsx
"use client"

import { useState } from "react"
import { useBudgets, useCreateBudget, useDeleteBudget } from "@/hooks/useBudgets"
import { useCategories } from "@/hooks/useCategories"
import { useAuthStore } from "@/store/auth.store"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Plus, Trash2, AlertTriangle,
    CheckCircle2, TrendingDown,
} from "lucide-react"
import { Budget } from "@/services/budget.service"
import { cn } from "@/lib/utils"

function BudgetCard({ budget, symbol, onDelete }: {
    budget: Budget
    symbol: string
    onDelete: (id: string) => void
}) {
    const statusColor = budget.is_exceeded
        ? "bg-red-500"
        : budget.is_alert
            ? "bg-yellow-500"
            : "bg-primary"

    const trackColor = budget.is_exceeded
        ? "bg-red-500/20"
        : budget.is_alert
            ? "bg-yellow-500/20"
            : "bg-primary/20"

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-5 card-hover">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${budget.category_color ?? "#6366F1"}20` }}
                        >
                            {budget.category_icon ?? "💰"}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{budget.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {budget.category_name ?? "All categories"} · {budget.period}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {budget.is_exceeded && (
                            <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-500 border-0">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Exceeded
                            </Badge>
                        )}
                        {budget.is_alert && !budget.is_exceeded && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-0">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Alert
                            </Badge>
                        )}
                        {!budget.is_alert && (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                On track
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(budget.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Amounts */}
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <p className="text-2xl font-bold">
                            {symbol}{budget.spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            of {symbol}{budget.amount_display.toLocaleString("en-IN")} budget
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {symbol}{budget.remaining.toLocaleString("en-IN")} left
                    </p>
                </div>

                {/* Progress bar */}
                <div className={cn("w-full rounded-full h-2", trackColor)}>
                    <motion.div
                        className={cn("h-2 rounded-full", statusColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, budget.percentage)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-right">
                    {budget.percentage}% used
                </p>
            </Card>
        </motion.div>
    )
}

function AddBudgetModal({ open, onOpenChange }: {
    open: boolean
    onOpenChange: (v: boolean) => void
}) {
    const { data: categories = [] } = useCategories()
    const { mutate: createBudget, isPending } = useCreateBudget()
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [period, setPeriod] = useState("monthly")
    const [threshold, setThreshold] = useState("80")

    const handleSubmit = () => {
        if (!name || !amount) return
        createBudget(
            {
                name,
                amount: Math.round(parseFloat(amount) * 100),
                period,
                category_id: categoryId || undefined,
                alert_threshold: parseInt(threshold),
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
            },
            {
                onSuccess: () => {
                    setName(""); setAmount(""); setCategoryId(""); setThreshold("80")
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Create Budget</DialogTitle>
                    <DialogDescription>
                        Set a spending limit to track your budget.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Budget name</Label>
                        <Input
                            placeholder="e.g. Monthly Food"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Budget amount (₹)</Label>
                        <Input
                            type="number"
                            placeholder="5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.icon} {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Period</Label>
                            <Select defaultValue="monthly" onValueChange={setPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Alert at (%)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Get alerted when spending reaches this percentage
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !name || !amount}>
                        Create Budget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BudgetsPage() {
    const { user } = useAuthStore()
    const { data: budgets = [], isLoading } = useBudgets()
    const { mutate: deleteBudget } = useDeleteBudget()
    const [addOpen, setAddOpen] = useState(false)
    const symbol = user?.currency === "USD" ? "$" : "₹"

    const totalBudgeted = budgets.reduce((s, b) => s + b.amount_display, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
    const exceeded = budgets.filter((b) => b.is_exceeded).length
    const onAlert = budgets.filter((b) => b.is_alert && !b.is_exceeded).length

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track and manage your spending limits
                    </p>
                </div>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Budget
                </Button>
            </div>

            {/* Summary row */}
            {budgets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Budgeted", value: `${symbol}${totalBudgeted.toLocaleString("en-IN")}`, color: "text-primary" },
                        { label: "Total Spent", value: `${symbol}${totalSpent.toLocaleString("en-IN")}`, color: "text-foreground" },
                        { label: "Exceeded", value: exceeded.toString(), color: "text-red-500" },
                        { label: "On Alert", value: onAlert.toString(), color: "text-yellow-600" },
                    ].map((s) => (
                        <Card key={s.label} className="p-4 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Budget cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="p-5">
                            <Skeleton className="w-full h-32" />
                        </Card>
                    ))}
                </div>
            ) : budgets.length === 0 ? (
                <Card className="p-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <TrendingDown className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No budgets yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create a budget to track and control your spending
                    </p>
                    <Button onClick={() => setAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first budget
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            symbol={symbol}
                            onDelete={deleteBudget}
                        />
                    ))}
                </div>
            )}

            <AddBudgetModal open={addOpen} onOpenChange={setAddOpen} />
        </div>
    )
}