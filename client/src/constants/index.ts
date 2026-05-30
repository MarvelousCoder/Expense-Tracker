// src/constants/index.ts

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Expense_Tracker"

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    TRANSACTIONS: "/transactions",
    BUDGETS: "/budgets",
    ANALYTICS: "/analytics",
    AI_INSIGHTS: "/ai-insights",
    SETTINGS: "/settings",
} as const

export const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
] as const

export const DEFAULT_CATEGORIES = [
    { name: "Food", icon: "🍔", color: "#F59E0B" },
    { name: "Travel", icon: "✈️", color: "#3B82F6" },
    { name: "Shopping", icon: "🛍️", color: "#EC4899" },
    { name: "Bills", icon: "📄", color: "#6366F1" },
    { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
    { name: "Health", icon: "🏥", color: "#10B981" },
    { name: "Education", icon: "📚", color: "#F97316" },
] as const