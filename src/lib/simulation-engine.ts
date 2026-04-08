import { Observation, Action, Scenario, Victim, Resources, ActionType, Severity, Scale, GeoContext } from './types';

export class LifeLineEnv {
  private scenario: Scenario;
  private currentObservation: Observation;
  private isDone: boolean = false;
  private maxSteps: number = 20;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.currentObservation = this.getInitialObservation();
  }

  private getInitialObservation(): Observation {
    return {
      step: 0,
      victims: JSON.parse(JSON.stringify(this.scenario.initialVictims)),
      resources: { ...this.scenario.initialResources },
      history: [],
      cumulativeReward: 0,
    };
  }

  public reset(): Observation {
    this.currentObservation = this.getInitialObservation();
    this.isDone = false;
    return this.currentObservation;
  }

  public state(): Observation {
    return this.currentObservation;
  }

  public step(action: Action): [Observation, number, boolean, any] {
    if (this.isDone) {
      return [this.currentObservation, 0, true, { error: 'Episode already finished' }];
    }

    const obs = this.currentObservation;
    obs.step += 1;

    let rawReward = 0;
    let reason = "Standard step";

    const { type, targetId } = action;

    // 1. Process Action
    switch (type) {
      case 'dispatch_ambulance':
        rawReward = this.handleDispatchAmbulance(targetId, obs);
        reason = targetId ? `Dispatched ambulance to ${targetId}` : "Ambulance dispatch error";
        break;
      case 'send_rescue_team':
        rawReward = this.handleSendRescueTeam(targetId, obs);
        reason = targetId ? `Sent rescue team to ${targetId}` : "Rescue team error";
        break;
      case 'notify_hospital':
        rawReward = this.handleNotifyHospital(targetId, obs);
        reason = "Hospital notification processed";
        break;
      case 'wait':
        rawReward = -0.05;
        reason = "Idling... resources held in reserve";
        break;
    }

    // 2. Dynamic Environment Updates (Deterioration)
    this.deteriorateVictims(obs);

    // 3. Update Global State
    obs.cumulativeReward += rawReward;
    obs.history.push(`${reason} (R: ${rawReward.toFixed(2)})`);

    // 4. Termination Check
    const allHandled = obs.victims.every(v => ['hospitalized', 'deceased'].includes(v.status));
    const outOfTime = obs.step >= this.maxSteps;
    
    if (allHandled || outOfTime) {
      this.isDone = true;
    }

    // 5. Normalize Reward (0.0 to 1.0)
    const stepReward = Math.max(0, Math.min(1, (rawReward + 0.5) / 1.5)); 

    return [obs, stepReward, this.isDone, { reason }];
  }

  private handleDispatchAmbulance(targetId: string | undefined, obs: Observation): number {
    if (!targetId || obs.resources.ambulancesAvailable <= 0) return -0.2;
    const victim = obs.victims.find(v => v.id === targetId);
    if (!victim || victim.status !== 'waiting') return -0.1;

    victim.status = 'in_transit';
    obs.resources.ambulancesAvailable -= 1;
    
    return this.calculateResponseReward(victim);
  }

  private handleSendRescueTeam(targetId: string | undefined, obs: Observation): number {
    if (!targetId || obs.resources.rescueTeamsAvailable <= 0) return -0.2;
    const victim = obs.victims.find(v => v.id === targetId);
    if (!victim || victim.status !== 'waiting') return -0.1;

    victim.status = 'rescued';
    obs.resources.rescueTeamsAvailable -= 1;

    return this.calculateResponseReward(victim) * 0.8; 
  }

  private handleNotifyHospital(targetId: string | undefined, obs: Observation): number {
    if (obs.resources.hospitalCapacityAvailable <= 0) return -0.1;
    
    const candidates = obs.victims.filter(v => v.status === 'in_transit' || v.status === 'rescued');
    if (candidates.length === 0) return -0.05;

    const victim = candidates.sort((a, b) => {
        const severityOrder = { critical: 3, serious: 2, moderate: 1, minor: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity];
    })[0];

    victim.status = 'hospitalized';
    obs.resources.hospitalCapacityAvailable -= 1;
    victim.handledAtStep = obs.step;

    obs.resources.ambulancesAvailable += 0.5; 
    
    return 0.5 + (victim.severity === 'critical' ? 0.3 : 0.1);
  }

  private calculateResponseReward(victim: Victim): number {
    const severityBonus = { critical: 0.8, serious: 0.5, moderate: 0.3, minor: 0.1 };
    const distancePenalty = (victim.distanceFromCommandCenterKm / 20) * 0.2;
    return severityBonus[victim.severity] - distancePenalty;
  }

  private deteriorateVictims(obs: Observation) {
    obs.victims.forEach(v => {
      if (v.status === 'waiting' || v.status === 'rescued') {
        const deteriorationChance = v.severity === 'critical' ? 0.2 : 0.05;
        if (Math.random() < deteriorationChance) {
          if (v.severity === 'critical') v.status = 'deceased';
          else if (v.severity === 'serious') v.severity = 'critical';
          else if (v.severity === 'moderate') v.severity = 'serious';
          else if (v.severity === 'minor') v.severity = 'moderate';
        }
      }
    });
  }
}

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'easy_commuter_accident',
    scenarioName: 'Lone Commuter Accident',
    disasterType: 'accident',
    scale: 'small',
    geographicalContext: 'urban',
    specificChallenges: [],
    initialVictims: [
      { id: 'v1', locationDescription: 'Main St Intersection', severity: 'moderate', distanceFromCommandCenterKm: 2, estimatedInitialResponseTimeMinutes: 5, status: 'waiting', x: 45, y: 55 }
    ],
    initialResources: { ambulancesAvailable: 2, rescueTeamsAvailable: 1, hospitalCapacityAvailable: 10 },
    scenarioDescription: 'A minor traffic collision with one victim in a highly accessible urban area.'
  },
  {
    id: 'medium_river_flood',
    scenarioName: 'Riverbank Overflow',
    disasterType: 'flood',
    scale: 'medium',
    geographicalContext: 'rural',
    specificChallenges: ['difficult_terrain'],
    initialVictims: [
      { id: 'v2', locationDescription: 'North Bridge', severity: 'serious', distanceFromCommandCenterKm: 12, estimatedInitialResponseTimeMinutes: 25, status: 'waiting', x: 20, y: 30 },
      { id: 'v3', locationDescription: 'West Farm', severity: 'critical', distanceFromCommandCenterKm: 15, estimatedInitialResponseTimeMinutes: 30, status: 'waiting', x: 80, y: 25 },
      { id: 'v4', locationDescription: 'Lowlands Rd', severity: 'moderate', distanceFromCommandCenterKm: 8, estimatedInitialResponseTimeMinutes: 15, status: 'waiting', x: 50, y: 70 }
    ],
    initialResources: { ambulancesAvailable: 1, rescueTeamsAvailable: 2, hospitalCapacityAvailable: 5 },
    scenarioDescription: 'Localized flooding has stranded residents with limited ambulance access and difficult terrain.'
  },
  {
    id: 'hard_urban_earthquake',
    scenarioName: 'Metropolis Seismicity',
    disasterType: 'earthquake',
    scale: 'large',
    geographicalContext: 'urban',
    specificChallenges: ['communication_blackout', 'collapsed_buildings'],
    initialVictims: [
        { id: 'v5', locationDescription: 'Subway Station B', severity: 'critical', distanceFromCommandCenterKm: 4, estimatedInitialResponseTimeMinutes: 12, status: 'waiting', x: 30, y: 40 },
        { id: 'v6', locationDescription: 'High Rise A', severity: 'critical', distanceFromCommandCenterKm: 7, estimatedInitialResponseTimeMinutes: 20, status: 'waiting', x: 60, y: 65 },
        { id: 'v7', locationDescription: 'Park Plaza', severity: 'serious', distanceFromCommandCenterKm: 3, estimatedInitialResponseTimeMinutes: 8, status: 'waiting', x: 45, y: 30 },
        { id: 'v8', locationDescription: 'Shopping Mall', severity: 'moderate', distanceFromCommandCenterKm: 10, estimatedInitialResponseTimeMinutes: 25, status: 'waiting', x: 70, y: 20 },
        { id: 'v9', locationDescription: 'School District', severity: 'critical', distanceFromCommandCenterKm: 15, estimatedInitialResponseTimeMinutes: 40, status: 'waiting', x: 15, y: 85 }
    ],
    initialResources: { ambulancesAvailable: 2, rescueTeamsAvailable: 2, hospitalCapacityAvailable: 3 },
    scenarioDescription: 'Large scale earthquake in a dense urban zone. Resources are extremely scarce compared to casualties.'
  }
];
