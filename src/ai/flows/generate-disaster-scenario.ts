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
      'A high-level text prompt describing the desired disaster scenario configuration. For example: "A major flood in a coastal town with multiple critical victims and limited rescue teams."\n'
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
          .describe('A brief description of the victim\u0027s location (e.g., "north side of Main Street", "third floor of the collapsed building").'),
        severity: z
          .enum(['critical', 'serious', 'moderate', 'minor'])
          .describe('The severity of the victim\u0027s condition.'),
        distanceFromCommandCenterKm: z
          .number()
          .describe('Estimated distance of the victim from a central command center in kilometers.'),
        estimatedInitialResponseTimeMinutes: z
          .number()
          .describe('Estimated initial time required for a first responder to reach the victim in minutes, considering obstacles.'),
      })
    )
    .describe('An array of initial victim details.'),
  initialResources: z
    .object({
      ambulancesAvailable: z.number().describe('The number of ambulances initially available for deployment.'),
      rescueTeamsAvailable: z.number().describe('The number of rescue teams initially available.'),
      hospitalCapacityAvailable: z
        .number()
        .describe('The number of available hospital beds or capacity for new patients.'),
    })
    .describe('Initial resources available for disaster response.'),
  scenarioDescription: z
    .string()
    .describe('A detailed narrative description of the generated disaster scenario, summarizing all the above parameters.'),
});
export type GenerateDisasterScenarioOutput = z.infer<
  typeof GenerateDisasterScenarioOutputSchema
>;

export async function generateDisasterScenario(
  input: GenerateDisasterScenarioInput
): Promise<GenerateDisasterScenarioOutput> {
  return generateDisasterScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDisasterScenarioPrompt',
  input: { schema: GenerateDisasterScenarioInputSchema },
  output: { schema: GenerateDisasterScenarioOutputSchema },
  prompt: `You are an AI assistant that specializes in generating realistic and diverse disaster scenario configurations for training emergency response AI agents.\n\nYour task is to create a detailed disaster scenario configuration based on the user's high-level prompt. Ensure the generated scenario is challenging and suitable for testing decision-making under pressure.\n\nAlways provide output in JSON format, strictly adhering to the specified schema for GenerateDisasterScenarioOutput. The 'id' for victims should be unique (e.g., "victim_1", "victim_2"). Ensure all fields are populated appropriately.\n\nUser Prompt: {{{userPrompt}}}`,
});

const generateDisasterScenarioFlow = ai.defineFlow(
  {
    name: 'generateDisasterScenarioFlow',
    inputSchema: GenerateDisasterScenarioInputSchema,
    outputSchema: GenerateDisasterScenarioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate scenario output');
    }
    return output;
  }
);
