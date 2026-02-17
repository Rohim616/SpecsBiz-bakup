
"use client"

import { useState, useEffect } from "react"
import { 
  Globe, 
  Lock, 
  Settings2, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Store,
  Share2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useBusinessData } from "@/hooks/use-business-data"
import { useUser } from "@/firebase"
import { translations } from "@/lib/translations"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ShopManagerPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const { shopConfig, actions, language } = useBusinessData()
  const t = translations[language]

  const [shopName, setShopName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isSaving, setIsDeleting] = useState(false)

  useEffect(() => {
    if (shopConfig) {
      setShopName(shopConfig.shopName || "")
      setAccessCode(shopConfig.accessCode || "")
      setIsActive(shopConfig.isActive || false)
    }
  }, [shopConfig])

  const handleSave = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Cloud Required", description: "Please login to activate your online shop." })
      return
    }
    actions.updateShopConfig({
      shopName,
      accessCode,
      isActive
    })
    toast({ title: "Settings Saved" })
  }

  const shopUrl = user ? `${window.location.origin}/shop/${user.uid}` : ""

  const copyToClipboard = () => {
    if (!shopUrl) return
    navigator.clipboard.writeText(shopUrl)
    toast({ title: "Link Copied" })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{t.shopManager}</h2>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Your Public Digital Catalog</p>
          </div>
        </div>
      </div>

      {!user && (
        <Card className="bg-amber-50 border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
          <div>
            <h4 className="font-black text-amber-800 uppercase text-sm">Cloud Login Required</h4>
            <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">
              Your online shop needs a cloud connection to work publicly. Please go to the <b>Auth</b> page and connect your account first.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-6">
        <Card className="rounded-[2.5rem] border-accent/10 shadow-xl overflow-hidden bg-white">
          <div className="bg-accent/5 p-6 border-b border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-accent/10"><Settings2 className="w-5 h-5 text-accent" /></div>
              <CardTitle className="text-lg font-black uppercase">{t.shopSettings}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[9px] font-black uppercase", isActive ? "text-green-600" : "text-muted-foreground")}>
                {isActive ? t.active : t.inactive}
              </span>
              <Switch checked={isActive} onCheckedChange={setIsActive} disabled={!user} />
            </div>
          </div>
          <CardContent className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.shopName}</Label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent opacity-40" />
                  <Input 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)} 
                    placeholder="e.g. Rohim General Store" 
                    className="h-14 pl-12 rounded-2xl bg-muted/20 border-none font-bold text-primary focus-visible:ring-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t.shopCode}</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent opacity-40" />
                  <Input 
                    value={accessCode} 
                    onChange={e => setAccessCode(e.target.value)} 
                    placeholder="e.g. 1234" 
                    className="h-14 pl-12 rounded-2xl bg-muted/20 border-none font-bold text-primary focus-visible:ring-accent"
                  />
                </div>
                <p className="text-[9px] font-medium text-muted-foreground italic ml-1">Customers will need this code to enter.</p>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={!user}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase shadow-xl transition-all active:scale-95 gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Save Shop Configuration
            </Button>
          </CardContent>
        </Card>

        {isActive && user && (
          <Card className="rounded-[2.5rem] border-emerald-100 shadow-2xl bg-emerald-50/30 animate-in zoom-in-95">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">{t.shareLink}</h3>
                  <p className="text-xs font-medium text-emerald-700/60">Copy this link and send it to your customers via WhatsApp or Facebook.</p>
                </div>
                
                <div className="w-full flex gap-2 mt-4">
                  <div className="flex-1 bg-white border border-emerald-200 p-4 rounded-2xl truncate text-xs font-mono text-emerald-800 shadow-inner">
                    {shopUrl}
                  </div>
                  <Button variant="outline" className="h-auto bg-white border-emerald-200 text-emerald-700 font-bold px-6 rounded-2xl shadow-sm hover:bg-emerald-50" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" /> {t.copyLink}
                  </Button>
                </div>

                <a href={shopUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-emerald-600 hover:underline mt-2 uppercase tracking-widest">
                  Preview Your Shop <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
