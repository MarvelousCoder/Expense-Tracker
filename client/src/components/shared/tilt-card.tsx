"use client"

import React, { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children?: React.ReactNode
    maxTilt?: number
    glareOpacity?: number
}

export function TiltCard({
    children,
    className,
    maxTilt = 12,
    glareOpacity = 0.15,
    ...props
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 })
    const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 })

    // Map mouse coordinate ratios (-0.5 to 0.5) to degrees of tilt
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt])

    // Glare position
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Normalize between -0.5 and 0.5
        const xPct = mouseX / rect.width - 0.5
        const yPct = mouseY / rect.height - 0.5

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative rounded-2xl transition-shadow duration-300 hover:shadow-2xl",
                className
            )}
            {...props}
        >
            {/* Dynamic Glare Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                style={{
                    background: `radial-gradient(circle 280px at ${glareX} ${glareY}, rgba(255, 255, 255, ${glareOpacity}), transparent 80%)`,
                }}
            />
            <div className="relative z-10 transform-[translateZ(10px)]">{children}</div>
        </motion.div>
    )
}
