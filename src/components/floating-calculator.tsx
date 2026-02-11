
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Calculator as CalcIcon, Eraser, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [expression, setExpression] = useState("0")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleNumber = (num: string) => {
    if (expression === "0" || expression === "Error") {
      setExpression(num)
    } else {
      setExpression(expression + num)
    }
  }

  const handleOperator = (op: string) => {
    if (expression === "Error") return
    const lastChar = expression.slice(-1)
    // Avoid double operators
    if (["+", "-", "*", "/"].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op)
    } else {
      setExpression(expression + op)
    }
  }

  const handleClear = () => {
    setExpression("0")
  }

  const handleBackspace = () => {
    if (expression.length > 1 && expression !== "Error") {
      setExpression(expression.slice(0, -1))
    } else {
      setExpression("0")
    }
  }

  const calculate = () => {
    try {
      // Use Function constructor for a safer alternative to eval
      const result = new Function(`return ${expression.replace(/[^-()\d/*+.]/g, '')}`)()
      setExpression(Number(result.toFixed(4)).toString())
    } catch (e) {
      setExpression("Error")
    }
  }

  const CalcButton = ({ children, onClick, variant = "outline", className = "" }: any) => (
    <Button
      variant={variant}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "h-14 sm:h-16 text-xl sm:text-2xl font-black rounded-2xl transition-all active:scale-90 floating-calc-element shadow-sm",
        className
      )}
    >
      {children}
    </Button>
  )

  const calculatorContent = (
    <>
      {/* Floating Toggle Button */}
      <div 
        className="fixed bottom-40 md:bottom-48 right-6 md:right-8 z-[10001] print:hidden pointer-events-auto floating-calc-element"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-[0_20px_50px_rgba(0,128,128,0.6)] bg-accent hover:bg-accent/90 border-4 border-white animate-in zoom-in duration-300 floating-calc-element transition-all active:scale-90"
          size="icon"
        >
          {isOpen ? <X className="w-8 h-8 md:w-10 md:h-10 text-white" /> : <CalcIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />}
        </Button>
      </div>

      {/* Calculator Popup - Optimized for Portrait Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 floating-calc-element"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).classList.contains('bg-black/70')) {
              setIsOpen(false);
            }
          }}
        >
          <div 
            className="w-full max-w-[340px] p-5 sm:p-6 rounded-[2.5rem] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-2 border-accent/20 animate-in zoom-in-95 duration-300 relative pointer-events-auto floating-calc-element"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <CalcIcon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">SpecsBiz Calc</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-10 w-10 hover:bg-red-50 hover:text-red-500 transition-colors" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Display Area - Vertically Spaced */}
            <div className="bg-muted/40 p-6 rounded-3xl border-2 border-accent/10 text-right overflow-hidden shadow-inner flex flex-col justify-center min-h-[140px] mb-6">
              <p className="text-sm font-bold text-accent uppercase tracking-widest mb-2 opacity-50">
                Live Equation
              </p>
              <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-none">
                <p className={cn(
                  "font-black text-primary tracking-tighter leading-none transition-all",
                  expression.length > 10 ? "text-3xl" : "text-4xl"
                )}>
                  {expression}
                </p>
              </div>
            </div>

            {/* Buttons Grid - 4 Columns, Vertically Taller */}
            <div className="grid grid-cols-4 gap-3">
              <CalcButton onClick={handleClear} variant="ghost" className="text-destructive bg-red-50 hover:bg-red-100 border-none text-lg">C</CalcButton>
              <CalcButton onClick={handleBackspace} variant="ghost" className="bg-muted/50 border-none"><Eraser className="w-5 h-5" /></CalcButton>
              <CalcButton onClick={() => handleOperator("/")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white border-none">÷</CalcButton>
              <CalcButton onClick={() => handleOperator("*")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white border-none">×</CalcButton>

              {[7, 8, 9].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/30 text-primary shadow-sm">{n}</CalcButton>
              ))}
              <CalcButton onClick={() => handleOperator("-")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white border-none">−</CalcButton>

              {[4, 5, 6].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/30 text-primary shadow-sm">{n}</CalcButton>
              ))}
              <CalcButton onClick={() => handleOperator("+")} className="bg-accent/10 text-accent hover:bg-accent hover:text-white border-none">+</CalcButton>

              {[1, 2, 3].map(n => (
                <CalcButton key={n} onClick={() => handleNumber(n.toString())} className="bg-white border-2 border-muted/30 text-primary shadow-sm">{n}</CalcButton>
              ))}
              <CalcButton onClick={calculate} className="bg-primary hover:bg-primary/90 text-white row-span-2 h-full text-3xl border-none shadow-lg">=</CalcButton>

              <CalcButton onClick={() => handleNumber("0")} className="col-span-2 bg-white border-2 border-muted/30 text-primary shadow-sm">0</CalcButton>
              <CalcButton onClick={() => handleNumber(".")} className="bg-white border-2 border-muted/30 text-primary shadow-sm">.</CalcButton>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(calculatorContent, document.body) : null;
}
