
"use client"

import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Dedicated component to display Crypto Ads.
 * Optimized for A-Ads Unit 2427567 verification.
 * Direct rendering to ensure verification bots can find the code instantly.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  return (
    <div className={cn("w-full flex flex-col items-center py-6 my-4 bg-white/50 rounded-3xl border border-accent/10 shadow-sm", className)}>
      <div className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-[0.4em] mb-3">
        SpecsBiz Official Partner
      </div>
      <div className="w-full min-h-[60px] flex items-center justify-center overflow-hidden">
        <div id="frame" style={{ width: '320px', margin: 'auto', zIndex: 99998, height: 'auto' }}>
          <iframe 
            data-aa='2427567' 
            src='https://ad.a-ads.com/2427567/?size=320x50&background_color=transparent'
            style={{ 
              border: 0, 
              padding: 0, 
              width: '320px', 
              height: '50px', 
              overflow: 'hidden', 
              display: 'block', 
              margin: 'auto' 
            }}
          ></iframe>
        </div>
      </div>
    </div>
  )
}
