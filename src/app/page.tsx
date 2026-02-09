"use client"

import { useState } from "react"
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Inbox,
  Plus,
  ShoppingCart,
  UserPlus,
  Zap,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBusinessData } from "@/hooks/use-business-data"

export default function DashboardPage() {
  const { toast } = useToast()
  const { products, sales, customers, actions, isLoading } = useBusinessData()
  
  // Sale Panel States
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<any[]>([])

  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0)
  const totalLav = sales.reduce((acc, s) => acc + (s.profit || 0), 0)

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, change: "0%", trend: "up", icon: DollarSign, color: "text-green-600" },
    { label: "Inventory Items", value: products.length.toString(), change: "+2%", trend: "up", icon: Package, color: "text-blue-600" },
    { label: "Active Customers", value: customers.length.toString(), change: "0%", trend: "up", icon: Users, color: "text-purple-600" },
    { label: "Sales Count", value: sales.length.toString(), change: "0%", trend: "up", icon: TrendingUp, color: "text-teal-600" },
  ]

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      toast({ title: "Item exists", description: "Adjust quantity in the cart." })
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
      toast({ title: "Added to Cart" })
    }
  }

  const updateQuantity = (id: string, value: string) => {
    const num = parseFloat(value) || 0
    setCart(cart.map(c => c.id === id ? { ...c, quantity: num } : c))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0)
  const totalProfit = cart.reduce((acc, item) => acc + ((item.sellingPrice - (item.purchasePrice || 0)) * item.quantity), 0)
  const tax = subtotal * 0.05
  const grandTotal = subtotal + tax

  const handleCheckout = () => {
    actions.addSale({
      total: grandTotal,
      profit: totalProfit,
      items: cart,
    })
    toast({ title: "Sale Successful", description: `Billed $${grandTotal.toFixed(2)} with $${totalProfit.toFixed(2)} Profit.` })
    setCart([])
    setIsSaleDialogOpen(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Business Overview</h1>
          <p className="text-muted-foreground">Manage your daily operations with cloud sync.</p>
        </div>
        
        <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-accent hover:bg-accent/90 shadow-lg gap-2 text-lg h-14 px-8">
              <ShoppingCart className="w-6 h-6" /> Create New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b bg-accent/5">
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" /> New Sale Transaction
              </DialogTitle>
              <DialogDescription>Select products and adjust quantities.</DialogDescription>
            </DialogHeader>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 min-h-0">
              <div className="border-r flex flex-col min-h-0 bg-muted/20">
                <div className="p-4 border-b bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search items..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {products
                      .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
                      .map((item) => (
                        <div key={item.id} className="p-3 border rounded-xl bg-white flex justify-between items-center hover:border-accent cursor-pointer shadow-sm group" onClick={() => addToCart(item)}>
                          <div>
                            <p className="text-sm font-bold text-primary">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] bg-blue-50">Stock: {item.stock} {item.unit}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-accent text-sm">${item.sellingPrice}</span>
                            <div className="p-1 rounded-full bg-accent/10 group-hover:bg-accent group-hover:text-white transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col min-h-0 bg-white">
                <div className="p-4 border-b bg-muted/5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cart Items</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 py-12">
                      <ShoppingCart className="w-12 h-12 mb-3" />
                      <p className="text-sm italic">Cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="space-y-2 pb-4 border-b last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-primary">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">Price: ${item.sellingPrice} / {item.unit}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-end justify-between gap-4">
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold uppercase opacity-60">Qty ({item.unit})</Label>
                              <Input type="number" step="0.01" className="h-8" value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value)} />
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-primary">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                          {item.quantity > item.stock && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold p-2 rounded flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3" /> Over stock!
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-6 border-t bg-muted/10 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-600 text-white p-3 rounded-xl shadow-inner">
                      <p className="text-[10px] font-bold uppercase opacity-80">Total Lav (Profit)</p>
                      <p className="text-xl font-black">${totalProfit.toFixed(2)}</p>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-xl shadow-inner text-right">
                      <p className="text-[10px] font-bold uppercase opacity-80">Grand Total</p>
                      <p className="text-xl font-black">${grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button className="w-full h-14 text-lg bg-accent hover:bg-accent/90 font-bold shadow-xl" disabled={cart.length === 0 || cart.some(i => i.quantity > i.stock || i.quantity <= 0)} onClick={handleCheckout}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Bill
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Recent Activity</CardTitle>
            <CardDescription>Review your latest business actions.</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Inbox className="w-8 h-8 opacity-20" />
                <p className="text-sm italic">No recent transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.slice(0, 5).map((sale, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-full"><Receipt className="w-4 h-4 text-accent" /></div>
                      <div>
                        <p className="text-sm font-bold">Sale Completed</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(sale.saleDate).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">${sale.total?.toFixed(2)}</p>
                      <p className="text-[10px] text-green-600 font-medium">Profit: ${sale.profit?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
