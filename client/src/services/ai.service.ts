// src/services/ai.service.ts
import api from "@/lib/api"

export interface CategorizeResponse {
    category: string
    confidence: string
    method: string
    reasoning: string
}

export interface OCRResponse {
    merchant: string | null
    amount: number | null
    date: string | null
    items: string[]
    category_hint: string | null
    currency: string
    confidence: string
    raw_text: string | null
    error: string | null
}

export interface InsightsResponse {
    insights: string[]
}

export interface ChatResponse {
    response: string
}

export interface SemanticSearchResult {
    id: string
    description: string
    amount: number
    amount_display: number
    transaction_type: string
    payment_method: string
    date: string
    category_name: string | null
    category_icon: string | null
    category_color: string | null
    is_recurring: boolean
    anomaly_score: number | null
    notes: string | null
    similarity_score: number
}

export interface SemanticSearchResponse {
    results: SemanticSearchResult[]
    query: string
    total: number
}

export interface BackfillResponse {
    processed: number
    failed: number
    remaining: number
    message: string
}

export const aiService = {
    categorize: (description: string, amount: number) =>
        api.post<CategorizeResponse>("/ai/categorize", { description, amount }),

    scanReceipt: async (file: File): Promise<OCRResponse> => {
        const token = localStorage.getItem("access_token")
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/ai/ocr/receipt`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            }
        )
        if (!response.ok) throw new Error("OCR failed")
        return response.json()
    },

    getInsights: () => api.get<InsightsResponse>("/ai/insights"),

    chat: (message: string, history: { role: string; content: string }[] = []) =>
        api.post<ChatResponse>("/ai/chat", { message, history }),

    // Search transactions by meaning, not just keywords.
    // Requires transactions to have embeddings — call backfill() first for existing ones.
    search: (query: string, transaction_type?: string, limit: number = 10) =>
        api.post<SemanticSearchResponse>("/ai/search", {
            query,
            ...(transaction_type ? { transaction_type } : {}),
            limit,
        }),

    // Embed all existing transactions so they become searchable.
    // New transactions are embedded automatically on creation.
    // Safe to call multiple times — only processes un-embedded transactions.
    backfill: () => api.post<BackfillResponse>("/ai/search/backfill", {}),
}