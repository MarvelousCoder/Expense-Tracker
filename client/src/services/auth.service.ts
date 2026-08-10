// src/services/auth.service.ts
import api from "@/lib/api"
import { AuthTokens, User } from "@/types"

export interface RegisterData {
    email: string
    username: string
    full_name: string
    password: string
    currency?: "INR" | "USD"
    theme?: "light" | "dark" | "system"
}

export interface LoginData {
    email: string
    password: string
}

export const authService = {
    register: async (data: RegisterData): Promise<AuthTokens> => {
        return api.post<AuthTokens>("/auth/register", data)
    },

    login: async (data: LoginData): Promise<AuthTokens> => {
        return api.post<AuthTokens>("/auth/login", data)
    },

    getMe: async (): Promise<User> => {
        return api.get<User>("/users/me")
    },

    logout: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        return api.post<{ message: string }>("/auth/forgot-password", { email })
    },

    resetPassword: async (
        token: string,
        new_password: string,
        confirm_password: string
    ): Promise<{ message: string }> => {
        return api.post<{ message: string }>("/auth/reset-password", {
            token,
            new_password,
            confirm_password,
        })
    },
}