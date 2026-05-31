// src/store/auth.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User, AuthTokens } from "@/types"

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean

    // Actions
    setAuth: (data: AuthTokens) => void
    setUser: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (data: AuthTokens) => {
                // Also set in localStorage for axios interceptor
                localStorage.setItem("access_token", data.access_token)
                localStorage.setItem("refresh_token", data.refresh_token)
                set({
                    user: data.user,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    isAuthenticated: true,
                })
            },

            setUser: (user: User) => set({ user }),

            logout: () => {
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                })
            },
        }),
        {
            name: "expense_tracker-auth",
            // Only persist these fields
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)