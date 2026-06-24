// src/app/(auth)/register/page.tsx
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
import { Eye, EyeOff, TrendingUp, Loader2, Check } from "lucide-react"
import { motion } from "framer-motion"

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric only"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  currency: z.enum(["INR", "USD"]).default("INR"),
})

type RegisterForm = z.infer<typeof registerSchema>

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
]

export default function RegisterPage() {
  const { register: registerUser, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm, unknown, RegisterForm>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { currency: "INR" },
  })

  const onSubmit = async (data: RegisterForm) => {
    await registerUser({ ...data, theme: "system" })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">TrackWise</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Have an account?
          </span>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Start tracking your finances intelligently
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

            {/* Name + Username row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  {...register("full_name")}
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-destructive text-xs">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register("username")}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && (
                  <p className="text-destructive text-xs">{errors.username.message}</p>
                )}
              </div>
            </div>

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
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password strength indicators */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1 pt-1"
                >
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${req.test(password)
                          ? "bg-green-500"
                          : "bg-muted"
                        }`}>
                        {req.test(password) && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className={`text-xs transition-colors ${req.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                        }`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label>Primary currency</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["INR", "USD"] as const).map((currency) => (
                  <label
                    key={currency}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={currency}
                      {...register("currency")}
                      className="peer sr-only"
                    />
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                      <span className="text-base">
                        {currency === "INR" ? "₹" : "$"}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{currency}</p>
                        <p className="text-xs text-muted-foreground">
                          {currency === "INR" ? "Indian Rupee" : "US Dollar"}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                : "Create account"
              }
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}