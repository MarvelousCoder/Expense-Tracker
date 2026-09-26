// src/components/layout/topbar.tsx
"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"  // — added for notifOpen state
import { NAV_ITEMS } from "@/constants"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useAuthStore } from "@/store/auth.store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet, SheetContent, SheetTrigger, SheetTitle,
} from "@/components/ui/sheet"
import {
    Bell, Menu, LogOut,
    Settings, TrendingUp, AlertTriangle,
    Repeat,
} from "lucide-react"
import Link from "next/link"
import {
    LayoutDashboard, ArrowLeftRight, Target,
    BarChart3, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/constants"
import { useBudgets } from "@/hooks/useBudgets"
import { useQuery } from "@tanstack/react-query"
import { aiService } from "@/services/ai.service"

const iconMap = {
    LayoutDashboard, ArrowLeftRight, Target,
    BarChart3, Sparkles, Settings,
} as const

// Recurring patterns whose next expected charge falls within this many days
// are surfaced as "upcoming bill" notifications.
const UPCOMING_BILL_WINDOW_DAYS = 7

interface TopbarProps {
    onLogout: () => void
}

export function Topbar({ onLogout }: TopbarProps) {
    const pathname = usePathname()
    const { user } = useAuthStore()
    const { data: budgets = [] } = useBudgets()
    // CHANGED — tracks whether the notification bell dropdown is open.
    // The two AI queries below are gated on this so they only fire once
    // the user actually opens the bell, instead of on every dashboard
    // page load (this was the main cause of the "everything loads at
    // once" slowness — anomaly/recurring detection are AI-backed calls).
    const [notifOpen, setNotifOpen] = useState(false)
    // NEW: same query keys used in ai-insights/page.tsx's RecurringSection /
    // AnomaliesSection — React Query dedupes by key, so this shares cache
    // with that page rather than firing duplicate requests when both are
    // mounted, and avoids re-fetching on every navigation within staleTime.
    const { data: anomalyData } = useQuery({
        queryKey: ["ai-anomalies"],
        queryFn: () => aiService.getAnomalies(30),
        staleTime: 5 * 60 * 1000,
        enabled: notifOpen,   // CHANGED — was eager, now only runs once the bell is opened
    })
    const { data: recurringData } = useQuery({
        queryKey: ["ai-recurring"],
        queryFn: aiService.getRecurring,
        staleTime: 5 * 60 * 1000,
        enabled: notifOpen,
    })

    const currentPage = NAV_ITEMS.find(
        (item) => pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
    )

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

    const currencySymbol = user?.currency === "USD" ? "$" : "₹"

    // Budget alerts — budgets that have crossed their alert threshold or exceeded limit
    const alertBudgets = budgets.filter((b) => b.is_alert || b.is_exceeded)
    const alertCount = alertBudgets.length

    // NEW: anomalous transactions from the last 30 days
    const anomalies = anomalyData?.anomalies ?? []

    // NEW: recurring patterns due within the next 7 days
    const now = new Date()
    const upcomingRecurring = (recurringData?.patterns ?? []).filter((p) => {
        const nextDate = new Date(p.next_expected)
        const diffDays = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= UPCOMING_BILL_WINDOW_DAYS
    })

    const totalCount = alertBudgets.length + anomalies.length + upcomingRecurring.length

    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 md:px-6 gap-4">

            {/* Mobile menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                    {/* Mobile sidebar content */}
                    <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-sm">{APP_NAME}</span>
                    </div>
                    <nav className="px-2 py-4 space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const Icon = iconMap[item.icon as keyof typeof iconMap]
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                    {item.label === "AI Insights" && (
                                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4 badge-ai">
                                            AI
                                        </Badge>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Page title */}
            <div className="flex-1">
                <h1 className="text-base font-semibold">
                    {currentPage?.label ?? "Dashboard"}
                </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
                {/* Currency badge */}
                <Badge variant="outline" className="hidden sm:flex text-xs font-medium">
                    {currencySymbol} {user?.currency ?? "INR"}
                </Badge>

                {/* Theme toggle */}
                <ThemeToggle />

                {/* Notifications */}
                {/* <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                </Button> */}

                {/* Notification bell — wired to budget alerts */}
                <DropdownMenu onOpenChange={setNotifOpen}>  {/* CHANGED — was <DropdownMenu>, now tracks open state */}
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9">
                            <Bell className="h-4 w-4" />
                            {totalCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                                    {totalCount > 9 ? "9+" : totalCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent align="end" className="w-72">
                        <DropdownMenuLabel className="font-medium">
                            Budget Alerts
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {alertCount === 0 ? (
                            <div className="px-3 py-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    All budgets are on track
                                </p>
                            </div>
                        ) : (
                            <>
                                {alertBudgets.map((budget) => (
                                    <DropdownMenuItem key={budget.id} asChild>
                                        <Link href="/budgets" className="cursor-pointer">
                                            <div className="flex items-start gap-2.5 w-full py-0.5">
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: `${budget.category_color ?? "#6366F1"}20` }}
                                                >
                                                    {budget.category_icon ?? "💰"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {budget.name}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs",
                                                        budget.is_exceeded
                                                            ? "text-destructive"
                                                            : "text-yellow-600 dark:text-yellow-500"
                                                    )}>
                                                        {budget.is_exceeded
                                                            ? `Exceeded by ₹${(budget.spent - budget.amount_display).toLocaleString("en-IN")}`
                                                            : `${budget.percentage}% of budget used`
                                                        }
                                                    </p>
                                                </div>
                                                <AlertTriangle className={cn(
                                                    "w-3.5 h-3.5 flex-shrink-0 mt-1",
                                                    budget.is_exceeded ? "text-destructive" : "text-yellow-500"
                                                )} />
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/budgets" className="cursor-pointer text-sm text-muted-foreground justify-center">
                                        View all budgets
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent> */}
                    <DropdownMenuContent align="end" className="w-80 max-h-112 overflow-y-auto">
                        {totalCount === 0 ? (
                            <div className="px-3 py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    You&apos;re all caught up
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* ── Budget Alerts ── */}
                                {alertBudgets.length > 0 && (
                                    <>
                                        <DropdownMenuLabel className="font-medium text-xs text-muted-foreground">
                                            Budget Alerts
                                        </DropdownMenuLabel>
                                        {alertBudgets.slice(0, 3).map((budget) => (
                                            <DropdownMenuItem key={budget.id} asChild>
                                                <Link href="/budgets" className="cursor-pointer">
                                                    <div className="flex items-start gap-2.5 w-full py-0.5">
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
                                                            style={{ backgroundColor: `${budget.category_color ?? "#6366F1"}20` }}
                                                        >
                                                            {budget.category_icon ?? "💰"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {budget.name}
                                                            </p>
                                                            {/* FIXED: hardcoded ₹ → currencySymbol (was ignoring
                                                                USD users entirely), yellow-600/500 → text-warning
                                                                token, added font-amount for tabular figures */}
                                                            <p className={cn(
                                                                "text-xs font-amount",
                                                                budget.is_exceeded
                                                                    ? "text-destructive"
                                                                    : "text-warning"
                                                            )}>
                                                                {budget.is_exceeded
                                                                    ? `Exceeded by ${currencySymbol}${(budget.spent - budget.amount_display).toLocaleString("en-IN")}`
                                                                    : `${budget.percentage}% of budget used`
                                                                }
                                                            </p>
                                                        </div>
                                                        <AlertTriangle className={cn(
                                                            "w-3.5 h-3.5 shrink-0 mt-1",
                                                            budget.is_exceeded ? "text-destructive" : "text-warning"
                                                        )} />
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuItem asChild>
                                            <Link href="/budgets" className="cursor-pointer text-xs text-muted-foreground justify-center">
                                                View all budgets
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {/* ── NEW: Anomalies ── */}
                                {anomalies.length > 0 && (
                                    <>
                                        {alertBudgets.length > 0 && <DropdownMenuSeparator />}
                                        <DropdownMenuLabel className="font-medium text-xs text-muted-foreground">
                                            Unusual Spending
                                        </DropdownMenuLabel>
                                        {anomalies.slice(0, 3).map((a) => (
                                            <DropdownMenuItem key={a.transaction_id} asChild>
                                                <Link href="/ai-insights?tab=anomalies" className="cursor-pointer">
                                                    <div className="flex items-start gap-2.5 w-full py-0.5">
                                                        <div className="w-7 h-7 rounded-lg bg-expense/10 flex items-center justify-center shrink-0 mt-0.5">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-expense" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {a.description}
                                                            </p>
                                                            <p className="text-xs text-expense font-amount">
                                                                {currencySymbol}{a.amount.toLocaleString("en-IN")} · {a.category}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuItem asChild>
                                            <Link href="/ai-insights?tab=anomalies" className="cursor-pointer text-xs text-muted-foreground justify-center">
                                                View all anomalies
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {/* ── NEW: Upcoming recurring bills ── */}
                                {upcomingRecurring.length > 0 && (
                                    <>
                                        {(alertBudgets.length > 0 || anomalies.length > 0) && <DropdownMenuSeparator />}
                                        <DropdownMenuLabel className="font-medium text-xs text-muted-foreground">
                                            Upcoming Bills
                                        </DropdownMenuLabel>
                                        {upcomingRecurring.slice(0, 3).map((p) => (
                                            <DropdownMenuItem key={p.merchant} asChild>
                                                <Link href="/ai-insights?tab=recurring" className="cursor-pointer">
                                                    <div className="flex items-start gap-2.5 w-full py-0.5">
                                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Repeat className="w-3.5 h-3.5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium capitalize truncate">
                                                                {p.merchant}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground font-amount">
                                                                {currencySymbol}{p.avg_amount.toLocaleString("en-IN")} · due {p.next_expected}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuItem asChild>
                                            <Link href="/ai-insights?tab=recurring" className="cursor-pointer text-xs text-muted-foreground justify-center">
                                                View all recurring
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Account Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={onLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}