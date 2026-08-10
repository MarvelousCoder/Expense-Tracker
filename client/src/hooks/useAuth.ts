// src/hooks/useAuth.ts
"use client"

import { useAuthStore } from "@/store/auth.store"
import { authService, LoginData, RegisterData } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useAuth() {
    const { setAuth, logout: clearAuth, isAuthenticated, user } = useAuthStore()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const register = async (data: RegisterData) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.register(data)
            setAuth(response)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (data: LoginData) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.login(data)
            setAuth(response)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        authService.logout()
        clearAuth()
        router.push("/login")
    }

    const forgotPassword = async (email: string) => {
        setIsLoading(true)
        setError(null)
        setMessage(null)
        try {
            const response = await authService.forgotPassword(email)
            setMessage(response.message)
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const resetPassword = async (
        token: string,
        newPassword: string,
        confirmPassword: string
    ) => {
        setIsLoading(true)
        setError(null)
        setMessage(null)
        try {
            const response = await authService.resetPassword(
                token,
                newPassword,
                confirmPassword
            )
            setMessage(response.message)
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) {
            setError(err.message || "Could not reset password. The link may have expired.")
        } finally {
            setIsLoading(false)
        }
    }

    return {
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        isLoading,
        error,
        message,
        isAuthenticated,
        user,
    }
}