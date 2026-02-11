'use server';
/**
 * @fileOverview Real-time AI Key Verification Flow.
 * Verifies the user's API key by attempting to list models and testing connectivity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

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
    try {
      // 1. Initialize a dynamic model instance with the provided key
      const model = googleAI.model('gemini-1.5-flash', { apiKey: input.apiKey });

      // 2. Perform a tiny generation to verify if the key is active and valid
      const response = await ai.generate({
        model: model,
        prompt: 'hi',
        config: { maxOutputTokens: 1 }
      });

      if (response) {
        return {
          success: true,
          detectedModel: 'Gemini 1.5 Flash (Active Connection)',
          message: 'API Key is valid and AI system is live!'
        };
      }

      return { success: false, message: 'Invalid response from AI provider.' };
    } catch (error: any) {
      console.error("Verification Error:", error);
      let errorMsg = 'Invalid API Key or connection failed.';
      
      if (error.message?.includes('API_KEY_INVALID')) errorMsg = 'The API key provided is invalid.';
      if (error.message?.includes('user location')) errorMsg = 'Your region is not supported by this API provider.';
      
      return {
        success: false,
        message: errorMsg
      };
    }
  }
);
