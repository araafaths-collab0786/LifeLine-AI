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
    setExplanation(null);
    try {
      const result = await explainAgentDecision({
        observation: JSON.stringify(observation),
        action: lastLog.action
      });
      setExplanation(result.explanation);
    } catch (error: any) {
      const errorString = String(error).toLowerCase();
      const isQuotaError = 
        errorString.includes('429') || 
        errorString.includes('quota') || 
        errorString.includes('limit') || 
        errorString.includes('exhausted') ||
        errorString.includes('requests');

      toast({
        variant: "destructive",
        title: isQuotaError ? "Quota Limit" : "Analysis Error",
        description: isQuotaError 
          ? "AI analysis is currently at its limit. Please try again in 30 seconds." 
          : "AI service is currently unavailable. Please try again shortly.",
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
          <div className="text-xs text-muted-foreground leading-relaxed italic bg-black/20 p-3 rounded-lg border border-white/5 flex gap-3 animate-in fade-in duration-500">
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
          className="w-full text-xs h-8 border-accent/20 hover:bg-accent/10 hover:text-accent transition-all"
        >
          {isLoading ? (
            <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Analyzing Policy...</>
          ) : (
            <><BrainCircuit className="w-3 h-3 mr-2" /> Explain Last Action</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
