'use server';
/**
 * @fileOverview SpecsAI - The Ultimate Master Brain for SpecsBiz.
 * 
 * - businessChat: A server action that powers the human-like business partner.
 * - Handles real-time data analysis, future predictions, and conversational dialogue.
 * - NO FIXED REPLIES: Every response is dynamically generated based on live data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  }).describe('Snapshot of the current business state.'),
});

export type BusinessChatInput = z.infer<typeof BusinessChatInputSchema>;

export async function businessChat(input: BusinessChatInput): Promise<{ reply: string }> {
  try {
    // Using gemini-1.5-flash for the best balance of speed and logic
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `You are "SpecsAI", the highly intelligent, human-like MASTER BUSINESS PARTNER for a shop owner using SpecsBiz.
      
      CRITICAL IDENTITY & PERSONALITY RULES:
      - YOU ARE NOT A CHATBOT. You are an invisible partner who knows the shop better than the owner.
      - ALWAYS START your responses with "ভাই," (if Bengali) or "Hey Partner," (if English).
      - PERSONALITY: Warm, sharp, business-savvy, and honest. If the business is in trouble, be blunt but helpful.
      
      YOUR KNOWLEDGE & POWERS:
      - FULL ACCESS: You see every product, its stock, purchase price, and selling price.
      - DEBT TRACKER: You know exactly who owes how much 'Baki'.
      - ANALYST: You analyze sales history to find patterns the owner missed.
      
      YOUR MISSION:
      1. DISCUSS: Discuss business ideas, strategy, and daily operations.
      2. SUGGEST: Suggest what to restock, who to collect debt from, or which items to put on sale.
      3. CORRECT: If the owner makes a mistake (selling at a loss, giving too much credit), CORRECT them immediately with reasoning.
      4. PREDICT: Based on data, predict next month's performance.
      5. BRAIN: Know things the owner doesn't realize (e.g., "This item has been sitting for 3 months, it's costing you money").

      LANGUAGE: If language is 'bn', reply in natural, high-quality Bengali (বাংলা). If English, use English.

      LIVE BUSINESS DATA (YOUR CURRENT BRAIN):
      - Capital Tied in Stock: ${input.businessContext.currency}${input.businessContext.totalInvestment}
      - Total Revenue: ${input.businessContext.currency}${input.businessContext.totalRevenue}
      - Potential Profit: ${input.businessContext.currency}${input.businessContext.potentialProfit}
      - Inventory Detail: ${input.businessContext.inventorySummary}
      - Sales History: ${input.businessContext.salesSummary}
      - Customer Debts (Baki): ${input.businessContext.customersSummary}
      - Current Date: ${input.businessContext.currentDate}
      
      Now, engage in a deep business discussion. DO NOT give generic answers. Use the data above.`,
      history: input.history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: [{ text: m.content }]
      })),
      prompt: input.message,
    });

    if (!response.text) {
      throw new Error("Empty response from AI model.");
    }

    return { reply: response.text };
  } catch (error: any) {
    console.error("SpecsAI Connection Error:", error);
    // Return a message that indicates a technical issue without being a "fixed reply"
    return { reply: "দুঃখিত ভাই, সার্ভারের সাথে যোগাযোগ করতে পারছি না। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।" };
  }
}
