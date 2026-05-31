// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useAuthStore } from "@/store/auth.store"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Wallet,
  PiggyBank, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const summaryCards = [
  {
    label: "Total Balance",
    value: "₹0.00",
    change: "+0%",
    trend: "up",
    icon: Wallet,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Monthly Income",
    value: "₹0.00",
    change: "+0%",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    label: "Monthly Expenses",
    value: "₹0.00",
    change: "+0%",
    trend: "down",
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    label: "Total Savings",
    value: "₹0.00",
    change: "+0%",
    trend: "up",
    icon: PiggyBank,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Good morning, {user?.full_name?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
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
                    className={`text-xs flex items-center gap-0.5 ${card.trend === "up"
                        ? "text-green-600 dark:text-green-400 bg-green-500/10"
                        : "text-red-600 dark:text-red-400 bg-red-500/10"
                      } border-0`}
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
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Badge variant="outline" className="text-xs">Coming soon</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first transaction to get started
            </p>
          </div>
        </Card>

        {/* Spending breakdown */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Spending Breakdown</h3>
            <Badge variant="outline" className="text-xs">Coming soon</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Charts will appear after transactions
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}