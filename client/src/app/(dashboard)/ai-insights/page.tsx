// src/app/(dashboard)/ai-insights/page.tsx
"use client"

import { useState, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { aiService } from "@/services/ai.service"
import { useAuthStore } from "@/store/auth.store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles, Send, Upload, Bot,
    User, Loader2, ReceiptText, TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AddTransactionModal, InitialTransactionData } from "@/components/forms/add-transaction-modal"

// ================================
// Insights Section
// ================================
function InsightsSection() {
    const { data, isLoading } = useQuery({
        queryKey: ["ai-insights"],
        queryFn: aiService.getInsights,
        staleTime: 5 * 60 * 1000,
    })

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {(data?.insights ?? []).map((insight, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed">{insight}</p>
                </motion.div>
            ))}
        </div>
    )
}

// ================================
// OCR Receipt Scanner Section
// ================================
function OCRSection({ onUseData }: { onUseData: (data: InitialTransactionData) => void }) {
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<any>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setScanning(true)
        setResult(null)

        try {
            const data = await aiService.scanReceipt(file)
            setResult(data)
            if (data.error) {
                toast.error("Could not read receipt: " + data.error)
            } else {
                toast.success("Receipt scanned successfully!")
            }
        } catch (err) {
            toast.error("Failed to scan receipt")
        } finally {
            setScanning(false)
        }
    }

    return (
        <div className="space-y-4">
            <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                onClick={() => fileRef.current?.click()}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScan}
                    aria-label="Upload receipt image"
                />
                {scanning ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Scanning receipt...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload a receipt</p>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG or WEBP · Max 5MB
                        </p>
                    </div>
                )}
            </div>

            {/* OCR Result */}
            <AnimatePresence>
                {result && !result.error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <ReceiptText className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm">Extracted Data</h4>
                                <Badge variant="secondary" className="text-xs ml-auto">
                                    {result.confidence} confidence
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {result.merchant && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Merchant</p>
                                        <p className="font-medium">{result.merchant}</p>
                                    </div>
                                )}
                                {result.amount && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="font-medium text-primary">
                                            ₹{result.amount.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                )}
                                {result.date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Date</p>
                                        <p className="font-medium">{result.date}</p>
                                    </div>
                                )}
                                {result.category_hint && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Category</p>
                                        <p className="font-medium">{result.category_hint}</p>
                                    </div>
                                )}
                            </div>

                            {result.items?.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Items</p>
                                    <div className="flex flex-wrap gap-1">
                                        {result.items.map((item: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    onUseData({
                                        description: result.merchant || "",
                                        amount: result.amount || undefined,
                                        date: result.date || new Date().toISOString().split("T")[0],
                                        category_hint: result.category_hint,
                                    })
                                }}
                            >
                                Use This Data to Add Transaction
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ================================
// Chat Section
// ================================
interface Message {
    role: "user" | "assistant"
    content: string
}

const SUGGESTED_QUESTIONS = [
    "How much did I spend this month?",
    "What is my total balance?",
    "Which category costs me the most?",
    "How are my savings this month?",
]

function ChatSection() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm your AI financial assistant. Ask me anything about your spending, income, or savings. 💰",
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return

        const userMessage: Message = { role: "user", content: text }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const history = messages
                .slice(-6)
                .map((m) => ({ role: m.role, content: m.content }))

            const result = await aiService.chat(text, history)

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: result.response },
            ])
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
            ])
        } finally {
            setLoading(false)
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
        }
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex items-start gap-2.5",
                            msg.role === "user" ? "flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                            msg.role === "assistant"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {msg.role === "assistant"
                                ? <Bot className="w-3.5 h-3.5" />
                                : <User className="w-3.5 h-3.5" />
                            }
                        </div>
                        <div className={cn(
                            "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm",
                            msg.role === "assistant"
                                ? "bg-muted text-foreground"
                                : "bg-primary text-primary-foreground"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-xl px-3.5 py-2.5">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggested questions */}
            {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    placeholder="Ask about your finances..."
                    className="flex-1"
                    disabled={loading}
                />
                <Button
                    size="icon"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

// ================================
// Main Page
// ================================
export default function AIInsightsPage() {
    const [activeTab, setActiveTab] = useState<"insights" | "chat" | "ocr">("insights")

    // State for the Add Transaction modal, opened from OCR scan results.
    // Lives at the page level so it can be triggered from inside OCRSection.
    const [addOpen, setAddOpen] = useState(false)
    const [addTransactionData, setAddTransactionData] = useState<InitialTransactionData | null>(null)

    const tabs = [
        { id: "insights", label: "Insights", icon: TrendingUp },
        { id: "chat", label: "Chat", icon: Bot },
        { id: "ocr", label: "Receipt Scanner", icon: ReceiptText },
    ] as const

    return (
        <div className="space-y-6 page-enter">
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    AI Insights
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    AI-powered financial analysis and assistance
                </p>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            <Card className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "insights" && <InsightsSection />}
                        {activeTab === "chat" && <ChatSection />}

                        {activeTab === "ocr" && (
                            <OCRSection
                                onUseData={(extractedData) => {
                                    // Real integration — open Add Transaction modal pre-filled
                                    // with the scanned receipt data, instead of just logging it
                                    setAddTransactionData(extractedData)
                                    setAddOpen(true)
                                }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </Card>

            <AddTransactionModal
                open={addOpen}
                onOpenChange={(open) => {
                    setAddOpen(open)
                    if (!open) setAddTransactionData(null)
                }}
                initialData={addTransactionData}
            />
        </div>
    )
}