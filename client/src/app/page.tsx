
// import { redirect } from "next/navigation"

// export default function HomePage() {
//   // redirect("/dashboard")
//   redirect("/login")
// }

// // NOTE: 2nd change

// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { motion } from "framer-motion"
// import { useAuthStore } from "@/store/auth.store"
// import { ThemeToggle } from "@/components/shared/theme-toggle"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import {
//   TrendingUp,
//   ShieldCheck,
//   Sparkles,
//   ArrowRight,
//   PieChart as PieIcon,
//   Bot,
//   Zap,
//   CheckCircle2,
//   ChevronRight,
//   Receipt,
//   Wallet,
//   ArrowUpRight,
//   BarChart3,
//   Sliders,
//   Lock,
// } from "lucide-react"
// import { AnimatedCounter } from "@/components/shared/animated-counter"
// import { SpotlightCard } from "@/components/shared/spotlight-card"


// export default function HomePage() {
//   const { isAuthenticated } = useAuthStore()

//   // Savings Calculator state for interactive widget
//   const [income, setIncome] = useState(85000)
//   const [expenseRatio, setExpenseRatio] = useState(65)

//   const currentExpenses = Math.round((income * expenseRatio) / 100)
//   const currentSavings = income - currentExpenses
//   // With TrackWise optimization (average 15% reduction in discretionary leakage)
//   const optimizedExpenses = Math.round(currentExpenses * 0.85)
//   const optimizedSavings = income - optimizedExpenses
//   const extraAnnualWealth = (optimizedSavings - currentSavings) * 12

//   return (
//     <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
//       {/* ─────────────────────────────────────────────────────────────
//           1. STICKY FROSTED NAVBAR
//       ───────────────────────────────────────────────────────────── */}
//       <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/60 transition-all duration-300">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//           <Link href="/" className="flex items-center gap-2.5 group">
//             <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105 duration-200">
//               <TrendingUp className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <span className="font-heading font-bold text-xl tracking-tight">
//               Track<span className="text-primary">Wise</span>
//             </span>
//           </Link>

//           <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
//             <a href="#features" className="hover:text-foreground transition-colors">
//               Features
//             </a>
//             <a href="#calculator" className="hover:text-foreground transition-colors">
//               ROI Calculator
//             </a>
//             <a href="#intelligence" className="hover:text-foreground transition-colors">
//               AI Engine
//             </a>
//             {/* <a href="#testimonials" className="hover:text-foreground transition-colors">
//               Testimonials
//             </a> */}
//           </nav>

//           <div className="flex items-center gap-3">
//             <ThemeToggle />
//             {isAuthenticated ? (
//               <Button asChild size="sm" className="shadow-md shadow-primary/20">
//                 <Link href="/dashboard" className="flex items-center gap-1.5">
//                   Dashboard <ArrowRight className="w-4 h-4 ml-1" />
//                 </Link>
//               </Button>
//             ) : (
//               <>
//                 <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
//                   <Link href="/login">Sign In</Link>
//                 </Button>
//                 <Button size="sm" asChild className="shadow-md shadow-primary/25">
//                   <Link href="/register" className="flex items-center gap-1">
//                     Get Started <ChevronRight className="w-4 h-4" />
//                   </Link>
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="flex-1">
//         {/* ─────────────────────────────────────────────────────────────
//             2. HERO SECTION WITH MESH GRADIENT & MOCKUP
//         ───────────────────────────────────────────────────────────── */}
//         <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden mesh-gradient">
//           <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

//           {/* Decorative glowing gradient orbs */}
//           <div className="absolute top-10 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-linear-to-tr from-primary/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

//           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
//             {/* Announcement badge */}
//             <motion.div
//               initial={{ opacity: 0, y: -16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-8 backdrop-blur-md shadow-sm"
//             >
//               <Sparkles className="w-3.5 h-3.5 text-primary" />
//               <span>TrackWise 2.0 • AI-Powered Wealth Intelligence</span>
//               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//             </motion.div>

//             {/* Headline */}
//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//               className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6 font-heading"
//             >
//               Master Your Wealth with{" "}
//               <span className="gradient-text">Predictive Intelligence</span>
//             </motion.h1>

//             {/* Subtitle */}
//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
//             >
//               Stop wondering where your earnings vanish. TrackWise automatically tracks,
//               categorizes, and predicts your financial health with machine learning and
//               actionable budget radar.
//             </motion.p>

