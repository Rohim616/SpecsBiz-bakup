'use server';
/**
 * @fileOverview Real-time AI Key Verification Flow.
 * Verifies the user's API key by directly calling the Google Models API.
 * This is more robust than a dummy generation and allows for true model detection.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyAiKeyInputSchema = z.object({
  apiKey: z.string().describe('The API key to verify.'),
});

const VerifyAiKeyOutputSchema = z.object({
  success: z.boolean(),
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
    // 1. Clean the key (remove quotes and spaces)
    const cleanKey = input.apiKey.trim().replace(/^["']|["']$/g, '');

    try {
      // 2. Direct fetch to Google's model list API
      // This is the fastest and most reliable way to check if a key is valid and what it can do.
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (response.ok && data.models) {
        // Find the best available Gemini model
        const models = data.models.map((m: any) => m.name.split('/').pop());
        const preferredModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        const bestModel = preferredModels.find(pm => models.some((m: string) => m.startsWith(pm))) || models[0];

        return {
          success: true,
          detectedModel: `${bestModel} (Verified & Ready)`,
          message: 'অভিনন্দন ভাই! আপনার এআই সিস্টেম এখন সফলভাবে সক্রিয়।'
        };
      }

      // 3. Extract specific error reason from Google
      let errorDetail = 'আপনার দেওয়া কি-টি সঠিক নয়।';
      if (data.error) {
        const msg = data.error.message || "";
        if (msg.includes('API_KEY_INVALID')) errorDetail = 'API Key ভুল (Invalid)। দয়া করে আবার চেক করুন।';
        else if (msg.includes('restricted')) errorDetail = 'এই কি-টিতে জেমিনি ব্যবহারের অনুমতি নেই।';
        else errorDetail = `গুগল এরর: ${msg}`;
      }

      return {
        success: false,
        message: errorDetail
      };
    } catch (error: any) {
      console.error("Verification Critical Error:", error);
      return {
        success: false,
        message: 'ইন্টারনেট বা সার্ভার সমস্যা। দয়া করে কিছুক্ষণ পর চেষ্টা করুন।'
      };
    }
  }
);
