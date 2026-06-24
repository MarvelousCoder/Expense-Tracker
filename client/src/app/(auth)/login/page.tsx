// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Eye, EyeOff, TrendingUp, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    await login(data)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/20 via-background to-background items-center justify-center p-12 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40" />

        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TrackWise
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
            Take control of your{" "}
            <span className="gradient-text">financial future</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            AI-powered insights, smart categorization, and real-time analytics
            to help you spend smarter.
          </p>

          {/* Feature list */}
          {[
            "Smart expense categorization with AI",
            "Real-time budget tracking & alerts",
            "OCR receipt scanning",
            "Predictive spending analytics",
          ].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">TrackWise</span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              No account?
            </span>
            <Link href="/register">
              <Button variant="outline" size="sm">
                Sign up
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Global error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                  : "Sign in"
                }
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Create one free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}