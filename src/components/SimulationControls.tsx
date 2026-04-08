"use client"

import { Observation, ActionType, Action } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause, Ambulance, Users, Building2, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface SimulationControlsProps {
  observation: Observation | null;
  isRunning: boolean;
  isDone: boolean;
  onStep: (action: Action) => void;
  onReset: () => void;
  onTogglePlay: () => void;
}

export function SimulationControls({ 
  observation, 
  isRunning, 
  isDone, 
  onStep, 
  onReset, 
  onTogglePlay 
}: SimulationControlsProps) {
  if (!observation) return null;

  const handleAction = (type: ActionType) => {
    // Human intervention: Pause auto-playback first
    if (isRunning) {
        onTogglePlay();
    }

    // Pick highest priority victim for auto-manual assignment
    const candidates = [...observation.victims].sort((a, b) => {
        const severityOrder = { critical: 3, serious: 2, moderate: 1, minor: 0 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });

    const target = candidates.find(v => 
        (type === 'dispatch_ambulance' && v.status === 'waiting') ||
        (type === 'send_rescue_team' && v.status === 'waiting') ||
        (type === 'notify_hospital' && (v.status === 'in_transit' || v.status === 'rescued'))
    );

    onStep({ type, targetId: target?.id });
  };

  return (
    <Card className="border-white/5 bg-[#1A1D23]/60 backdrop-blur-2xl sticky bottom-6 z-40 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <CardContent className="p-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/5 shadow-inner">
                <Button size="icon" variant="ghost" onClick={onReset} className="rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={onTogglePlay} disabled={isDone} className={`rounded-full w-12 h-12 shadow-xl transition-all ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#638FE9] hover:bg-[#638FE9]/90'}`}>
                {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onStep({ type: 'wait' })} disabled={isDone || isRunning} className="rounded-full hover:bg-white/5 text-muted-foreground hover:text-white">
                <Clock className="w-4 h-4" />
                </Button>
            </div>
            <div className="hidden lg:block text-xs font-code opacity-50">
               STEP: {observation.step.toString().padStart(2, '0')}/20
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="grid grid-cols-3 gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button 
                        variant="secondary" 
                        size="sm"
                        className="gap-2 h-10 px-4 bg-white/5 border border-white/10 hover:bg-[#638FE9]/20 hover:border-[#638FE9]/50 transition-all group"
                        disabled={isDone || observation.resources.ambulancesAvailable <= 0}
                        onClick={() => handleAction('dispatch_ambulance')}
                    >
                        <Ambulance className="w-4 h-4 text-[#638FE9]" /> 
                        <span className="hidden sm:inline">Dispatch</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1A1D23] border-white/10">Deploy ambulance (Available: {observation.resources.ambulancesAvailable})</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button 
                        variant="secondary" 
                        size="sm"
                        className="gap-2 h-10 px-4 bg-white/5 border border-white/10 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group"
                        disabled={isDone || observation.resources.rescueTeamsAvailable <= 0}
                        onClick={() => handleAction('send_rescue_team')}
                    >
                        <Users className="w-4 h-4 text-orange-400" /> 
                        <span className="hidden sm:inline">Rescue</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1A1D23] border-white/10">Deploy rescue team (Available: {observation.resources.rescueTeamsAvailable})</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button 
                        variant="secondary" 
                        size="sm"
                        className="gap-2 h-10 px-4 bg-white/5 border border-white/10 hover:bg-[#765EDD]/20 hover:border-[#765EDD]/50 transition-all group"
                        disabled={isDone || observation.resources.hospitalCapacityAvailable <= 0}
                        onClick={() => handleAction('notify_hospital')}
                    >
                        <Building2 className="w-4 h-4 text-[#765EDD]" /> 
                        <span className="hidden sm:inline">ER Notify</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1A1D23] border-white/10">Confirm hospital bed (Available: {observation.resources.hospitalCapacityAvailable})</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
