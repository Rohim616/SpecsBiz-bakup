
"use client"

import Script from 'next/script'
import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Ad container component.
 * IMPORTANT: The current script is for a "Social Bar", which is a floating overlay.
 * It will ALWAYS appear at the top/side of the screen regardless of where the code is placed.
 * To put an ad INSIDE this dashed box, please provide a "320x50 Banner" code from Adsterra.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  return (
    <div className={cn("w-full flex flex-col items-center justify-center min-h-[110px] border-2 border-dashed border-accent/20 rounded-[2.5rem] bg-accent/5 transition-all hover:bg-accent/10 relative overflow-hidden", className)}>
      <div className="text-[9px] font-black uppercase text-accent/30 tracking-[0.5em] mb-1">
        SpecsBiz Partner Slot
      </div>
      
      {/* 
        This is your Adsterra Social Bar Script.
        Because it is a "Social Bar" type, it floats over the app.
      */}
      <Script 
        src="https://pl28723496.effectivegatecpm.com/d6/33/01/d6330149d0bc87e70e5ea439b64ec493.js" 
        strategy="afterInteractive"
      />
      
      <div className="text-[8px] font-bold text-muted-foreground/20 uppercase">
        Waiting for fixed banner code...
      </div>
    </div>
  )
}
