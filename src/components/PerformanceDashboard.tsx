"use client"

import { LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Activity, Timer, CheckCircle2 } from "lucide-react";

interface PerformanceDashboardProps {
  logs: LogEntry[];
}

export function PerformanceDashboard({ logs }: PerformanceDashboardProps) {
  const chartData = [...logs].reverse().map(l => ({
    step: l.step,
    reward: l.reward,
    cumulative: logs.filter(log => log.step <= l.step).reduce((acc, log) => acc + log.reward, 0)
  }));

  const chartConfig = {
    reward: { label: "Step Reward", color: "hsl(var(--primary))" },
    cumulative: { label: "Total Score", color: "hsl(var(--accent))" }
  };

  const statusDistribution = [
    { name: 'Success', value: logs.filter(l => l.reward > 0.6).length, color: 'hsl(var(--primary))' },
    { name: 'Neutral', value: logs.filter(l => l.reward >= 0.4 && l.reward <= 0.6).length, color: 'hsl(var(--muted-foreground))' },
    { name: 'Failure', value: logs.filter(l => l.reward < 0.4).length, color: 'hsl(var(--destructive))' }
  ];

  const avgReward = logs.length > 0 ? (logs.reduce((acc, l) => acc + l.reward, 0) / logs.length) : 0;
  const efficiency = logs.length > 0 ? (logs.filter(l => l.reward > 0.5).length / logs.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/5 bg-white/5 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Avg Agent Reward</p>
            <p className="text-xl font-code font-bold">{avgReward.toFixed(3)}</p>
          </div>
        </Card>
        <Card className="border-white/5 bg-white/5 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">System Efficiency</p>
            <p className="text-xl font-code font-bold">{efficiency.toFixed(1)}%</p>
          </div>
        </Card>
        <Card className="border-white/5 bg-white/5 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Steps Validated</p>
            <p className="text-xl font-code font-bold">{logs.length} / 20</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Reward Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillReward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="step" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="reward" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#fillReward)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Timer className="w-4 h-4 text-accent" />
              Action Outcome Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