//             {/* Action buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.3 }}
//               className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
//             >
//               <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/30 interactive-hover">
//                 <Link href={isAuthenticated ? "/dashboard" : "/register"} className="flex items-center gap-2">
//                   {isAuthenticated ? "Open Dashboard" : "Start Tracking Free"}
//                   <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </Button>
//               <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base interactive-hover">
//                 <a href="#calculator" className="flex items-center gap-2">
//                   <Sliders className="w-4 h-4 text-primary" />
//                   Calculate Savings ROI
//                 </a>
//               </Button>
//             </motion.div>

//             {/* Trust points */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.6, delay: 0.4 }}
//               className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground mb-16"
//             >
//               <div className="flex items-center gap-2">
//                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                 <span>Zero Manual Excel Logging</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
//                 <span>Bank-grade 256-bit Encryption</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Zap className="w-4 h-4 text-amber-500" />
//                 <span>Instant OCR Receipt Scanner</span>
//               </div>
//             </motion.div>

//             {/* ── Interactive Dashboard Mockup Preview ── */}
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.4 }}
//               className="relative mx-auto max-w-5xl rounded-2xl p-2 sm:p-4 border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden"
//             >
//               {/* Window Controls */}
//               <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 px-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-rose-500/80" />
//                   <div className="w-3 h-3 rounded-full bg-amber-500/80" />
//                   <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
//                   <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">
//                     TrackWise Financial Command Center
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
//                     Live Sync • Ready
//                   </Badge>
//                 </div>
//               </div>

//               {/* Mockup Dashboard Content Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
//                 {/* Balance Card */}
//                 <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-muted-foreground">Total Net Balance</span>
//                     <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
//                       <Wallet className="w-4 h-4" />
//                     </div>
//                   </div>
//                   <div className="text-2xl sm:text-3xl font-bold font-amount text-foreground mb-1">
//                     ₹3,42,850.00
//                   </div>
//                   <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
//                     <ArrowUpRight className="w-3.5 h-3.5" />
//                     <span>+18.4% vs last month</span>
//                   </div>
//                 </div>

//                 {/* Monthly Income Card */}
//                 <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm hover:border-emerald-500/40 transition-all">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-muted-foreground">Monthly Inflow</span>
//                     <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
//                       <TrendingUp className="w-4 h-4" />
//                     </div>
//                   </div>
//                   <div className="text-2xl sm:text-3xl font-bold font-amount text-foreground mb-1">
//                     ₹1,25,000.00
//                   </div>
//                   <div className="text-xs text-muted-foreground">Primary salary + freelance dividend</div>
//                 </div>

//                 {/* Savings Rate Card */}
//                 <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm hover:border-purple-500/40 transition-all">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-muted-foreground">Savings Rate</span>
//                     <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
//                       <PieIcon className="w-4 h-4" />
//                     </div>
//                   </div>
//                   <div className="text-2xl sm:text-3xl font-bold font-amount text-purple-500 mb-1">
//                     38%
//                   </div>
//                   <div className="w-full bg-muted rounded-full h-1.5 mt-2">
//                     <div className="bg-purple-500 h-1.5 rounded-full w-[76%]" />
//                   </div>
//                 </div>
//               </div>

//               {/* Mockup Dynamic Activity & AI notification banner */}
//               <div className="mt-4 p-3.5 rounded-xl bg-linear-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
//                     <Bot className="w-5 h-5 text-primary-foreground" />
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold flex items-center gap-2">
//                       <span>Smart Budget Radar Alert</span>
//                       <Badge className="badge-ai text-[10px] py-0 px-1.5">AI Insight</Badge>
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       Dining expenses increased by 14% this weekend. TrackWise redirected ₹2,400 to your emergency reserve!
//                     </div>
//                   </div>
//                 </div>
//                 <Button size="sm" variant="outline" className="text-xs shrink-0 bg-background/80">
//                   Review Leakage
//                 </Button>
//               </div>
//             </motion.div>
//           </div>
//         </section>

