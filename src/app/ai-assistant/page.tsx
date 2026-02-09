"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Bot, 
  Send, 
  Sparkles, 
  History, 
  Store,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useBusinessData } from "@/hooks/use-business-data"
import { businessChat } from "@/ai/flows/business-chat-flow"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"

const QUICK_ACTIONS = [
  "Summarize last week's sales",
  "Generate low stock report",
  "Find VIP customers",
  "Analyze revenue trends",
  "Suggest restock quantities",
  "Compare sales with last month",
  "Identify slowest moving items",
  "Segment customers by spending",
  "Forecast next month's sales",
  "Check high-margin products",
  "Show sales by category",
  "Identify peak sales hours",
  "Recommend pricing adjustments"
]

export default function AIAssistantPage() {
  const { toast } = useToast()
  const { products, sales, customers, currency, language } = useBusinessData()
  const t = translations[language]
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant" as const, content: language === 'bn' ? "হ্যালো! আমি আপনার SpecsBiz স্মার্ট অ্যাসিস্ট্যান্ট। আমি আপনার ইনভেন্টরি, সেলস সামারি বা কাস্টমার ডাটা বিশ্লেষণে সাহায্য করতে পারি।" : "Hello! I'm your SpecsBiz Smart Assistant. How can I help you manage your business today? I can help with inventory updates, sales summaries, or customer segmentation." }
  ])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return
    
    const userMsg = { id: Date.now(), role: "user" as const, content: messageText }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      // Prepare business context summary
      const inventorySummary = products.map(p => `${p.name}: ${p.stock} ${p.unit}`).slice(0, 20).join(', ')
      const salesSummary = sales.map(s => `${s.total} (${new Date(s.saleDate).toLocaleDateString()})`).slice(0, 15).join(', ')
      const customersSummary = customers.map(c => `${c.firstName}: ${currency}${c.totalDue} due`).slice(0, 15).join(', ')
      const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0)

      const history = messages.map(m => ({ role: m.role, content: m.content }))

      const result = await businessChat({
        message: messageText,
        history,
        businessContext: {
          inventorySummary: inventorySummary || "No inventory records",
          salesSummary: salesSummary || "No sales records",
          customersSummary: customersSummary || "No customer records",
          totalRevenue,
          currency
        }
      })

      const assistantMsg = { 
        id: Date.now() + 1, 
        role: "assistant" as const, 
        content: result.reply 
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "AI Error", 
        description: "Could not get a response from the AI assistant." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2 truncate">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-accent shrink-0" /> {t.aiAssistant}
          </h2>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">Your intelligent companion for business insights.</p>
        </div>
        <Badge variant="outline" className="text-accent border-accent px-3 py-1 flex justify-center shrink-0">
          <Sparkles className="w-3 h-3 mr-1" /> Powered by Gemini
        </Badge>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0 w-full">
        <Card className="lg:col-span-3 flex flex-col min-h-0 shadow-lg border-accent/20 w-full overflow-hidden">
          <CardHeader className="border-b bg-accent/5 p-3 md:p-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border-2 border-accent shrink-0">
                <AvatarFallback className="bg-accent text-white"><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">SpecsBiz Chat</CardTitle>
                <CardDescription className="text-[10px] truncate">{isLoading ? 'AI is thinking...' : 'Active and ready to assist'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 min-h-0 p-0 overflow-hidden relative">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`max-w-[85%] md:max-w-[75%] p-3 rounded-2xl break-words whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-accent text-white rounded-tr-none shadow-md' 
                        : 'bg-muted text-foreground rounded-tl-none border shadow-sm'
                    }`}>
                      <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start w-full">
                    <div className="bg-muted text-foreground p-3 rounded-2xl rounded-tl-none border flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="shrink-0 border-t bg-white/50 w-full">
            <div className="px-3 md:px-4 py-2 bg-muted/30 w-full">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Suggestions
              </p>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm"
                      className="text-[10px] h-7 rounded-full border-accent/20 hover:border-accent hover:bg-accent/5 shrink-0"
                      onClick={() => handleSend(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            
            <CardFooter className="p-3 md:p-4 w-full">
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Ask your business assistant..." 
                  className="flex-1 text-sm h-10 shadow-inner min-w-0 focus-visible:ring-accent"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button 
                  className="bg-accent hover:bg-accent/90 shrink-0 h-10 w-10 p-0 shadow-lg" 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardFooter>
          </div>
        </Card>

        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto pr-1">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-accent" /> Recent Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="p-1.5 rounded bg-blue-100 text-blue-600 shrink-0"><Store className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-xs font-bold">Smart Analysis</p>
                  <p className="text-[10px] text-muted-foreground">AI can help you find VIP customers and forecast trends.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-green-50/50 border border-green-100">
                <div className="p-1.5 rounded bg-green-100 text-green-600 shrink-0"><TrendingUp className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-xs font-bold">Data Driven</p>
                  <p className="text-[10px] text-muted-foreground">Every response is based on your real business data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs uppercase tracking-widest font-bold opacity-70">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[11px] leading-relaxed">
                Try asking "Who owes me the most money?" or "What items are running out of stock?" to get instant answers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
