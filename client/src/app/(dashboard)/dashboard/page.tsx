
// // src/app/(dashboard)/dashboard/page.tsx
// "use client"

// import { useAuthStore } from "@/store/auth.store"
// import { useDashboardSummary, useTransactions, useAnalyticsSummary } from "@/hooks/useTransactions"
// import { motion } from "framer-motion"
// import {
//   TrendingUp, TrendingDown, Wallet,
//   PiggyBank, ArrowUpRight, ArrowDownRight,
//   Plus, Download
// } from "lucide-react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"
// import { useState } from "react"
// import { transactionService } from "@/services/transaction.service"
// import { AddTransactionModal } from "@/components/forms/add-transaction-modal"
// import Link from "next/link"
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"


// // ─────────────────────────────────────────────────────────────────────────────
// // Sub-components defined BEFORE DashboardPage so they are in scope when used
// // ─────────────────────────────────────────────────────────────────────────────

// function SummaryCardSkeleton() {
//   return (
//     <Card className="p-5">
//       <div className="flex items-start justify-between mb-3">
//         <Skeleton className="w-9 h-9 rounded-lg" />
//         <Skeleton className="w-16 h-5 rounded-full" />
//       </div>
//       <Skeleton className="w-24 h-8 mb-1" />
//       <Skeleton className="w-32 h-4" />
//     </Card>
//   )
// }


// function RecentTransactions({ symbol }: { symbol: string }) {
//   const { data, isLoading } = useTransactions({ per_page: 5 })

//   if (isLoading) {
//     return (
//       <div className="space-y-3">
//         {Array(3).fill(0).map((_, i) => (
//           <div key={i} className="flex items-center gap-3">
//             <Skeleton className="w-9 h-9 rounded-full" />
//             <div className="flex-1">
//               <Skeleton className="w-32 h-4 mb-1" />
//               <Skeleton className="w-20 h-3" />
//             </div>
//             <Skeleton className="w-16 h-4" />
//           </div>
//         ))}
//       </div>
//     )
//   }

//   const transactions = data?.items ?? []

//   if (transactions.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-10 text-center">
//         <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
//           <Wallet className="w-5 h-5 text-muted-foreground" />
//         </div>
//         <p className="text-sm font-medium">No transactions yet</p>
//         <p className="text-xs text-muted-foreground mt-1">
//           Add your first transaction above
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-2">
//       {transactions.map((t) => {
//         // Color logic — income green, expense red, transfer amber
//         const amountColor =
//           t.transaction_type === "income"
//             ? "text-income"
//             : t.transaction_type === "transfer"
//               ? "text-warning"
//               : "text-expense"

//         // Prefix — income gets +, expense gets -, transfer gets →
//         const prefix =
//           t.transaction_type === "income" ? "+" :
//             t.transaction_type === "transfer" ? "→" : "-"

//         return (
//           <div
//             key={t.id}
//             className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
//           >
//             <div
//               className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
//               style={{ backgroundColor: `${t.category_color ?? "#94A3B8"}20` }}
//             >
//               {t.category_icon ?? "📦"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium truncate">{t.description}</p>
//               <p className="text-xs text-muted-foreground">
//                 {t.category_name ?? "Uncategorized"} · {t.date}
//                 {t.transaction_type === "transfer" && (
//                   <span className="ml-1 text-warning">· Transfer</span>
//                 )}
//               </p>
//             </div>
//             <span className={`text-sm font-semibold shrink-0 font-amount ${amountColor}`}>
//               {prefix}{symbol}{t.amount_display.toLocaleString("en-IN")}
//             </span>
//           </div>
//         )
//       })}
//     </div>
//   )
// }


// function SpendingBreakdown({ symbol }: { symbol: string }) {
//   const { data, isLoading } = useAnalyticsSummary()

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-6 gap-3">
//         <Skeleton className="w-32 h-32 rounded-full" />
//         <Skeleton className="w-24 h-3" />
//         <Skeleton className="w-20 h-3" />
//       </div>
//     )
//   }

//   const categories = data?.categories ?? []

