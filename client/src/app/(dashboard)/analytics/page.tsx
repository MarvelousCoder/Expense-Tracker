// src/app/(dashboard)/analytics/page.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend, LineChart, Line,
} from "recharts"
import { motion } from "framer-motion"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function useAnalytics() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: () => api.get<any>("/transactions/analytics/summary"),
    })
}

const CustomTooltip = ({ active, payload, label, symbol }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-medium mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {symbol}{p.value?.toLocaleString("en-IN")}
                </p>
            ))}
        </div>
    )
}

export default function AnalyticsPage() {
    const { user } = useAuthStore()
    const { data, isLoading } = useAnalytics()
    const symbol = user?.currency === "USD" ? "$" : "₹"

    const monthlyData = (data?.monthly ?? []).map((m: any) => ({
        name: MONTHS[m.month - 1],
        Income: m.income,
        Expense: m.expense,
        Net: m.income - m.expense,
    }))

    const categoryData = data?.categories ?? []

    const totalExpense = categoryData.reduce((s: number, c: any) => s + c.amount, 0)

    return (
        <div className="space-y-6 page-enter">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {new Date().getFullYear()} financial overview
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="p-5">
                            <Skeleton className="w-40 h-5 mb-4" />
                            <Skeleton className="w-full h-64" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Income vs Expenses Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-5">
                            <h3 className="font-semibold mb-4">Income vs Expenses</h3>
                            {monthlyData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                                    No data for this year yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={monthlyData} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                        <Tooltip content={<CustomTooltip symbol={symbol} />} />
                                        <Legend />
                                        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Card>
                    </motion.div>

                    {/* Spending by Category Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-5">
                            <h3 className="font-semibold mb-4">Spending by Category</h3>
                            {categoryData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                                    No expense data yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="amount"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={50}
                                            paddingAngle={3}
                                        >
                                            {categoryData.map((entry: any, i: number) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            // formatter={(v: number) => [`${symbol}${v.toLocaleString("en-IN")}`, ""]}
                                            formatter={(v: any) => [`${symbol}${Number(v ?? 0).toLocaleString("en-IN")}`, ""]}
                                        />
                                        <Legend
                                            formatter={(value, entry: any) => (
                                                <span className="text-xs">
                                                    {entry.payload.icon} {value}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Card>
                    </motion.div>

                    {/* Net Savings Line Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-5">
                            <h3 className="font-semibold mb-4">Net Savings Trend</h3>
                            {monthlyData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                        <Tooltip content={<CustomTooltip symbol={symbol} />} />
                                        <Line
                                            type="monotone"
                                            dataKey="Net"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Card>
                    </motion.div>

                    {/* Category breakdown table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-5">
                            <h3 className="font-semibold mb-4">Category Breakdown</h3>
                            {categoryData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                                    No expense data yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categoryData.map((cat: any, i: number) => {
                                        const pct = totalExpense > 0
                                            ? Math.round((cat.amount / totalExpense) * 100)
                                            : 0
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>{cat.icon}</span>
                                                        <span className="font-medium">{cat.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground text-xs">{pct}%</span>
                                                        <span className="font-semibold">
                                                            {symbol}{cat.amount.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1.5">
                                                    <motion.div
                                                        className="h-1.5 rounded-full"
                                                        style={{ backgroundColor: cat.color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>
                    </motion.div>

                </div>
            )}
        </div>
    )
}