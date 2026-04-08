"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Settings2, ShieldAlert } from 'lucide-react';
import { Scenario, Victim, Severity, GeoContext, Scale } from '@/lib/types';

interface ScenarioEditorProps {
  onScenarioCreated: (scenario: Scenario) => void;
}

export function ScenarioEditor({ onScenarioCreated }: ScenarioEditorProps) {
  const [name, setName] = useState('Custom Emergency');
  const [type, setType] = useState('accident');
  const [scale, setScale] = useState<Scale>('small');
  const [geo, setGeo] = useState<GeoContext>('urban');
  const [victims, setVictims] = useState<Partial<Victim>[]>([
    { id: 'v_custom_1', locationDescription: 'Site Alpha', severity: 'moderate', distanceFromCommandCenterKm: 5, estimatedInitialResponseTimeMinutes: 10, status: 'waiting' }
  ]);

  const addVictim = () => {
    const id = `v_custom_${victims.length + 1}`;
    setVictims([...victims, { id, locationDescription: 'New Site', severity: 'moderate', distanceFromCommandCenterKm: 5, estimatedInitialResponseTimeMinutes: 10, status: 'waiting' }]);
  };

  const removeVictim = (index: number) => {
    setVictims(victims.filter((_, i) => i !== index));
  };

  const updateVictim = (index: number, updates: Partial<Victim>) => {
    const newVictims = [...victims];
    newVictims[index] = { ...newVictims[index], ...updates };
    setVictims(newVictims);
  };

  const handleSave = () => {
    const scenario: Scenario = {
      id: `custom-${Date.now()}`,
      scenarioName: name,
      disasterType: type,
      scale,
      geographicalContext: geo,
      specificChallenges: [],
      initialVictims: victims as Victim[],
      initialResources: {
        ambulancesAvailable: scale === 'catastrophic' ? 2 : 5,
        rescueTeamsAvailable: scale === 'catastrophic' ? 1 : 3,
        hospitalCapacityAvailable: scale === 'catastrophic' ? 5 : 20,
      },
      scenarioDescription: `User defined ${type} scenario in ${geo} context.`
    };
    onScenarioCreated(scenario);
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Environment Architect
            </CardTitle>
            <CardDescription>Manually configure your RL training environment variables.</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">OpenEnv Compliant</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Scenario Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Context</Label>
            <Select value={geo} onValueChange={(v) => setGeo(v as GeoContext)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="mountainous">Mountainous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Victim Registry</Label>
            <Button variant="ghost" size="sm" onClick={addVictim} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Victim
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {victims.map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/5 group">
                <Input 
                  value={v.locationDescription} 
                  onChange={(e) => updateVictim(i, { locationDescription: e.target.value })} 
                  className="h-8 text-xs bg-transparent border-none focus-visible:ring-1"
                />
                <Select value={v.severity} onValueChange={(val) => updateVictim(i, { severity: val as Severity })}>
                  <SelectTrigger className="h-8 w-[100px] text-[10px] bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeVictim(i)} className="h-8 w-8 text-muted-foreground hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
          <ShieldAlert className="w-4 h-4 mr-2" /> 
          Initialize Simulation State
        </Button>
      </CardContent>
    </Card>
  );
}
