// client/src/lib/confetti.ts
/**
 * Zero-dependency canvas confetti engine with natural physics
 */

interface ConfettiOptions {
    particleCount?: number
    spread?: number
    origin?: { x: number; y: number }
    colors?: string[]
}

export function triggerConfetti(options: ConfettiOptions = {}) {
    if (typeof window === "undefined") return

    const {
        particleCount = 60,
        spread = 70,
        origin = { x: 0.5, y: 0.6 },
        colors = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#3B82F6"],
    } = options

    let canvas = document.getElementById("trackwise-confetti-canvas") as HTMLCanvasElement

    if (!canvas) {
        canvas = document.createElement("canvas")
        canvas.id = "trackwise-confetti-canvas"
        canvas.style.position = "fixed"
        canvas.style.inset = "0"
        canvas.style.width = "100vw"
        canvas.style.height = "100vh"
        canvas.style.pointerEvents = "none"
        canvas.style.zIndex = "999999"
        document.body.appendChild(canvas)
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        size: number
        color: string
        rotation: number
        rotationSpeed: number
        opacity: number
        shape: "circle" | "rect"
    }> = []

    const startX = origin.x * canvas.width
    const startY = origin.y * canvas.height

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI / 180) * (270 + (Math.random() - 0.5) * spread)
        const velocity = 8 + Math.random() * 12

        particles.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 4,
            vy: Math.sin(angle) * velocity,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            opacity: 1,
            shape: Math.random() > 0.5 ? "rect" : "circle",
        })
    }

    let animationId: number

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let activeParticles = 0

        for (const p of particles) {
            if (p.opacity <= 0.01) continue

            activeParticles++
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.35 // gravity
            p.vx *= 0.98 // air resistance
            p.rotation += p.rotationSpeed
            p.opacity -= 0.012

            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate((p.rotation * Math.PI) / 180)
            ctx.globalAlpha = Math.max(0, p.opacity)
            ctx.fillStyle = p.color

            if (p.shape === "rect") {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
            } else {
                ctx.beginPath()
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()
        }

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(render)
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            cancelAnimationFrame(animationId)
        }
    }

    animationId = requestAnimationFrame(render)
}
