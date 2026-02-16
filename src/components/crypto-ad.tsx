
"use client"

import Script from 'next/script'
import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Ad container component.
 * Note: Social Bar ads float and don't sit inside this box.
 * To put an ad FIXED inside this box, use a "Banner" unit.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  return (
    <div className={cn("w-full flex flex-col items-center justify-center min-h-[90px] border-2 border-dashed border-accent/20 rounded-[2rem] bg-accent/5 transition-all hover:bg-accent/10", className)}>
      <div className="text-[9px] font-black uppercase text-accent/30 tracking-[0.5em] mb-1">
        SpecsBiz Partner Slot
      </div>
      
      {/* 
        Adsterra Social Bar Script 
        Your floating ad is active (as seen in your screenshot).
        To put a fixed banner HERE, please send me a "320x50 Banner" code from Adsterra.
      */}
      <Script 
        src="https://pl28723496.effectivegatecpm.com/d6/33/01/d6330149d0bc87e70e5ea439b64ec493.js" 
        strategy="afterInteractive"
      />
      
      <div className="text-[8px] font-bold text-muted-foreground/20 uppercase">
        Intelligence Ad Delivery System
      </div>
    </div>
  )
}
