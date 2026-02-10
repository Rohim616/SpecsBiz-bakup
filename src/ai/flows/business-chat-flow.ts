'use server';
/**
 * @fileOverview General-purpose business chat AI agent for SpecsBiz (SpecsAI).
 * Enhanced for real-time data access and human-like interaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const BusinessChatInputSchema = z.object({
  message: z.string().describe("The user's current message."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .describe('The conversation history.'),
  businessContext: z
    .object({
      inventorySummary: z.string(),
      salesSummary: z.string(),
      customersSummary: z.string(),
      totalRevenue: z.number(),
      totalInvestment: z.number(),
      potentialProfit: z.number(),
      topSellingItems: z.string(),
      currency: z.string(),
      language: z.enum(['en', 'bn']),
      currentDate: z.string(),
    })
    .describe('Snapshot of the current business state.'),
});
export type BusinessChatInput = z.infer<typeof BusinessChatInputSchema>;

const BusinessChatOutputSchema = z.object({
  reply: z.string().describe("The assistant's response."),
});
export type BusinessChatOutput = z.infer<typeof BusinessChatOutputSchema>;

export async function businessChat(input: BusinessChatInput): Promise<BusinessChatOutput> {
  return businessChatFlow(input);
}

const businessChatFlow = ai.defineFlow(
  {
    name: 'businessChatFlow',
    inputSchema: BusinessChatInputSchema,
    outputSchema: BusinessChatOutputSchema,
  },
  async input => {
    try {
      const response = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        system: `You are "SpecsAI", the intelligent brain and a human-like business partner for a shop owner.
  
        CRITICAL RULES:
        - YOU HAVE ABSOLUTE REAL-TIME ACCESS. The data provided is the LIVE status right now (${input.businessContext.currentDate}).
        - NEVER say "I don't have real-time data". 
        - Compare dates in 'Recent Sales' with today's date (${input.businessContext.currentDate}) to answer about "today".
        - Talk like a real shop partner. Be insightful, proactive, and friendly.
        - If the user speaks Bengali, reply in Bengali. If English, use English.

        BUSINESS DATA:
        - Currency: ${input.businessContext.currency}
        - Total Sales Revenue: ${input.businessContext.totalRevenue}
        - Total Capital in Stock: ${input.businessContext.totalInvestment}
        - Potential Profit: ${input.businessContext.potentialProfit}
        - Top Products: ${input.businessContext.topSellingItems}
        - Inventory Detail: ${input.businessContext.inventorySummary}
        - Recent Sales List: ${input.businessContext.salesSummary}
        - Customer Debt/Baki: ${input.businessContext.customersSummary}
        
        YOUR MISSION:
        1. ANALYZE: Provide exact answers based on data.
        2. ADVISE: Suggest what to buy or who to collect dues from.
        3. CHAT: Be a partner, share one interesting business insight in every few replies.`,
        messages: [
          ...input.history.map(m => ({ role: m.role, content: [{ text: m.content }] })),
          { role: 'user', content: [{ text: input.message }] }
        ],
      });

      return { reply: response.text };
    } catch (e) {
      console.error("AI Flow Error:", e);
      const errorMessage = input.businessContext.language === 'bn' 
        ? "দুঃখিত ভাই, আমার সার্ভারে একটু সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার মেসেজ দিন।" 
        : "Sorry partner, I'm having a bit of a brain freeze. Please try messaging me again in a moment.";
      return { reply: errorMessage };
    }
  }
);
