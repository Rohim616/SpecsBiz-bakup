
"use client"

import { useState, useMemo } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  BarChart, 
  PieChart,
  Target,
  Inbox,
  ShieldCheck,
  Calendar,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Trash2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { analyzeBusinessHealth, type AnalyzeBusinessHealthOutput } from "@/ai/flows/analyze-business-health"
import { useToast } from "@/hooks/use-toast"
import { useBusinessData } from "@/hooks/use-business-data"
import { translations } from "@/lib/translations"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subDays, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from "date-fns"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const { toast } = useToast()
  const { sales, products, isLoading, currency, actions, language } = useBusinessData()
  const t = translations[language]
  
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month")
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<AnalyzeBusinessHealthOutput | null>(null)

  // Deletion Password Protection
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePass, setDeletePass] = useState("")

  // Filter sales based on time range
  const filteredSales = useMemo(() => {
    const now = new Date()
    let start: Date, end: Date

    switch (timeRange) {
      case "day":
        start = startOfDay(now); end = endOfDay(now); break
      case "week":
        start = startOfWeek(now); end = endOfWeek(now); break
      case "month":
        start = startOfMonth(now); end = endOfMonth(now); break
      case "year":
        start = startOfYear(now); end = endOfYear(now); break
      default:
        start = startOfMonth(now); end = endOfMonth(now)
    }

    return sales.filter(s => {
      const saleDate = new Date(s.saleDate)
      return isWithinInterval(saleDate, { start, end })
    })
  }, [sales, timeRange])

  // Chart Data preparation
  const chartData = useMemo(() => {
    const now = new Date()
    
    if (timeRange === "day") {
      const hours = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        revenue: 0,
        profit: 0
      }))
      filteredSales.forEach(s => {
        const hour = new Date(s.saleDate).getHours()
        hours[hour].revenue += (s.total || 0)
        hours[hour].profit += (s.profit || 0)
      })
      return hours
    }

    if (timeRange === "week" || timeRange === "month") {
      const start = timeRange === "week" ? startOfWeek(now) : startOfMonth(now)
      const end = timeRange === "week" ? endOfWeek(now) : endOfMonth(now)
      const days = eachDayOfInterval({ start, end })
      
      return days.map(day => {
        const daySales = filteredSales.filter(s => isSameDay(new Date(s.saleDate), day))
        return {
          name: format(day, "MMM dd"),
          revenue: daySales.reduce((sum, s) => sum + (sum + (s.total || 0)), 0),
          profit: daySales.reduce((sum, s) => sum + (s.profit || 0), 0)
        }
      })
    }

    const months = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) })
    return months.map(month => {
      const monthSales = filteredSales.filter(s => isSameMonth(new Date(s.saleDate), month))
      return {
        name: format(month, "MMM"),
        revenue: monthSales.reduce((sum, s) => sum + (s.total || 0), 0),
        profit: monthSales.reduce((sum, s) => sum + (s.profit || 0), 0)
      }
    })
  }, [filteredSales, timeRange])

  const metrics = useMemo(() => {
    const revenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0)
    const profit = filteredSales.reduce((acc, s) => acc + (s.profit || 0), 0)
    const count = filteredSales.length
    const avgTicket = count > 0 ? revenue / count : 0

    return { revenue, profit, count, avgTicket }
  }, [filteredSales])

  const handleRunAudit = async () => {
    if (products.length === 0) {
      toast({ title: "No Inventory", variant: "destructive" })
      return
    }

    setIsAuditing(true)
    try {
      const inventorySummary = products.map(p => `${p.name} (Stock: ${p.stock})`).join(", ")
      const salesSummary = filteredSales.slice(0, 10).map(s => `Sale: ${currency}${s.total}`).join(", ")
      
      const result = await analyzeBusinessHealth({
        inventoryData: inventorySummary,
        salesData: salesSummary,
        totalInvestment: products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0),
        potentialProfit: products.reduce((acc, p) => acc + (((p.sellingPrice || 0) - (p.purchasePrice || 0)) * (p.stock || 0)), 0)
      })
      
      setAuditResult(result)
      toast({ title: "Audit Complete" })
    } catch (error) {
      toast({ title: "Audit Failed", variant: "destructive" })
    } finally {
      setIsAuditing(false)
    }
  }

  const handleDeleteSale = () => {
    if (deletePass === "specsxr") {
      if (deleteId) {
        actions.deleteSale(deleteId)
        toast({ title: t.language === 'en' ? "Removed Successfully" : "ডিলিট সম্পন্ন হয়েছে" })
      }
      setDeleteId(null)
      setDeletePass("")
    } else {
      toast({ variant: "destructive", title: "Authorization Failed" })
      setDeletePass("")
    }
  }

  if (isLoading) return <div className="p-10 text-center animate-pulse text-accent font-bold">{t.loading}</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" /> {t.analytics}
          </h2>
          <p className="text-sm text-muted-foreground">{t.masterLedgerDesc}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <Tabs value={timeRange} onValueChange={(val: any) => setTimeRange(val)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-[320px] bg-muted/50 p-1">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button className="bg-accent hover:bg-accent/90 gap-2 w-full sm:w-auto shadow-lg" onClick={handleRunAudit} disabled={isAuditing || products.length === 0}>
            <Sparkles className="w-4 h-4" />
            {isAuditing ? t.thinking : "AI Health Audit"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-white border-none shadow-lg overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <CardDescription className="text-white/70 text-[10px] uppercase font-bold tracking-widest">{t.revenue} ({timeRange})</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-black truncate">{currency}{metrics.revenue.toLocaleString() ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-accent text-white border-none shadow-lg overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <CardDescription className="text-white/70 text-[10px] uppercase font-bold tracking-widest">{t.totalLav} ({timeRange})</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-black truncate">{currency}{metrics.profit.toLocaleString() ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="w-5 h-5" /> {t.historyProtection}
            </DialogTitle>
            <DialogDescription>{t.deleteSaleDesc}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs font-bold uppercase opacity-70">{t.secretKey}</Label>
            <Input type="password" placeholder="••••••••" className="h-12 text-lg font-bold" value={deletePass} onChange={e => setDeletePass(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="destructive" className="w-full h-12 text-base font-bold" onClick={handleDeleteSale}>
              {t.authorizeDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