//         {/* ─────────────────────────────────────────────────────────────
//             3. KEY METRICS STRIP (ANIMATED STATS)
//         ───────────────────────────────────────────────────────────── */}
//         <section className="py-12 border-y border-border/60 bg-muted/30">
//           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//               <div>
//                 <div className="text-3xl sm:text-4xl font-bold font-amount text-foreground mb-1">
//                   ₹<AnimatedCounter value={120} suffix="M+" />
//                 </div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">Transactions Tracked</div>
//               </div>
//               <div>
//                 <div className="text-3xl sm:text-4xl font-bold font-amount text-primary mb-1">
//                   <AnimatedCounter value={99} suffix=".4%" decimals={1} />
//                 </div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">AI Categorization Accuracy</div>
//               </div>
//               <div>
//                 <div className="text-3xl sm:text-4xl font-bold font-amount text-emerald-500 mb-1">
//                   ₹<AnimatedCounter value={18500} suffix="/mo" />
//                 </div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">Average User Savings Boost</div>
//               </div>
//               <div>
//                 <div className="text-3xl sm:text-4xl font-bold font-amount text-amber-500 mb-1">
//                   4.9<span className="text-xl">/5</span>
//                 </div>
//                 <div className="text-xs sm:text-sm text-muted-foreground">App Store & User Rating</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ─────────────────────────────────────────────────────────────
//             4. BENTO GRID FEATURES SECTION
//         ───────────────────────────────────────────────────────────── */}
//         <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-3xl mx-auto mb-16">
//             <Badge variant="outline" className="mb-3 px-3 py-1 text-primary border-primary/30">
//               Complete Feature Suite
//             </Badge>
//             <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading mb-4">
//               Engineered for People Who Value Every Single Rupee
//             </h2>
//             <p className="text-muted-foreground text-base sm:text-lg">
//               Say goodbye to messy spreadsheets and unorganized banking statements.
//               TrackWise synthesizes all your financial streams into one effortless, intelligent cockpit.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Bento Card 1: AI Categorization */}
//             <SpotlightCard className="md:col-span-2">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
//                   <Sparkles className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold">Autonomous AI Transaction Classifier</h3>
//                   <p className="text-xs text-muted-foreground">Natural language parsing & smart semantic grouping</p>
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground leading-relaxed mb-6">
//                 Transactions from credit cards, UPI, or manual cash entries are automatically
//                 classified into tax-smart buckets (Groceries, Tech, Fuel, Dining, Investments)
//                 without you lifting a finger.
//               </p>
//               <div className="p-4 rounded-xl bg-muted/60 border border-border/70 space-y-2">
//                 <div className="flex items-center justify-between text-xs">
//                   <div className="flex items-center gap-2">
//                     <span className="text-base">🍕</span>
//                     <span className="font-medium">Swiggy Order #8921</span>
//                   </div>
//                   <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
//                     Auto-categorized: Dining & Food
//                   </Badge>
//                 </div>
//                 <div className="flex items-center justify-between text-xs">
//                   <div className="flex items-center gap-2">
//                     <span className="text-base">⛽</span>
//                     <span className="font-medium">Indian Oil Corporation</span>
//                   </div>
//                   <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
//                     Auto-categorized: Fuel & Commute
//                   </Badge>
//                 </div>
//               </div>
//             </SpotlightCard>

//             {/* Bento Card 2: Receipt OCR */}
//             <SpotlightCard>
//               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
//                 <Receipt className="w-5 h-5" />
//               </div>
//               <h3 className="text-lg font-bold mb-2">OCR Bill & Receipt Scanner</h3>
//               <p className="text-sm text-muted-foreground leading-relaxed mb-4">
//                 Snap a photo of grocery bills or invoices. Our computer vision extracts vendor,
//                 tax breakdown, items, and total amount in milliseconds.
//               </p>
//               <div className="flex items-center gap-2 text-xs text-purple-500 font-medium">
//                 <span>99.2% OCR extraction fidelity</span>
//                 <ArrowRight className="w-3.5 h-3.5" />
//               </div>
//             </SpotlightCard>

//             {/* Bento Card 3: Budget Radar */}
//             <SpotlightCard>
//               <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
//                 <BarChart3 className="w-5 h-5" />
//               </div>
//               <h3 className="text-lg font-bold mb-2">Proactive Budget Radar</h3>
//               <p className="text-sm text-muted-foreground leading-relaxed mb-4">
//                 Set custom spending limits with dynamic thresholds (50%, 80%, 100%).
//                 Get alerted before you overshoot, not at the end of the month.
//               </p>
//               <div className="w-full bg-muted rounded-full h-2">
//                 <div className="bg-amber-500 h-2 rounded-full w-[82%]" />
//               </div>
//               <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
//                 <span>Shopping Budget</span>
//                 <span className="text-amber-500 font-medium">82% Exhausted</span>
//               </div>
//             </SpotlightCard>

