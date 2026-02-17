
"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Globe, 
  Lock, 
  Settings2, 
  Copy, 
  CheckCircle2, 
  Store,
  Share2,
  AlertCircle,
  Settings,
  X,
  Maximize2,
  RefreshCw,
  ShieldAlert,
  LayoutTemplate,
  PackageCheck,
  Eye,
  EyeOff,
  MessageSquareText,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  Search,
  Tag,
  DollarSign,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBusinessData } from "@/hooks/use-business-data"
import { useUser } from "@/firebase"
import { translations } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

export default function ShopManagerPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const { shopConfig, products, actions, language, currency } = useBusinessData()
  const t = translations[language]

  // Shop Config State
  const [shopName, setShopName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [welcomeMsg, setWelcomeMsg] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Product Management State
  const [search, setSearch] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePass, setDeletePass] = useState("")

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    unit: "pcs",
    alertThreshold: "5",
    imageUrl: "",
    showInShop: true
  })

  useEffect(() => {
    if (shopConfig) {
      setShopName(shopConfig.shopName || "")
      setAccessCode(shopConfig.accessCode || "")
      setWelcomeMsg(shopConfig.welcomeMsg || "")
      setIsActive(shopConfig.isActive || false)
    }
  }, [shopConfig])

  const handleSaveConfig = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Cloud Required", description: "Please login to activate your online shop." })
      return
    }
    actions.updateShopConfig({
      shopName,
      accessCode,
      welcomeMsg,
      isActive
    })
    toast({ title: "Shop Configuration Updated" })
    setRefreshKey(prev => prev + 1)
  }

  const toggleProductVisibility = (productId: string, currentStatus: boolean) => {
    actions.updateProduct(productId, { showInShop: !currentStatus })
    toast({ title: currentStatus ? "Hidden from Shop" : "Visible in Shop" })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (type === 'new') setNewProduct(prev => ({ ...prev, imageUrl: base64 }))
      else setEditingProduct((prev: any) => ({ ...prev, imageUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return
    actions.addProduct({
      ...newProduct,
      stock: parseFloat(newProduct.stock) || 0,
      purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
      alertThreshold: parseFloat(newProduct.alertThreshold) || 5
    })
    setNewProduct({ name: "", category: "", purchasePrice: "", sellingPrice: "", stock: "", unit: "pcs", alertThreshold: "5", imageUrl: "", showInShop: true })
    setIsAddProductOpen(false)
    toast({ title: t.saveProduct })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return
    actions.updateProduct(editingProduct.id, {
      ...editingProduct,
      stock: parseFloat(editingProduct.stock) || 0,
      purchasePrice: parseFloat(editingProduct.purchasePrice) || 0,
      sellingPrice: parseFloat(editingProduct.sellingPrice) || 0
    })
    setEditingProduct(null)
    toast({ title: t.updateChanges })
  }

  const handleDeleteConfirm = () => {
    if (deletePass === "specsxr") {
      if (deleteId) {
        actions.deleteProduct(deleteId)
        setDeleteId(null)
        setDeletePass("")
        toast({ title: "Product Removed" })
      }
    } else {
      toast({ variant: "destructive", title: "Invalid Key" })
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  }, [products, search])

  const shopUrl = user ? `${window.location.origin}/shop/${user.uid}` : ""

  const copyToClipboard = () => {
    if (!shopUrl) return
    navigator.clipboard.writeText(shopUrl)
    toast({ title: "Link Copied" })
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] w-full max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tighter">{t.shopManager}</h2>
            <p className="text-[9px] font-bold text-accent uppercase tracking-[0.3em]">Administrator Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-accent/10 text-accent"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 h-12 px-6 rounded-2xl shadow-xl font-black uppercase gap-2 transition-all active:scale-95">
                <Settings className="w-5 h-5" /> {language === 'bn' ? 'অ্যাডমিন সেটিংস' : 'Admin Settings'}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[850px] rounded-[2.5rem] p-0 overflow-hidden border-accent/20 shadow-2xl">
              <DialogHeader className="p-6 bg-accent/5 border-b shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl border border-accent/10 shadow-sm"><Settings2 className="w-6 h-6 text-accent" /></div>
                    <div>
                      <DialogTitle className="text-xl font-black text-primary uppercase tracking-tighter">Shop Administrator</DialogTitle>
                      <DialogDescription className="text-[10px] font-bold uppercase opacity-60">Full Control Panel</DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-8">
                    <span className={cn("text-[9px] font-black uppercase", isActive ? "text-green-600" : "text-muted-foreground")}>
                      {isActive ? t.active : t.inactive}
                    </span>
                    <Switch checked={isActive} onCheckedChange={setIsActive} disabled={!user} />
                  </div>
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start rounded-none bg-muted/30 px-6 h-12 border-b overflow-x-auto no-scrollbar">
                  <TabsTrigger value="general" className="gap-2 text-[10px] font-black uppercase tracking-widest"><Settings className="w-3.5 h-3.5" /> General</TabsTrigger>
                  <TabsTrigger value="content" className="gap-2 text-[10px] font-black uppercase tracking-widest"><LayoutTemplate className="w-3.5 h-3.5" /> Customization</TabsTrigger>
                  <TabsTrigger value="products" className="gap-2 text-[10px] font-black uppercase tracking-widest"><PackageCheck className="w-3.5 h-3.5" /> Inventory Control</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8 bg-white max-h-[65vh] overflow-y-auto">
                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-8 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.shopName}</Label>
                        <Input value={shopName} onChange={e => setShopName(e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-none font-bold text-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.shopCode}</Label>
                        <Input value={accessCode} onChange={e => setAccessCode(e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-none font-bold text-primary" />
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[1.5rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Share2 className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-xs font-black uppercase text-emerald-900">{t.shareLink}</h4>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase h-5">Public</Badge>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-emerald-200 p-3 rounded-xl truncate text-[10px] font-mono text-emerald-800 shadow-inner">
                          {shopUrl || 'Login required'}
                        </div>
                        <Button variant="outline" size="sm" className="bg-white border-emerald-200 text-emerald-700 font-bold rounded-xl" onClick={copyToClipboard} disabled={!user}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Customization Tab */}
                  <TabsContent value="content" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                        <MessageSquareText className="w-3.5 h-3.5 text-accent" /> Custom Welcome Message
                      </Label>
                      <textarea 
                        value={welcomeMsg} 
                        onChange={e => setWelcomeMsg(e.target.value)}
                        placeholder="Welcome to our shop! Feel free to explore our collection..."
                        className="w-full min-h-[120px] p-4 rounded-2xl bg-muted/20 border-none font-medium text-sm text-primary focus:ring-2 focus:ring-accent outline-none"
                      />
                      <p className="text-[9px] font-bold text-muted-foreground italic px-1">This message will appear at the top of your shop gallery.</p>
                    </div>
                  </TabsContent>

                  {/* A to Z Inventory Control Tab */}
                  <TabsContent value="products" className="space-y-6 mt-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-primary">Web Catalog Manager</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Add, Edit or Delete items live</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input placeholder="Filter catalog..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl text-xs bg-muted/20 border-none" />
                        </div>
                        <Button onClick={() => setIsAddProductOpen(true)} className="bg-accent h-10 px-4 rounded-xl font-black uppercase text-[10px] gap-2 shrink-0 shadow-lg">
                          <Plus className="w-4 h-4" /> New Item
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {filteredProducts.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground italic text-xs">No matching products found.</div>
                      ) : (
                        filteredProducts.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-muted/5 rounded-2xl border border-black/5 hover:bg-muted/10 transition-all group">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border shadow-sm shrink-0">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent/5 flex items-center justify-center text-[8px] font-bold">N/A</div>}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-primary truncate leading-none mb-1.5">{p.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[8px] h-4 font-black uppercase border-accent/20 text-accent">{p.category || 'General'}</Badge>
                                  <span className="text-[9px] font-bold text-muted-foreground">{currency}{p.sellingPrice} / {p.unit}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn(
                                  "h-9 rounded-xl font-black text-[9px] uppercase gap-2 transition-all",
                                  p.showInShop !== false ? "text-green-600 bg-green-50" : "text-muted-foreground bg-muted/50"
                                )}
                                onClick={() => toggleProductVisibility(p.id, p.showInShop !== false)}
                              >
                                {p.showInShop !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{p.showInShop !== false ? "Visible" : "Hidden"}</span>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-accent/10 rounded-xl" onClick={() => setEditingProduct(p)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => setDeleteId(p.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </div>

                <div className="p-6 bg-muted/20 border-t">
                  <Button 
                    onClick={handleSaveConfig} 
                    disabled={!user}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase shadow-xl transition-all active:scale-95 gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Deploy All Shop Changes
                  </Button>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!user ? (
        <Card className="bg-amber-50 border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
          <div>
            <h4 className="font-black text-amber-800 uppercase text-sm">Cloud Login Required</h4>
            <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">
              Your online shop needs a cloud connection to work publicly. Please go to the <b>Auth</b> page and connect your account first.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] overflow-hidden border-4 border-accent/10 shadow-2xl relative group">
          {isActive ? (
            <>
              <iframe 
                key={refreshKey}
                src={shopUrl} 
                className="w-full h-full border-none"
                title="Shop Preview"
              />
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={shopUrl} target="_blank" rel="noreferrer">
                  <Button className="bg-primary/80 backdrop-blur-md text-white rounded-full h-12 px-6 gap-2 shadow-2xl">
                    <Maximize2 className="w-4 h-4" /> View Full Site
                  </Button>
                </a>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center gap-6 bg-accent/5">
              <div className="p-8 bg-white rounded-[3rem] shadow-xl text-muted-foreground/20">
                <Globe className="w-24 h-24" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-primary uppercase">Preview Offline</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
                  আপনার শপটি বর্তমানে বন্ধ আছে। সেটিংস থেকে <b>Active</b> করে সেভ করুন এখানে প্রিভিউ দেখার জন্য।
                </p>
                <Button variant="outline" className="mt-4 border-accent text-accent rounded-xl font-bold" onClick={() => setIsSettingsOpen(true)}>
                  Open Admin Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* A to Z: Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-primary font-black uppercase">Add Web Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed overflow-hidden">
                {newProduct.imageUrl ? <img src={newProduct.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                <Label htmlFor="shop-new-image" className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white"><Upload /></Label>
                <input id="shop-new-image" type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'new')} />
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Name</Label><Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="h-11" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Buy Price</Label><Input type="number" value={newProduct.purchasePrice} onChange={e => setNewProduct({...newProduct, purchasePrice: e.target.value})} className="h-11" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Sell Price</Label><Input type="number" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} className="h-11" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Initial Stock</Label><Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="h-11" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Unit</Label><Input value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="h-11" /></div>
            </div>
          </div>
          <DialogFooter><Button className="w-full h-14 bg-accent font-black uppercase" onClick={handleAddProduct}>Save & Add to Catalog</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A to Z: Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-primary font-black uppercase">Edit Item Details</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed overflow-hidden">
                {editingProduct?.imageUrl ? <img src={editingProduct.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                <Label htmlFor="shop-edit-image" className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white"><Upload /></Label>
                <input id="shop-edit-image" type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'edit')} />
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Name</Label><Input value={editingProduct?.name || ""} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="h-11" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Buy Price</Label><Input type="number" value={editingProduct?.purchasePrice || ""} onChange={e => setEditingProduct({...editingProduct, purchasePrice: e.target.value})} className="h-11" /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Sell Price</Label><Input type="number" value={editingProduct?.sellingPrice || ""} onChange={e => setEditingProduct({...editingProduct, sellingPrice: e.target.value})} className="h-11" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">Stock</Label><Input type="number" value={editingProduct?.stock || ""} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="h-11" /></div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase">Shop Visibility</Label>
                <div className="flex items-center gap-2 h-11">
                  <Switch checked={editingProduct?.showInShop !== false} onCheckedChange={(val) => setEditingProduct({...editingProduct, showInShop: val})} />
                  <span className="text-[10px] font-bold">{editingProduct?.showInShop !== false ? 'Show' : 'Hide'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter><Button className="w-full h-14 bg-primary font-black uppercase" onClick={handleUpdateProduct}>Save All Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A to Z: Delete Authorization Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 bg-red-50 rounded-xl"><Lock className="w-6 h-6" /></div>
              <DialogTitle className="font-black uppercase tracking-tighter">Master Wipe</DialogTitle>
            </div>
            <DialogDescription className="text-xs">Enter 'specsxr' to permanently remove this product.</DialogDescription>
          </DialogHeader>
          <div className="py-4"><Input type="password" placeholder="••••••••" className="h-14 text-center text-2xl font-black rounded-2xl" value={deletePass} onChange={e => setDeletePass(e.target.value)} /></div>
          <DialogFooter><Button variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase" onClick={handleDeleteConfirm}>Authorize & Wipe</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
