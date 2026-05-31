// src/components/layout/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, APP_NAME } from "@/constants"
import { useAuthStore } from "@/store/auth.store"
import {
    LayoutDashboard, ArrowLeftRight, Target,
    BarChart3, Sparkles, Settings, TrendingUp,
    LogOut, ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const iconMap = {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    BarChart3,
    Sparkles,
    Settings,
} as const

interface SidebarProps {
    onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname()
    const { user } = useAuthStore()
    const [collapsed, setCollapsed] = useState(false)

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

    return (
        <TooltipProvider delayDuration={0}>
            <motion.aside
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="relative hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0 overflow-hidden"
            >
                {/* ── Logo ── */}
                <div className="flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                                >
                                    {APP_NAME}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Nav Items ── */}
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = iconMap[item.icon as keyof typeof iconMap]
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href))

                        const navItem = (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                                    />
                                )}

                                <Icon className={cn(
                                    "h-4 w-4 flex-shrink-0",
                                    isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                                )} />

                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* AI badge */}
                                {item.label === "AI Insights" && !collapsed && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0"
                                    >
                                        AI
                                    </Badge>
                                )}
                            </Link>
                        )

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            )
                        }

                        return navItem
                    })}
                </nav>

                {/* ── User section ── */}
                <div className="p-2 border-t border-sidebar-border">
                    <div className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        collapsed ? "justify-center" : ""
                    )}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-1 overflow-hidden min-w-0"
                                >
                                    <p className="text-sm font-medium truncate leading-tight">
                                        {user?.full_name ?? "User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate leading-tight">
                                        {user?.email ?? ""}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={onLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Sign out</TooltipContent>
                                    </Tooltip>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Collapse toggle ── */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent z-10"
                >
                    <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
                        <ChevronLeft className="h-3 w-3" />
                    </motion.div>
                </Button>
            </motion.aside>
        </TooltipProvider>
    )
}