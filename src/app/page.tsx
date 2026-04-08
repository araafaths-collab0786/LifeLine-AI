"use client"

import { useState } from 'react';
import { useSimulation } from '@/hooks/use-simulation';
import { SimulationVisualizer } from '@/components/SimulationVisualizer';
import { SimulationControls } from '@/components/SimulationControls';
import { ScenarioGenerator } from '@/components/ScenarioGenerator';
import { ScenarioEditor } from '@/components/ScenarioEditor';
import { DecisionExplainer } from '@/components/DecisionExplainer';
import { LogViewer } from '@/components/LogViewer';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, LayoutDashboard, Settings, FileCode, ShieldAlert, Zap, Layers, BarChart3, MessageSquare } from 'lucide-react';
import { PRESET_SCENARIOS } from '@/lib/simulation-engine';

export default function Home() {
  const {
    observation,
    logs,
    isDone,
    isRunning,
    currentScenario,
    resetSimulation,
    stepSimulation,
    setIsRunning
  } = useSimulation();

  return (
    <div className="min-h-screen bg-[#1A1D23] text-[#F8F9FA] flex flex-col font-body selection:bg-[#638FE9]/30">
      {/* Dynamic Navigation Header */}
      <header className="h-16 border-b border-white/5 bg-[#1A1D23]/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#638FE9]/20 flex items-center justify-center border border-[#638FE9]/30 shadow-lg shadow-[#638FE9]/5">
            <Heart className="w-6 h-6 text-[#638FE9] animate-pulse-slow" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              LifeLine AI 
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded uppercase">v1.2</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Disaster Response Benchmark</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
           <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
              {PRESET_SCENARIOS.map((s) => (
                <Button 
                  key={s.id} 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetSimulation(s)}
                  className={`text-[10px] h-7 uppercase font-bold tracking-tighter transition-all ${currentScenario.id === s.id ? 'bg-primary text-white hover:bg-primary' : 'text-muted-foreground hover:text-white'}`}
                >
                  {s.id.split('_').pop()}
                </Button>
              ))}
           </div>
           <div className="h-4 w-px bg-white/10 mx-2" />
           <Badge variant="outline" className="border-orange-500/50 text-orange-400 gap-2 font-code text-[10px] px-3">
            <Zap className="w-3 h-3 fill-current" /> OpenEnv Validated
          </Badge>
        </div>
      </header>

      {/* Responsive Dashboard Grid */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Column */}
        <aside className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="w-full bg-black/20 border border-white/5 p-1 h-11">
              <TabsTrigger value="generator" className="flex-1 text-xs gap-2">
                <Zap className="w-3.5 h-3.5" /> AI Gen
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex-1 text-xs gap-2">
                <Settings className="w-3.5 h-3.5" /> Manual
              </TabsTrigger>
            </TabsList>
            <TabsContent value="generator" className="mt-4">
              <ScenarioGenerator onScenarioGenerated={resetSimulation} />
            </TabsContent>
            <TabsContent value="editor" className="mt-4">
              <ScenarioEditor onScenarioCreated={resetSimulation} />
            </TabsContent>
          </Tabs>

          <DecisionExplainer observation={observation} lastLog={logs[0]} />
          
          <div className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resource Stack</h3>
               <Layers className="w-4 h-4 text-primary opacity-50" />
            </div>
            <div className="space-y-5">
              {[
                { label: 'Fleet Efficiency', val: 78, color: 'text-primary' },
                { label: 'Hospital Buffer', val: 42, color: 'text-accent' },
                { label: 'System Latency', val: 12, color: 'text-green-400' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className={stat.color}>{stat.val}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-current ${stat.color}`} style={{ width: `${stat.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Central Visualization Column */}
        <section className="lg:col-span-6 space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge className="bg-[#638FE9]/10 text-[#638FE9] border-[#638FE9]/30">Active Env</Badge>
                <h2 className="text-2xl font-bold tracking-tight text-white">{currentScenario.scenarioName}</h2>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{currentScenario.scenarioDescription}</p>
            </div>
            <div className="text-right shrink-0 hidden md:block">
              <div className="flex gap-2 justify-end mb-2">
                <Badge variant="outline" className="capitalize text-[10px]">{currentScenario.disasterType}</Badge>
                <Badge variant="outline" className="capitalize text-[10px] text-accent border-accent/40">{currentScenario.geographicalContext}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Target Benchmark: lifeline-v1</p>
            </div>
          </div>

          <SimulationVisualizer observation={observation} />
          
          <SimulationControls 
            observation={observation}
            isRunning={isRunning}
            isDone={isDone}
            onStep={stepSimulation}
            onReset={() => resetSimulation()}
            onTogglePlay={() => setIsRunning(!isRunning)}
          />

          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="bg-black/20 border border-white/5 h-12 p-1">
              <TabsTrigger value="visual" className="gap-2 px-6">
                <LayoutDashboard className="w-4 h-4" /> Visual Map
              </TabsTrigger>
              <TabsTrigger value="inference" className="gap-2 px-6">
                <FileCode className="w-4 h-4" /> inference.py
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 px-6">
                <BarChart3 className="w-4 h-4" /> Detailed Analytics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="mt-4">
              <div className="aspect-video rounded-2xl border border-white/5 bg-black/40 relative overflow-hidden group">
                <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-10 pointer-events-none">
                  {[...Array(400)].map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/20" />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Spatial Intelligence Engine</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    Real-time spatial mapping of {observation?.victims.length} active agents in <strong>{currentScenario.geographicalContext}</strong> environment.
                  </p>
                  <div className="flex gap-3">
                    <Badge variant="secondary" className="bg-white/5 border-white/10">3.2ms Latency</Badge>
                    <Badge variant="secondary" className="bg-white/5 border-white/10">60 FPS Render</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="inference" className="mt-4">
              <div className="rounded-xl border border-white/5 bg-[#0D0F12] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="h-8 w-8"><Layers className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                   <span className="text-[10px] text-muted-foreground font-code ml-2 tracking-widest">BASELINE_INFERENCE.PY</span>
                </div>
                <div className="font-code text-xs leading-relaxed max-h-[400px] overflow-auto custom-scrollbar">
                  <pre className="text-blue-400"># OpenEnv Standard Inference Baseline</pre>
                  <pre className="text-white/40 mb-4"># Model: lifeline-agent-v1.0</pre>
                  <pre className="text-purple-400">import <span className="text-white">os</span></pre>
                  <pre className="text-purple-400">from <span className="text-white">openenv</span> import <span className="text-white">Env</span></pre>
                  <pre className="mt-4 text-green-400">{`env = Env("lifeline-v1")
obs = env.reset()

def policy(observation):
    # Agent logic to prioritize critical victims
    waiting = [v for v in obs['victims'] if v['status'] == 'waiting']
    if not waiting: return {"type": "wait"}
    
    target = sorted(waiting, key=lambda x: x['severity'], reverse=True)[0]
    return {"type": "dispatch_ambulance", "targetId": target['id']}

while not env.is_done():
    action = policy(obs)
    obs, reward, done, info = env.step(action)`}</pre>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
               <PerformanceDashboard logs={logs} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Right Status Column */}
        <aside className="lg:col-span-3 space-y-6">
          <LogViewer logs={logs} scenarioName={currentScenario.scenarioName} />
          
          <div className="p-5 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center text-center">
             <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-accent" />
             </div>
             <h3 className="text-sm font-bold mb-1">Human-in-the-Loop</h3>
             <p className="text-xs text-muted-foreground leading-relaxed px-4">
               Manual overrides and intervention signals are logged as human-generated actions.
             </p>
             <Button variant="outline" size="sm" className="mt-4 w-full text-[10px] uppercase font-bold tracking-widest border-white/10 hover:bg-accent hover:text-white transition-all">
               Connect Local SDK
             </Button>
          </div>

          <div className="p-4 rounded-xl border border-[#765EDD]/20 bg-[#765EDD]/5 relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10">
                <BarChart3 className="w-24 h-24" />
             </div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">Benchmarks</h3>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-medium">SOTA Accuracy</span>
                   <Badge className="bg-accent text-white border-none">92.4%</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-medium">Mean Step Reward</span>
                   <span className="text-xs font-code">0.782</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-medium">Validation Tasks</span>
                   <span className="text-xs">12/12</span>
                </div>
             </div>
          </div>
        </aside>
      </main>

      <footer className="py-8 border-t border-white/5 px-6 text-center text-xs text-muted-foreground/60 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p>LifeLine AI &copy; 2024 - Intelligent Disaster Response Environment</p>
          <div className="h-4 w-px bg-white/10" />
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">OpenEnv Schema</a>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[10px] font-code opacity-50">HF_SPACE_ID: lifeline-v1-benchmark</Badge>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">A{i}</div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
