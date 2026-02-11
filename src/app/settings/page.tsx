'use client';

import { useState, useEffect } from "react";
import { 
  Settings, 
  Trash2,
  Lock,
  AlertTriangle,
  Languages,
  Download,
  Printer,
  Sparkles,
  Key,
  Info,
  Loader2,
  RefreshCw,
  Activity,
  CheckCircle2,
  FileText,
  AlertCircle,
  X
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
import { verifyAiKey } from "@/ai/flows/verify-ai-key";
import { cn } from "@/lib/utils";

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
  
  // AI State
  const [newAiKey, setNewAiKey] = useState(aiApiKey || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [detectedModel, setDetectedModel] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    setNewAiKey(aiApiKey || "");
  }, [aiApiKey]);

  const handleLanguageChange = (val: 'en' | 'bn') => {
    actions.setLanguage(val);
    toast({ title: val === 'en' ? "Language Changed" : "ভাষা পরিবর্তন করা হয়েছে" });
  };

  const handleVerifyAndSaveKey = async () => {
    // 1. Clean the key locally before sending
    const cleanedKey = newAiKey.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanedKey) {
      toast({ variant: "destructive", title: "Key Required" });
      return;
    }

    setIsVerifying(true);
    setDetectedModel(null);
    setVerifyError(null);

    try {
      // 2. Perform real verification
      const result = await verifyAiKey({ apiKey: cleanedKey });
      
      if (result.success) {
        setDetectedModel(result.detectedModel || "AI System Active");
        // Save the cleaned key to permanent storage
        actions.setAiApiKey(cleanedKey);
        toast({
          title: language === 'en' ? "AI Activated!" : "এআই সক্রিয় হয়েছে!",
          description: result.message
        });
      } else {
        setVerifyError(result.message);
        toast({
          variant: "destructive",
          title: language === 'en' ? "Activation Failed" : "অ্যাক্টিভেশন ব্যর্থ",
        });
      }
    } catch (e: any) {
      setVerifyError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = async () => {
    if (password === "specsxr") {
      setIsDeleting(true);
      await actions.resetAllData();
      toast({ title: "System Reset" });
    } else {
      toast({ title: "Wrong Password", variant: "destructive" });
      setPassword("");
    }
  };

  const handleDownloadCSV = () => {
    setIsExportOptionsOpen(false);
    toast({ title: "Generating Document..." });
    const csvContent = "SpecsBiz Data Report\nInventory: " + products.length + "\nSales: " + sales.length;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "specsbiz_backup.csv";
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-accent/10 rounded-xl">
          <Settings className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-headline text-primary">{t.systemSettings}</h2>
          <p className="text-sm text-muted-foreground">{t.configurePrefs}</p>
        </div>
      </div>

      <div className="grid gap-6 px-2">
        {/* SpecsAI Master Activation Card */}
        <Card className="border-primary/30 shadow-2xl bg-white overflow-hidden ring-4 ring-primary/5 rounded-[2rem]">
          <div className="bg-primary text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">SpecsAI Master Activation</CardTitle>
                <CardDescription className="text-white/70 text-xs">Real-time model detection & secure brain sync.</CardDescription>
              </div>
            </div>
            <Badge className={cn("border-none h-7 px-3 text-[10px] font-black uppercase tracking-widest", aiApiKey ? "bg-green-500" : "bg-amber-500")}>
              {aiApiKey ? "SYSTEM ACTIVE" : "BRAIN OFFLINE"}
            </Badge>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black flex items-center gap-2 text-primary uppercase">
                  <Key className="w-4 h-4" /> AI Provider API Key
                </Label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-accent font-black uppercase hover:underline flex items-center gap-1">
                  Get Gemini Key <RefreshCw className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input 
                    type="password" 
                    placeholder="Paste your Gemini API Key here..."
                    value={newAiKey}
                    onChange={(e) => {
                      setNewAiKey(e.target.value);
                      setVerifyError(null);
                    }}
                    className={cn(
                      "h-14 bg-muted/30 focus:ring-primary font-mono text-xs border-primary/10 rounded-xl pr-10",
                      verifyError && "border-destructive focus:ring-destructive"
                    )}
                  />
                  {newAiKey && (
                    <button 
                      onClick={() => { setNewAiKey(""); setVerifyError(null); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 h-14 px-8 font-black uppercase shadow-xl transition-all active:scale-95 shrink-0"
                  onClick={handleVerifyAndSaveKey}
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Activate"}
                </Button>
              </div>

              {verifyError && (
                <div className="bg-red-50 p-4 rounded-xl border-2 border-destructive/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-destructive uppercase">Verification Failed</p>
                    <p className="text-sm font-bold text-destructive/80">{verifyError}</p>
                  </div>
                </div>
              )}

              {detectedModel && (
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase">Status: Connected</p>
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
                    আপনার এপিআই কি এখন থেকে সরাসরি **গুগল সার্ভারে** ভেরিফাই হবে। কি যোগ করার সাথে সাথেই এআই আপনার দোকানের ডাটা রিয়েল-টাইমে অ্যানালাইসিস করা শুরু করবে।
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export Card */}
        <Card className="border-accent/20 shadow-lg bg-white overflow-hidden rounded-[2rem]">
          <div className="bg-accent/5 p-4 border-b border-accent/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-white p-2 rounded-lg"><FileText className="w-5 h-5" /></div>
              <CardTitle className="text-lg">Full Data Export</CardTitle>
            </div>
          </div>
          <CardContent className="p-6">
            <Button className="w-full bg-accent hover:bg-accent/90 h-14 text-lg font-bold gap-2 shadow-xl rounded-2xl" onClick={() => setIsExportOptionsOpen(true)}>
              <Download className="w-5 h-5" /> Export Business Data
            </Button>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="rounded-[2rem]">
          <CardHeader className="px-6">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-accent" />
              <CardTitle>{t.language}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full h-12 rounded-xl border-accent/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/50 bg-red-50/50 rounded-[2rem]">
          <CardHeader className="px-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle>{t.dangerZone}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex justify-between items-center p-4 border border-red-200 rounded-2xl bg-white/50">
              <p className="text-sm font-bold text-red-700">{t.resetSystem}</p>
              <Button variant="destructive" className="rounded-xl font-bold" onClick={() => setIsResetOpen(true)}>{t.resetSystem}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-destructive font-black uppercase">Confirm Full Wipe</DialogTitle>
            <DialogDescription>This will delete ALL your products, sales, and customers forever.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label className="text-xs font-bold uppercase opacity-60">Master Password ('specsxr')</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl" placeholder="••••••••" />
          </div>
          <DialogFooter>
            <Button variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase shadow-xl" onClick={handleReset} disabled={isDeleting || !password}>
              {isDeleting ? "Wiping Data..." : "Confirm & Format System"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportOptionsOpen} onOpenChange={setIsExportOptionsOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black uppercase">Export Data</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-6">
            <Button variant="outline" className="h-20 rounded-2xl border-accent/20 text-accent font-black uppercase shadow-sm" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-6 w-6" /> Download Excel/CSV Backup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
