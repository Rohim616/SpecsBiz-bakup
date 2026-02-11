
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';

/**
 * @fileOverview Genkit initialization optimized for SpecsBiz Master Brain.
 * Supports both Google AI and OpenAI models via standard plugins.
 */

export const ai = genkit({
  plugins: [
    googleAI(),
    openAI(),
  ],
});
