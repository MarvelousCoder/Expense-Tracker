// src/components/layout/topbar.tsx
"use client"

import { usePathname } from "next/navigation"
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
    Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet"
import {
    Bell, Menu, LogOut, User,
    Settings, TrendingUp,
} from "lucide-react"
import Link from "next/link"
import {
    LayoutDashboard, ArrowLeftRight, Target,
    BarChart3, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/constants"

const iconMap = {
    LayoutDashboard, ArrowLeftRight, Target,
    BarChart3, Sparkles, Settings,
} as const

interface TopbarProps {
    onLogout: () => void
}

export function Topbar({ onLogout }: TopbarProps) {
    const pathname = usePathname()
    const { user } = useAuthStore()

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
                                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
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
                <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                </Button>

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
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
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