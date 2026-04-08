"use client"

import { LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

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

  return (
    <Card className="border-white/5 bg-white/5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
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
              <YAxis 
                hide 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="reward" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#fillReward)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--accent))" 
                fill="none" 
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Avg Reward</p>
            <p className="text-lg font-code">
              {logs.length > 0 ? (logs.reduce((acc, l) => acc + l.reward, 0) / logs.length).toFixed(3) : '0.000'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Efficiency</p>
            <p className="text-lg font-code">
              {logs.length > 0 ? (logs.filter(l => l.reward > 0.5).length / logs.length * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}