
"use client"

import { useState } from "react"
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2,
  Clock,
  Receipt,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SalesPage() {
  const { toast } = useToast()
  const [cart, setCart] = useState<any[]>([])
  const [search, setSearch] = useState("")

  // Demo inventory for calculation testing
  const [inventory, setInventory] = useState<any[]>([
    { id: 1, name: "Sample Fabric", purchasePrice: 50, price: 120, stock: 25.5, unit: "meter" },
    { id: 2, name: "Premium Rice", purchasePrice: 40, price: 65, stock: 100, unit: "kg" },
    { id: 3, name: "Glass Frames", purchasePrice: 200, price: 450, stock: 10, unit: "pcs" },
  ])

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      toast({ title: "Already in cart", description: "Adjust quantity in the cart side panel." })
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
      toast({ title: "Added to cart", description: `${item.name} added.` })
    }
  }

  const updateQuantity = (id: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setCart(cart.map(c => {
      if (c.id === id) {
        return { ...c, quantity: numValue }
      }
      return c
    }))
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter(c => c.id !== id))
  }

  // Calculations
  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0)
  const totalCost = cart.reduce((acc, c) => acc + (c.purchasePrice * c.quantity), 0)
  const totalProfit = subtotal - totalCost
  
  const tax = subtotal * 0.08 // Optional tax
  const grandTotal = subtotal + tax

  const handleCheckout = () => {
    toast({
      title: "Sale Recorded Successfully",
      description: `Total: $${grandTotal.toFixed(2)} | Profit (Lav): $${totalProfit.toFixed(2)}`,
    })
    setCart([])
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-7 space-y-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" /> Product Selection
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name..." 
                className="pl-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                <div key={item.id} className="p-4 border rounded-xl bg-card hover:border-accent transition-colors flex justify-between items-center group">
                  <div className="space-y-1">
                    <p className="font-semibold text-primary">{item.name}</p>
                    <p className="text-sm text-accent font-bold">${item.price} <span className="text-[10px] text-muted-foreground font-normal">per {item.unit}</span></p>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal bg-blue-50/50">
                         Stock: {item.stock} {item.unit}
                       </Badge>
                       <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal bg-green-50/50 text-green-700">
                         Lav: ${(item.price - item.purchasePrice).toFixed(2)}
                       </Badge>
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    className="bg-accent/10 text-accent hover:bg-accent hover:text-white"
                    onClick={() => addToCart(item)}
                    disabled={item.stock <= 0}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" /> Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-center py-8 text-muted-foreground italic text-sm">
            Complete your first sale to see transaction history.
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:col-span-5">
        <Card className="sticky top-20 shadow-xl border-accent/20 overflow-hidden">
          <CardHeader className="border-b bg-accent/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-accent" /> Checkout Cart
            </CardTitle>
            <CardDescription>{cart.length} items ready for billing</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground italic flex flex-col items-center gap-3">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="space-y-3 pb-4 border-b last:border-0 group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-primary">{item.name}</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase">Unit: {item.unit}</span>
                          <span className="text-[10px] text-blue-600 font-medium">Avail: {item.stock}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-red-500 h-8 w-8"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <Label className="text-[10px] text-muted-foreground font-bold uppercase">Quantity</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            className="h-9 font-bold border-accent/30 focus:ring-accent"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                          />
                       </div>
                       <div className="text-right">
                          <Label className="text-[10px] text-muted-foreground font-bold uppercase">Item Total</Label>
                          <p className="font-black text-primary text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                       </div>
                    </div>
                    
                    {/* Real-time Validation */}
                    {item.quantity > item.stock && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-600 text-[10px] font-bold border border-red-100">
                        <AlertTriangle className="w-3.5 h-3.5" /> 
                        STOCK ERROR: You only have {item.stock} {item.unit} available!
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-2 bg-green-50/50 rounded-lg border border-green-100">
                      <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Estimated Lav (Profit)</span>
                      <span className="text-sm font-black text-green-600">+${((item.price - item.purchasePrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-6 pt-4 border-t-2 border-dashed">
                {/* Profit Summary */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-green-600 text-white rounded-xl shadow-sm">
                      <p className="text-[10px] font-bold uppercase opacity-80">Total Lav (Profit)</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xl font-black">${totalProfit.toFixed(2)}</span>
                      </div>
                   </div>
                   <div className="p-3 bg-primary text-white rounded-xl shadow-sm text-right">
                      <p className="text-[10px] font-bold uppercase opacity-80">Grand Total</p>
                      <p className="text-xl font-black">${grandTotal.toFixed(2)}</p>
                   </div>
                </div>

                {/* Sub-totals */}
                <div className="space-y-2 text-sm px-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Tax (8%)</span>
                    <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-16 text-lg bg-accent hover:bg-accent/90 shadow-2xl transition-all hover:scale-[1.02]" 
                  onClick={handleCheckout}
                  disabled={cart.some(i => i.quantity > i.stock || i.quantity <= 0)}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Bill
                </Button>
                
                {cart.some(i => i.quantity > i.stock) && (
                  <p className="text-[10px] text-red-500 text-center font-bold">Checkout disabled due to stock errors.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
