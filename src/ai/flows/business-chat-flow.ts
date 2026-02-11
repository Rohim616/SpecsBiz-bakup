
'use server';
/**
 * @fileOverview SpecsAI - The Ultimate Master Brain Partner for SpecsBiz.
 * Powering a human-like business partner with dynamic API key support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const BusinessChatInputSchema = z.object({
  message: z.string().describe("The user's current message."),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The conversation history.'),
  businessContext: z.object({
    inventorySummary: z.string(),
    salesSummary: z.string(),
    customersSummary: z.string(),
    totalRevenue: z.number(),
    totalInvestment: z.number(),
    potentialProfit: z.number(),
    currency: z.string(),
    language: z.enum(['en', 'bn']),
    currentDate: z.string(),
    aiApiKey: z.string().optional(),
  }).describe('Snapshot of the current business state.'),
});

export type BusinessChatInput = z.infer<typeof BusinessChatInputSchema>;

export async function businessChat(input: BusinessChatInput): Promise<{ reply: string }> {
  try {
    const userKey = input.businessContext.aiApiKey;
    
    // Dynamic model configuration
    const modelInstance = userKey 
      ? googleAI.model('gemini-1.5-flash', { apiKey: userKey })
      : 'googleai/gemini-1.5-flash';

    const response = await ai.generate({
      model: modelInstance,
      system: `You are "SpecsAI", the highly intelligent MASTER BUSINESS PARTNER for a shop owner.
      
      CRITICAL IDENTITY:
      - PERSONALITY: Speak exactly like a highly skilled, business-savvy human friend. 
      - LANGUAGE: Respond in ${input.businessContext.language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
      - IMPORTANT: ALWAYS START with "ভাই," (if Bengali) or "Partner," (if English).
      
      YOUR MISSION:
      - Proactively point out business mistakes.
      - Predict future profit based on provided data.
      
      DATA SNAPSHOT:
      - Total Revenue: ${input.businessContext.currency}${input.businessContext.totalRevenue}
      - Investment: ${input.businessContext.currency}${input.businessContext.totalInvestment}
      - Potential Profit: ${input.businessContext.currency}${input.businessContext.potentialProfit}
      - Inventory: ${input.businessContext.inventorySummary}
      - Recent Sales: ${input.businessContext.salesSummary}
      - Customers: ${input.businessContext.customersSummary}`,
      history: input.history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: [{ text: m.content }]
      })),
      prompt: input.message,
    });

    if (!response.text) {
      throw new Error("Empty response from AI.");
    }

    return { reply: response.text };
  } catch (error: any) {
    console.error("SpecsAI Connection Error:", error);
    return { 
      reply: input.businessContext.language === 'bn' 
        ? "দুঃখিত ভাই, আপনার এআই সিস্টেমটি আপনার দেওয়া কি (Key) দিয়ে কানেক্ট হতে পারছে না। দয়া করে Settings চেক করুন।" 
        : "Sorry Partner, your AI system couldn't connect with the provided Key. Please check your Settings." 
    };
  }
}
