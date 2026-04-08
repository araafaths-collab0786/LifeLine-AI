'use server';
/**
 * @fileOverview An AI decision explainer tool that interprets an agent's actions
 * within a simulation observation and provides human-readable justifications.
 *
 * - explainAgentDecision - A function that handles the explanation process.
 * - ExplainAgentDecisionInput - The input type for the explainAgentDecision function.
 * - ExplainAgentDecisionOutput - The return type for the explainAgentDecision function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainAgentDecisionInputSchema = z.object({
  observation: z
    .string()
    .describe(
      'A JSON string representing the current observation or state of the simulation environment.'
    ),
  action: z
    .string()
    .describe(
      'A string describing the action taken by the AI agent (e.g., "Dispatch ambulance to location X").'
    ),
});
export type ExplainAgentDecisionInput = z.infer<
  typeof ExplainAgentDecisionInputSchema
>;

const ExplainAgentDecisionOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      "A human-readable explanation or justification for the agent's action."
    ),
});
export type ExplainAgentDecisionOutput = z.infer<
  typeof ExplainAgentDecisionOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'explainAgentDecisionPrompt',
  input: { schema: ExplainAgentDecisionInputSchema },
  output: { schema: ExplainAgentDecisionOutputSchema },
  prompt: `You are an AI Decision Explainer for an emergency response simulation.
Your task is to interpret an AI agent's action based on the current state of the simulation and provide a human-readable justification.

The current simulation observation is:
{{{observation}}}

The action taken by the agent was:
{{{action}}}

Please explain why the agent chose this action, considering the current observation. Provide a concise and clear justification.`,
});

export async function explainAgentDecision(
  input: ExplainAgentDecisionInput
): Promise<ExplainAgentDecisionOutput> {
  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('Failed to get explanation from the AI model.');
      }
      return output;
    } catch (error: any) {
      attempts++;
      const errorMessage = error?.toString() || '';
      const isRetryable = 
        errorMessage.includes('503') || 
        errorMessage.includes('UNAVAILABLE') || 
        errorMessage.includes('429') || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('limit');

      if (attempts >= maxAttempts || !isRetryable) {
        throw error;
      }
      
      const delay = Math.pow(2, attempts) * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Maximum retry attempts reached for decision explanation.');
}
