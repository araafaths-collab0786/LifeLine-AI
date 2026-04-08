"use client"

import { Observation, Victim } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, Ambulance, Building2, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationVisualizerProps {
  observation: Observation | null;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors = {
    critical: "bg-red-500/20 text-red-400 border-red-500/50",
    serious: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    minor: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", colors[severity as keyof typeof colors])}>
      {severity}
    </Badge>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'waiting': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case 'rescued': return <Activity className="w-4 h-4 text-blue-400" />;
    case 'in_transit': return <Ambulance className="w-4 h-4 text-primary" />;
    case 'hospitalized': return <Building2 className="w-4 h-4 text-green-400" />;
    default: return null;
  }
};

export function SimulationVisualizer({ observation }: SimulationVisualizerProps) {
  if (!observation) return null;

  const totalVictims = observation.victims.length;
  const hospitalizedCount = observation.victims.filter(v => v.status === 'hospitalized').length;
  const progress = (hospitalizedCount / totalVictims) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Overview */}
      <Card className="md:col-span-3 border-white/5 bg-white/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Step</p>
              <p className="text-2xl font-bold font-code">{observation.step}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Survival Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold font-code">{progress.toFixed(0)}%</p>
                <Progress value={progress} className="h-2 w-20" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Score</p>
              <p className="text-2xl font-bold font-code text-primary">+{observation.cumulativeReward.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Resources Available</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="font-code">🚑 {observation.resources.ambulancesAvailable}</Badge>
                <Badge variant="secondary" className="font-code">🛠️ {observation.resources.rescueTeamsAvailable}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Victims List */}
      <Card className="md:col-span-2 border-white/5 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Active Victims
          </CardTitle>
          <Badge variant="outline">{observation.victims.filter(v => v.status !== 'hospitalized').length} Pending</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {observation.victims.map((victim) => (
              <div key={victim.id} className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {victim.id.split('_').pop() || victim.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{victim.locationDescription}</p>
                      <SeverityBadge severity={victim.severity} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {victim.distanceFromCommandCenterKm}km</span>
                      <span className="flex items-center gap-1 capitalize"><StatusIcon status={victim.status} /> {victim.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Est. Wait</p>
                  <p className="text-sm font-code">{victim.estimatedInitialResponseTimeMinutes}m</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logistics Status */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Logistics Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hospital Capacity</span>
                <span className="font-code">{observation.resources.hospitalCapacityAvailable} beds</span>
             </div>
             <Progress value={(observation.resources.hospitalCapacityAvailable / 20) * 100} className="h-1.5" />
          </div>
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4">Environment Observations</h4>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs">
                <p className="font-semibold text-primary mb-1">Dynamic Factor: Deterioration</p>
                <p className="text-muted-foreground">Victims in critical status have a 10% chance per step of reaching termination state.</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-xs">
                <p className="font-semibold text-accent mb-1">Environmental Note</p>
                <p className="text-muted-foreground">Urban context increases response delay by 1-2 minutes randomly.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}