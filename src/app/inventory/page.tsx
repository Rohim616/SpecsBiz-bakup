
"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Package, 
  Plus, 
  Search, 
  Sparkles, 
  MoreVertical, 
  Trash,
  Inbox,
  Edit2,
  Printer,
  Filter,
  Download,
  Calendar,
  Settings2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  PackagePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { generateProductDescription } from "@/ai/flows/generate-product-description"
import { useToast } from "@/hooks/use-toast"
import { useBusinessData } from "@/hooks/use-business-data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const { toast } = useToast()
  const { products, sales, actions, isLoading, currency, language } = useBusinessData()
  const t = translations[language]
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  // Restock State
  const [restockProduct, setRestockProduct] = useState<any>(null)
  const [restockQty, setRestockQty] = useState("")
  const [restockPrice, setRestockPrice] = useState("")

  const units = ["pcs", "kg", "gm", "ltr", "meter", "box", "dozen"]

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return Array.from(cats)
  }, [products])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    features: "",
    description: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    unit: "pcs"
  })

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = filterCategory === "all" || p.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, filterCategory])

  const handleAIDescription = async (isEdit = false) => {
    const target = isEdit ? editingProduct : newProduct;
    if (!target.name || !target.category) {
      toast({ title: "Missing Info", description: "Enter name and category first.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const result = await generateProductDescription({
        productName: target.name,
        productCategory: target.category,
        keyFeatures: target.features || "",
        targetAudience: "General Customers"
      })
      if (isEdit) setEditingProduct({ ...editingProduct, description: result.description })
      else setNewProduct(prev => ({ ...prev, description: result.description }))
      toast({ title: "AI Description Ready" })
    } catch (error) {
      toast({ title: "AI Error", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sellingPrice) return;
    actions.addProduct({
      ...newProduct,
      stock: parseFloat(newProduct.stock) || 0,
      purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
    })
    setNewProduct({ name: "", category: "", features: "", description: "", purchasePrice: "", sellingPrice: "", stock: "", unit: "pcs" })
    setIsAddOpen(false)
    toast({ title: "Product Added" })
  }

  const handleRestock = () => {
    if (!restockProduct || !restockQty) return;
    actions.addRestock(restockProduct.id, parseFloat(restockQty), parseFloat(restockPrice) || restockProduct.purchasePrice);
    setRestockProduct(null);
    setRestockQty("");
    setRestockPrice("");
    toast({ title: "Stock Updated & Recorded" });
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-accent" /> {t.inventory}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">{t.manageStock}</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none shadow-lg h-10">
                <Plus className="w-4 h-4 mr-2" /> {t.addProduct}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.addProduct}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t.language === 'en' ? 'Name' : 'নাম'}</Label>
                  <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t.language === 'en' ? 'Category' : 'ক্যাটাগরি'}</Label>
                    <Input value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t.unitType}</Label>
                    <Select value={newProduct.unit} onValueChange={(val) => setNewProduct({...newProduct, unit: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t.buyPrice}</Label>
                    <Input type="number" value={newProduct.purchasePrice} onChange={e => setNewProduct({...newProduct, purchasePrice: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t.sellPrice}</Label>
                    <Input type="number" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t.stock} ({newProduct.unit})</Label>
                  <Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
              </div>
              <DialogFooter><Button className="bg-accent w-full" onClick={handleAddProduct}>{t.saveProduct}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-accent/10 overflow-hidden">
        <CardHeader className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.searchInventory} className="pl-9 h-10 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[180px] bg-white h-10"><SelectValue placeholder={t.allCategories} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold">{t.productNameCat}</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">{t.pricing}</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">{t.stockLevel}</TableHead>
                <TableHead className="text-right pr-4 font-bold text-[10px] uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-accent/5">
                  <TableCell className="p-3">
                    <p className="text-xs font-bold text-primary">{p.name}</p>
                    <p className="text-[9px] text-accent uppercase font-black">{p.category || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] font-bold text-primary">{t.sellPrice}: {currency}{p.sellingPrice}</p>
                    <p className="text-[9px] text-muted-foreground">{t.buyPrice}: {currency}{p.purchasePrice}</p>
                  </TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", p.stock < 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700")}>
                      {p.stock} {p.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-accent text-accent hover:bg-accent hover:text-white" onClick={() => {
                      setRestockProduct(p);
                      setRestockPrice(p.purchasePrice.toString());
                    }}>
                      <PackagePlus className="w-3.5 h-3.5 mr-1" /> {t.restock}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={!!restockProduct} onOpenChange={(open) => !open && setRestockProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-accent" /> {t.newStockEntry}
            </DialogTitle>
            <DialogDescription className="font-bold text-primary">{restockProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase">{t.buyQty} ({restockProduct?.unit})</Label>
              <Input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="0.00" className="h-12 text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase">{t.buyPrice} ({currency})</Label>
              <Input type="number" value={restockPrice} onChange={e => setRestockPrice(e.target.value)} className="h-12 text-lg font-bold text-accent" />
            </div>
            <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
              <p className="text-[9px] font-black uppercase opacity-60">{t.totalCostSpent}</p>
              <p className="text-2xl font-black text-primary">{currency}{((parseFloat(restockQty) || 0) * (parseFloat(restockPrice) || 0)).toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-accent h-12 text-base font-black" onClick={handleRestock} disabled={!restockQty}>
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
