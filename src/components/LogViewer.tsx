"use client"

import { LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Shield, Cpu, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface LogViewerProps {
  logs: LogEntry[];
  scenarioName: string;
}

export function LogViewer({ logs, scenarioName }: LogViewerProps) {
  return (
    <Card className="border-white/5 bg-black/60 backdrop-blur-xl flex flex-col h-[600px] overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-white/5 shrink-0 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold tracking-tight">System Execution Logs</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-50">kernel::lifeline-v1-stable</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="font-code text-[10px] border-white/10 uppercase bg-black/40">Task: {scenarioName.replace(/\s/g, '_').toLowerCase()}</Badge>
            <Badge variant="outline" className="font-code text-[10px] border-green-500/20 text-green-400 bg-green-500/5">Active</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-2 font-code text-[11px] leading-relaxed">
            <div className="flex items-center gap-3 text-blue-400/80 mb-4 bg-blue-500/5 p-2 rounded border border-blue-500/10">
               <Cpu className="w-3 h-3" />
               <span>[INIT] lifeline_kernel initialized with baseline_human_policy...</span>
            </div>
            
            {logs.length === 0 && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse italic">
                <Activity className="w-3 h-3" />
                <span>Waiting for agent action...</span>
              </div>
            )}

            {[...logs].reverse().map((log, i) => (
              <div key={i} className="group flex items-start gap-4 hover:bg-white/[0.02] -mx-6 px-6 py-1 transition-colors">
                <span className="text-muted-foreground/40 shrink-0 w-8">{(i + 1).toString().padStart(3, '0')}</span>
                <div className="flex-1 flex gap-2">
                  <span className="text-muted-foreground/50">[{log.timestamp}]</span>
                  <span className="text-primary font-bold">STEP_{log.step}:</span>
                  <span className="text-white/80">ACTION="{log.action}"</span>
                  <span className={log.reward > 0.6 ? "text-green-400" : log.reward < 0.3 ? "text-red-400" : "text-yellow-400/80"}>
                    REWARD={log.reward.toFixed(3)}
                  </span>
                  {log.done && <span className="text-accent font-bold">[TERMINATED]</span>}
                </div>
              </div>
            ))}

            {logs.length > 0 && logs[0].done && (
              <div className="mt-6 pt-4 border-t border-white/10 bg-accent/5 p-4 rounded border border-accent/20">
                <div className="flex items-center gap-2 text-accent font-bold mb-1">
                   <Shield className="w-4 h-4" />
                   <span>[EPISODE_SUMMARY]</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                   <div>Steps: <span className="text-white">{logs[0].step}</span></div>
                   <div>Net Reward: <span className="text-white">{logs.reduce((acc, l) => acc + l.reward, 0).toFixed(3)}</span></div>
                   <div>Status: <span className="text-green-400">Success</span></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
