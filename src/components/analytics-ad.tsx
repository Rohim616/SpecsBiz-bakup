
"use client"

import { useEffect, useRef } from 'react'
import { cn } from "@/lib/utils"

interface AnalyticsAdProps {
  className?: string
}

/**
 * @fileOverview Ad container specifically for Analytics page.
 * Optimized for Social Bar / Large Banner.
 */
export function AnalyticsAd({ className }: AnalyticsAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && adRef.current) {
      // Check if script is already present to prevent duplicate injections
      const scriptId = 'analytics-ad-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://pl28726334.effectivegatecpm.com/de1365bddc236f23cf3be3ce45190342/invoke.js';
        document.body.appendChild(script);
      }
    }
  }, [])

  return (
    <div className={cn("w-full flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-accent/10 rounded-[2.5rem] bg-accent/5 transition-all hover:bg-accent/10 relative overflow-hidden mt-10", className)}>
      <div className="text-[9px] font-black uppercase text-accent/30 tracking-[0.5em] mb-4">
        Analytics Sponsored Slot
      </div>
      
      {/* 
        Container for the specific ad ID provided by user
      */}
      <div ref={adRef} id="container-de1365bddc236f23cf3be3ce45190342" className="w-full flex justify-center overflow-x-auto no-scrollbar" />
      
      <div className="mt-4 text-[7px] font-bold text-muted-foreground/30 uppercase tracking-widest">
        Live Performance Data Partner
      </div>
    </div>
  )
}
