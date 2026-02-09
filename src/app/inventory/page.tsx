
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
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  DialogFooter
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
import { generateProductDescription } from "@/ai/flows/generate-product-description"
import { useToast } from "@/hooks/use-toast"
import { useBusinessData } from "@/hooks/use-business-data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const { toast } = useToast()
  const { products, actions, isLoading, currency } = useBusinessData()
  const [isGenerating, setIsGenerating] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [reportDate, setReportDate] = useState("")

  // Hydration fix for date
  useEffect(() => {
    setReportDate(new Date().toLocaleString())
  }, [])

  const units = ["pcs", "kg", "gm", "ltr", "meter", "box", "dozen"]

  // Get unique categories for filter
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
      if (isEdit) {
        setEditingProduct({ ...editingProduct, description: result.description })
      } else {
        setNewProduct(prev => ({ ...prev, description: result.description }))
      }
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
      name: newProduct.name,
      category: newProduct.category,
      stock: parseFloat(newProduct.stock) || 0,
      purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
      unit: newProduct.unit,
      description: newProduct.description,
      sku: `SKU-${Math.floor(Math.random() * 1000)}`
    })
    setNewProduct({ name: "", category: "", features: "", description: "", purchasePrice: "", sellingPrice: "", stock: "", unit: "pcs" })
    setIsAddOpen(false)
    toast({ title: "Product Added" })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct.name || !editingProduct.sellingPrice) return;
    actions.updateProduct(editingProduct.id, {
      ...editingProduct,
      stock: parseFloat(editingProduct.stock) || 0,
      purchasePrice: parseFloat(editingProduct.purchasePrice) || 0,
      sellingPrice: parseFloat(editingProduct.sellingPrice) || 0,
    })
    setEditingProduct(null)
    toast({ title: "Product Updated" })
  }

  const openEditDialog = (product: any) => {
    setTimeout(() => {
      setEditingProduct(product)
    }, 10)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Print Only Header */}
      <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b pb-6 w-full text-center">
        <div className="flex items-center gap-4 mb-2">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="SpecsBiz Logo" 
              className="h-16 w-16 object-contain"
            />
          )}
          <h1 className="text-4xl font-black text-primary font-headline">SpecsBiz</h1>
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Inventory Status Report</p>
        <div className="text-[10px] mt-2 opacity-60 font-medium flex items-center gap-2 justify-center">
          <Calendar className="w-3 h-3" /> Report Date: {reportDate || "Loading..."}
        </div>
        {filterCategory !== 'all' && (
          <div className="mt-2">
            <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-bold">Category: {filterCategory}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-accent" /> Inventory
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your stock and profit margins.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 border-primary text-primary" 
            onClick={handlePrint}
            disabled={filteredProducts.length === 0}
          >
            <Printer className="w-4 h-4" /> Print Stock
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <CardDescription>Enter product details for stock management.</CardDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="name" className="sm:text-right text-xs">Name</Label>
                  <Input className="sm:col-span-3 h-9" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label className="sm:text-right text-xs">Category</Label>
                  <Input className="sm:col-span-3 h-9" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label className="sm:text-right text-xs">Unit Type</Label>
                  <Select value={newProduct.unit} onValueChange={(val) => setNewProduct({...newProduct, unit: val})}>
                    <SelectTrigger className="sm:col-span-3 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(u => (
                        <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase opacity-70">Buy Price (per {newProduct.unit})</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
                      <Input type="number" step="0.01" className="pl-8" value={newProduct.purchasePrice} onChange={e => setNewProduct({...newProduct, purchasePrice: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase opacity-70">Sell Price (per {newProduct.unit})</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
                      <Input type="number" step="0.01" className="pl-8" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label className="sm:text-right text-xs">Stock ({newProduct.unit})</Label>
                  <Input type="number" step="0.01" className="sm:col-span-3 h-9" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                  <Label className="sm:text-right mt-2 text-xs">Description</Label>
                  <div className="sm:col-span-3 space-y-2">
                    <Textarea className="min-h-[60px] text-xs" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                    <Button size="sm" variant="secondary" className="w-full gap-2 text-[10px]" onClick={() => handleAIDescription(false)} disabled={isGenerating}>
                      <Sparkles className="w-3.5 h-3.5" /> {isGenerating ? "Analyzing..." : "AI Generate Description"}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-accent w-full" onClick={handleAddProduct}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search inventory by name..." 
              className="pl-9 h-10 bg-white" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-white h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-xs">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 text-center">
              <Inbox className="w-8 h-8 opacity-20" />
              <p className="text-xs italic">No products found for this filter.</p>
            </div>
          ) : (
            <div className="min-w-[600px] print:min-w-full">
              <Table>
                <TableHeader className="bg-muted/50 print:bg-transparent">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase print:text-black">Product Name & Category</TableHead>
                    <TableHead className="text-xs font-bold uppercase print:text-black">Buy Price</TableHead>
                    <TableHead className="text-xs font-bold uppercase print:text-black">Sell Price</TableHead>
                    <TableHead className="text-xs font-bold uppercase print:text-black">Stock Level</TableHead>
                    <TableHead className="w-[50px] print:hidden"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-accent/5 print:hover:bg-transparent">
                      <TableCell className="p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-primary print:text-black">{p.name}</p>
                          <div className="text-[9px] text-accent uppercase font-bold print:text-gray-500">{p.category || 'No Category'} • {p.unit}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground print:text-black">{currency}{p.purchasePrice?.toLocaleString(undefined, {minimumFractionDigits: 2})} / {p.unit}</TableCell>
                      <TableCell className="font-bold text-primary text-[10px] md:text-xs print:text-black">{currency}{p.sellingPrice?.toLocaleString(undefined, {minimumFractionDigits: 2})} / {p.unit}</TableCell>
                      <TableCell className="text-[10px] md:text-xs">
                        <span className={cn(
                          "px-2 py-1 rounded-full",
                          p.stock < 5 ? "bg-red-100 text-red-600 font-bold print:bg-transparent print:text-red-600" : "bg-green-100 text-green-700 print:bg-transparent print:text-black"
                        )}>
                          {p.stock} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell className="p-2 print:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-3.5 h-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 text-xs" onClick={() => openEditDialog(p)}>
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive text-xs" onClick={() => actions.deleteProduct(p.id)}>
                              <Trash className="w-3.5 h-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="hidden print:flex items-center justify-between text-[10px] text-muted-foreground italic border-t pt-4 mt-8">
         <p>* Total Unique Products Listed: {filteredProducts.length}</p>
         <p>Report authorized by SpecsBiz Smart System.</p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-xs">Name</Label>
                <Input className="sm:col-span-3 h-9" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-xs">Category</Label>
                <Input className="sm:col-span-3 h-9" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label className="sm:text-right text-xs">Unit Type</Label>
                <Select value={editingProduct.unit} onValueChange={(val) => setEditingProduct({...editingProduct, unit: val})}>
                  <SelectTrigger className="sm:col-span-3 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => (
                      <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase opacity-70">Buy Price (per {editingProduct.unit})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
                    <Input type="number" step="0.01" className="pl-8" value={editingProduct.purchasePrice} onChange={e => setEditingProduct({...editingProduct, purchasePrice: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase opacity-70">Sell Price (per {editingProduct.unit})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
                    <Input type="number" step="0.01" className="pl-8" value={editingProduct.sellingPrice} onChange={e => setEditingProduct({...editingProduct, sellingPrice: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-xs">Stock ({editingProduct.unit})</Label>
                <Input type="number" step="0.01" className="sm:col-span-3 h-9" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                <Label className="sm:text-right mt-2 text-xs">Description</Label>
                <div className="sm:col-span-3 space-y-2">
                  <Textarea className="min-h-[60px] text-xs" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                  <Button size="sm" variant="secondary" className="w-full gap-2 text-[10px]" onClick={() => handleAIDescription(true)} disabled={isGenerating}>
                    <Sparkles className="w-3.5 h-3.5" /> {isGenerating ? "Analyzing..." : "AI Generate Description"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="bg-accent w-full" onClick={handleUpdateProduct}>Update Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .sidebar-wrapper, header, footer, .sidebar-inset > header, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .rounded-lg { border-radius: 0 !important; }
          .shadow-lg, .shadow-xl, .shadow-sm { box-shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #ddd !important; }
          th, td { border: 1px solid #ddd !important; padding: 10px !important; color: black !important; }
          .text-primary { color: black !important; }
          .text-accent { color: #008080 !important; }
          img { max-height: 80px !important; width: auto !important; }
        }
      `}</style>
    </div>
  )
}
