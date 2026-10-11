"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    spotlightColor?: string
}

export function SpotlightCard({
    children,
    className,
    spotlightColor = "rgba(99, 102, 241, 0.12)",
    ...props
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return

        const div = divRef.current
        const rect = div.getBoundingClientRect()

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleMouseEnter = () => {
        setOpacity(1)
    }

    const handleMouseLeave = () => {
        setOpacity(0)
    }

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative rounded-xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 overflow-hidden hover:shadow-md hover:border-primary/30",
                className
            )}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-500 rounded-xl"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    )
}
