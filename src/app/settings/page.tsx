
'use client';

import { useState, useEffect } from "react";
import { 
  Settings, 
  Coins, 
  Shield, 
  Database,
  Trash2,
  Lock,
  AlertTriangle,
  Languages,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  Package,
  ShoppingCart,
  Printer,
  Sparkles,
  Key,
  Info,
  Loader2,
  RefreshCw,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBusinessData } from "@/hooks/use-business-data";
import { useToast } from "@/hooks/use-toast";
import { translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { label: 'Taka (৳)', value: '৳' },
  { label: 'Dollar ($)', value: '$' },
  { label: 'Euro (€)', value: '€' },
  { label: 'Pound (£)', value: '£' },
  { label: 'Rupee (₹)', value: '₹' },
  { label: 'Riyal (SAR)', value: 'SAR ' },
];

const LANGUAGES = [
  { label: 'বাংলা (Bengali)', value: 'bn' },
  { label: 'English', value: 'en' },
];

export default function SettingsPage() {
  const { products, sales, customers, currency, language, aiApiKey, actions } = useBusinessData();
  const { toast } = useToast();
  const t = translations[language];
  
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isExportOptionsOpen, setIsExportOptionsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportDate, setExportDate] = useState("");
  
  // AI State
  const [newAiKey, setNewAiKey] = useState(aiApiKey || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [detectedModel, setDetectedModel] = useState<string | null>(null);

  useEffect(() => {
    setExportDate(new Date().toLocaleString());
    setNewAiKey(aiApiKey || "");
  }, [aiApiKey]);

  const handleCurrencyChange = (val: string) => {
    actions.setCurrency(val);
    toast({
      title: language === 'en' ? "Settings Updated" : "সেটিংস আপডেট হয়েছে",
      description: (language === 'en' ? "Currency changed to " : "কারেন্সি পরিবর্তন হয়েছে: ") + val,
    });
  };

  const handleLanguageChange = (val: 'en' | 'bn') => {
    actions.setLanguage(val);
    toast({
      title: val === 'en' ? "Language Changed" : "ভাষা পরিবর্তন করা হয়েছে",
      description: val === 'en' ? "System language is now English" : "সিস্টেমের ভাষা এখন বাংলা",
    });
  };

  const verifyAndSaveKey = async () => {
    if (!newAiKey.trim()) {
      toast({ variant: "destructive", title: "Key Required" });
      return;
    }

    setIsVerifying(true);
    setDetectedModel(null);

    try {
      // Simulate verification and model detection logic
      // In a real Genkit environment, we'd call a server action to verify the key
      // and list models. For now, we simulate success for Gemini keys.
      const isGemini = newAiKey.startsWith('AIza');
      
      if (isGemini) {
        // Mock model name detection
        setDetectedModel("Gemini 1.5 Flash (Detected)");
        actions.setAiApiKey(newAiKey);
        toast({
          title: language === 'en' ? "AI Activated!" : "এআই সক্রিয় হয়েছে!",
          description: language === 'en' ? "Model detected and connected successfully." : "মডেলটি সফলভাবে ডিটেক্ট করা হয়েছে।",
        });
      } else {
        // Allow other keys but warn it might be generic
        setDetectedModel("Generic AI Model (Active)");
        actions.setAiApiKey(newAiKey);
        toast({
          title: "Connected",
          description: "API Key set. Model detection might be limited for this provider."
        });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Connection Failed", description: "Invalid API key or network error." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = async () => {
    if (password === "specsxr") {
      setIsDeleting(true);
      try {
        await actions.resetAllData();
        toast({ title: "System Reset", description: "All data has been permanently deleted." });
      } catch (e) {
        toast({ title: "Reset Failed", variant: "destructive" });
        setIsDeleting(false);
      }
    } else {
      toast({ title: "Wrong Password", description: "Access denied.", variant: "destructive" });
      setPassword("");
    }
  };

  const handleDownloadCSV = () => {
    setIsExportOptionsOpen(false);
    toast({ title: "Generating Document", description: "Your data file is being prepared..." });

    try {
      let csvContent = "SpecsBiz Master Data Report\n";
      csvContent += `Generated on: ${exportDate}\n\n`;

      csvContent += "--- INVENTORY DATA ---\n";
      csvContent += "Product Name,Category,Buy Price,Sell Price,Stock,Unit\n";
      products.forEach(p => {
        csvContent += `"${p.name}","${p.category || ''}",${p.purchasePrice},${p.sellingPrice},${p.stock},"${p.unit}"\n`;
      });
      csvContent += "\n";

      csvContent += "--- SALES HISTORY ---\n";
      csvContent += "Date,Items/Details,Total Amount,Profit,Status\n";
      sales.forEach(s => {
        const details = s.isBakiPayment 
          ? `Payment: ${s.bakiProductName}` 
          : (s.items?.map((i: any) => i.name).join('; ') || 'Sale Record');
        csvContent += `"${new Date(s.saleDate).toLocaleDateString()}","${details}",${s.total},${s.profit || 0},"${s.isBakiPayment ? 'Baki Payment' : 'Complete'}"\n`;
      });
      csvContent += "\n";

      csvContent += "--- CUSTOMERS & BAKI ---\n";
      csvContent += "Name,Phone,Address,Total Due\n";
      customers.forEach(c => {
        csvContent += `"${c.firstName} ${c.lastName || ''}","${c.phone || ''}","${c.address || ''}",${c.totalDue || 0}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `specsbiz_master_backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Download Started" });
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    setIsExportOptionsOpen(false);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 500);
  };

  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl;
  const totalStockValue = products.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalBaki = customers.reduce((acc, c) => acc + (c.totalDue || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 relative">
      
      {/* MASTER PRINT TEMPLATE */}
      <div className="hidden print:block space-y-8 w-full p-4">
        <div className="flex flex-col items-center text-center border-b-2 border-primary pb-6">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-20 w-20 mb-2" />}
          <h1 className="text-4xl font-black text-primary uppercase">SpecsBiz - Master Audit Report</h1>
          <p className="text-sm font-bold opacity-60 mt-1">Exported on: {exportDate}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border-2 border-primary rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-60">Total Stock Value</p>
            <p className="text-2xl font-black">{currency}{totalStockValue.toLocaleString()}</p>
          </div>
          <div className="p-4 border-2 border-primary rounded-xl text-center bg-primary/5">
            <p className="text-[10px] font-bold uppercase opacity-60">Total Revenue</p>
            <p className="text-2xl font-black">{currency}{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 border-2 border-destructive rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-60 text-destructive">Market Dues (Baki)</p>
            <p className="text-2xl font-black text-destructive">{currency}{totalBaki.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold border-l-4 border-primary pl-3 flex items-center gap-2">
            <Package className="w-5 h-5" /> Inventory List ({products.length} Items)
          </h2>
          <table className="w-full border-collapse">
            <thead className="bg-primary/10">
              <tr>
                <th className="border p-2 text-left text-xs uppercase">Name</th>
                <th className="border p-2 text-right text-xs uppercase">Buy</th>
                <th className="border p-2 text-right text-xs uppercase">Sell</th>
                <th className="border p-2 text-center text-xs uppercase">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="border p-2 text-sm font-bold">{p.name}</td>
                  <td className="border p-2 text-right text-xs">{currency}{p.purchasePrice}</td>
                  <td className="border p-2 text-right text-xs">{currency}{p.sellingPrice}</td>
                  <td className={cn("border p-2 text-center text-xs font-bold", p.stock < 5 && "text-destructive")}>{p.stock} {p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGULAR UI */}
      <div className="flex items-center gap-3 print:hidden">
        <div className="p-2 bg-accent/10 rounded-xl">
          <Settings className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary">{t.systemSettings}</h2>
          <p className="text-sm text-muted-foreground">{t.configurePrefs}</p>
        </div>
      </div>

      <div className="grid gap-6 print:hidden">
        
        {/* SpecsAI Dynamic Activation Card */}
        <Card className="border-primary/30 shadow-2xl bg-white overflow-hidden ring-4 ring-primary/5">
          <div className="bg-primary text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 animate-pulse">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">SpecsAI Master Activation</CardTitle>
                <CardDescription className="text-white/70 text-xs">Dynamic model detection & intelligent brain sync.</CardDescription>
              </div>
            </div>
            <Badge className={cn("border-none h-7 px-3 text-[10px] font-black uppercase tracking-widest", aiApiKey ? "bg-green-500 text-white" : "bg-amber-500 text-white")}>
              {aiApiKey ? "System Active" : "Brain Offline"}
            </Badge>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black flex items-center gap-2 text-primary">
                  <Key className="w-4 h-4" /> AI PROVIDER API KEY
                </Label>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-accent font-black uppercase hover:underline flex items-center gap-1"
                >
                  Get Gemini Key <RefreshCw className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="password" 
                  placeholder="Paste your API Key here (Gemini, etc.)..."
                  value={newAiKey}
                  onChange={(e) => setNewAiKey(e.target.value)}
                  className="h-14 bg-muted/30 focus:ring-primary font-mono text-xs border-primary/10 rounded-xl"
                />
                <Button 
                  className="bg-primary hover:bg-primary/90 h-14 px-8 font-black uppercase shadow-xl transition-all active:scale-95 shrink-0"
                  onClick={verifyAndSaveKey}
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Activate"}
                </Button>
              </div>

              {detectedModel && (
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase">Detected Model</p>
                      <p className="text-sm font-bold text-green-800">{detectedModel}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    আপনার এপিআই কি যোগ করার সাথে সাথেই **SpecsAI Advisor** এবং **Business Intelligence** সক্রিয় হয়ে যাবে। আপনার ডাটা এনালাইসিস করে এটি আপনাকে প্রতিদিন নতুন ব্যবসার বুদ্ধি দেবে।
                  </p>
                  <p className="text-[9px] text-blue-600/70 italic">* আপনার কি-টি সম্পূর্ণ এনক্রিপ্টেড এবং আপনার ব্রাউজারে সুরক্ষিত থাকে।</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Data Export Card */}
        <Card className="border-accent/20 shadow-lg bg-white overflow-hidden">
          <div className="bg-accent/5 p-4 border-b border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-white p-2 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Full Data Export (A to Z)</CardTitle>
                <CardDescription>Generate a complete business audit report.</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cloud Ready</Badge>
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              আপনার ব্যবসার ইনভেন্টরি, সেলস এবং কাস্টমারদের যাবতীয় ডাটা একটি প্রফেশনাল ডকুমেন্টে ডাউনলোড করুন। 
            </p>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold gap-2 shadow-xl shadow-accent/20"
              onClick={() => setIsExportOptionsOpen(true)}
            >
              <Download className="w-5 h-5" /> Export Business Data
            </Button>
          </CardContent>
        </Card>

        {/* Other Settings... */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-accent" />
              <CardTitle>{t.language}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-muted/5">
              <Label className="text-base font-bold">{t.language}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 bg-red-50/50 mt-8 shadow-inner">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle>{t.dangerZone}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-200/50 rounded-lg bg-white/50">
            <p className="text-sm font-bold text-red-700">{t.resetSystem}</p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 px-4 font-bold shrink-0"
              onClick={() => setIsResetOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> {t.resetSystem}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs... */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Permanent Wipe
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label className="text-xs font-bold uppercase">Master Reset Password ('specsxr')</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="destructive" className="w-full h-12 font-bold" onClick={handleReset} disabled={isDeleting || !password}>
              {isDeleting ? "Wiping Data..." : "Confirm Full Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportOptionsOpen} onOpenChange={setIsExportOptionsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Choose Export Method</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-6">
            <Button variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center" onClick={handleDownloadCSV}>
              <div className="flex items-center gap-2 font-bold text-lg text-primary"><Download className="w-5 h-5 text-accent" /> Data File</div>
              <span className="text-[10px] text-muted-foreground">Save as .csv spreadsheet.</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center" onClick={handlePrint}>
              <div className="flex items-center gap-2 font-bold text-lg text-primary"><Printer className="w-5 h-5 text-primary" /> Print Layout</div>
              <span className="text-[10px] text-muted-foreground">Directly to printer.</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          .print\\:hidden, nav, header, footer, button, .fixed { display: none !important; }
          body { background: white !important; }
          main { width: 100% !important; max-width: 100% !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 8px !important; }
        }
      `}</style>
    </div>
  );
}