//   if (categories.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-10 text-center">
//         <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
//           <TrendingDown className="w-5 h-5 text-muted-foreground" />
//         </div>
//         <p className="text-sm font-medium">No expense data yet</p>
//         <p className="text-xs text-muted-foreground mt-1">
//           Add expenses to see breakdown
//         </p>
//       </div>
//     )
//   }

//   // Top 4 categories to keep the widget compact
//   const topCategories = categories.slice(0, 4)

//   return (
//     <div className="space-y-3">
//       {/* Donut chart — same config as analytics page */}
//       <ResponsiveContainer width="100%" height={180}>
//         <PieChart>
//           <Pie
//             data={topCategories}
//             dataKey="amount"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             outerRadius={75}
//             innerRadius={42}
//             paddingAngle={3}
//           >
//             {topCategories.map((entry: any, i: number) => (
//               <Cell key={i} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(v: any) => [
//               `${symbol}${Number(v ?? 0).toLocaleString("en-IN")}`,
//               "",
//             ]}
//           />
//         </PieChart>
//       </ResponsiveContainer>

//       {/* Category legend with amounts */}
//       <div className="space-y-2">
//         {topCategories.map((cat: any, i: number) => (
//           <div key={i} className="flex items-center justify-between text-xs">
//             <div className="flex items-center gap-1.5">
//               <div
//                 className="w-2 h-2 rounded-full shrink-0"
//                 style={{ backgroundColor: cat.color }}
//               />
//               <span>{cat.icon}</span>
//               <span className="text-muted-foreground">{cat.name}</span>
//             </div>
//             <span className="font-medium font-amount">
//               {symbol}{cat.amount.toLocaleString("en-IN")}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // NEW: Savings Rate card
// //
// // savingsRate = (income - expenses) / income * 100, computed entirely from
// // data the dashboard summary endpoint already returns — no backend changes.
// //
// // Tiers loosely follow the 50/30/20 rule of thumb (50% needs, 30% wants,
// // 20% savings/investing):
// //   < 0%    → spent more than earned this month
// //   0–10%   → below recommended, review discretionary spending
// //   10–20%  → healthy baseline
// //   > 20%   → excellent, consider directing the surplus into investments
// //
// // Tailwind class names are declared as literal strings per tier (not built
// // dynamically via string concatenation) since Tailwind's build-time class
// // scanner only picks up literal class names — a computed class name would
// // silently produce no styling in the production build.
// // ─────────────────────────────────────────────────────────────────────────────
// function SavingsRateCard({ income, expenses }: { income: number; expenses: number }) {
//   const hasIncome = income > 0
//   const savingsRate = hasIncome ? ((income - expenses) / income) * 100 : 0
//   const displayRate = Math.round(savingsRate)
//   // Clamp only for the progress bar's width — the raw number is still shown as-is
//   const barWidth = Math.min(100, Math.max(0, savingsRate))

//   let tier: { color: string; barColor: string; badgeBg: string; message: string }

//   if (!hasIncome) {
//     tier = {
//       color: "text-muted-foreground",
//       barColor: "bg-muted-foreground",
//       badgeBg: "bg-muted",
//       message: "Add income transactions to see your savings rate",
//     }
//   } else if (savingsRate < 0) {
//     tier = {
//       color: "text-expense",
//       barColor: "bg-expense",
//       badgeBg: "bg-expense/10",
//       message: "You're spending more than you earn this month",
//     }
//   } else if (savingsRate < 10) {
//     tier = {
//       color: "text-expense",
//       barColor: "bg-expense",
//       badgeBg: "bg-expense/10",
//       message: "Below recommended — review discretionary spending",
//     }
//   } else if (savingsRate < 20) {
//     tier = {
//       color: "text-warning",
//       barColor: "bg-warning",
//       badgeBg: "bg-warning/10",
//       message: "On track — you're saving at a healthy baseline",
//     }
//   } else {
//     tier = {
//       color: "text-income",
//       barColor: "bg-income",
//       badgeBg: "bg-income/10",
//       message: "Excellent — consider directing the surplus into SIPs or other investments",
//     }
//   }

