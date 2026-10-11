// // src/components/shared/theme-toggle.tsx
// "use client"

// import { useTheme } from "next-themes"
// import { Moon, Sun, Monitor } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { useEffect, useState } from "react"

// export function ThemeToggle() {
//     const { theme, setTheme } = useTheme()
//     const [mounted, setMounted] = useState(false)

//     // Prevent hydration mismatch
//     useEffect(() => setMounted(true), [])
//     if (!mounted) return null

//     const cycles = ["system", "light", "dark"] as const

//     const next = () => {
//         const idx = cycles.indexOf(theme as any) ?? 0
//         setTheme(cycles[(idx + 1) % cycles.length])
//     }

//     return (
//         <Button
//             variant="ghost"
//             size="icon"
//             onClick={next}
//             className="rounded-full w-9 h-9"
//             aria-label="Toggle theme"
//         >
//             {theme === "dark" && <Moon className="h-4 w-4" />}
//             {theme === "light" && <Sun className="h-4 w-4" />}
//             {theme === "system" && <Monitor className="h-4 w-4" />}
//         </Button>
//     )
// }

// NOTE: 2nd change

// src/components/shared/theme-toggle.tsx
"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => setMounted(true), [])
    if (!mounted) {
        return <div className="w-9 h-9" />
    }

    const isDark = resolvedTheme === "dark"

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        const nextTheme = isDark ? "light" : "dark"

        // View Transition API check (Chrome, Edge, Safari 18+)
        if (typeof document !== "undefined" && "startViewTransition" in document) {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = rect.left + rect.width / 2
            const y = rect.top + rect.height / 2
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            )

            const transition = (document as any).startViewTransition(() => {
                setTheme(nextTheme)
            })

            transition.ready.then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 480,
                        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                        pseudoElement: "::view-transition-new(root)",
                    }
                )
            })
        } else {
            // Fallback transition
            setTheme(nextTheme)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`relative rounded-full w-9 h-9 overflow-hidden hover:bg-muted/80 transition-colors ${className || ""}`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ y: -16, opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ y: 16, opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex items-center justify-center"
                >
                    {isDark ? (
                        <Moon className="h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
                    ) : (
                        <Sun className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                </motion.div>
            </AnimatePresence>
        </Button>
    )
}