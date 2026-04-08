"use client"

import { useState, useCallback, useEffect } from 'react';
import { LifeLineEnv, PRESET_SCENARIOS } from '@/lib/simulation-engine';
import { Observation, Action, Scenario, LogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useSimulation() {
  const [env, setEnv] = useState<LifeLineEnv | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [observation, setObservation] = useState<Observation | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const resetSimulation = useCallback((scenario: Scenario = currentScenario) => {
    const newEnv = new LifeLineEnv(scenario);
    const initialObs = newEnv.reset();
    setEnv(newEnv);
    setCurrentScenario(scenario);
    setObservation(JSON.parse(JSON.stringify(initialObs)));
    setLogs([]);
    setIsDone(false);
    setIsRunning(false);
  }, [currentScenario]);

  const stepSimulation = useCallback((action: Action) => {
    if (!env || isDone) return;

    const [nextObs, reward, done, info] = env.step(action);
    
    const newLog: LogEntry = {
      step: nextObs.step,
      action: `${action.type}${action.targetId ? ` -> ${action.targetId}` : ''}`,
      reward,
      done,
      timestamp: new Date().toLocaleTimeString()
    };

    setObservation(JSON.parse(JSON.stringify(nextObs)));
    setLogs(prev => [newLog, ...prev]);
    setIsDone(done);

    if (done) {
      setIsRunning(false);
      toast({
        title: "Mission Complete",
        description: `Final Episode Score: ${nextObs.cumulativeReward.toFixed(2)}`,
      });
    }
  }, [env, isDone, toast]);

  useEffect(() => {
    resetSimulation();
  }, []);

  return {
    observation,
    logs,
    isDone,
    isRunning,
    setIsRunning,
    currentScenario,
    resetSimulation,
    stepSimulation,
  };
}