//   return (
//     <Card className="p-5">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className={`w-9 h-9 rounded-lg ${tier.badgeBg} flex items-center justify-center`}>
//             <PiggyBank className={`w-4 h-4 ${tier.color}`} />
//           </div>
//           <div>
//             <h3 className="font-semibold">Savings Rate</h3>
//             <p className="text-xs text-muted-foreground">
//               Percentage of income saved this month
//             </p>
//           </div>
//         </div>
//         <span className={`text-3xl font-bold font-amount ${tier.color}`}>
//           {displayRate}%
//         </span>
//       </div>

//       <div className="w-full bg-muted rounded-full h-2 mb-3">
//         <motion.div
//           className={`h-2 rounded-full ${tier.barColor}`}
//           initial={{ width: 0 }}
//           animate={{ width: `${barWidth}%` }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//         />
//       </div>

//       <p className={`text-sm ${tier.color}`}>
//         {tier.message}
//       </p>
//     </Card>
//   )
// }


// // ─────────────────────────────────────────────────────────────────────────────
// // Main page component
// // ─────────────────────────────────────────────────────────────────────────────

// export default function DashboardPage() {
//   const { user } = useAuthStore()
//   const { data: summary, isLoading } = useDashboardSummary()
//   const [addOpen, setAddOpen] = useState(false)
//   const symbol = user?.currency === "USD" ? "$" : "₹"

//   const formatAmount = (amount: number) =>
//     `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

//   const summaryCards = [
//     {
//       label: "Total Balance",
//       value: formatAmount(summary?.total_balance ?? 0),
//       // change: `${summary?.income_change_pct ?? 0}%`,
//       // trend: "up" as const,
//       change: summary?.balance_change_pct ?? 0,
//       icon: Wallet,
//       color: "text-primary",
//       bg: "bg-primary/10",
//     },
//     {
//       label: "Monthly Income",
//       value: formatAmount(summary?.monthly_income ?? 0),
//       // change: `+${summary?.income_change_pct ?? 0}%`,
//       // trend: "up" as const,
//       change: summary?.income_change_pct ?? 0,
//       icon: TrendingUp,
//       color: "text-income",
//       bg: "bg-income/10",
//     },
//     {
//       label: "Monthly Expenses",
//       value: formatAmount(summary?.monthly_expenses ?? 0),
//       change: summary?.expense_change_pct ?? 0,
//       // trend: "down" as const,
//       icon: TrendingDown,
//       color: "text-expense",
//       bg: "bg-expense/10",
//     },
//     {
//       label: "Monthly Savings",
//       value: formatAmount(summary?.total_savings ?? 0),
//       // change: "+0%",
//       // trend: "up" as const,
//       change: summary?.savings_change_pct ?? 0,
//       icon: PiggyBank,
//       color: "text-warning",
//       bg: "bg-warning/10",
//     },
//   ]

//   return (
//     <div className="space-y-6 page-enter">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">
//             Welcome, {user?.full_name?.split(" ")[0]}
//           </h2>
//           <p className="text-muted-foreground text-sm mt-1">
//             Here&apos;s what&apos;s happening with your finances today.
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={transactionService.exportCSV}
//             className="hidden sm:flex"
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </Button>
//           <Button size="sm" onClick={() => setAddOpen(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add Transaction
//           </Button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         {isLoading
//           ? Array(4).fill(0).map((_, i) => <SummaryCardSkeleton key={i} />)
//           : summaryCards.map((card, i) => {
//             const Icon = card.icon
//             // CHANGED — trend is now derived from the actual sign of `card.change`
//             // (positive → up arrow + income/green styling, negative → down arrow +
//             // expense/red styling) instead of a hardcoded "up"/"down" string that
//             // didn't necessarily match the real number.
//             const isPositive = (card.change ?? 0) >= 0
//             const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
//             return (
//               <motion.div
//                 key={card.label}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.08 }}
//               >
//                 <Card className="p-5 card-hover cursor-default h-full flex flex-col">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
//                       <Icon className={`w-4 h-4 ${card.color}`} />
//                     </div>
//                     {card.change !== null && (
//                     <Badge
//                       variant="secondary"
//                       className={`text-xs flex items-center gap-0.5 border-0 ${isPositive
//                         ? "text-income bg-income/10"
//                         : "text-expense bg-expense/10"
//                         }`}
//                     >
//                       <TrendIcon className="w-3 h-3" />
//                         {/* CHANGED — no hardcoded "+", the number's own sign shows
//                             through naturally (e.g. "-100%", "12.5%"). */}
//                         {card.change}%
//                     </Badge>
//                     )}
//                   </div>
//                   {/* <p className="text-2xl font-bold tracking-tight font-amount">{card.value}</p>
//                   <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p> */}
//                   <p className="text-2xl font-bold tracking-tight font-amount">{card.value}</p>
//                   <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
//                   {card.label === "Total Balance" && (
//                     <p className="text-xs text-muted-foreground/70 mt-auto pt-1">
//                       Total salary earned: {formatAmount(summary?.total_salary_earned ?? 0)}
//                     </p>
//                   )}
//                 </Card>
//               </motion.div>
//             )
//           })}
//       </div>

