"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCounterProps {
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    duration?: number
    className?: string
    formatter?: (val: number) => string
}

export function AnimatedCounter({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = 1000,
    className = "",
    formatter,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-20px" })
    const previousValueRef = useRef(0)

    useEffect(() => {
        if (!isInView) return

        const startValue = previousValueRef.current
        const targetValue = value
        const startTime = performance.now()

        let animationFrameId: number

        const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic curve for natural deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            const current = startValue + (targetValue - startValue) * easeProgress

            setDisplayValue(current)

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(updateCounter)
            } else {
                setDisplayValue(targetValue)
                previousValueRef.current = targetValue
            }
        }

        animationFrameId = requestAnimationFrame(updateCounter)

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [value, duration, isInView])

    const formattedNumber = formatter
        ? formatter(displayValue)
        : displayValue.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })

    return (
        <span ref={ref} className={className}>
            {prefix}
            {formattedNumber}
            {suffix}
        </span>
    )
}
