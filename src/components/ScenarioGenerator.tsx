"use client"

import { useState } from 'react';
import { generateDisasterScenario } from '@/ai/flows/generate-disaster-scenario';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, Play } from 'lucide-react';
import { Scenario } from '@/lib/types';

interface ScenarioGeneratorProps {
  onScenarioGenerated: (scenario: Scenario) => void;
}

export function ScenarioGenerator({ onScenarioGenerated }: ScenarioGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateDisasterScenario({ userPrompt: prompt });
      
      // Convert Genkit output to our app's Scenario type
      const newScenario: Scenario = {
        id: `gen-${Date.now()}`,
        scenarioName: result.scenarioName,
        disasterType: result.disasterType,
        scale: result.scale,
        geographicalContext: result.geographicalContext,
        specificChallenges: result.specificChallenges,
        initialVictims: result.initialVictims.map(v => ({
          ...v,
          status: 'waiting'
        })),
        initialResources: result.initialResources,
        scenarioDescription: result.scenarioDescription
      };
      
      onScenarioGenerated(newScenario);
      setPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Scenario Generator
        </CardTitle>
        <CardDescription>
          Describe a disaster, and the AI will build a complete RL environment configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder="e.g. A major flash flood in a mountainous village with isolated elderly victims..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] bg-background/50"
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt} 
          className="w-full"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Environment...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Training Task</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}