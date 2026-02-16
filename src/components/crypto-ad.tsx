
"use client"

import { useEffect, useRef } from 'react'
import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Ad container component.
 * Optimized for Banner ads only. Removed floating social bar.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Manual injection to force the banner script to execute within this specific container
    if (bannerRef.current && bannerRef.current.childNodes.length === 0) {
      const atOptions = document.createElement('script')
      atOptions.innerHTML = `
        atOptions = {
          'key' : '9c3305cef38420408885e0c5935d7716',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `
      const invoke = document.createElement('script')
      invoke.type = 'text/javascript'
      invoke.src = 'https://www.highperformanceformat.com/9c3305cef38420408885e0c5935d7716/invoke.js'
      
      bannerRef.current.appendChild(atOptions)
      bannerRef.current.appendChild(invoke)
    }
  }, [])

  return (
    <div className={cn("w-full flex flex-col items-center justify-center min-h-[110px] border-2 border-dashed border-accent/20 rounded-[2.5rem] bg-accent/5 transition-all hover:bg-accent/10 relative overflow-hidden", className)}>
      <div className="text-[9px] font-black uppercase text-accent/30 tracking-[0.5em] mb-2">
        SpecsBiz Partner Slot
      </div>
      
      {/* 
        ADSTERRA 320x50 BANNER (Fixed Ad)
        Injected manually into this div via the useEffect hook.
      */}
      <div ref={bannerRef} className="flex items-center justify-center min-h-[50px] w-full" />
      
      <div className="mt-2 text-[7px] font-bold text-muted-foreground/30 uppercase tracking-widest">
        Live Verified Revenue Stream
      </div>
    </div>
  )
}
