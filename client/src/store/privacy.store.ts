// client/src/store/privacy.store.ts
"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PrivacyState {
    isMasked: boolean
    toggleMask: () => void
    setMasked: (masked: boolean) => void
}

export const usePrivacyStore = create<PrivacyState>()(
    persist(
        (set) => ({
            isMasked: false,
            toggleMask: () => set((state) => ({ isMasked: !state.isMasked })),
            setMasked: (masked) => set({ isMasked: masked }),
        }),
        {
            name: "trackwise-privacy-mode",
        }
    )
)
