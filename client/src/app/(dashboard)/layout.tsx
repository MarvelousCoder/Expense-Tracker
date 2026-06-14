// src/app/(dashboard)/layout.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const router = useRouter()

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.replace("/login")
  //   }
  // }, [isAuthenticated, router])

  // if (!isAuthenticated) return null

  // ── Hydration guard ───────────────────────────────────────────────────
  // Zustand persist takes one tick to rehydrate from localStorage.
  // Without this flag, isAuthenticated is false on first render even
  // for logged-in users, causing an immediate redirect to /login.
  // We wait until after mount (hydration complete) before checking auth.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    // Only run auth check after Zustand has hydrated from localStorage
    if (hydrated && !isAuthenticated) {
      router.replace("/login")
    }
  }, [hydrated, isAuthenticated, router])

  // Show nothing until hydration is complete — prevents flash of login redirect
  if (!hydrated) return null

  // After hydration, if not authenticated, return null while redirect happens
  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}