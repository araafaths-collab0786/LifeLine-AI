"use client"

import { useState } from 'react';
import { explainAgentDecision } from '@/ai/flows/explain-agent-decision';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, MessageSquareQuote } from 'lucide-react';
import { Observation, LogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface DecisionExplainerProps {
  observation: Observation | null;
  lastLog: LogEntry | undefined;
}

export function DecisionExplainer({ observation, lastLog }: DecisionExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExplain = async () => {
    if (!observation || !lastLog) return;
    setIsLoading(true);
    try {
      const result = await explainAgentDecision({
        observation: JSON.stringify(observation),
        action: lastLog.action
      });
      setExplanation(result.explanation);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "AI service is currently unavailable or rate limited. Please try again shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-accent" />
          Decision Reasoning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {explanation ? (
          <div className="text-xs text-muted-foreground leading-relaxed italic bg-black/20 p-3 rounded-lg border border-white/5 flex gap-3">
            <MessageSquareQuote className="w-4 h-4 text-accent shrink-0" />
            {explanation}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Analysis of the most recent step is available for human review.
          </p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExplain} 
          disabled={isLoading || !lastLog}
          className="w-full text-xs h-8 border-accent/20 hover:bg-accent/10 hover:text-accent"
        >
          {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <BrainCircuit className="w-3 h-3 mr-2" />}
          Explain Last Action
        </Button>
      </CardContent>
    </Card>
  );
}
