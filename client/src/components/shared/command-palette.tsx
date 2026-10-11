"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    BarChart3,
    Sparkles,
    Settings,
    Plus,
    Download,
    Moon,
    Sun,
    Search,
    Receipt,
    LogOut,
    Command as CommandIcon,
    Eye,
    PartyPopper,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { transactionService } from "@/services/transaction.service"
import { useAuth } from "@/hooks/useAuth"
import { usePrivacyStore } from "@/store/privacy.store"
import { triggerConfetti } from "@/lib/confetti"


interface CommandPaletteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddTransaction?: () => void
}

export function CommandPalette({
    open,
    onOpenChange,
    onAddTransaction,
}: CommandPaletteProps) {
    const router = useRouter()
    const { resolvedTheme, setTheme } = useTheme()
    const { logout } = useAuth()
    const { isMasked, toggleMask } = usePrivacyStore()
    const [query, setQuery] = useState("")

    // Global Ctrl+K / Cmd+K listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                onOpenChange(!open)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, onOpenChange])

    const actions = useMemo(
        () => [
            // Navigation
            {
                id: "nav-dashboard",
                title: "Go to Dashboard",
                category: "Navigation",
                icon: LayoutDashboard,
                perform: () => router.push("/dashboard"),
            },
            {
                id: "nav-transactions",
                title: "View All Transactions",
                category: "Navigation",
                icon: ArrowLeftRight,
                perform: () => router.push("/transactions"),
            },
            {
                id: "nav-budgets",
                title: "Manage Budgets & Thresholds",
                category: "Navigation",
                icon: Target,
                perform: () => router.push("/budgets"),
            },
            {
                id: "nav-analytics",
                title: "Cashflow & Spending Analytics",
                category: "Navigation",
                icon: BarChart3,
                perform: () => router.push("/analytics"),
            },
            {
                id: "nav-ai",
                title: "AI Insights & Copilot",
                category: "Navigation",
                icon: Sparkles,
                perform: () => router.push("/ai-insights"),
            },
            {
                id: "nav-settings",
                title: "Account & Preference Settings",
                category: "Navigation",
                icon: Settings,
                perform: () => router.push("/settings"),
            },
            // Quick Actions
            {
                id: "action-add",
                title: "Add New Transaction",
                category: "Actions",
                icon: Plus,
                perform: () => {
                    if (onAddTransaction) {
                        onAddTransaction()
                    } else {
                        router.push("/transactions")
                    }
                },
            },
            {
                id: "action-ocr",
                title: "Scan Bill / Receipt with OCR",
                category: "Actions",
                icon: Receipt,
                perform: () => router.push("/ai-insights?tab=ocr"),
            },
            {
                id: "action-export",
                title: "Export Transactions as CSV",
                category: "Actions",
                icon: Download,
                perform: () => transactionService.exportCSV(),
            },
            {
                id: "action-theme",
                title: `Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`,
                category: "Preferences",
                icon: resolvedTheme === "dark" ? Sun : Moon,
                perform: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
            },
            {
                id: "action-privacy",
                title: `${isMasked ? "Reveal" : "Mask"} Balances (Privacy Mode)`,
                category: "Preferences",
                icon: Eye,
                perform: () => toggleMask(),
            },
            {
                id: "action-confetti",
                title: "Fire Celebration Confetti Blast 🎉",
                category: "Actions",
                icon: PartyPopper,
                perform: () => triggerConfetti({ particleCount: 80, spread: 90 }),
            },
            {
                id: "action-logout",
                title: "Sign Out of TrackWise",
                category: "Account",
                icon: LogOut,
                perform: () => logout(),
            },
        ],
        [router, resolvedTheme, setTheme, logout, onAddTransaction, isMasked, toggleMask]
    )

    const filtered = useMemo(() => {
        if (!query.trim()) return actions
        const q = query.toLowerCase()
        return actions.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.category.toLowerCase().includes(q)
        )
    }, [actions, query])

    const handleSelect = (perform: () => void) => {
        onOpenChange(false)
        perform()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 overflow-hidden max-w-lg border border-border/80 glass-card shadow-2xl">
                <DialogTitle className="sr-only">Quick Command Palette</DialogTitle>
                <div className="flex items-center px-4 border-b border-border/60 gap-2.5">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search actions..."
                        className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/80">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No matching commands or pages found.
                        </div>
                    ) : (
                        filtered.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item.perform)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left hover:bg-muted/70 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-md bg-muted/80 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {item.title}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        {item.category}
                                    </span>
                                </button>
                            )
                        })
                    )}
                </div>

                <div className="border-t border-border/50 px-4 py-2 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Navigate with mouse or keyboard</span>
                    <span className="flex items-center gap-1 font-mono">
                        <CommandIcon className="w-3 h-3" />
                        <span>K to toggle</span>
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
