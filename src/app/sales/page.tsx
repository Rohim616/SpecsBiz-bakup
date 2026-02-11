
"use client"

import { useState } from "react"
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  CheckCircle2,
  Clock,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Inbox,
  X,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useBusinessData } from "@/hooks/use-business-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

export default function SalesPage() {
  const { toast } = useToast()
  const { products, sales, actions, isLoading, currency, language } = useBusinessData()
  const t = translations[language]
  
  const [cart, setCart] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      toast({ title: t.language === 'en' ? "Already in cart" : "ইতিমধ্যেই কার্টে আছে" })
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
      toast({ title: t.language === 'en' ? "Added to list" : "তালিকায় যোগ করা হয়েছে" })
    }
  }

  const updateQuantity = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setCart(cart.map(c => c.id === id ? { ...c, quantity: numValue } : c))
  }

  const updateUnitPrice = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setCart(cart.map(c => c.id === id ? { ...c, sellingPrice: numValue } : c))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const subtotal = cart.reduce((acc, c) => acc + (c.sellingPrice * c.quantity), 0)
  const totalCost = cart.reduce((acc, c) => acc + ((c.purchasePrice || 0) * c.quantity), 0)
  const totalProfit = subtotal - totalCost
  const grandTotal = subtotal

  const handleCheckout = () => {
    actions.addSale({
      total: grandTotal,
      profit: totalProfit,
      items: cart,
    })
    toast({
      title: t.language === 'en' ? "Sale Recorded" : "বিক্রয় সম্পন্ন হয়েছে",
      description: `${t.finalTotal}: ${currency}${grandTotal.toLocaleString()}`,
    })
    setCart([])
    setIsSummaryOpen(false)
  }

  if (isLoading) return <div className="p-10 text-center animate-pulse text-accent font-bold">{t.loading}</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Product Selection Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-headline text-primary flex items-center gap-2">
            <Receipt className="w-6 h-6 text-accent" /> {t.language === 'en' ? 'Quick Sale' : 'দ্রুত বিক্রয়'}
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Select products to generate bill</p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t.searchInventory} 
            className="pl-9 h-11 border-accent/10 focus-visible:ring-accent bg-white shadow-sm rounded-xl" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Full Width Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products
          .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
          .map((item) => (
          <Card 
            key={item.id} 
            className="border-accent/5 hover:border-accent hover:shadow-xl transition-all cursor-pointer group active:scale-[0.98] overflow-hidden"
            onClick={() => addToCart(item)}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[120px]">
              <div className="space-y-1">
                <p className="font-black text-primary text-sm md:text-base leading-tight truncate">{item.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-black text-accent">{currency}{item.sellingPrice?.toLocaleString()}</p>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-bold bg-blue-50 border-blue-100 text-blue-700">
                    {t.stock}: {item.stock} {item.unit}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-24 text-center text-muted-foreground opacity-30 italic flex flex-col items-center gap-4">
            <Inbox className="w-16 h-16" />
            <p>{t.noData}</p>
          </div>
        )}
      </div>

      {/* Floating Checkout Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <Button 
            onClick={() => setIsSummaryOpen(true)}
            className="h-16 px-6 rounded-2xl shadow-[0_15px_40px_rgba(0,128,128,0.4)] bg-accent hover:bg-accent/90 border-4 border-white gap-3 group"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7 text-white" />
              <Badge className="absolute -top-3 -right-3 h-6 w-6 flex items-center justify-center bg-red-500 border-2 border-white font-black text-[10px] rounded-full">
                {cart.length}
              </Badge>
            </div>
            <span className="font-black uppercase tracking-tighter text-sm hidden sm:inline">Review Bill & Checkout</span>
          </Button>
        </div>
      )}

      {/* Bill Summary Popup */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 overflow-hidden border-accent/20 shadow-2xl rounded-3xl">
          <DialogHeader className="p-6 bg-accent/5 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-primary">{t.billSummary}</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {cart.length} {t.itemsInBill}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsSummaryOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-8">
              {cart.map((item) => {
                const itemTotal = item.sellingPrice * item.quantity;
                const itemProfit = (item.sellingPrice - (item.purchasePrice || 0)) * item.quantity;
                const isLoss = itemProfit < 0;
                
                return (
                  <div key={item.id} className="space-y-4 pb-6 border-b border-black/5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-black text-primary leading-tight truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold uppercase tracking-tight">
                          <span className="text-blue-600 bg-blue-50 px-1.5 rounded">{t.stock}: {item.stock}</span>
                          <span className="text-orange-600 bg-orange-50 px-1.5 rounded">{t.buyPrice}: {currency}{item.purchasePrice || 0}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-muted-foreground">Qty ({item.unit})</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="h-11 bg-accent/5 border-accent/10 text-lg font-black" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-muted-foreground">Unit Price ({currency})</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="h-11 bg-accent/5 border-accent/10 text-lg font-black text-accent" 
                          value={item.sellingPrice} 
                          onChange={(e) => updateUnitPrice(item.id, e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1 px-4 py-2.5 bg-muted/30 rounded-xl border border-muted flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-muted-foreground">{t.language === 'en' ? 'Item Total' : 'মোট বিল'}</span>
                        <span className="text-sm font-black text-primary">{currency}{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl border flex justify-between items-center",
                        isLoss ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <span className={cn("text-[9px] font-black uppercase", isLoss ? "text-red-600" : "text-emerald-600")}>
                          {isLoss ? 'Loss' : 'Lav'}
                        </span>
                        <span className={cn("text-sm font-black", isLoss ? "text-red-600" : "text-emerald-700")}>
                          {isLoss ? '-' : '+'}{currency}{Math.abs(itemProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/20 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className={cn(
                 "p-4 text-white rounded-2xl shadow-lg flex flex-col justify-between",
                 totalProfit < 0 ? "bg-destructive" : "bg-emerald-600"
               )}>
                  <p className="text-[8px] font-black uppercase opacity-80 tracking-widest">{totalProfit < 0 ? (t.language === 'en' ? 'Total Loss' : 'মোট লস') : t.totalLav}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 opacity-70" />
                    <span className="text-2xl font-black">{currency}{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
               </div>
               <div className="p-4 bg-primary text-white rounded-2xl shadow-lg flex flex-col justify-between items-end text-right">
                  <p className="text-[8px] font-black uppercase opacity-80 tracking-widest">{t.finalTotal}</p>
                  <p className="text-2xl font-black mt-1">{currency}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
               </div>
            </div>

            <Button 
              className="w-full h-16 text-lg bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 gap-3" 
              onClick={handleCheckout}
              disabled={cart.some(i => i.quantity <= 0)}
            >
              <CheckCircle2 className="w-6 h-6" /> {t.completeSale}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
