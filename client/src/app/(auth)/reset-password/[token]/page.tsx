// // src/app/(auth)/reset-password/[token]/page.tsx
// "use client"

// import { useState, Suspense } from "react"
// import Link from "next/link"
// import { useSearchParams } from "next/navigation"
// import { useAuth } from "@/hooks/useAuth"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { ThemeToggle } from "@/components/shared/theme-toggle"
// import { Eye, EyeOff, TrendingUp, Loader2, CheckCircle2 } from "lucide-react"
// import { motion } from "framer-motion"

// const resetPasswordSchema = z
//     .object({
//         new_password: z
//             .string()
//             .min(8, "Password must be at least 8 characters")
//             .regex(/[A-Z]/, "Must contain at least one uppercase letter")
//             .regex(/[0-9]/, "Must contain at least one number"),
//         confirm_password: z.string(),
//     })
//     .refine((data) => data.new_password === data.confirm_password, {
//         message: "Passwords do not match",
//         path: ["confirm_password"],
//     })

// type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

// function ResetPasswordForm() {
//     const searchParams = useSearchParams()
//     const token = searchParams.get("token") || ""
//     const { resetPassword, isLoading, error, message } = useAuth()
//     const [showPassword, setShowPassword] = useState(false)

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<ResetPasswordForm>({
//         resolver: zodResolver(resetPasswordSchema),
//     })

//     const onSubmit = async (data: ResetPasswordForm) => {
//         await resetPassword(token, data.new_password, data.confirm_password)
//     }

//     if (!token) {
//         return (
//             <div className="text-center">
//                 <h2 className="text-xl font-bold tracking-tight mb-2">
//                     Invalid reset link
//                 </h2>
//                 <p className="text-muted-foreground text-sm mb-6">
//                     This link is missing or malformed. Please request a new one.
//                 </p>
//                 <Link href="/forgot-password">
//                     <Button className="w-full">Request new link</Button>
//                 </Link>
//             </div>
//         )
//     }

//     if (message) {
//         return (
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-center"
//             >
//                 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
//                     <CheckCircle2 className="w-7 h-7 text-primary" />
//                 </div>
//                 <h2 className="text-xl font-bold tracking-tight mb-2">
//                     Password updated
//                 </h2>
//                 <p className="text-muted-foreground text-sm">{message}</p>
//                 <p className="text-muted-foreground text-xs mt-4">
//                     Redirecting you to login...
//                 </p>
//             </motion.div>
//         )
//     }

//     return (
//         <>
//             <div className="mb-8">
//                 <h2 className="text-2xl font-bold tracking-tight mb-1">
//                     Set a new password
//                 </h2>
//                 <p className="text-muted-foreground text-sm">
//                     Make sure it&apos;s at least 8 characters
//                 </p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 {error && (
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
//                     >
//                         {error}
//                     </motion.div>
//                 )}

//                 <div className="space-y-1.5">
//                     <Label htmlFor="new_password">New password</Label>
//                     <div className="relative">
//                         <Input
//                             id="new_password"
//                             type={showPassword ? "text" : "password"}
//                             placeholder="••••••••"
//                             autoComplete="new-password"
//                             {...register("new_password")}
//                             className={errors.new_password ? "border-destructive pr-10" : "pr-10"}
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                         >
//                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                         </button>
//                     </div>
//                     {errors.new_password && (
//                         <p className="text-destructive text-xs">{errors.new_password.message}</p>
//                     )}
//                 </div>

//                 <div className="space-y-1.5">
//                     <Label htmlFor="confirm_password">Confirm password</Label>
//                     <Input
//                         id="confirm_password"
//                         type={showPassword ? "text" : "password"}
//                         placeholder="••••••••"
//                         autoComplete="new-password"
//                         {...register("confirm_password")}
//                         className={errors.confirm_password ? "border-destructive" : ""}
//                     />
//                     {errors.confirm_password && (
//                         <p className="text-destructive text-xs">
//                             {errors.confirm_password.message}
//                         </p>
//                     )}
//                 </div>

//                 <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? (
//                         <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Updating...
//                         </>
//                     ) : (
//                         "Update password"
//                     )}
//                 </Button>
//             </form>
//         </>
//     )
// }

// export default function ResetPasswordPage() {
//     return (
//         <div className="min-h-screen bg-background flex">
//             <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/20 via-background to-background items-center justify-center p-12 overflow-hidden">
//                 <div className="absolute inset-0 bg-grid opacity-40" />
//                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
//                 <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="relative z-10 max-w-md"
//                 >
//                     <div className="flex items-center gap-3 mb-12">
//                         <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
//                             <TrendingUp className="w-5 h-5 text-primary-foreground" />
//                         </div>
//                         <span className="text-xl font-semibold tracking-tight">TrackWise</span>
//                     </div>

//                     <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
//                         Almost <span className="gradient-text">there</span>
//                     </h1>

//                     <p className="text-muted-foreground text-lg leading-relaxed mb-10">
//                         Choose a strong new password to get back into your account.
//                     </p>
//                 </motion.div>
//             </div>

//             <div className="w-full lg:w-1/2 flex flex-col">
//                 <div className="flex items-center justify-between p-6">
//                     <div className="flex items-center gap-2 lg:hidden">
//                         <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
//                             <TrendingUp className="w-4 h-4 text-primary-foreground" />
//                         </div>
//                         <span className="font-semibold">TrackWise</span>
//                     </div>
//                     <div className="hidden lg:block" />
//                     <ThemeToggle />
//                 </div>

//                 <div className="flex-1 flex items-center justify-center p-6">
//                     <motion.div
//                         initial={{ opacity: 0, y: 16 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.4 }}
//                         className="w-full max-w-sm"
//                     >
//                         <Suspense fallback={<Loader2 className="w-5 h-5 animate-spin mx-auto" />}>
//                             <ResetPasswordForm />
//                         </Suspense>
//                     </motion.div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// src/app/(auth)/reset-password/[token]/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Eye, EyeOff, TrendingUp, Loader2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const resetPasswordSchema = z
    .object({
        new_password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const params = useParams<{ token: string }>()
    const token = params.token
    const { resetPassword, isLoading, error, message } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordForm) => {
        await resetPassword(token, data.new_password, data.confirm_password)
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
                        Almost <span className="gradient-text">there</span>
                    </h1>

                    <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                        Choose a strong new password to get back into your account.
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
                        {!token ? (
                            <div className="text-center">
                                <h2 className="text-xl font-bold tracking-tight mb-2">
                                    Invalid reset link
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    This link is missing or malformed. Please request a new one.
                                </p>
                                <Link href="/forgot-password">
                                    <Button className="w-full">Request new link</Button>
                                </Link>
                            </div>
                        ) : message ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight mb-2">
                                    Password updated
                                </h2>
                                <p className="text-muted-foreground text-sm">{message}</p>
                                <p className="text-muted-foreground text-xs mt-4">
                                    Redirecting you to login...
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                                        Set a new password
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Make sure it&apos;s at least 8 characters
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
                                        <Label htmlFor="new_password">New password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new_password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                {...register("new_password")}
                                                className={errors.new_password ? "border-destructive pr-10" : "pr-10"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.new_password && (
                                            <p className="text-destructive text-xs">{errors.new_password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirm_password">Confirm password</Label>
                                        <Input
                                            id="confirm_password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            {...register("confirm_password")}
                                            className={errors.confirm_password ? "border-destructive" : ""}
                                        />
                                        {errors.confirm_password && (
                                            <p className="text-destructive text-xs">
                                                {errors.confirm_password.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update password"
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