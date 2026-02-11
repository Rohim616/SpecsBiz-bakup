
'use server';
/**
 * @fileOverview SpecsAI Advisor - A strategic growth and profit optimization expert.
 * Supports dynamic model detection and user-provided API keys.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GrowthExpertInputSchema = z.object({
  message: z.string().describe("User's query."),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  context: z.object({
    inventorySummary: z.string(),
    salesPerformance: z.string(),
    topProducts: z.string(),
    currentLanguage: z.enum(['en', 'bn']),
    currency: z.string(),
    aiApiKey: z.string().optional(),
  }),
});

const GrowthExpertOutputSchema = z.object({
  reply: z.string(),
  detectedModel: z.string().optional(),
});

const advisorFlow = ai.defineFlow(
  {
    name: 'advisorFlow',
    inputSchema: GrowthExpertInputSchema,
    outputSchema: GrowthExpertOutputSchema,
  },
  async (input) => {
    const userKey = input.context.aiApiKey;
    
    // Logic: If user provides a key, we prioritize it.
    // We try to use gemini-1.5-flash as the most versatile model for the provided key.
    const modelInstance = userKey 
      ? googleAI.model('gemini-1.5-flash', { apiKey: userKey })
      : 'googleai/gemini-1.5-flash';

    try {
      const response = await ai.generate({
        model: modelInstance,
        system: `You are "SpecsAI Advisor", a world-class Strategic Business Growth Expert for shop owners.
        
        YOUR PERSONALITY:
        - Sharp, data-driven, and highly professional.
        - Speak like a business consultant who genuinely wants the shop to double its profit.
        - LANGUAGE: ${input.context.currentLanguage === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
        - IMPORTANT: ALWAYS START with "নমস্কার ভাই," (if Bengali) or "Greetings Partner," (if English).
        
        YOUR GOAL:
        - Analyze the provided shop data to find growth opportunities.
        - Focus on PROFIT MAXIMIZATION. 
        
        DATA CONTEXT:
        - Inventory: ${input.context.inventorySummary}
        - Sales Stats: ${input.context.salesPerformance}
        - Top Performers: ${input.context.topProducts}
        - Currency: ${input.context.currency}`,
        history: input.history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: [{ text: m.content }]
        })),
        prompt: input.message,
      });

      return { 
        reply: response.text || "I'm analyzing your business data...",
        detectedModel: userKey ? "Custom Gemini (Active)" : "Default System Brain"
      };
    } catch (error: any) {
      console.error("Advisor Execution Error:", error);
      throw error;
    }
  }
);

export async function growthExpertChat(input: z.infer<typeof GrowthExpertInputSchema>) {
  try {
    return await advisorFlow(input);
  } catch (error: any) {
    console.error("Advisor AI Bridge Error:", error);
    return { 
      reply: input.context.currentLanguage === 'bn' 
        ? "দুঃখিত ভাই, আপনার এপিআই কি-তে সমস্যা হচ্ছে। দয়া করে Settings থেকে কি (Key) টি পুনরায় চেক করুন এবং নিশ্চিত করুন যে সেটি সক্রিয়।" 
        : "Sorry Partner, there's an issue with your API Key. Please check your Key in Settings and make sure it's active." 
    };
  }
}
