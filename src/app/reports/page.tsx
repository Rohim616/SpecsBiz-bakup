
"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  FileSpreadsheet, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users,
  CreditCard,
  Inbox,
  Loader2,
  Printer,
  Check,
  Settings2,
  Trash2,
  Lock,
  Clock,
  Tag,
  ChevronRight,
  X,
  History,
  PackageSearch
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useBusinessData } from "@/hooks/use-business-data"
import { useUser, useFirestore } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useToast } from "@/hooks/use-toast"

export default function MasterLedgerPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const { products, sales, customers, procurements, currency, isLoading: dataLoading, actions, language } = useBusinessData()
  const t = translations[language]
  
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [allBakiRecords, setAllBakiRecords] = useState<any[]>([])
  const [isBakiLoading, setIsBakiLoading] = useState(false)
  const [generatedDate, setGeneratedDate] = useState("")

  // Deletion State
  const [deleteItem, setDeleteItem] = useState<{ id: string, type: string, extra?: any } | null>(null)
  const [deletePass, setDeletePass] = useState("")

  // Hydration fix for print date
  useEffect(() => {
    setGeneratedDate(new Date().toLocaleString())
  }, [])

  // Print Settings State
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [printColumns, setPrintColumns] = useState({
    date: true,
    type: true,
    item: true,
    entity: true,
    total: true,
    paid: true,
    unpaid: true,
    status: true
  })

  // Fetch ALL Baki Records
  useEffect(() => {
    async function fetchAllBaki() {
      if (!user?.uid || !db) {
        const localBaki = customers.flatMap(c => 
          (c.bakiRecords || []).map((r: any) => ({
            ...r,
            customerId: c.id,
            customerName: `${c.firstName} ${c.lastName}`
          }))
        )
        setAllBakiRecords(localBaki)
        return
      }

      setIsBakiLoading(true)
      try {
        const records: any[] = []
        for (const customer of customers) {
          const snap = await getDocs(collection(db, 'users', user.uid, 'customers', customer.id, 'bakiRecords'))
          snap.forEach(doc => {
            records.push({
              ...doc.data(),
              id: doc.id,
              customerId: customer.id,
              customerName: `${customer.firstName} ${customer.lastName}`
            })
          })
        }
        setAllBakiRecords(records)
      } catch (e) {
        console.error("Error fetching baki records", e)
      } finally {
        setIsBakiLoading(false)
      }
    }

    if (!dataLoading) {
      fetchAllBaki()
    }
  }, [user, db, customers, dataLoading])

  // Merge everything into a MASTER LEDGER
  const ledgerEntries = useMemo(() => {
    const entries: any[] = []

    // 1. SALES (Direct & Baki Payments)
    sales.forEach(s => {
      let itemName = "";
      if (s.isBakiPayment) {
        itemName = `Payment: ${s.bakiProductName || 'Baki Settlement'}`;
      } else if (s.items && s.items.length > 0) {
        itemName = s.items.map((i: any) => `${i.name} (${i.quantity} ${i.unit || 'pcs'})`).join(', ');
      } else {
        itemName = `Sale #${s.id?.slice(-4)}`;
      }

      entries.push({
        id: s.id,
        date: new Date(s.saleDate),
        type: s.isBakiPayment ? 'Baki Payment' : 'Direct Sale',
        rawType: 'sale',
        item: itemName,
        amount: s.total,
        paid: s.total,
        unpaid: 0,
        status: 'Complete',
        color: s.isBakiPayment ? 'text-blue-600' : 'text-green-600',
        customer: s.customerName || 'Walking Customer',
        originalData: s
      })
    })

    // 2. DEBTS (New Baki Records)
    allBakiRecords.forEach(r => {
      entries.push({
        id: r.id,
        date: new Date(r.takenDate),
        type: 'New Baki',
        rawType: 'baki',
        item: `${r.productName} (${r.quantity} ${r.unit || 'pcs'})`,
        amount: r.amount,
        paid: r.paidAmount || 0,
        unpaid: r.amount - (r.paidAmount || 0),
        status: r.status === 'paid' ? 'Paid' : 'Unpaid',
        color: r.status === 'paid' ? 'text-green-600' : 'text-destructive',
        customer: r.customerName,
        customerId: r.customerId
      })
    })

    // 3. INVENTORY HISTORY (Real Procurement Spend - FIXES FAKE DATES)
    procurements.forEach(p => {
      entries.push({
        id: p.id,
        date: new Date(p.date), 
        type: p.type === 'sync' ? 'Initial Stock' : 'Restock Entry',
        rawType: 'inventory',
        item: `Bought: ${p.productName} (${p.quantity} ${p.unit || 'units'})`,
        amount: p.totalCost,
        paid: p.totalCost,
        unpaid: 0,
        status: 'In Stock',
        color: 'text-primary',
        customer: 'Supplier'
      })
    })

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [sales, allBakiRecords, procurements])

  const filteredLedger = ledgerEntries.filter(e => {
    const matchesSearch = `${e.item} ${e.customer}`.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || e.rawType === filterType || e.type.toLowerCase().includes(filterType.toLowerCase())
    
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && e.date >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && e.date <= end;
    }

    return matchesSearch && matchesType && matchesDate;
  })

  const summary = useMemo(() => {
    return {
      totalCashIn: sales.reduce((acc, s) => acc + (s.total || 0), 0),
      totalOwed: customers.reduce((acc, c) => acc + (c.totalDue || 0), 0),
      totalInvestment: products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0)
    }
  }, [sales, customers, products])

  const handleAuthorizedDelete = () => {
    if (deletePass === "specsxr") {
      if (deleteItem) {
        if (deleteItem.type === 'sale') {
          actions.deleteSale(deleteItem.id);
          toast({ title: "Sale Cancelled" });
        } else if (deleteItem.type === 'baki') {
          actions.deleteBakiRecord(deleteItem.extra.customerId, deleteItem.id, deleteItem.extra.remaining);
          toast({ title: "Baki Removed" });
        } else if (deleteItem.type === 'inventory') {
          actions.deleteProcurement(deleteItem.id);
          toast({ title: "Stock Record Removed" });
        }
      }
      setDeleteItem(null);
      setDeletePass("");
    } else {
      toast({ variant: "destructive", title: "Incorrect Password" });
      setDeletePass("");
    }
  }

  const handleDownloadCSV = () => {
    const headers = ["Date", "Time", "Type", "Item Description", "Entity", "Total", "Paid", "Unpaid", "Status"]
    const rows = filteredLedger.map(e => [
      e.date.toLocaleDateString(),
      e.date.toLocaleTimeString(),
      e.type,
      e.item.replace(/,/g, '|'),
      e.customer,
      e.amount,
      e.paid,
      e.unpaid,
      e.status
    ])

    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `master_ledger_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    setIsPrintDialogOpen(false);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 1000);
  }

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }

  if (dataLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <p className="font-bold text-accent animate-pulse">{t.loading}</p>
      </div>
    )
  }

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-full overflow-hidden">
      {/* Print Header */}
      <div className="hidden print:flex flex-col items-center justify-center mb-6 border-b pb-4 w-full text-center">
        <div className="flex items-center gap-3 mb-2">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-14 w-14 object-contain" />}
          <h1 className="text-3xl font-black text-primary font-headline">SpecsBiz</h1>
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Master Ledger Official Report | {generatedDate}</p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-accent" /> {t.masterLedger}
          </h2>
          <p className="text-sm text-muted-foreground print:hidden">{t.masterLedgerDesc}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto print:hidden">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5 h-11" onClick={() => setIsPrintDialogOpen(true)}>
            <Printer className="w-4 h-4" /> {t.printLedger}
          </Button>
          <Button variant="outline" className="gap-2 border-accent text-accent hover:bg-accent/5 h-11" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4" /> {t.exportCSV}
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><DollarSign className="w-16 h-16" /></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">{t.totalCashReceived}</p>
              <p className="text-2xl font-black text-emerald-700">{currency}{summary.totalCashIn.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100 shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CreditCard className="w-16 h-16" /></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-destructive text-white rounded-xl shadow-lg shadow-red-100"><CreditCard className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">{t.marketDues}</p>
              <p className="text-2xl font-black text-destructive">{currency}{summary.totalOwed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Package className="w-16 h-16" /></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><Package className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">{t.inventoryValue}</p>
              <p className="text-2xl font-black text-primary">{currency}{summary.totalInvestment.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/10 shadow-lg overflow-hidden print:border-none print:shadow-none bg-white/50 backdrop-blur-sm rounded-[2rem]">
        <CardHeader className="p-4 md:p-6 border-b bg-muted/20 flex flex-col space-y-4 print:hidden">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={t.filterType} 
                className="pl-9 h-12 bg-white rounded-xl focus-visible:ring-accent font-medium" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px] bg-white h-12 rounded-xl font-bold">
                  <SelectValue placeholder={t.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-bold">All Entities</SelectItem>
                  <SelectItem value="sale" className="font-bold">Sales & Payments</SelectItem>
                  <SelectItem value="baki" className="font-bold">Debt Records</SelectItem>
                  <SelectItem value="inventory" className="font-bold">Stock/Purchases</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/80 p-4 rounded-2xl border border-accent/10 shadow-inner">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">
                {language === 'bn' ? 'তারিখ ফিল্টার:' : 'Filter by Date:'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Input 
                type="date" 
                className="h-10 text-xs w-full sm:w-40 bg-white border-accent/10 rounded-xl font-bold" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
              <span className="text-[10px] font-black text-muted-foreground uppercase">to</span>
              <Input 
                type="date" 
                className="h-10 text-xs w-full sm:w-40 bg-white border-accent/10 rounded-xl font-bold" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 text-[10px] font-black uppercase text-accent border-accent/20 hover:bg-accent hover:text-white rounded-xl gap-2 shadow-sm"
                onClick={handleSetToday}
              >
                <Clock className="w-3.5 h-3.5" /> {language === 'bn' ? 'আজ' : 'Today'}
              </Button>
              {(startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 px-4 text-[10px] font-black uppercase text-destructive hover:bg-red-50 rounded-xl"
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> {language === 'bn' ? 'মুছুন' : 'Clear'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredLedger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
              <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center"><Inbox className="w-10 h-10 opacity-10" /></div>
              <p className="text-sm font-black uppercase tracking-widest opacity-30">{t.noData}</p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 md:p-6 bg-muted/5">
              {filteredLedger.map((entry, idx) => (
                <Card key={entry.id + idx} className="overflow-hidden border-accent/10 shadow-sm hover:shadow-md transition-all rounded-[1.5rem] bg-white print:border-none print:shadow-none print:rounded-none group">
                  <div className="p-4 md:p-6 space-y-4">
                    {/* Header: Date, Time and Type */}
                    <div className={cn("flex flex-wrap items-center justify-between gap-3", !printColumns.date && !printColumns.type && "print:hidden")}>
                      <div className={cn("flex items-center gap-3", !printColumns.date && "print:hidden")}>
                        <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-black text-primary uppercase">{entry.date.toLocaleDateString()}</p>
                          <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-accent" /> 
                            {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className={cn(!printColumns.type && "print:hidden")}>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase tracking-widest h-6 px-3 border-accent/20 bg-accent/5",
                          entry.rawType === 'inventory' ? 'text-primary bg-primary/5 border-primary/10' : 'text-accent'
                        )}>
                          {entry.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section: Item Details & Entity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-4">
                        <div className={cn(!printColumns.item && "print:hidden")}>
                          <Label className="text-[9px] font-black uppercase opacity-40 block mb-1.5 tracking-[0.2em]">Activity Details</Label>
                          <p className="text-sm font-bold text-primary leading-relaxed border-l-4 border-accent/20 pl-4">{entry.item}</p>
                        </div>
                        <div className={cn(!printColumns.entity && "print:hidden")}>
                          <Label className="text-[9px] font-black uppercase opacity-40 block mb-1.5 tracking-[0.2em]">Contact / Entity</Label>
                          <p className="text-xs font-black flex items-center gap-2 text-muted-foreground uppercase">
                            <Users className="w-3.5 h-3.5 text-accent" /> {entry.customer}
                          </p>
                        </div>
                      </div>

                      {/* Financials Block */}
                      <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/10 shadow-inner flex flex-col justify-center">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className={cn(!printColumns.total && "print:hidden")}>
                            <p className="text-[8px] font-black uppercase opacity-50 mb-1">Total Bill</p>
                            <p className="text-sm md:text-base font-black text-primary">{currency}{entry.amount.toLocaleString()}</p>
                          </div>
                          <div className={cn(!printColumns.paid && "print:hidden")}>
                            <p className="text-[8px] font-black uppercase opacity-50 mb-1">Received</p>
                            <p className="text-sm md:text-base font-black text-emerald-600">{currency}{entry.paid.toLocaleString()}</p>
                          </div>
                          <div className={cn(!printColumns.unpaid && "print:hidden")}>
                            <p className="text-[8px] font-black uppercase opacity-50 mb-1">Due</p>
                            <p className={cn(
                              "text-sm md:text-base font-black", 
                              entry.unpaid > 0 ? "text-destructive" : "text-muted-foreground opacity-20"
                            )}>
                              {currency}{entry.unpaid.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Status and Delete Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-black/5">
                      <div className={cn("flex items-center gap-2", !printColumns.status && "print:hidden")}>
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          entry.rawType === 'inventory' ? 'bg-primary' : (entry.unpaid > 0 ? 'bg-destructive' : 'bg-green-500')
                        )} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", entry.color)}>
                          {entry.status}
                        </span>
                      </div>
                      
                      <div className="print:hidden">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-destructive hover:bg-red-50 hover:text-destructive rounded-xl font-black text-[9px] uppercase px-3 gap-2 opacity-40 group-hover:opacity-100 transition-all"
                          onClick={() => setDeleteItem({ id: entry.id, type: entry.rawType, extra: entry.rawType === 'baki' ? { customerId: entry.customerId, remaining: entry.unpaid } : null })}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Record
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden Table for Printing Only */}
      <div className="hidden print:block">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow>
              <TableHead className={cn(!printColumns.date && "hidden")}>Date/Time</TableHead>
              <TableHead className={cn(!printColumns.type && "hidden")}>Type</TableHead>
              <TableHead className={cn(!printColumns.item && "hidden")}>Description</TableHead>
              <TableHead className={cn(!printColumns.entity && "hidden")}>Entity</TableHead>
              <TableHead className={cn(!printColumns.total && "hidden")}>Total</TableHead>
              <TableHead className={cn(!printColumns.paid && "hidden")}>Paid</TableHead>
              <TableHead className={cn(!printColumns.unpaid && "hidden")}>Unpaid</TableHead>
              <TableHead className={cn(!printColumns.status && "hidden")}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLedger.map((entry, i) => (
              <TableRow key={i}>
                <TableCell className={cn(!printColumns.date && "hidden")}>{entry.date.toLocaleString()}</TableCell>
                <TableCell className={cn(!printColumns.type && "hidden")}>{entry.type}</TableCell>
                <TableCell className={cn(!printColumns.item && "hidden")}>{entry.item}</TableCell>
                <TableCell className={cn(!printColumns.entity && "hidden")}>{entry.customer}</TableCell>
                <TableCell className={cn(!printColumns.total && "hidden")}>{currency}{entry.amount}</TableCell>
                <TableCell className={cn(!printColumns.paid && "hidden")}>{currency}{entry.paid}</TableCell>
                <TableCell className={cn(!printColumns.unpaid && "hidden")}>{currency}{entry.unpaid}</TableCell>
                <TableCell className={cn(!printColumns.status && "hidden")}>{entry.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Auth Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-3 bg-red-50 rounded-2xl shadow-sm"><Lock className="w-7 h-7" /></div>
              <div>
                <DialogTitle className="font-black uppercase tracking-tighter text-xl">Security Clearance</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase opacity-60">Authorize ledger deletion</DialogDescription>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mt-4">
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                {language === 'en' 
                  ? 'Note: Deleting a record is permanent and will reverse inventory or balance changes linked to it.' 
                  : 'সতর্কতা: লেজার থেকে এন্ট্রি মুছলে তা চিরস্থায়ীভাবে ডাটাবেস এবং ইনভেন্টরি ব্যালেন্স পরিবর্তন করবে।'}
              </p>
            </div>
          </DialogHeader>
          <div className="py-6 space-y-2">
            <Label className="text-[10px] font-black uppercase opacity-70 tracking-widest ml-1">{t.secretKey}</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-16 text-3xl font-black text-center rounded-2xl bg-accent/5 border-accent/10 focus-visible:ring-accent" 
              value={deletePass} 
              onChange={e => setDeletePass(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="destructive" className="w-full h-16 rounded-2xl text-base font-black uppercase shadow-2xl transition-all active:scale-95 gap-2" onClick={handleAuthorizedDelete}>
              <History className="w-5 h-5" /> {language === 'en' ? 'Authorize & Reverse Data' : 'অথোরাইজ ও ডিলিট করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Config Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl"><Settings2 className="w-6 h-6 text-primary" /></div>
              <div>
                <DialogTitle className="font-black uppercase tracking-tighter text-xl">Report Layout</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase opacity-60">Customize columns for PDF/Paper</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-8">
            {Object.entries(printColumns).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-black/5 hover:bg-muted/50 transition-all">
                <Label className="text-[10px] font-black uppercase tracking-widest capitalize">{key}</Label>
                <Switch 
                  checked={value} 
                  onCheckedChange={(checked) => setPrintColumns(prev => ({ ...prev, [key]: checked }))} 
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 h-16 rounded-[1.5rem] font-black uppercase shadow-2xl gap-3 text-lg" onClick={handlePrint}>
              <Printer className="w-6 h-6" /> Generate Official PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          .print\\:hidden, nav, .fixed, [role="dialog"], button { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .sidebar-wrapper, header, footer, .sidebar-inset > header, nav, [role="navigation"], .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .hidden.print\\:block { display: block !important; }
          .hidden.print\\:flex { display: flex !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 10px !important; color: black !important; font-size: 10pt !important; }
          th { background-color: #f0f0f0 !important; font-weight: bold !important; }
          .rounded-\\[2rem\\], .rounded-\\[1\\.5rem\\], .rounded-3xl { border-radius: 0 !important; border: 1px solid #eee !important; margin-bottom: 10px !important; }
        }
      `}</style>
    </div>
  )
}
