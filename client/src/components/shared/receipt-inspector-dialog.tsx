"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    CheckCircle2,
    Receipt,
    Sparkles,
    ArrowRight,
    ScanLine,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ReceiptInspectorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageSrc: string | null
    ocrData: any | null
    isScanning: boolean
    onUseData?: (data: any) => void
}

export function ReceiptInspectorDialog({
    open,
    onOpenChange,
    imageSrc,
    ocrData,
    isScanning,
    onUseData,
}: ReceiptInspectorDialogProps) {
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
    const handleReset = () => {
        setZoom(1)
        setRotation(0)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col glass-card border border-border/80 shadow-2xl">
                <DialogHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center text-ai">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <span>Receipt AI Inspector</span>
                                {isScanning && (
                                    <Badge variant="secondary" className="badge-ai text-[10px] animate-pulse">
                                        Scanning OCR...
                                    </Badge>
                                )}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Interactive pan, zoom, and extracted field verification
                            </p>
                        </div>
                    </div>

                    {/* Zoom & Rotate Controls */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-xs font-mono px-1.5 text-muted-foreground">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleZoomIn}
                            title="Zoom In"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleRotate}
                            title="Rotate 90°"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleReset}
                            title="Reset View"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Viewport Area */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-95 overflow-hidden">
                    {/* Left/Main Image Canvas */}
                    <div className="md:col-span-7 bg-muted/40 relative flex items-center justify-center overflow-hidden p-4 border-r border-border/60 select-none">
                        {imageSrc ? (
                            <div className="relative overflow-hidden flex items-center justify-center w-full h-full max-h-115">
                                <motion.img
                                    src={imageSrc}
                                    alt="Receipt Preview"
                                    animate={{
                                        scale: zoom,
                                        rotate: rotation,
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-md cursor-grab active:cursor-grabbing"
                                    drag
                                    dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
                                />

                                {/* Laser scan line effect during OCR */}
                                {isScanning && (
                                    <motion.div
                                        initial={{ top: "0%" }}
                                        animate={{ top: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-ai to-transparent shadow-[0_0_15px_#a855f7] z-20 pointer-events-none"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-xs text-muted-foreground">
                                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No receipt image loaded
                            </div>
                        )}
                    </div>

                    {/* Right OCR Extracted Fields Panel */}
                    <div className="md:col-span-5 p-5 flex flex-col justify-between bg-card/60 backdrop-blur-md overflow-y-auto">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-ai" /> Extracted Metadata
                                </span>
                                {ocrData && !isScanning && (
                                    <Badge variant="outline" className="text-[11px] text-emerald-500 border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                                    </Badge>
                                )}
                            </div>

                            {isScanning ? (
                                <div className="space-y-4 py-8 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-ai/10 flex items-center justify-center mx-auto text-ai animate-spin">
                                        <ScanLine className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Analyzing merchant, date, tax, and line items...
                                    </p>
                                </div>
                            ) : ocrData ? (
                                <div className="space-y-3 text-xs">
                                    <div className="p-3 rounded-xl bg-muted/50 border border-border/70">
                                        <span className="text-muted-foreground">Merchant / Vendor</span>
                                        <p className="font-bold text-sm text-foreground mt-0.5">
                                            {ocrData.merchant || "Unknown Merchant"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl bg-muted/50 border border-border/70">
                                            <span className="text-muted-foreground">Detected Total</span>
                                            <p className="font-bold text-sm font-amount text-primary mt-0.5">
                                                ₹{Number(ocrData.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-muted/50 border border-border/70">
                                            <span className="text-muted-foreground">Date</span>
                                            <p className="font-semibold text-foreground mt-0.5">
                                                {ocrData.date || "Today"}
                                            </p>
                                        </div>
                                    </div>

                                    {ocrData.category && (
                                        <div className="p-3 rounded-xl bg-ai/10 border border-ai/20">
                                            <span className="text-ai font-medium">Suggested Category</span>
                                            <p className="font-bold text-foreground capitalize mt-0.5">
                                                {ocrData.category}
                                            </p>
                                        </div>
                                    )}

                                    {ocrData.items && ocrData.items.length > 0 && (
                                        <div className="mt-3">
                                            <span className="text-muted-foreground font-medium mb-1 block">
                                                Line Items ({ocrData.items.length})
                                            </span>
                                            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                                                {ocrData.items.map((item: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between p-1.5 rounded-lg bg-muted/30 text-[11px]"
                                                    >
                                                        <span className="truncate">{item.description || item.name}</span>
                                                        <span className="font-amount font-semibold ml-2 shrink-0">
                                                            ₹{Number(item.price || item.amount || 0).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    Upload an invoice or supermarket receipt to preview AI breakdown.
                                </div>
                            )}
                        </div>

                        {ocrData && onUseData && (
                            <div className="pt-4 border-t border-border/60 mt-4">
                                <Button
                                    className="w-full shadow-md shadow-primary/25 interactive-hover"
                                    onClick={() => {
                                        onUseData(ocrData)
                                        onOpenChange(false)
                                    }}
                                >
                                    Confirm & Create Transaction <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
