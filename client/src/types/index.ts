// src/types/index.ts

export type Currency = "INR" | "USD"
export type Theme = "light" | "dark" | "system"

export interface User {
    id: string
    email: string
    username: string
    full_name: string
    currency: Currency
    theme: Theme
    avatar_url: string | null
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
    last_login: string | null
}

export interface AuthTokens {
    access_token: string
    refresh_token: string
    token_type: string
    user: User
}

export interface ApiError {
    detail: string
    status?: string
    message?: string
}