//       {/* Bottom sections */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//         {/* Recent Transactions */}
//         <Card className="lg:col-span-2 p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold">Recent Transactions</h3>
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/transactions">View all</Link>
//             </Button>
//           </div>
//           <RecentTransactions symbol={symbol} />
//         </Card>

//         {/* Spending Breakdown */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold">Spending Breakdown</h3>
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/analytics">View all</Link>
//             </Button>
//           </div>
//           <SpendingBreakdown symbol={symbol} />
//         </Card>

//       </div>

//       {/* NEW: Savings Rate — its own row, since the guidance text needs
//           room to breathe rather than being crammed into a small stat card */}
//       {!isLoading && (
//         <SavingsRateCard
//           income={summary?.monthly_income ?? 0}
//           expenses={summary?.monthly_expenses ?? 0}
//         />
//       )}

//       <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
//     </div>
//   )
// }

// NOTE: 2nd change

// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useDashboardSummary, useTransactions, useAnalyticsSummary } from "@/hooks/useTransactions"
import { motion, Reorder } from "framer-motion"
import {
  TrendingUp, TrendingDown, Wallet,
  PiggyBank, ArrowUpRight, ArrowDownRight,
  Plus, Download, Sparkles, Receipt,
  BarChart3, ShieldCheck, ChevronRight,
  GripVertical, RotateCcw
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { transactionService } from "@/services/transaction.service"
import { AddTransactionModal } from "@/components/forms/add-transaction-modal"
import Link from "next/link"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { TiltCard } from "@/components/shared/tilt-card"
import { triggerConfetti } from "@/lib/confetti"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { usePrivacyStore } from "@/store/privacy.store"
import { SpotlightCard } from "@/components/shared/spotlight-card"


// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <Card className="p-5 glass-card">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-28 h-8 mb-2" />
      <Skeleton className="w-32 h-4" />
    </Card>
  )
}

