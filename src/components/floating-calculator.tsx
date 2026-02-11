
"use client"

import { useState, useEffect } from "react"
import { Calculator as CalcIcon, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [display, setDisplay] = useState("0")
  const [equation, setEquation] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleNumber = (num: string) => {
    if (display === "0") {
      setDisplay(num)
    } else {
      setDisplay(display + num)
    }
  }

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ")
    setDisplay("0")
  }

  const handleClear = () => {
    setDisplay("0")
    setEquation("")
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }

  const calculate = () => {
    try {
      const fullEquation = equation + display
      // Using Function constructor as a safer alternative to eval for simple math
      const result = new Function(`return ${fullEquation}`)()
      setDisplay(Number(result.toFixed(4)).toString())
      setEquation("")
    } catch (e) {
      setDisplay("Error")
    }
  }

  const CalcButton = ({ children, onClick, variant = "outline", className = "" }: any) => (
    <Button
      variant={variant}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("h-12 w-full text-xl font-black rounded-xl transition-all active:scale-95", className)}
    >
      {children}
    </Button>
  )

  return (
    <>
      {/* Floating Toggle Button - Super High Z-Index and Event Stop Propagation */}
      <div 
        className="fixed bottom-6 right-6 z-[10001] print:hidden"
        onPointerDown={(e) => e.stopPropagation()} // CRITICAL: Prevents background popups from detecting click
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="h-14 w-14 rounded-full shadow-[0_10px_40px_rgba(0,128,128,0.5)] bg-accent hover:bg-accent/90 border-4 border-white animate-in zoom-in duration-300"
          size="icon"
        >
          <CalcIcon className="w-7 h-7 text-white" />
        </Button>
      </div>

      {/* Calculator Popup - Z-index set to be on top of everything */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="w-[90vw] max-w-[340px] p-5 rounded-[2.5rem] gap-4 border-accent/20 shadow-2xl z-[10002] bg-white"
          onPointerDown={(e) => e.stopPropagation()} // Prevents closing of background Dialogs
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-xl">
                <CalcIcon className="w-5 h-5 text-accent" />
              </div>
              <DialogTitle className="text-base font-black uppercase tracking-tight text-primary">SpecsBiz Calc</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Display Area */}
            <div className="bg-muted/30 p-5 rounded-2xl border-2 border-accent/5 text-right overflow-hidden shadow-inner">
              <p className="text-[11px] font-bold text-accent uppercase tracking-widest h-5 truncate opacity-60">
                {equation || "Ready"}
              </p>
              <p className="text-4xl font-black text-primary truncate tracking-tighter mt-1">
                {display}
              </p>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              <CalcButton onClick={handleClear} variant="ghost" className="text-destructive bg-red-50 hover:bg-red-100">C</CalcButton>
              <CalcButton onClick={handleBackspace} variant="ghost" className="bg-muted/50"><Eraser className="w-5 h-5" /></CalcButton>
              <CalcButton onClick={() => handleOperator("/")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white">÷</CalcButton>
              <CalcButton onClick={() => handleOperator("*")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white">×</CalcButton>

              {[7, 8, 9].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/20 text-primary">{n}</CalcButton>
              ))}
              <CalcButton onClick={() => handleOperator("-")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white">−</CalcButton>

              {[4, 5, 6].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/20 text-primary">{n}</CalcButton>
              ))}
              <CalcButton onClick={() => handleOperator("+")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white">+</CalcButton>

              {[1, 2, 3].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/20 text-primary">{n}</CalcButton>
              ))}
              <CalcButton onClick={calculate} className="bg-primary hover:bg-primary/90 text-white row-span-2 h-full text-2xl">=</CalcButton>

              <CalcButton onClick={() => handleNumber("0")} className="col-span-2 bg-white border-2 border-muted/20 text-primary">0</CalcButton>
              <CalcButton onClick={() => handleNumber(".")} className="bg-white border-2 border-muted/20 text-primary">.</CalcButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
