
"use client"

import { useState, useMemo } from "react"
import { 
  PackageSearch, 
  Search, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingDown, 
  Inbox,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useBusinessData } from "@/hooks/use-business-data"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

export default function ProcurementPage() {
  const { procurements, currency, isLoading, language } = useBusinessData()
  const t = translations[language]
  
  const [search, setSearch] = useState("")

  const totalSpent = useMemo(() => {
    return procurements.reduce((acc, p) => acc + (p.totalCost || 0), 0)
  }, [procurements])

  const filteredProc = useMemo(() => {
    return procurements.filter(p => 
      p.productName.toLowerCase().includes(search.toLowerCase())
    )
  }, [procurements, search])

  if (isLoading) return <div className="p-10 text-center animate-pulse text-accent font-bold">{t.loading}</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-accent" /> {t.stockEntryHistory}
          </h2>
          <p className="text-sm text-muted-foreground">{t.procurementDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-primary text-white p-4 overflow-hidden relative group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="w-20 h-20" />
          </div>
          <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">{t.totalProcurementCost}</p>
          <div className="text-2xl font-black">{currency}{totalSpent.toLocaleString()}</div>
        </Card>
        <Card className="bg-accent text-white p-4 overflow-hidden relative group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
            <Package className="w-20 h-20" />
          </div>
          <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Total Items Added</p>
          <div className="text-2xl font-black">{procurements.length} Records</div>
        </Card>
      </div>

      <Card className="border-accent/10 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t.search} 
              className="pl-9 h-12 bg-white border-accent/10 shadow-inner focus-visible:ring-accent" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredProc.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Inbox className="w-12 h-12 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-20">{t.noData}</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6 font-black text-primary uppercase text-[10px] tracking-widest">{t.date}</TableHead>
                  <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest">{t.productBought}</TableHead>
                  <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest">{t.buyQty}</TableHead>
                  <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest">{t.buyPrice}</TableHead>
                  <TableHead className="text-right pr-6 font-black text-primary uppercase text-[10px] tracking-widest">{t.totalCostSpent}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProc.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/5 transition-all group">
                    <TableCell className="pl-6 py-4 text-[10px] font-bold text-muted-foreground">
                      {new Date(p.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-black text-primary group-hover:text-accent transition-colors">
                      {p.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold">{p.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {currency}{p.buyPrice?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-black text-primary text-sm">
                        {currency}{p.totalCost?.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
