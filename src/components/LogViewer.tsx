"use client"

import { LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogViewerProps {
  logs: LogEntry[];
  scenarioName: string;
}

export function LogViewer({ logs, scenarioName }: LogViewerProps) {
  return (
    <Card className="border-white/5 bg-black/40 h-full flex flex-col">
      <CardHeader className="py-3 shrink-0">
        <CardTitle className="text-sm font-code flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          System Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2 font-code text-[11px] leading-tight">
            <div className="text-blue-400">
              [START] task={scenarioName.replace(/\s/g, '_').toLowerCase()} env=lifeline_v1 model=baseline_human
            </div>
            {logs.map((log, i) => (
              <div key={i} className={log.reward > 0.5 ? "text-green-400" : log.reward < 0 ? "text-red-400" : "text-gray-400"}>
                [STEP] step={log.step} action="{log.action}" reward={log.reward.toFixed(2)} done={log.done ? 'true' : 'false'} error=null
              </div>
            ))}
            {logs.length > 0 && logs[0].done && (
              <div className="text-primary font-bold pt-2 border-t border-white/10 mt-2">
                [END] success={logs[0].reward > 0 ? 'true' : 'false'} steps={logs[0].step} score={logs.reduce((acc, l) => acc + l.reward, 0).toFixed(2)}
              </div>
            )}
            {logs.length === 0 && (
              <div className="text-muted-foreground animate-pulse">Initializing kernel...</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}