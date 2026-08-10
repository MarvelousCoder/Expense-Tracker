// src/app/(auth)/forgot-password/page.tsx
"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ArrowLeft, TrendingUp, Loader2, MailCheck } from "lucide-react"
import { motion } from "framer-motion"

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const { forgotPassword, isLoading, error, message } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordForm) => {
        await forgotPassword(data.email)
    }

    return (
        <div className="min-h-screen bg-background flex">
            <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-primary/20 via-background to-background items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-md"
                >
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">TrackWise</span>
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                        Forgot your <span className="gradient-text">password?</span>
                    </h1>

                    <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                        No worries. Enter the email tied to your account and we&apos;ll send
                        you a link to set a new one.
                    </p>
                </motion.div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold">TrackWise</span>
                    </div>
                    <div className="hidden lg:block" />
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-sm"
                    >
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>

                        {message ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <MailCheck className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight mb-2">
                                    Check your inbox
                                </h2>
                                <p className="text-muted-foreground text-sm">{message}</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                                        Reset your password
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        We&apos;ll email you a link to get back in
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            {...register("email")}
                                            className={errors.email ? "border-destructive" : ""}
                                        />
                                        {errors.email && (
                                            <p className="text-destructive text-xs">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending link...
                                            </>
                                        ) : (
                                            "Send reset link"
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}