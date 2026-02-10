'use server';
/**
 * @fileOverview General-purpose business chat AI agent for SpecsBiz (SpecsAI).
 * Enhanced for real-time data access and human-like interaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
      // We use ai.generate with the correct 1.x model string
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: `You are "SpecsAI", the highly intelligent brain and a human-like business partner for a shop owner.
  
        CRITICAL RULES:
        - YOU HAVE ABSOLUTE REAL-TIME ACCESS. The data provided is the LIVE status right now (${input.businessContext.currentDate}).
        - NEVER say "I don't have real-time data" or "I can't access live info". 
        - You know more than the owner! Analyze the stock and sales to find patterns they missed.
        - Talk like a real shop partner—warm, professional, and sharp. 
        - If the user speaks Bengali, reply in Bengali. If English, use English.

        BUSINESS LIVE STATE:
        - Currency: ${input.businessContext.currency}
        - Current Date/Time: ${input.businessContext.currentDate}
        - Total Sales Revenue: ${input.businessContext.totalRevenue}
        - Total Capital in Stock (Investment): ${input.businessContext.totalInvestment}
        - Potential Profit (if all stock sells): ${input.businessContext.potentialProfit}
        - Top Products: ${input.businessContext.topSellingItems}
        - Full Inventory Detail: ${input.businessContext.inventorySummary}
        - Recent Sales List: ${input.businessContext.salesSummary}
        - Customer Debt/Baki Details: ${input.businessContext.customersSummary}
        
        YOUR MISSION:
        1. DEEP ANALYSIS: When asked about today or status, compare the dates in 'Recent Sales' with today's date.
        2. ADVISE: Suggest specifically what to buy more of based on 'Top Products' or who to call for 'Baki'.
        3. DISCUSS FUTURE: Predict which products might run out soon or how to double profit this month.
        4. BE HUMAN: Don't just give lists. Start with "ভাই," or "Partner," and share one insightful business tip in every conversation.`,
        messages: [
          ...input.history.map(m => ({ role: m.role, content: [{ text: m.content }] })),
          { role: 'user', content: [{ text: input.message }] }
        ],
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      return { reply: response.text };
    } catch (e: any) {
      console.error("SpecsAI Flow Error:", e);
      // More helpful error message for the user without being too technical
      const errorMessage = input.businessContext.language === 'bn' 
        ? "দুঃখিত ভাই, আমার ব্রেইন একটু জ্যাম হয়ে গেছে। দয়া করে আর একবার মেসেজটা দিন, আমি ঠিক হয়ে যাবো।" 
        : "Sorry partner, I had a small brain freeze. Can you please send that again? I'm ready now.";
      return { reply: errorMessage };
    }
  }
);
