export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';
export type VictimStatus = 'waiting' | 'rescued' | 'in_transit' | 'hospitalized' | 'deceased';
export type Scale = 'small' | 'medium' | 'large' | 'catastrophic';
export type GeoContext = 'urban' | 'rural' | 'coastal' | 'mountainous' | 'industrial' | 'desert';

export interface Victim {
  id: string;
  locationDescription: string;
  severity: Severity;
  distanceFromCommandCenterKm: number;
  estimatedInitialResponseTimeMinutes: number;
  status: VictimStatus;
  handledAtStep?: number;
}

export interface Resources {
  ambulancesAvailable: number;
  rescueTeamsAvailable: number;
  hospitalCapacityAvailable: number;
}

export interface Observation {
  step: number;
  victims: Victim[];
  resources: Resources;
  history: string[];
  cumulativeReward: number;
}

export type ActionType = 'dispatch_ambulance' | 'send_rescue_team' | 'notify_hospital' | 'wait';

export interface Action {
  type: ActionType;
  targetId?: string;
}

export interface Reward {
  value: number; // 0.0 to 1.0
  reason: string;
}

export interface Scenario {
  id: string;
  scenarioName: string;
  disasterType: string;
  scale: Scale;
  geographicalContext: GeoContext;
  specificChallenges: string[];
  initialVictims: Victim[];
  initialResources: Resources;
  scenarioDescription: string;
}

export interface LogEntry {
  step: number;
  action: string;
  reward: number;
  done: boolean;
  timestamp: string;
}
