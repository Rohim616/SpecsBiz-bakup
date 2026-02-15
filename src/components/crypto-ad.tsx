
"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Dedicated component to display Crypto Ads.
 * Optimized for A-Ads Unit 2427567 verification.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always render the container div with a fixed height to prevent "hidden" detection
  // during the initial load or SSR phase.
  return (
    <div className={cn("w-full flex flex-col items-center py-4 my-2", className)}>
      <div className="text-[8px] font-black uppercase text-muted-foreground/30 tracking-[0.3em] mb-2">
        SpecsBiz Partner Ad
      </div>
      <div className="w-full min-h-[60px] flex items-center justify-center">
        {mounted ? (
          <div id="ad-container" style={{ width: '320px', height: '50px', position: 'relative', zIndex: 10 }}>
            <iframe 
              data-aa='2427567' 
              src='https://ad.a-ads.com/2427567/?size=320x50&background_color=transparent'
              style={{ 
                border: 0, 
                padding: 0, 
                width: '320px', 
                height: '50px', 
                overflow: 'hidden', 
                display: 'block' 
              }}
            ></iframe>
          </div>
        ) : (
          <div className="w-[320px] h-[50px] bg-muted/5 rounded animate-pulse border border-dashed border-accent/10" />
        )}
      </div>
    </div>
  )
}
