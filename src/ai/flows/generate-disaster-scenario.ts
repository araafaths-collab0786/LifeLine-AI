'use server';
/**
 * @fileOverview An AI tool to generate diverse and detailed disaster scenario configurations.
 *
 * - generateDisasterScenario - A function that leverages a large language model to generate
 *   disaster scenario configurations based on a high-level user prompt.
 * - GenerateDisasterScenarioInput - The input type for the generateDisasterScenario function.
 * - GenerateDisasterScenarioOutput - The return type for the generateDisasterScenario function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDisasterScenarioInputSchema = z.object({
  userPrompt: z
    .string()
    .describe(
      'A high-level text prompt describing the desired disaster scenario configuration. For example: "A major flood in a coastal town with multiple critical victims and limited rescue teams."'
    ),
});
export type GenerateDisasterScenarioInput = z.infer<
  typeof GenerateDisasterScenarioInputSchema
>;

const GenerateDisasterScenarioOutputSchema = z.object({
  scenarioName: z.string().describe('A short, descriptive name for the generated scenario. Example: "Coastal Flood Emergency"'),
  disasterType: z
    .enum([
      'accident',
      'flood',
      'medical_emergency',
      'fire',
      'earthquake',
      'hurricane',
      'tsunami',
      'landslide',
      'chemical_spill',
      'blizzard',
    ])
    .describe('The type of disaster being simulated.'),
  scale: z
    .enum(['small', 'medium', 'large', 'catastrophic'])
    .describe('The scale or magnitude of the disaster.'),
  geographicalContext: z
    .enum(['urban', 'rural', 'coastal', 'mountainous', 'industrial', 'desert'])
    .describe('The geographical environment where the disaster occurs.'),
  specificChallenges: z
    .array(z.string())
    .describe('An array of unique challenges present in the scenario (e.g., hazardous_materials, difficult_terrain, communication_blackout, collapsed_buildings).'),
  initialVictims: z
    .array(
      z.object({
        id: z.string().describe('Unique identifier for the victim (e.g., "victim_1").'),
        locationDescription: z
          .string()
          .describe('A brief description of the victim\'s location.'),
        severity: z
          .enum(['critical', 'serious', 'moderate', 'minor'])
          .describe('The severity of the victim\'s condition.'),
        distanceFromCommandCenterKm: z
          .number()
          .describe('Distance from command center in km.'),
        estimatedInitialResponseTimeMinutes: z
          .number()
          .describe('Initial response time in minutes.'),
        x: z.number().min(0).max(100).describe('X coordinate on a 0-100 grid.'),
        y: z.number().min(0).max(100).describe('Y coordinate on a 0-100 grid.'),
      })
    )
    .describe('An array of initial victim details.'),
  initialResources: z
    .object({
      ambulancesAvailable: z.number().describe('The number of ambulances initially available.'),
      rescueTeamsAvailable: z.number().describe('The number of rescue teams initially available.'),
      hospitalCapacityAvailable: z
        .number()
        .describe('The number of available hospital beds.'),
    })
    .describe('Initial resources available for disaster response.'),
  scenarioDescription: z
    .string()
    .describe('A detailed narrative description of the generated disaster scenario.'),
});
export type GenerateDisasterScenarioOutput = z.infer<
  typeof GenerateDisasterScenarioOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateDisasterScenarioPrompt',
  input: { schema: GenerateDisasterScenarioInputSchema },
  output: { schema: GenerateDisasterScenarioOutputSchema },
  prompt: `You are an AI assistant that specializes in generating realistic and diverse disaster scenario configurations for training emergency response AI agents.

Create a detailed disaster scenario configuration based on the user's high-level prompt. Ensure the generated scenario is challenging and suitable for testing decision-making under pressure.

User Prompt: {{{userPrompt}}}`,
});

export async function generateDisasterScenario(
  input: GenerateDisasterScenarioInput
): Promise<GenerateDisasterScenarioOutput> {
  let attempts = 0;
  const maxAttempts = 6;
  
  while (attempts < maxAttempts) {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate scenario output');
      }
      return output;
    } catch (error: any) {
      attempts++;
      const errorMessage = String(error).toLowerCase();
      const isRetryable = 
        errorMessage.includes('503') || 
        errorMessage.includes('unavailable') || 
        errorMessage.includes('429') || 
        errorMessage.includes('resource_exhausted') ||
        errorMessage.includes('exhausted') ||
        errorMessage.includes('requests') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('limit');

      if (attempts >= maxAttempts || !isRetryable) {
        throw error;
      }
      
      const delay = Math.pow(2, attempts) * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Maximum retry attempts reached for scenario generation.');
}
