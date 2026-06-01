// // src/app/(dashboard)/dashboard/page.tsx
// "use client"

// import { useAuthStore } from "@/store/auth.store"
// import { motion } from "framer-motion"
// import {
//   TrendingUp, TrendingDown, Wallet,
//   PiggyBank, ArrowUpRight, ArrowDownRight,
// } from "lucide-react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// const summaryCards = [
//   {
//     label: "Total Balance",
//     value: "₹0.00",
//     change: "+0%",
//     trend: "up",
//     icon: Wallet,
//     color: "text-primary",
//     bg: "bg-primary/10",
//   },
//   {
//     label: "Monthly Income",
//     value: "₹0.00",
//     change: "+0%",
//     trend: "up",
//     icon: TrendingUp,
//     color: "text-green-500",
//     bg: "bg-green-500/10",
//   },
//   {
//     label: "Monthly Expenses",
//     value: "₹0.00",
//     change: "+0%",
//     trend: "down",
//     icon: TrendingDown,
//     color: "text-red-500",
//     bg: "bg-red-500/10",
//   },
//   {
//     label: "Total Savings",
//     value: "₹0.00",
//     change: "+0%",
//     trend: "up",
//     icon: PiggyBank,
//     color: "text-purple-500",
//     bg: "bg-purple-500/10",
//   },
// ]

// export default function DashboardPage() {
//   const { user } = useAuthStore()

//   return (
//     <div className="space-y-6 page-enter">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight">
//           Good morning, {user?.full_name?.split(" ")[0]} 👋
//         </h2>
//         <p className="text-muted-foreground text-sm mt-1">
//           Here&apos;s what&apos;s happening with your finances today.
//         </p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         {summaryCards.map((card, i) => {
//           const Icon = card.icon
//           const TrendIcon = card.trend === "up" ? ArrowUpRight : ArrowDownRight

//           return (
//             <motion.div
//               key={card.label}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.08 }}
//             >
//               <Card className="p-5 card-hover cursor-default">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
//                     <Icon className={`w-4 h-4 ${card.color}`} />
//                   </div>
//                   <Badge
//                     variant="secondary"
//                     className={`text-xs flex items-center gap-0.5 ${card.trend === "up"
//                         ? "text-green-600 dark:text-green-400 bg-green-500/10"
//                         : "text-red-600 dark:text-red-400 bg-red-500/10"
//                       } border-0`}
//                   >
//                     <TrendIcon className="w-3 h-3" />
//                     {card.change}
//                   </Badge>
//                 </div>
//                 <p className="text-2xl font-bold tracking-tight">{card.value}</p>
//                 <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
//               </Card>
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* Placeholder sections */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Recent transactions */}
//         <Card className="lg:col-span-2 p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold">Recent Transactions</h3>
//             <Badge variant="outline" className="text-xs">Coming soon</Badge>
//           </div>
//           <div className="flex flex-col items-center justify-center py-10 text-center">
//             <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
//               <Wallet className="w-5 h-5 text-muted-foreground" />
//             </div>
//             <p className="text-sm font-medium">No transactions yet</p>
//             <p className="text-xs text-muted-foreground mt-1">
//               Add your first transaction to get started
//             </p>
//           </div>
//         </Card>

//         {/* Spending breakdown */}
//         <Card className="p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold">Spending Breakdown</h3>
//             <Badge variant="outline" className="text-xs">Coming soon</Badge>
//           </div>
//           <div className="flex flex-col items-center justify-center py-10 text-center">
//             <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
//               <TrendingDown className="w-5 h-5 text-muted-foreground" />
//             </div>
//             <p className="text-sm font-medium">No data yet</p>
//             <p className="text-xs text-muted-foreground mt-1">
//               Charts will appear after transactions
//             </p>
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }


// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useAuthStore } from "@/store/auth.store"
import { useDashboardSummary } from "@/hooks/useTransactions"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Wallet,
  PiggyBank, ArrowUpRight, ArrowDownRight,
  Plus, Download
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { transactionService } from "@/services/transaction.service"
import { useTransactions } from "@/hooks/useTransactions"
import { AddTransactionModal } from "@/components/forms/add-transaction-modal"

function SummaryCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-24 h-8 mb-1" />
      <Skeleton className="w-32 h-4" />
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: summary, isLoading } = useDashboardSummary()
  const [addOpen, setAddOpen] = useState(false)
  const symbol = user?.currency === "USD" ? "$" : "₹"

  const formatAmount = (amount: number) =>
    `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

  const summaryCards = [
    {
      label: "Total Balance",
      value: formatAmount(summary?.total_balance ?? 0),
      change: `${summary?.income_change_pct ?? 0}%`,
      trend: "up" as const,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Monthly Income",
      value: formatAmount(summary?.monthly_income ?? 0),
      change: `+${summary?.income_change_pct ?? 0}%`,
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Monthly Expenses",
      value: formatAmount(summary?.monthly_expenses ?? 0),
      change: `${summary?.expense_change_pct ?? 0}%`,
      trend: "down" as const,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Savings",
      value: formatAmount(summary?.total_savings ?? 0),
      change: "+0%",
      trend: "up" as const,
      icon: PiggyBank,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Good morning, {user?.full_name?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your finances today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={transactionService.exportCSV}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <SummaryCardSkeleton key={i} />)
          : summaryCards.map((card, i) => {
            const Icon = card.icon
            const TrendIcon = card.trend === "up" ? ArrowUpRight : ArrowDownRight

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-5 card-hover cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex items-center gap-0.5 border-0 ${card.trend === "up"
                          ? "text-green-600 dark:text-green-400 bg-green-500/10"
                          : "text-red-600 dark:text-red-400 bg-red-500/10"
                        }`}
                    >
                      <TrendIcon className="w-3 h-3" />
                      {card.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
                </Card>
              </motion.div>
            )
          })
        }
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Button variant="ghost" size="sm" asChild>
              <a href="/transactions">View all</a>
            </Button>
          </div>
          <RecentTransactions symbol={symbol} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Spending Breakdown</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Charts coming in Phase 4</p>
            <p className="text-xs text-muted-foreground mt-1">
              Analytics after more data
            </p>
          </div>
        </Card>
      </div>

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

// Recent transactions sub-component
function RecentTransactions({ symbol }: { symbol: string }) {
  const { data, isLoading } = useTransactions({ per_page: 5 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
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
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Wallet className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add your first transaction above
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: `${t.category_color}20` }}
          >
            {t.category_icon ?? "📦"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.description}</p>
            <p className="text-xs text-muted-foreground">{t.category_name ?? "Uncategorized"} · {t.date}</p>
          </div>
          <span className={`text-sm font-semibold flex-shrink-0 ${t.transaction_type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
            }`}>
            {t.transaction_type === "income" ? "+" : "-"}
            {symbol}{t.amount_display.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  )
}
