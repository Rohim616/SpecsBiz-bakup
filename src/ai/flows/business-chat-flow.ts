'use server';

/**
 * @fileOverview General-purpose business chat AI agent for SpecsBiz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BusinessChatInputSchema = z.object({
  message: z.string().describe('The user\'s current message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).describe('The conversation history.'),
  businessContext: z.object({
    inventorySummary: z.string(),
    salesSummary: z.string(),
    customersSummary: z.string(),
    totalRevenue: z.number(),
    currency: z.string()
  }).describe('Snapshot of the current business state.')
});
export type BusinessChatInput = z.infer<typeof BusinessChatInputSchema>;

const BusinessChatOutputSchema = z.object({
  reply: z.string().describe('The assistant\'s helpful response.'),
});
export type BusinessChatOutput = z.infer<typeof BusinessChatOutputSchema>;

export async function businessChat(input: BusinessChatInput): Promise<BusinessChatOutput> {
  return businessChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'businessChatPrompt',
  input: {schema: BusinessChatInputSchema},
  output: {schema: BusinessChatOutputSchema},
  prompt: `You are "SpecsBiz Smart Assistant", a highly skilled business consultant for a retail/wholesale store.
  
  You have access to the following real-time business data:
  - Currency: {{businessContext.currency}}
  - Total Revenue: {{businessContext.totalRevenue}}
  - Inventory Status: {{businessContext.inventorySummary}}
  - Recent Sales: {{businessContext.salesSummary}}
  - Customers Overview: {{businessContext.customersSummary}}
  
  Guidelines:
  1. Be professional, concise, and helpful.
  2. Use the provided data to answer specific questions about stock, revenue, or debtors.
  3. If asked to summarize, analyze trends, or suggest actions, use the data logic.
  4. If you don't have enough data to answer, be honest but suggest what the user should check.
  5. Respond in the language of the query (English or Bengali).

  Conversation History:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  
  User: {{message}}
  Assistant:`,
});

const businessChatFlow = ai.defineFlow(
  {
    name: 'businessChatFlow',
    inputSchema: BusinessChatInputSchema,
    outputSchema: BusinessChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