//             {/* Bento Card 4: Cash Flow Prediction */}
//             <SpotlightCard className="md:col-span-2">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
//                   <TrendingUp className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold">Predictive Month-End Cashflow</h3>
//                   <p className="text-xs text-muted-foreground">Time-series forecasting based on spending velocities</p>
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground leading-relaxed mb-4">
//                 TrackWise looks at recurring commitments (rent, EMIs, utility bills, subscriptions)
//                 and forecasts your exact month-end liquidity so you never experience surprise shortfalls.
//               </p>
//               <div className="grid grid-cols-3 gap-3 text-center">
//                 <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
//                   <div className="text-xs text-muted-foreground mb-1">Fixed EMIs</div>
//                   <div className="font-semibold font-amount text-sm">₹28,500</div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
//                   <div className="text-xs text-muted-foreground mb-1">Subscriptions</div>
//                   <div className="font-semibold font-amount text-sm">₹2,899</div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
//                   <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Projected Surplus</div>
//                   <div className="font-semibold font-amount text-sm text-emerald-600 dark:text-emerald-400">
//                     +₹34,200
//                   </div>
//                 </div>
//               </div>
//             </SpotlightCard>
//           </div>
//         </section>

//         {/* ─────────────────────────────────────────────────────────────
//             5. INTERACTIVE SAVINGS ROI SIMULATOR
//         ───────────────────────────────────────────────────────────── */}
//         <section id="calculator" className="py-20 bg-muted/30 border-y border-border/60">
//           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center max-w-2xl mx-auto mb-12">
//               <Badge variant="outline" className="mb-3 text-primary border-primary/30">
//                 Interactive Wealth Simulator
//               </Badge>
//               <h2 className="text-3xl font-bold font-heading mb-3">
//                 Calculate How Much TrackWise Will Save You
//               </h2>
//               <p className="text-muted-foreground text-sm sm:text-base">
//                 Adjust your monthly earnings and expense percentage to visualize how much
//                 discretionary leakage TrackWise recovers annually.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card p-6 sm:p-10 rounded-2xl border border-border/80 shadow-xl">
//               {/* Sliders Area */}
//               <div className="lg:col-span-7 space-y-6">
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <label className="text-sm font-semibold">Monthly Income</label>
//                     <span className="font-amount font-bold text-lg text-primary">
//                       ₹{income.toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="25000"
//                     max="400000"
//                     step="5000"
//                     value={income}
//                     onChange={(e) => setIncome(Number(e.target.value))}
//                     className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
//                   />
//                   <div className="flex justify-between text-xs text-muted-foreground mt-1">
//                     <span>₹25,000</span>
//                     <span>₹2,00,000</span>
//                     <span>₹4,00,000+</span>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <label className="text-sm font-semibold">Current Expense Ratio</label>
//                     <span className="font-amount font-bold text-lg text-expense">
//                       {expenseRatio}% (₹{currentExpenses.toLocaleString("en-IN")})
//                     </span>
//                   </div>
//                   <input
//                     type="range"
//                     min="30"
//                     max="95"
//                     step="1"
//                     value={expenseRatio}
//                     onChange={(e) => setExpenseRatio(Number(e.target.value))}
//                     className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
//                   />
//                   <div className="flex justify-between text-xs text-muted-foreground mt-1">
//                     <span>30% (Frugal)</span>
//                     <span>65% (Average)</span>
//                     <span>95% (High Burn)</span>
//                   </div>
//                 </div>

//                 <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2.5">
//                   <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
//                   <span>
//                     Users identify an average of 15% hidden recurring leaks and duplicate dining/streaming
//                     expenses within their first 30 days of using TrackWise AI.
//                   </span>
//                 </div>
//               </div>

//               {/* Simulation Result Card */}
//               <div className="lg:col-span-5 p-6 rounded-xl bg-linear-to-br from-primary/10 via-card to-background border border-primary/30 text-center relative overflow-hidden shadow-lg">
//                 <div className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
//                   Projected Annual Wealth Unlock
//                 </div>
//                 <div className="text-3xl sm:text-4xl font-bold font-amount text-emerald-500 mb-2">
//                   ₹{extraAnnualWealth.toLocaleString("en-IN")}
//                 </div>
//                 <p className="text-xs text-muted-foreground mb-6">
//                   Extra funds redirected directly to investments, emergency buffer, or debt payoff each year.
//                 </p>

