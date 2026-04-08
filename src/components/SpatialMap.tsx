"use client"

import { Observation, Victim } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Activity, Ambulance, Building2, MapPin, Skull, Cross, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpatialMapProps {
  observation: Observation | null;
}

const STATIC_LANDMARKS = [
  { id: 'h1', name: 'St. Judes Medical Center', x: 15, y: 15, type: 'hospital' },
  { id: 'h2', name: 'Central Trauma Unit', x: 85, y: 15, type: 'hospital' },
  { id: 'h3', name: 'Southside Infirmary', x: 15, y: 85, type: 'hospital' },
  { id: 'p1', name: 'Paramedic Station 4', x: 85, y: 85, type: 'outpost' },
];

const StatusIcon = ({ status, className }: { status: string; className?: string }) => {
  switch (status) {
    case 'waiting': return <AlertTriangle className={cn("text-orange-400", className)} />;
    case 'rescued': return <Activity className={cn("text-blue-400", className)} />;
    case 'in_transit': return <Ambulance className={cn("text-primary", className)} />;
    case 'hospitalized': return <Building2 className={cn("text-green-400", className)} />;
    case 'deceased': return <Skull className={cn("text-red-500", className)} />;
    default: return null;
  }
};

export function SpatialMap({ observation }: SpatialMapProps) {
  if (!observation) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl border border-white/5 bg-black/40 overflow-hidden group">
      {/* Grid Background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-10 pointer-events-none">
        {[...Array(400)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/20" />
        ))}
      </div>

      {/* Command Center (Center Point) */}
      <div 
        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ left: '50%', top: '50%' }}
      >
        <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/50 animate-pulse">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <Badge variant="outline" className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md text-[8px] border-primary/30">HQ CENTER</Badge>
      </div>

      {/* Static Landmarks */}
      <TooltipProvider>
        {STATIC_LANDMARKS.map((landmark) => (
          <div 
            key={landmark.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity z-10"
            style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center cursor-help">
                  {landmark.type === 'hospital' ? <Building2 className="w-3 h-3 text-green-400" /> : <Landmark className="w-3 h-3 text-blue-400" />}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 border-white/10 p-2">
                <p className="text-[10px] font-bold text-white">{landmark.name}</p>
                <p className="text-[8px] text-muted-foreground uppercase">{landmark.type.replace('_', ' ')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </TooltipProvider>

      {/* Victims Mapping */}
      <TooltipProvider>
        {observation.victims.map((victim) => (
          <div 
            key={victim.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-10"
            style={{ left: `${victim.x}%`, top: `${victim.y}%` }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black/40 backdrop-blur-md transition-transform hover:scale-125 cursor-help shadow-lg",
                  victim.status === 'deceased' ? 'border-red-500 animate-none opacity-50' : 
                  victim.status === 'waiting' ? 'border-orange-500 animate-pulse' : 
                  victim.status === 'hospitalized' ? 'border-green-500' : 'border-primary'
                )}>
                  <StatusIcon status={victim.status} className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1D23] border-white/10 p-3 space-y-1">
                <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/5 pb-1">
                  <span className="font-bold text-xs">{victim.locationDescription}</span>
                  <Badge className="text-[10px] uppercase h-4">{victim.severity}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {victim.distanceFromCommandCenterKm}km from HQ
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  Status: {victim.status.replace('_', ' ')}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </TooltipProvider>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Map Legend</h4>
        <div className="space-y-2">
          {[
            { label: 'Waiting', color: 'text-orange-400', icon: AlertTriangle },
            { label: 'In Transit', color: 'text-primary', icon: Ambulance },
            { label: 'Saved', color: 'text-green-400', icon: Building2 },
            { label: 'Fatalities', color: 'text-red-500', icon: Skull }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <item.icon className={cn("w-3 h-3", item.color)} />
              <span className="text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}