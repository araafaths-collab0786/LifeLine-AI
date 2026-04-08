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

    // Use a fresh copy to ensure React detects the change in the nested objects
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

  // Baseline Policy Heuristic for automatic execution
  const getBaselineAction = useCallback((obs: Observation): Action => {
    const waiting = [...obs.victims]
      .filter(v => v.status === 'waiting')
      .sort((a, b) => {
        const order = { critical: 3, serious: 2, moderate: 1, minor: 0 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      });

    if (waiting.length > 0) {
      if (obs.resources.ambulancesAvailable > 0) {
        return { type: 'dispatch_ambulance', targetId: waiting[0].id };
      }
      if (obs.resources.rescueTeamsAvailable > 0) {
        return { type: 'send_rescue_team', targetId: waiting[0].id };
      }
    }

    const inTransit = obs.victims.find(v => v.status === 'in_transit' || v.status === 'rescued');
    if (inTransit && obs.resources.hospitalCapacityAvailable > 0) {
      return { type: 'notify_hospital', targetId: inTransit.id };
    }

    return { type: 'wait' };
  }, []);

  // Handle automatic simulation steps when 'Play' is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isDone && observation) {
      interval = setInterval(() => {
        // Always get the freshest observation state for the policy
        const action = getBaselineAction(observation);
        stepSimulation(action);
      }, 1500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isDone, observation, stepSimulation, getBaselineAction]);

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
