"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare,
  Loader2,
  Zap,
  Trash2,
  BrainCircuit,
  Clock
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
import { collection, query, orderBy, addDoc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
  "Analyze my overall business",
  "Who took credit today?",
  "Future profit prediction",
  "Suggest ways to increase profit",
  "Which items are losing money?"
]

const QUICK_ACTIONS_BN = [
  "আমার ব্যবসার পুরো অবস্থা জানাও",
  "আজকে কে কে বাকিতে নিসে?",
  "ভবিষ্যৎ লাভের সম্ভাবনা কেমন?",
  "লাভ বাড়ানোর বুদ্ধি দাও",
  "কোন কোন মালে লস হচ্ছে?"
]

export default function AIAssistantPage() {
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  const { products, sales, customers, currency, language } = useBusinessData()
  const t = translations[language]
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // Memoized query for chat messages
  const aiMessagesQuery = useMemoFirebase(() => {
    if (!user?.uid || !db) return null;
    return query(collection(db, 'users', user.uid, 'aiMessages'), orderBy('timestamp', 'asc'));
  }, [user?.uid, db]);

  const { data: allFbMessages } = useCollection(aiMessagesQuery);

  // Set or Load Session ID
  useEffect(() => {
    const savedSid = localStorage.getItem('specsbiz_active_session');
    if (savedSid) {
      setActiveSessionId(savedSid);
    } else {
      const newSid = Date.now().toString();
      setActiveSessionId(newSid);
      localStorage.setItem('specsbiz_active_session', newSid);
    }
  }, []);

  // Filter messages for current active session
  const currentMessages = useMemo(() => {
    const list = (allFbMessages || []).filter(m => m.sessionId === activeSessionId);
    if (list.length === 0) {
      return [{ 
        id: 'welcome', 
        role: "assistant" as const, 
        content: language === 'bn' 
          ? "হ্যালো ভাই! আমি SpecsAI। আপনার ব্যবসার মগজ এখন আমার হাতে। প্রতিটি মালের খবর আর কাস্টমারের বকেয়া আমি জানি। ব্যবসার কি অবস্থা জানতে চান? শুরু করুন!" 
          : "Hi Partner! I'm SpecsAI. I have full access to your business brain. I know every product and every customer debt. Ready to analyze your business or predict the future? Let's talk!" 
      }];
    }
    return list;
  }, [allFbMessages, activeSessionId, language]);

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentMessages, isLoading])

  // Business Context Builder
  const businessMetrics = useMemo(() => {
    const totalInvestment = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0)
    const totalStockValue = products.reduce((acc, p) => acc + ((p.sellingPrice || 0) * (p.stock || 0)), 0)
    const potentialProfit = totalStockValue - totalInvestment
    const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0)
    
    const soldStats: Record<string, number> = {}
    sales.forEach(s => {
      if (s.items) s.items.forEach((i: any) => {
        soldStats[i.name] = (soldStats[i.name] || 0) + (i.quantity || 0)
      })
    })
    const topItems = Object.entries(soldStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, qty]) => `${name} (${qty} sold)`)
      .join(', ')

    return { totalInvestment, potentialProfit, totalRevenue, topItems }
  }, [products, sales])

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user?.uid || !db || !activeSessionId) return;
    
    await addDoc(collection(db, 'users', user.uid, 'aiMessages'), {
      role,
      content,
      sessionId: activeSessionId,
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

      // Building highly detailed context strings
      const inventorySummary = products.length > 0 
        ? products.slice(0, 50).map(p => `[${p.name}: stock ${p.stock}${p.unit}, buy ${p.purchasePrice}, sell ${p.sellingPrice}]`).join(' ')
        : "Inventory empty."
        
      const salesSummary = sales.length > 0
        ? sales.slice(0, 30).map(s => `Date: ${new Date(s.saleDate).toLocaleDateString()}, Total: ${currency}${s.total}, Profit: ${currency}${s.profit || 0}`).join(' || ')
        : "No sales."
        
      const customersSummary = customers.length > 0
        ? customers.slice(0, 30).map(c => `${c.firstName}: Baki ${currency}${c.totalDue}`).join(' | ')
        : "No customers."

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
          totalRevenue: businessMetrics.totalRevenue,
          totalInvestment: businessMetrics.totalInvestment,
          potentialProfit: businessMetrics.potentialProfit,
          topSellingItems: businessMetrics.topItems || "None",
          currency,
          language,
          currentDate: new Date().toLocaleString()
        }
      })

      await saveMessage('assistant', result.reply);
    } catch (error) {
      console.error("Chat Error:", error);
      await saveMessage('assistant', "maybe AI er limit shes !");
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    if (!user?.uid || !db) return;
    const snap = await getDocs(query(collection(db, 'users', user.uid, 'aiMessages')));
    const batch = writeBatch(db);
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    toast({ title: language === 'bn' ? "মেমোরি মুছে ফেলা হয়েছে" : "Memory Cleared" });
  }

  const actions = language === 'bn' ? QUICK_ACTIONS_BN : QUICK_ACTIONS

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-accent shrink-0 animate-pulse" /> SpecsAI Master Brain
          </h2>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate italic">Your intelligent business partner is online.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 text-[10px] gap-2 border-destructive text-destructive hover:bg-destructive/5 font-bold" 
          onClick={clearChat}
        >
          <Trash2 className="w-3 h-3" /> {t.clearChat}
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 shadow-2xl border-accent/20 w-full overflow-hidden bg-white rounded-3xl">
        <CardHeader className="border-b bg-accent/5 p-3 md:p-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-accent shrink-0 shadow-md">
                <AvatarFallback className="bg-primary text-white"><Bot className="w-5 h-5" /></AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm md:text-base font-black text-primary">SpecsAI Partner</CardTitle>
              <CardDescription className="text-[10px] truncate flex items-center gap-1">
                {isLoading ? (
                  <span className="flex items-center gap-1 font-bold text-accent animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> {language === 'bn' ? 'ডাটা বিশ্লেষণ করছি...' : 'Thinking...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 font-bold uppercase tracking-widest">
                    <MessageSquare className="w-2.5 h-2.5" /> Live Master Mode
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 p-0 overflow-hidden relative bg-[url('https://picsum.photos/seed/chatbg/1000/1000')] bg-opacity-5">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-6">
              {currentMessages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl break-words shadow-md transition-all ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-tr-none' 
                      : 'bg-white text-foreground rounded-tl-none border border-accent/10'
                  }`}>
                    <p className="text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <div className={`text-[8px] mt-2 opacity-50 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <Clock className="w-2 h-2" /> 
                        {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white text-foreground p-4 rounded-2xl rounded-tl-none border border-accent/5 flex items-center gap-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent/70">{language === 'bn' ? 'ডাটা দেখছি...' : 'Checking data...'}</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="shrink-0 border-t bg-white w-full">
          <div className="px-3 md:px-4 py-2 bg-muted/30 w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {actions.map((action, i) => (
                  <button 
                    key={i} 
                    className="text-[10px] h-8 px-3 rounded-full border border-accent/20 bg-white hover:border-accent hover:bg-accent/5 shrink-0 transition-all font-bold flex items-center gap-1.5 shadow-sm"
                    onClick={() => handleSend(action)}
                    disabled={isLoading}
                  >
                    <Zap className="w-3 h-3 text-yellow-500" /> {action}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          
          <CardFooter className="p-3 md:p-4 w-full bg-white">
            <div className="flex w-full gap-2 items-center bg-muted/10 p-1 rounded-2xl border">
              <Input 
                placeholder={language === 'bn' ? "ভাই, ব্যবসা নিয়ে আলোচনা করুন..." : "Discuss business, Partner..."}
                className="flex-1 text-sm h-12 border-none bg-transparent focus-visible:ring-0 shadow-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <Button 
                className="bg-accent hover:bg-accent/90 shrink-0 h-10 w-10 p-0 rounded-xl shadow-lg transition-transform active:scale-95" 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