//                 <div className="grid grid-cols-2 gap-3 text-left mb-6 text-xs border-t border-border/60 pt-4">
//                   <div>
//                     <span className="text-muted-foreground">Current Monthly Savings</span>
//                     <div className="font-semibold font-amount text-sm mt-0.5">
//                       ₹{currentSavings.toLocaleString("en-IN")}
//                     </div>
//                   </div>
//                   <div>
//                     <span className="text-primary font-medium">TrackWise Optimized</span>
//                     <div className="font-semibold font-amount text-sm text-emerald-500 mt-0.5">
//                       ₹{optimizedSavings.toLocaleString("en-IN")}
//                     </div>
//                   </div>
//                 </div>

//                 <Button className="w-full shadow-md shadow-primary/25" asChild>
//                   <Link href="/register">Claim These Savings</Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ─────────────────────────────────────────────────────────────
//             6. TESTIMONIALS & USER REVIEWS
//         ───────────────────────────────────────────────────────────── */}
//         {/* <section id="testimonials" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <Badge variant="outline" className="mb-3 text-primary border-primary/30">
//               Loved by Thousands
//             </Badge>
//             <h2 className="text-3xl font-bold font-heading mb-3">Real Stories from Active Savers</h2>
//             <p className="text-muted-foreground text-base">
//               See how working professionals, founders, and students took command of their financial lives.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {[
//               {
//                 quote:
//                   "TrackWise detected 3 active subscriptions I forgot I had (worth ₹2,100/mo). The savings rate gauge has turned saving money into an addictive game.",
//                 author: "Ananya Sharma",
//                 role: "Product Designer, Bengaluru",
//                 rating: 5,
//               },
//               {
//                 quote:
//                   "The OCR receipt scanner alone saves me 2 hours every weekend. I just photograph my supermarket receipts and my tax deductions are automatically segregated.",
//                 author: "Rohan Varma",
//                 role: "Senior Software Engineer",
//                 rating: 5,
//               },
//               {
//                 quote:
//                   "I was always intimidated by complex accounting software. TrackWise feels like Apple built a personal finance app: stunning, fast, and remarkably intuitive.",
//                 author: "Pooja Mehta",
//                 role: "Consultant & Angel Investor",
//                 rating: 5,
//               },
//             ].map((t, idx) => (
//               <SpotlightCard key={idx} className="flex flex-col justify-between">
//                 <div>
//                   <div className="flex items-center gap-1 mb-4 text-amber-400">
//                     {Array(t.rating)
//                       .fill(0)
//                       .map((_, i) => (
//                         <Star key={i} className="w-4 h-4 fill-current" />
//                       ))}
//                   </div>
//                   <p className="text-sm text-foreground/90 italic leading-relaxed mb-6">
//                     &ldquo;{t.quote}&rdquo;
//                   </p>
//                 </div>
//                 <div className="border-t border-border/60 pt-4">
//                   <div className="font-semibold text-sm">{t.author}</div>
//                   <div className="text-xs text-muted-foreground">{t.role}</div>
//                 </div>
//               </SpotlightCard>
//             ))}
//           </div>
//         </section> */}

//         {/* ─────────────────────────────────────────────────────────────
//             7. CALL TO ACTION BANNER
//         ───────────────────────────────────────────────────────────── */}
//         <section className="py-20 relative overflow-hidden">
//           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="relative rounded-3xl p-8 sm:p-14 bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-2xl text-center overflow-hidden">
//               {/* Background ambient lighting */}
//               <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
//               <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

//               <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 font-heading">
//                 Take Control of Your Financial Future Today
//               </h2>
//               <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
//                 Join over 10,000 smart individuals who have eliminated financial anxiety and accelerated their wealth with TrackWise.
//               </p>

//               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//                 <Button
//                   size="lg"
//                   className="h-12 px-8 bg-white text-primary hover:bg-white/90 text-base font-semibold shadow-lg shadow-black/10"
//                   asChild
//                 >
//                   <Link href="/register">Create Free Account</Link>
//                 </Button>
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   className="h-12 px-8 border-white/40 text-white hover:bg-white/10 text-base font-semibold"
//                   asChild
//                 >
//                   <Link href="/login">Sign In</Link>
//                 </Button>
//               </div>

//               <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/70">
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-3.5 h-3.5" /> No credit card required
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <Lock className="w-3.5 h-3.5" /> 100% Private & Encrypted
//                 </span>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ─────────────────────────────────────────────────────────────
//           8. MODERN FOOTER
//       ───────────────────────────────────────────────────────────── */}
//       <footer className="border-t border-border/60 py-12 bg-card">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
//               <TrendingUp className="w-4 h-4 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-base tracking-tight font-heading">
//               Track<span className="text-primary">Wise</span>
//             </span>
//             <span className="text-xs text-muted-foreground ml-2">
//               © {new Date().getFullYear()} TrackWise Inc. All rights reserved.
//             </span>
//           </div>

