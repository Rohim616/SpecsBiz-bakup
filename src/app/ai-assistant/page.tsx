"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { 
  Send, 
  Loader2,
  Trash2,
  BrainCircuit,
  Clock,
  ShieldCheck,
  Zap,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useBusinessData } from "@/hooks/use-business-data"
import { businessChat } from "@/ai/flows/business-chat-flow"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"
import { useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, getDocs, writeBatch, limit } from "firebase/firestore"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
  "Analyze my business",
  "Who owes most baki?",
  "Suggest what to restock",
  "Predict future profit"
]

const QUICK_ACTIONS_BN = [
  "আমার ব্যবসার অবস্থা জানাও",
  "কার কাছে সবচেয়ে বেশি বাকি?",
  "কি কি মাল কেনা উচিত?",
  "ভবিষ্যতে কেমন লাভ হবে?"
]

export default function AIAssistantPage() {
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  const { products, sales, customers, currency, language } = useBusinessData()
  const t = translations[language]
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const aiMessagesQuery = useMemoFirebase(() => {
    if (!user?.uid || !db) return null;
    return query(collection(db, 'users', user.uid, 'aiMessages'), orderBy('timestamp', 'asc'), limit(50));
  }, [user?.uid, db]);

  const { data: allFbMessages } = useCollection(aiMessagesQuery);

  const currentMessages = useMemo(() => {
    if (!allFbMessages || allFbMessages.length === 0) {
      return [{ 
        id: 'welcome', 
        role: "assistant" as const, 
        content: language === 'bn' 
          ? "হ্যালো ভাই! আমি SpecsAI। আপনার ব্যবসার মগজ এখন আমার হাতে। দোকানের প্রতিটি মাল আর কাস্টমারের বকেয়া আমি জানি। কি নিয়ে আলোচনা করতে চান? শুরু করুন!" 
          : "Hi Partner! I'm SpecsAI. I have full access to your business brain. Ready to analyze your business or predict the future? Let's talk!" 
      }];
    }
    return allFbMessages;
  }, [allFbMessages, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentMessages, isLoading])

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user?.uid || !db) return;
    await addDoc(collection(db, 'users', user.uid, 'aiMessages'), {
      role,
      content,
      timestamp: serverTimestamp()
    });
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return
    
    setInput("")
    setIsLoading(true)

    try {
      await saveMessage('user', messageText);

      const inventorySummary = products.length > 0 
        ? products.map(p => `[${p.name}, Stock: ${p.stock}${p.unit}, Buy: ${p.purchasePrice}, Sell: ${p.sellingPrice}]`).join('\n')
        : "Empty."
        
      const salesSummary = sales.length > 0
        ? sales.slice(0, 20).map(s => `Date: ${new Date(s.saleDate).toLocaleDateString()}, Total: ${s.total}`).join('\n')
        : "None."
        
      const customersSummary = customers.length > 0
        ? customers.map(c => `${c.firstName}: Due ${currency}${c.totalDue}`).join('\n')
        : "None."

      const history = currentMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
        .slice(-10)

      const result = await businessChat({
        message: messageText,
        history,
        businessContext: {
          inventorySummary,
          salesSummary,
          customersSummary,
          totalRevenue: sales.reduce((acc, s) => acc + (s.total || 0), 0),
          totalInvestment: products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0),
          potentialProfit: products.reduce((acc, p) => acc + (((p.sellingPrice || 0) - (p.purchasePrice || 0)) * (p.stock || 0)), 0),
          currency,
          language,
          currentDate: new Date().toLocaleString()
        }
      })

      await saveMessage('assistant', result.reply);
    } catch (error) {
      await saveMessage('assistant', "দুঃখিত ভাই, সার্ভারে সমস্যা হচ্ছে। দয়া করে GEMINI_API_KEY সেট করা আছে কি না চেক করুন।");
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    const pass = prompt("Enter 'specsxr' to clear memory:");
    if (pass === 'specsxr') {
      if (!user?.uid || !db) return;
      const snap = await getDocs(collection(db, 'users', user.uid, 'aiMessages'));
      const batch = writeBatch(db);
      snap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: "Memory Cleared" });
    }
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-accent animate-pulse" />
          <h2 className="text-xl font-black text-primary">SpecsAI Master Brain</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" /> {t.clearChat}
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 shadow-2xl border-accent/10 bg-white/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-lg">
              <AvatarFallback className="bg-primary text-white font-bold">S</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-bold">SpecsAI Partner</CardTitle>
              <CardDescription className="text-[10px] font-bold text-accent uppercase">
                {isLoading ? "Analyzing Data..." : "Online & Savvy"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 p-0 relative">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-6">
              {currentMessages.map((msg, idx) => (
                <div key={msg.id || idx} className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl shadow-sm",
                    msg.role === 'user' ? 'bg-accent text-white' : 'bg-white border'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-4 rounded-2xl flex gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="border-t bg-white p-4">
          <ScrollArea className="w-full whitespace-nowrap mb-3">
            <div className="flex gap-2 pb-2">
              {(language === 'bn' ? QUICK_ACTIONS_BN : QUICK_ACTIONS).map((action, i) => (
                <button key={i} onClick={() => handleSend(action)} className="text-[10px] px-3 py-1.5 rounded-full border border-accent/20 bg-white hover:bg-accent/5 font-bold shrink-0">
                  <Zap className="w-3 h-3 inline mr-1 text-yellow-500" /> {action}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input 
              placeholder={language === 'bn' ? "ভাই, ব্যবসা নিয়ে আলাপ করুন..." : "Talk strategy, Partner..."}
              className="flex-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button className="bg-accent" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