function RecentTransactions({ symbol, isMasked }: { symbol: string; isMasked: boolean }) {
  const { data, isLoading } = useTransactions({ per_page: 5 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="w-32 h-4 mb-1" />
              <Skeleton className="w-20 h-3" />
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    )
  }

  const transactions = data?.items ?? []

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
          <Wallet className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">No transactions recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Add your first transaction above or scan an expense receipt to start tracking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((t, index) => {
        const amountColor =
          t.transaction_type === "income"
            ? "text-income"
            : t.transaction_type === "transfer"
              ? "text-warning"
              : "text-expense"

        const prefix =
          t.transaction_type === "income" ? "+" :
            t.transaction_type === "transfer" ? "→" : "-"

        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-all duration-200 group border border-transparent hover:border-border/60"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-200"
              style={{ backgroundColor: `${t.category_color ?? "#6366F1"}18` }}
            >
              {t.category_icon ?? "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {t.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span>{t.category_name ?? "General"}</span>
                <span>•</span>
                <span>{t.date}</span>
                {t.transaction_type === "transfer" && (
                  <span className="text-warning font-medium">• Transfer</span>
                )}
              </div>
            </div>
            <span className={`text-sm font-bold shrink-0 font-amount ${amountColor}`}>
              {isMasked ? (
                <span className="text-muted-foreground select-none">••••</span>
              ) : (
                `${prefix}${symbol}${t.amount_display.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
              )}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

function SpendingBreakdown({ symbol, isMasked }: { symbol: string; isMasked: boolean }) {
  const { data, isLoading } = useAnalyticsSummary()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <Skeleton className="w-32 h-32 rounded-full" />
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-20 h-3" />
      </div>
    )
  }

  const categories = data?.categories ?? []

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
          <TrendingDown className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">No expense data yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add expenses to see your visual breakdown.
        </p>
      </div>
    )
  }

  const topCategories = categories.slice(0, 4)
  const totalTopExpense = topCategories.reduce((acc: number, cur: any) => acc + (cur.amount || 0), 0)

  return (
    <div className="space-y-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={topCategories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={4}
              stroke="none"
            >
              {topCategories.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.color || "#6366F1"} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-popover border border-border p-2.5 rounded-lg shadow-xl text-xs">
                      <div className="font-semibold flex items-center gap-1.5 mb-1">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="font-amount font-bold text-primary">
                        {isMasked ? "••••" : `${symbol}${Number(item.amount ?? 0).toLocaleString("en-IN")}`}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown rows with relative bars */}
      <div className="space-y-2.5">
        {topCategories.map((cat: any, i: number) => {
          const pct = totalTopExpense > 0 ? Math.round((cat.amount / totalTopExpense) * 100) : 0
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color || "#6366F1" }}
                  />
                  <span>{cat.icon}</span>
                  <span className="font-medium text-foreground/90">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">{pct}%</span>
                  <span className="font-bold font-amount">
                    {isMasked ? "••••" : `${symbol}${cat.amount.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: cat.color || "#6366F1" }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SavingsRateCard({ income, expenses }: { income: number; expenses: number }) {
  const hasIncome = income > 0
  const savingsRate = hasIncome ? ((income - expenses) / income) * 100 : 0
  const displayRate = Math.round(savingsRate)
  const barWidth = Math.min(100, Math.max(0, savingsRate))

  let tier: { color: string; barColor: string; badgeBg: string; message: string; badgeText: string }

  if (!hasIncome) {
    tier = {
      color: "text-muted-foreground",
      barColor: "bg-muted-foreground",
      badgeBg: "bg-muted",
      badgeText: "Awaiting Income",
      message: "Add monthly income transactions to activate your automated savings radar",
    }
  } else if (savingsRate < 0) {
    tier = {
      color: "text-expense",
      barColor: "bg-expense",
      badgeBg: "bg-expense/10",
      badgeText: "Deficit Spending",
      message: "Monthly outflows currently exceed earned income. Review discretionary subscriptions.",
    }
  } else if (savingsRate < 10) {
    tier = {
      color: "text-expense",
      barColor: "bg-expense",
      badgeBg: "bg-expense/10",
      badgeText: "Below Target",
      message: "Recommended target is 20%. Trim unnecessary dining and impulse purchases.",
    }
  } else if (savingsRate < 20) {
    tier = {
      color: "text-warning",
      barColor: "bg-warning",
      badgeBg: "bg-warning/10",
      badgeText: "Good Baseline",
      message: "You're on track with a stable financial baseline. Try pushing for 25% surplus.",
    }
  } else {
    tier = {
      color: "text-income",
      barColor: "bg-income",
      badgeBg: "bg-income/10",
      badgeText: "High Wealth Velocity",
      message: "Outstanding! Direct this cash surplus into high-yield investments, SIPs, or emergency reserves.",
    }
  }

  return (
    <Card className="p-6 glass-card border border-border/80 relative overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${tier.badgeBg} flex items-center justify-center shrink-0 shadow-sm`}>
            <PiggyBank className={`w-5 h-5 ${tier.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Monthly Savings Velocity</h3>
              <Badge variant="outline" className={`text-xs ${tier.color} border-current/30`}>
                {tier.badgeText}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              50/30/20 Wealth Retention Index
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {displayRate >= 20 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerConfetti({ particleCount: 75, spread: 85 })}
              className="h-8 text-xs px-3 text-income border-income/30 hover:bg-income/10 gap-1.5 rounded-full cursor-pointer shadow-xs interactive-hover"
            >
              <Sparkles className="w-3.5 h-3.5" /> Celebrate Goal 🎉
            </Button>
          )}

          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-extrabold font-amount ${tier.color}`}>
              <AnimatedCounter value={displayRate} suffix="%" />
            </span>
            <span className="text-xs text-muted-foreground">of income</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2.5 mb-3 overflow-hidden p-0.5 border border-border/40">
        <motion.div
          className={`h-full rounded-full ${tier.barColor} shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={`font-medium ${tier.color}`}>{tier.message}</span>
        <span className="shrink-0 ml-2 hidden md:inline-block font-mono">Target: ≥20%</span>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Page Component
// ─────────────────────────────────────────────────────────────────────────────

type WidgetKey = "summary" | "activity" | "savings"
const DEFAULT_WIDGET_ORDER: WidgetKey[] = ["summary", "activity", "savings"]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { isMasked } = usePrivacyStore()
  const { data: summary, isLoading } = useDashboardSummary()
  const [addOpen, setAddOpen] = useState(false)
  const symbol = user?.currency === "USD" ? "$" : "₹"

  // Persisted Drag & Drop Widget Order
  const [widgetOrder, setWidgetOrder] = useState<WidgetKey[]>(DEFAULT_WIDGET_ORDER)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("trackwise_dashboard_order")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 3) {
          setWidgetOrder(parsed)
        }
      }
    } catch (e) {
      // fallback
    }
  }, [])

  const handleReorder = (newOrder: WidgetKey[]) => {
    setWidgetOrder(newOrder)
    try {
      localStorage.setItem("trackwise_dashboard_order", JSON.stringify(newOrder))
    } catch (e) { }
  }

  const resetWidgetOrder = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER)
    try {
      localStorage.removeItem("trackwise_dashboard_order")
    } catch (e) { }
  }

  const summaryCards = [
    {
      label: "Total Net Balance",
      rawNumber: summary?.total_balance ?? 0,
      change: summary?.balance_change_pct ?? 0,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
      accentBorder: "hover:border-primary/50",
    },
    {
      label: "Monthly Inflow",
      rawNumber: summary?.monthly_income ?? 0,
      change: summary?.income_change_pct ?? 0,
      icon: TrendingUp,
      color: "text-income",
      bg: "bg-income/10",
      accentBorder: "hover:border-income/50",
    },
    {
      label: "Monthly Outflow",
      rawNumber: summary?.monthly_expenses ?? 0,
      change: summary?.expense_change_pct ?? 0,
      icon: TrendingDown,
      color: "text-expense",
      bg: "bg-expense/10",
      accentBorder: "hover:border-expense/50",
    },
    {
      label: "Monthly Net Savings",
      rawNumber: summary?.total_savings ?? 0,
      change: summary?.savings_change_pct ?? 0,
      icon: PiggyBank,
      color: "text-warning",
      bg: "bg-warning/10",
      accentBorder: "hover:border-warning/50",
    },
  ]

  return (
    <div className="space-y-6 page-enter pb-10">

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading flex items-center gap-2">
            Welcome, {user?.full_name?.split(" ")[0]}
            {/* <span className="text-xl"></span> */}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here is the live pulse of your financial universe today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetWidgetOrder}
            className="hidden lg:inline-flex text-xs text-muted-foreground hover:text-foreground"
            title="Reset layout order"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Layout
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={transactionService.exportCSV}
            className="hidden sm:inline-flex interactive-hover border-border/80"
          >
            <Download className="w-4 h-4 mr-2 text-muted-foreground" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="shadow-md shadow-primary/25 interactive-hover"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Launchpad Ribbon */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-card/60 rounded-xl border border-border/70 backdrop-blur-md text-xs">
        <span className="px-3 py-1 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
          Quick Tools:
        </span>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2.5 rounded-lg">
          <Link href="/ai-insights?tab=ocr" className="flex items-center gap-1.5 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            AI Receipt Scan
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2.5 rounded-lg">
          <Link href="/budgets" className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            Budget Thresholds
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2.5 rounded-lg">
          <Link href="/analytics" className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Cashflow Trends
          </Link>
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REORDERABLE DRAG-AND-DROP DASHBOARD WIDGETS
      ───────────────────────────────────────────────────────────── */}
      <Reorder.Group
        axis="y"
        values={widgetOrder}
        onReorder={handleReorder}
        className="space-y-6 list-none"
      >
        {widgetOrder.map((widgetId) => (
          <Reorder.Item
            key={widgetId}
            value={widgetId}
            className="relative group focus:outline-none"
          >
            {/* Visual Drag Handle Pill */}
            <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-md border border-border/80 px-2.5 py-0.5 rounded-full text-[10px] text-muted-foreground flex items-center gap-1.5 shadow-sm z-20 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              <span>Drag to reorder section</span>
            </div>

            {/* Widget 1: Summary Stat Cards */}
            {widgetId === "summary" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {isLoading
                  ? Array(4).fill(0).map((_, i) => <SummaryCardSkeleton key={i} />)
                  : summaryCards.map((card, i) => {
                    const Icon = card.icon
                    const isPositive = card.change >= 0
                    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
                    return (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="h-full"
                      >
                        <TiltCard maxTilt={7} className="h-full">
                          <SpotlightCard className={`p-5 h-full flex flex-col justify-between transition-all duration-300 ${card.accentBorder}`}>
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shadow-sm`}>
                                  <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs flex items-center gap-0.5 border-0 font-medium ${isPositive
                                    ? "text-income bg-income/10"
                                    : "text-expense bg-expense/10"
                                    }`}
                                >
                                  <TrendIcon className="w-3 h-3" />
                                  {card.change}%
                                </Badge>
                              </div>

                              <div className="text-2xl font-bold tracking-tight font-amount mb-1">
                                {isMasked ? (
                                  <span className="tracking-widest text-muted-foreground select-none">••••••</span>
                                ) : (
                                  <>
                                    {symbol}
                                    <AnimatedCounter
                                      value={card.rawNumber}
                                      decimals={2}
                                      duration={800}
                                    />
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                            </div>

                            {card.label === "Total Net Balance" && (
                              <div className="text-[11px] text-muted-foreground/80 pt-3 border-t border-border/50 mt-3 flex items-center justify-between">
                                <span>Total Salary Inflow:</span>
                                <span className="font-amount font-semibold">
                                  {isMasked ? "••••" : `${symbol}${(summary?.total_salary_earned ?? 0).toLocaleString("en-IN")}`}
                                </span>
                              </div>
                            )}
                          </SpotlightCard>
                        </TiltCard>
                      </motion.div>
                    )
                  })}
              </div>
            )}

            {/* Widget 2: Recent Activity & Spending Breakdown */}
            {widgetId === "activity" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Transactions List */}
                <Card className="lg:col-span-2 p-5 glass-card border border-border/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-base">Recent Activity</h3>
                      <p className="text-xs text-muted-foreground">Latest transactions and transfers</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-primary">
                      <Link href="/transactions" className="flex items-center gap-1">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <RecentTransactions symbol={symbol} isMasked={isMasked} />
                </Card>

                {/* Spending Breakdown Donut */}
                <Card className="p-5 glass-card border border-border/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-base">Spending Categories</h3>
                      <p className="text-xs text-muted-foreground">Where funds flow this month</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-primary">
                      <Link href="/analytics" className="flex items-center gap-1">
                        Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <SpendingBreakdown symbol={symbol} isMasked={isMasked} />
                </Card>
              </div>
            )}

            {/* Widget 3: Savings Velocity Radar */}
            {widgetId === "savings" && !isLoading && (
              <SavingsRateCard
                income={summary?.monthly_income ?? 0}
                expenses={summary?.monthly_expenses ?? 0}
              />
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Add Transaction Dialog */}
      <AddTransactionModal
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) {
            // Trigger confetti burst on completion
            triggerConfetti({ particleCount: 50, spread: 60 })
          }
        }}
      />
    </div>
  )
}
