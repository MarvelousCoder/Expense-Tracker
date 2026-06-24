// src/constants/index.ts

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "TrackWise"

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

export const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
    },
    {
        label: "Transactions",
        href: "/transactions",
        icon: "ArrowLeftRight",
    },
    {
        label: "Budgets",
        href: "/budgets",
        icon: "Target",
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: "BarChart3",
    },
    {
        label: "AI Insights",
        href: "/ai-insights",
        icon: "Sparkles",
    },
    {
        label: "Settings",
        href: "/settings",
        icon: "Settings",
    },
] as const

export const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
] as const

// export const DEFAULT_CATEGORIES = [
//     { name: "Food", icon: "🍔", color: "#F59E0B" },
//     { name: "Travel", icon: "✈️", color: "#3B82F6" },
//     { name: "Shopping", icon: "🛍️", color: "#EC4899" },
//     { name: "Bills", icon: "📄", color: "#6366F1" },
//     { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
//     { name: "Health", icon: "🏥", color: "#10B981" },
//     { name: "Education", icon: "📚", color: "#F97316" },
// ] as const


// Fixed priority order for category dropdown — daily use first, rare last
// Must match exact names from seed.py
export const CATEGORY_SORT_ORDER = [
    "Salary",
    "Food & Dining",
    "Groceries",
    "Fuel",
    "Shopping",
    "Bills & Utilities",
    "Rent",
    "EMI",
    "Subscriptions",
    "Health",
    "Entertainment",
    "Education",
    "Travel",
    "Investment",
    "Other",
] as const

export const PAYMENT_METHODS = [
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "net_banking", label: "Net Banking" },
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank" },
] as const

export const DEFAULT_CATEGORIES = [
    { name: "Food & Dining", icon: "🍔", color: "#F59E0B" },
    { name: "Travel", icon: "✈️", color: "#3B82F6" },
    { name: "Shopping", icon: "🛍️", color: "#EC4899" },
    { name: "Bills", icon: "📄", color: "#6366F1" },
    { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
    { name: "Health", icon: "🏥", color: "#10B981" },
    { name: "Education", icon: "📚", color: "#F97316" },
] as const