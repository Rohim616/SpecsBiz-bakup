
"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CryptoAdProps {
  className?: string
}

/**
 * @fileOverview Dedicated component to display Crypto Ads.
 * Integrated with user's A-Ads unit 2427567 for monetization.
 */
export function CryptoAd({ className }: CryptoAdProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn("w-full flex flex-col items-center gap-1", className)}>
      <div className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">
        SpecsBiz Partner Ad
      </div>
      <div className="w-full min-h-[50px] bg-transparent flex items-center justify-center overflow-hidden">
        {/* A-Ads Unit 2427567 Integration */}
        <div id="frame" style={{ width: '320px', margin: 'auto', zIndex: 99998, height: 'auto' }}>
          <iframe 
            data-aa='2427567' 
            src='https://ad.a-ads.com/2427567/?size=320x50&background_color=transparent'
            style={{ border: 0, padding: 0, width: '320px', height: '50px', overflow: 'hidden', display: 'block', margin: 'auto' }}
          ></iframe>
        </div>
      </div>
    </div>
  )
}
