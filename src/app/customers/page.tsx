
"use client"

import { useState } from "react"
import { 
  Users, 
  Search, 
  Sparkles, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Inbox,
  Plus,
  MapPin,
  Trash,
  Edit2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { suggestCustomerSegments } from "@/ai/flows/suggest-customer-segments"
import { useToast } from "@/hooks/use-toast"
import { useBusinessData } from "@/hooks/use-business-data"

export default function CustomersPage() {
  const { toast } = useToast()
  const { customers, actions, isLoading, currency } = useBusinessData()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<{ segments: string[], reasoning: string } | null>(null)
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [adjustmentDialog, setAdjustmentDialog] = useState<{customer: any, type: 'add' | 'pay'} | null>(null)
  const [adjustAmount, setAdjustAmount] = useState("")

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    totalDue: 0,
    segment: "Baki User"
  })

  const handleAISegmentation = async () => {
    if (customers.length === 0) {
      toast({ title: "No Data", description: "Add customers first.", variant: "destructive" })
      return
    }
    
    setIsAnalyzing(true)
    try {
      const historyStr = customers.map(c => `${c.firstName}: Total Baki ${currency}${c.totalDue}`).join(". ")
      const demographicsStr = "User provided credit customer list."
      const result = await suggestCustomerSegments({
        purchaseHistory: historyStr,
        demographics: demographicsStr
      })
      setAiAnalysis({ segments: result.customerSegments, reasoning: result.reasoning })
      toast({ title: "AI Insights Ready" })
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddCustomer = () => {
    if (!newCustomer.firstName) return
    actions.addCustomer({
      ...newCustomer,
      totalDue: parseFloat(newCustomer.totalDue.toString()) || 0
    })
    setNewCustomer({ firstName: "", lastName: "", email: "", phone: "", address: "", totalDue: 0, segment: "Baki User" })
    setIsAddOpen(false)
    toast({ title: "Customer Added to Baki List" })
  }

  const handleUpdateCustomer = () => {
    if (!editingCustomer.firstName) return
    actions.updateCustomer(editingCustomer.id, {
      ...editingCustomer,
      totalDue: parseFloat(editingCustomer.totalDue.toString()) || 0
    })
    setEditingCustomer(null)
    toast({ title: "Customer Info Updated" })
  }

  const handleAdjustBaki = () => {
    if (!adjustmentDialog || !adjustAmount) return
    const amount = parseFloat(adjustAmount)
    if (isNaN(amount) || amount <= 0) return

    const newTotal = adjustmentDialog.type === 'add' 
      ? (adjustmentDialog.customer.totalDue || 0) + amount
      : Math.max(0, (adjustmentDialog.customer.totalDue || 0) - amount)

    actions.updateCustomer(adjustmentDialog.customer.id, {
      ...adjustmentDialog.customer,
      totalDue: newTotal
    })

    toast({ 
      title: adjustmentDialog.type === 'add' ? "Baki Added" : "Payment Received",
      description: `${currency}${amount} adjusted for ${adjustmentDialog.customer.firstName}`
    })
    setAdjustmentDialog(null)
    setAdjustAmount("")
  }

  const openEditDialog = (customer: any) => {
    setTimeout(() => {
      setEditingCustomer(customer)
    }, 10)
  }

  const totalMarketBaki = customers.reduce((acc, c) => acc + (c.totalDue || 0), 0)

  if (isLoading) return <div className="p-10 text-center animate-pulse text-accent font-bold">Syncing Baki Data...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" /> Baki Management
          </h2>
          <p className="text-sm text-muted-foreground">Manage customer credits and pending payments.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="border-accent text-accent gap-2 flex-1 sm:flex-none"
            onClick={handleAISegmentation}
            disabled={isAnalyzing || customers.length === 0}
          >
            <Sparkles className="w-4 h-4" />
            {isAnalyzing ? "Analysing Risk..." : "AI Risk Audit"}
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 gap-2 flex-1 sm:flex-none">
                <Plus className="w-4 h-4" /> Add Baki User
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Customer (Baki)</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Input className="h-9" value={newCustomer.firstName} onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input className="h-9" value={newCustomer.lastName} onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" className="h-9" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Initial Baki ({currency})</Label>
                    <Input type="number" className="h-9" value={newCustomer.totalDue} onChange={e => setNewCustomer({...newCustomer, totalDue: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input className="h-9" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Input className="h-9" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-accent" onClick={handleAddCustomer}>Save Baki Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-destructive/10 border-destructive/20 shadow-none">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs uppercase tracking-widest font-bold opacity-70">Total Market Baki</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-black text-destructive">{currency}{totalMarketBaki.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-white border-none shadow-lg">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs uppercase tracking-widest font-bold opacity-70">Active Borrowers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-black">{customers.filter(c => (c.totalDue || 0) > 0).length}</p>
          </CardContent>
        </Card>
      </div>

      {aiAnalysis && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> AI Debt Audit & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.segments.map((seg, i) => (
                <Badge key={i} className="bg-accent text-white">{seg}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed">"{aiAnalysis.reasoning}"</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Baki records..." 
              className="pl-9 h-11" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 text-center">
              <Inbox className="w-12 h-12 opacity-10" />
              <div>
                <p className="text-sm italic">No baki records found.</p>
                <p className="text-[10px] mt-1">Start by adding customers who take items on credit.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Contact & Address</TableHead>
                  <TableHead className="text-xs">Total Baki</TableHead>
                  <TableHead className="text-xs text-right pr-6">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers
                  .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{c.firstName} {c.lastName}</span>
                        <span className="text-[10px] text-muted-foreground">{c.segment}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Phone className="w-2.5 h-2.5" /> {c.phone}</span>
                        <span className="text-[10px] flex items-center gap-1 text-muted-foreground truncate max-w-[150px]"><MapPin className="w-2.5 h-2.5" /> {c.address || 'No address'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`text-sm font-black ${c.totalDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {currency}{c.totalDue?.toLocaleString() || '0'}
                        </span>
                        {c.totalDue > 1000 && <Badge variant="outline" className="text-[8px] h-4 w-fit border-destructive text-destructive px-1">High Debt</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] gap-1 border-destructive text-destructive hover:bg-destructive/5"
                          onClick={() => setAdjustmentDialog({customer: c, type: 'add'})}
                        >
                          <ArrowUpRight className="w-3 h-3" /> Add Baki
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] gap-1 border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => setAdjustmentDialog({customer: c, type: 'pay'})}
                        >
                          <ArrowDownLeft className="w-3 h-3" /> Pay
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 text-xs" onClick={() => openEditDialog(c)}>
                              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs text-destructive" onClick={() => actions.deleteCustomer(c.id)}>
                              <Trash className="w-3.5 h-3.5" /> Remove Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Baki Dialog */}
      <Dialog open={!!adjustmentDialog} onOpenChange={(open) => !open && setAdjustmentDialog(null)}>
        <DialogContent className="w-[90vw] max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {adjustmentDialog?.type === 'add' ? <Plus className="text-destructive" /> : <DollarSign className="text-green-600" />}
              {adjustmentDialog?.type === 'add' ? 'Add Extra Baki' : 'Receive Payment'}
            </DialogTitle>
            <CardDescription>Adjust balance for {adjustmentDialog?.customer?.firstName}</CardDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
              <span className="text-xs font-bold uppercase opacity-60">Current Balance</span>
              <span className="font-black text-lg">{currency}{adjustmentDialog?.customer?.totalDue?.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Amount ({currency})</Label>
              <Input 
                type="number" 
                placeholder="Enter amount..." 
                autoFocus
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdjustBaki()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className={`w-full ${adjustmentDialog?.type === 'add' ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={handleAdjustBaki}
            >
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">First Name</Label>
                  <Input className="h-9" value={editingCustomer.firstName} onChange={e => setEditingCustomer({...editingCustomer, firstName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Last Name</Label>
                  <Input className="h-9" value={editingCustomer.lastName} onChange={e => setEditingCustomer({...editingCustomer, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" className="h-9" value={editingCustomer.email} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Total Baki Balance ({currency})</Label>
                  <Input type="number" className="h-9 font-bold" value={editingCustomer.totalDue} onChange={e => setEditingCustomer({...editingCustomer, totalDue: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input className="h-9" value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input className="h-9" value={editingCustomer.address} onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full bg-accent" onClick={handleUpdateCustomer}>Update Customer Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
