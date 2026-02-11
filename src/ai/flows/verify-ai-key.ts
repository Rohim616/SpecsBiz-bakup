
'use server';
/**
 * @fileOverview Universal AI Key Verification & Model Detection Flow.
 * Detects the provider (Google/OpenAI/etc) and fetches available models.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyAiKeyInputSchema = z.object({
  apiKey: z.string().describe('The API key to verify.'),
});

const VerifyAiKeyOutputSchema = z.object({
  success: z.boolean(),
  provider: z.string().optional(),
  detectedModel: z.string().optional(),
  message: z.string(),
});

export async function verifyAiKey(input: { apiKey: string }) {
  return verifyAiKeyFlow(input);
}

const verifyAiKeyFlow = ai.defineFlow(
  {
    name: 'verifyAiKeyFlow',
    inputSchema: VerifyAiKeyInputSchema,
    outputSchema: VerifyAiKeyOutputSchema,
  },
  async (input) => {
    const cleanKey = input.apiKey.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanKey) {
      return { success: false, message: 'দয়া করে একটি সঠিক এপিআই কি দিন।' };
    }

    // 1. Identify Provider
    let provider = 'unknown';
    if (cleanKey.startsWith('AIzaSy')) provider = 'google';
    else if (cleanKey.startsWith('sk-')) provider = 'openai';

    try {
      if (provider === 'google') {
        // Fetch models from Google
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`,
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 0 } // Bypass cache
          }
        );

        const data = await response.json();

        if (response.ok && data.models) {
          // Find the best available model
          const modelNames = data.models
            .map((m: any) => m.name.split('/').pop())
            .filter((name: string) => name.includes('gemini'));
          
          const preferred = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
          const bestModel = preferred.find(p => modelNames.some((m: string) => m.startsWith(p))) || modelNames[0];

          return {
            success: true,
            provider: 'Google AI',
            detectedModel: bestModel,
            message: `অভিনন্দন ভাই! আপনার কি-টি ভেরিফাইড। আমরা "${bestModel}" মডেলটি আপনার জন্য সেট করেছি।`
          };
        }

        return { 
          success: false, 
          message: data.error?.message || 'গুগল সার্ভার কি-টি গ্রহণ করছে না।' 
        };
      } 
      
      if (provider === 'openai') {
        // Placeholder for OpenAI - in this specific environment we focus on Genkit/GoogleAI
        // but we allow the UI to show it's detected.
        return {
          success: true,
          provider: 'OpenAI (Limited Support)',
          detectedModel: 'gpt-4o-mini',
          message: 'ওপেনএআই কি ডিটেক্ট করা হয়েছে। তবে জেমিনি কি দিলে সেরা পারফরম্যান্স পাবেন।'
        };
      }

      return { 
        success: false, 
        message: 'এই কি-টি আমাদের সিস্টেমে পরিচিত নয়। দয়া করে জেমিনি কি ব্যবহার করুন।' 
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'সার্ভারের সাথে কানেক্ট হতে পারছি না। আপনার ইন্টারনেট সংযোগ বা ফায়ারওয়াল চেক করুন।'
      };
    }
  }
);
