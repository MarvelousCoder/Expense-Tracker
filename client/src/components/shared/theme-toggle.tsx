// src/components/shared/theme-toggle.tsx
"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const cycles = ["system", "light", "dark"] as const

    const next = () => {
        const idx = cycles.indexOf(theme as any) ?? 0
        setTheme(cycles[(idx + 1) % cycles.length])
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="rounded-full w-9 h-9"
            aria-label="Toggle theme"
        >
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "system" && <Monitor className="h-4 w-4" />}
        </Button>
    )
}