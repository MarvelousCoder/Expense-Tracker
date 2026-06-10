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
}