//           <div className="flex items-center gap-6 text-xs text-muted-foreground">
//             <a href="#features" className="hover:text-foreground transition-colors">
//               Features
//             </a>
//             <a href="#calculator" className="hover:text-foreground transition-colors">
//               Calculator
//             </a>
//             <Link href="/login" className="hover:text-foreground transition-colors">
//               Sign In
//             </Link>
//             <Link href="/register" className="hover:text-foreground transition-colors">
//               Sign Up
//             </Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }







"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  motion,
  AnimatePresence,
  MotionConfig,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import { useAuthStore } from "@/store/auth.store"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PieChart as PieIcon,
  Bot,
  Zap,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Wallet,
  ArrowUpRight,
  BarChart3,
  Sliders,
  Lock,
  Upload,
  Repeat,
  ArrowUp,
} from "lucide-react"
import { SpotlightCard } from "@/components/shared/spotlight-card"

// Assumption used by the savings calculator (an estimate, not measured data)
const ASSUMED_REDUCTION = 0.15

// ── Animation helpers (framer-motion is already a project dependency) ──
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const inView = { once: true, amount: 0.2 } as const

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "highlights", label: "AI Features" },
  { id: "calculator", label: "Savings Estimator" },
]

// Card wrapper: scroll-reveal (via parent stagger) + lift on hover
function RevealCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Number that tweens smoothly whenever its value changes (en-IN formatting)
function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-IN"))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" })
    return () => controls.stop()
  }, [value, mv])
  return <motion.span>{text}</motion.span>
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  // Scroll-driven UI state
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  const { scrollY, scrollYProgress } = useScroll()
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const orbY = useTransform(scrollY, [0, 600], [0, 120])

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24)
    setShowTop(y > 600)
    if (y < 300) setActiveSection("")
  })

  // Smooth anchor scrolling (this page only) + active nav link tracking
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const root = document.documentElement
    if (!reduce) root.style.scrollBehavior = "smooth"

    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    sections.forEach((el) => observer.observe(el))
    return () => {
      root.style.scrollBehavior = ""
      observer.disconnect()
    }
  }, [])

  // Savings calculator state
  const [income, setIncome] = useState(85000)
  const [expenseRatio, setExpenseRatio] = useState(65)

  const currentExpenses = Math.round((income * expenseRatio) / 100)
  const currentSavings = income - currentExpenses
  const optimizedExpenses = Math.round(currentExpenses * (1 - ASSUMED_REDUCTION))
  const optimizedSavings = income - optimizedExpenses
  const extraAnnualWealth = (optimizedSavings - currentSavings) * 12

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
        {/* Scroll progress bar */}
        <motion.div
          style={{ scaleX: progressX }}
          className="fixed top-0 left-0 right-0 z-60 h-0.5 origin-left bg-primary"
        />

        {/* 1. NAVBAR */}
        <header
          className={`sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/60 transition-shadow duration-300 ${scrolled ? "shadow-md shadow-black/5" : ""
            }`}
        >
          <div
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"
              }`}
          >
            <Link href="/" onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105 duration-200">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">
                Track<span className="text-primary">Wise</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              {NAV_LINKS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`group relative py-1 transition-colors hover:text-foreground ${activeSection === id ? "text-foreground" : ""
                    }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${activeSection === id ? "w-full" : "w-0"
                      }`}
                  />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button asChild size="sm" className="shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 active:scale-95">
                  <Link href="/dashboard" className="flex items-center gap-1.5">
                    Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="shadow-md shadow-primary/25 transition-transform hover:-translate-y-0.5 active:scale-95">
                    <Link href="/register" className="flex items-center gap-1">
                      Get Started <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* 2. HERO */}
          <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden mesh-gradient">
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

            <motion.div style={{ y: orbY }} className="absolute top-10 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-linear-to-tr from-primary/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-8 backdrop-blur-md shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>TrackWise • AI-Powered Expense Intelligence</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6 font-heading"
              >
                Master Your Spending with{" "}
                <span className="gradient-text">AI-Powered Insights</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
              >
                Stop wondering where your money goes. TrackWise categorizes your
                transactions, scans your receipts and keeps your budgets on track
                with the help of AI.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/30 interactive-hover">
                  <Link href={isAuthenticated ? "/dashboard" : "/register"} className="flex items-center gap-2">
                    {isAuthenticated ? "Open Dashboard" : "Start Tracking Free"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base interactive-hover">
                  <a href="#calculator" className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    Estimate Your Savings
                  </a>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground mb-16"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero Manual Excel Logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secure Login & Private Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>OCR Receipt Scanner</span>
                </div>
              </motion.div>

              {/* Dashboard preview (sample data) */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.3, delay: 0 } }}
                className="relative mx-auto max-w-5xl rounded-2xl p-2 sm:p-4 border border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">
                      TrackWise Dashboard Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                      Sample Data
                    </Badge>
                  </div>
                </div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inView} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/40 hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Total Net Balance</span>
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-amount text-foreground mb-1">
                      ₹3,42,850.00
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+18.4% vs last month</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Monthly Inflow</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-amount text-foreground mb-1">
                      ₹1,25,000.00
                    </div>
                    <div className="text-xs text-muted-foreground">Salary + freelance income</div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Savings Rate</span>
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <PieIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-amount text-purple-500 mb-1">
                      38%
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "38%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="bg-purple-500 h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="mt-4 p-3.5 rounded-xl bg-linear-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>Budget Alert</span>
                        <Badge className="badge-ai text-[10px] py-0 px-1.5">AI Insight</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dining expenses are up 14% this weekend. Review your dining budget to stay on track.
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0 bg-background/80">
                    Review Spending
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 3. HIGHLIGHTS STRIP (no invented statistics) */}
          <section id="highlights" className="py-12 border-y border-border/60 bg-muted/30 scroll-mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={inView} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="group cursor-default">
                  <div className="mx-auto mb-2 w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold">AI Categorization</div>
                  <div className="text-xs text-muted-foreground">Transactions sorted for you</div>
                </motion.div>
                <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="group cursor-default">
                  <div className="mx-auto mb-2 w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold">Receipt OCR</div>
                  <div className="text-xs text-muted-foreground">Scan bills from a photo</div>
                </motion.div>
                <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="group cursor-default">
                  <div className="mx-auto mb-2 w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold">Smart Budgets</div>
                  <div className="text-xs text-muted-foreground">Track limits per category</div>
                </motion.div>
                <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="group cursor-default">
                  <div className="mx-auto mb-2 w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold">CSV Import</div>
                  <div className="text-xs text-muted-foreground">Bring in existing data</div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* 4. FEATURES */}
          <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inView} className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 px-3 py-1 text-primary border-primary/30">
                Feature Suite
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading mb-4">
                Built for People Who Value Every Single Rupee
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Say goodbye to messy spreadsheets and unorganized statements.
                TrackWise brings your spending into one intelligent dashboard.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={inView} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: AI Categorization */}
              <RevealCard className="md:col-span-2">
                <SpotlightCard className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">AI Transaction Classifier</h3>
                      <p className="text-xs text-muted-foreground">Smart categorization of your spending</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Add transactions manually or import a CSV, and TrackWise automatically
                    classifies them into categories like Groceries, Fuel, Dining and Investments.
                  </p>
                  <div className="p-4 rounded-xl bg-muted/60 border border-border/70 space-y-2">
                    <div className="flex items-center justify-between text-xs transition-transform duration-200 hover:translate-x-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍕</span>
                        <span className="font-medium">Swiggy Order #8921</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                        Auto-categorized: Dining & Food
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs transition-transform duration-200 hover:translate-x-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⛽</span>
                        <span className="font-medium">Indian Oil Corporation</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Auto-categorized: Fuel & Commute
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-1">Sample transactions</p>
                  </div>
                </SpotlightCard>
              </RevealCard>

              {/* Card 2: Receipt OCR */}
              <RevealCard>
                <SpotlightCard className="h-full">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">OCR Bill & Receipt Scanner</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Snap a photo of a bill or invoice and TrackWise extracts the vendor,
                    items and total amount for you.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-500 font-medium">
                    <span>Review and edit before saving</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </SpotlightCard>
              </RevealCard>

              {/* Card 3: Budgets */}
              <RevealCard>
                <SpotlightCard className="h-full">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Budget Tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Set spending limits per category and see how much of each budget is used,
                    so you can adjust before you overshoot.
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "82%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="bg-amber-500 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>Shopping Budget (sample)</span>
                    <span className="text-amber-500 font-medium">82% Used</span>
                  </div>
                </SpotlightCard>
              </RevealCard>

              {/* Card 4: Recurring expenses */}
              <RevealCard className="md:col-span-2">
                <SpotlightCard className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Recurring Expense Detection</h3>
                      <p className="text-xs text-muted-foreground">Spot repeating payments and unusual spending</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    TrackWise looks for recurring payments such as rent, EMIs and subscriptions,
                    and flags unusual transactions so nothing slips by unnoticed.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <div className="text-xs text-muted-foreground mb-1">Fixed EMIs</div>
                      <div className="font-semibold font-amount text-sm">₹28,500</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <div className="text-xs text-muted-foreground mb-1">Subscriptions</div>
                      <div className="font-semibold font-amount text-sm">₹2,899</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Left This Month</div>
                      <div className="font-semibold font-amount text-sm text-emerald-600 dark:text-emerald-400">
                        +₹34,200
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Sample figures</p>
                </SpotlightCard>
              </RevealCard>
            </motion.div>
          </section>

          {/* 5. SAVINGS ESTIMATOR */}
          <section id="calculator" className="py-20 bg-muted/30 border-y border-border/60 scroll-mt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inView} className="text-center max-w-2xl mx-auto mb-12">
                <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                  Interactive Savings Estimator
                </Badge>
                <h2 className="text-3xl font-bold font-heading mb-3">
                  Estimate How Much You Could Save
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Adjust your monthly income and expense percentage to see what a modest
                  cut in discretionary spending could add up to over a year.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card p-6 sm:p-10 rounded-2xl border border-border/80 shadow-xl">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={inView} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold">Monthly Income</label>
                      <span className="font-amount font-bold text-lg text-primary">
                        ₹{income.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="25000"
                      max="400000"
                      step="5000"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹25,000</span>
                      <span>₹2,00,000</span>
                      <span>₹4,00,000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold">Current Expense Ratio</label>
                      <span className="font-amount font-bold text-lg text-expense">
                        {expenseRatio}% (₹{currentExpenses.toLocaleString("en-IN")})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="95"
                      step="1"
                      value={expenseRatio}
                      onChange={(e) => setExpenseRatio(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>30% (Frugal)</span>
                      <span>65% (Average)</span>
                      <span>95% (High Burn)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      This is an estimate based on an assumed {Math.round(ASSUMED_REDUCTION * 100)}% reduction
                      in current expenses. Actual savings depend on your own spending habits.
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={inView}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5 p-6 rounded-xl bg-linear-to-br from-primary/10 via-card to-background border border-primary/30 text-center relative overflow-hidden shadow-lg"
                >
                  <div className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
                    Estimated Extra Savings Per Year
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold font-amount text-emerald-500 mb-2">
                    ₹<AnimatedNumber value={extraAnnualWealth} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    Could go toward investments, an emergency buffer, or paying off debt.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-left mb-6 text-xs border-t border-border/60 pt-4">
                    <div>
                      <span className="text-muted-foreground">Current Monthly Savings</span>
                      <div className="font-semibold font-amount text-sm mt-0.5">
                        ₹<AnimatedNumber value={currentSavings} />
                      </div>
                    </div>
                    <div>
                      <span className="text-primary font-medium">Estimated With Optimization</span>
                      <div className="font-semibold font-amount text-sm text-emerald-500 mt-0.5">
                        ₹<AnimatedNumber value={optimizedSavings} />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full shadow-md shadow-primary/25 transition-transform hover:-translate-y-0.5 active:scale-95" asChild>
                    <Link href="/register">Start Saving</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 6. CALL TO ACTION */}
          <section className="py-20 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={inView} transition={{ duration: 0.6, ease: "easeOut" }} className="relative rounded-3xl p-8 sm:p-14 bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-2xl text-center overflow-hidden">
                <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 font-heading">
                  Take Control of Your Finances Today
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  Track expenses, set budgets and scan receipts, all in one place with TrackWise.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-white text-primary hover:bg-white/90 text-base font-semibold shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 active:scale-95"
                    asChild
                  >
                    <Link href="/register">Create Free Account</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 border-white/40 text-white hover:bg-white/10 text-base font-semibold transition-transform hover:-translate-y-0.5 active:scale-95"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Your data stays private
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* 7. FOOTER */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border/60 py-12 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base tracking-tight font-heading">
                Track<span className="text-primary">Wise</span>
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                © {new Date().getFullYear()} TrackWise. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#calculator" className="hover:text-foreground transition-colors">
                Estimator
              </a>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </motion.footer>

        {/* Back-to-top button */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              key="back-to-top"
              type="button"
              aria-label="Back to top"
              initial={{ opacity: 0, scale: 0.8, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 16 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}