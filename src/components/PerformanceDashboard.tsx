"use client"

import { LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp, Activity, Timer, CheckCircle2, ShieldAlert, Zap, Target, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PerformanceDashboardProps {
  logs: LogEntry[];
}

export function PerformanceDashboard({ logs }: PerformanceDashboardProps) {
  // Data processing for charts
  const chartData = [...logs].reverse().map((l) => {
    const cumulative = logs
      .filter(log => log.step <= l.step)
      .reduce((acc, log) => acc + log.reward, 0);
    
    return {
      step: l.step,
      reward: l.reward,
      cumulative: parseFloat(cumulative.toFixed(2)),
      baseline: 0.5
    };
  });

  const chartConfig: ChartConfig = {
    reward: { label: "Step Reward", color: "hsl(var(--primary))" },
    cumulative: { label: "Cumulative Score", color: "hsl(var(--accent))" },
    baseline: { label: "Baseline", color: "hsl(var(--muted-foreground))" },
    value: { label: "Frequency", color: "hsl(var(--primary))" }
  };

  // Outcome distribution analysis
  const statusDistribution = [
    { name: 'SOTA Accuracy', value: logs.filter(l => l.reward > 0.7).length, color: 'hsl(var(--chart-1))' },
    { name: 'Optimal Response', value: logs.filter(l => l.reward > 0.5 && l.reward <= 0.7).length, color: 'hsl(var(--chart-2))' },
    { name: 'Sub-Optimal', value: logs.filter(l => l.reward >= 0.3 && l.reward <= 0.5).length, color: 'hsl(var(--chart-3))' },
    { name: 'Process Delay', value: logs.filter(l => l.reward < 0.3).length, color: 'hsl(var(--destructive))' }
  ];

  // Advanced metrics calculation
  const avgReward = logs.length > 0 ? (logs.reduce((acc, l) => acc + l.reward, 0) / logs.length) : 0;
  const survivalRate = logs.length > 0 ? (logs.filter(l => l.reward > 0.6).length / logs.length * 100) : 0;
  const peakReward = logs.length > 0 ? Math.max(...logs.map(l => l.reward)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Level Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mean Agent Reward', val: avgReward.toFixed(3), icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Mission Success Prob', val: `${survivalRate.toFixed(1)}%`, icon: Zap, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Peak Step Performance', val: peakReward.toFixed(3), icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Verified Episodes', val: `${logs.length}/20`, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' }
        ].map((item, i) => (
          <Card key={i} className="border-white/5 bg-black/20 backdrop-blur-md overflow-hidden relative group transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${item.color.replace('text', 'bg')}`} />
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.label}</p>
                <p className="text-2xl font-code font-bold tracking-tight text-white">{item.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Reward Area Chart */}
        <Card className="lg:col-span-2 border-white/5 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Reward Trajectory
              </CardTitle>
              <CardDescription className="text-[10px]">Real-time step reward vs cumulative trend</CardDescription>
            </div>
            <Badge variant="outline" className="font-code text-[10px] border-primary/20 text-primary">LIVE TELEMETRY</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="step" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="reward" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorReward)" 
                    strokeWidth={3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1} 
                    fill="url(#colorCumulative)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Outcome Bar Chart */}
        <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Outcome Density
            </CardTitle>
            <CardDescription className="text-[10px]">Statistical categorization of agent actions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Reduced container height for better vertical proportion */}
            <div className="h-[220px] w-full">
              <ChartContainer config={chartConfig}>
                <BarChart data={statusDistribution} layout="vertical" margin={{ left: -40 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  {/* Smaller barSize for a more compact appearance */}
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
               <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-2 font-bold uppercase tracking-widest">
                    <ShieldAlert className="w-3 h-3 text-destructive" />
                    Critical Failures
                  </span>
                  <span className="font-bold">{logs.filter(l => l.reward < 0.2).length} Event(s)</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive transition-all duration-1000" 
                    style={{ width: `${(logs.filter(l => l.reward < 0.2).length / Math.max(logs.length, 1)) * 100}%` }} 
                  />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
