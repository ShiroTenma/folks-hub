import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Layers, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NexusFeed } from './NexusFeed';

interface ActivityOverviewProps {
  divisionProgress: any[];
}

export function ActivityOverview({ divisionProgress }: ActivityOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Division Progress */}
      <Card className="lg:col-span-2 rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
        <CardHeader className="border-b-2 border-[#f4f2ef] p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/20">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-heading font-black tracking-tight text-[#1c1c1c]">
                  Division <span className="text-[#535366]">Analytics</span>
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">Operational Pipeline Status</CardDescription>
              </div>
            </div>
            <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-[#f4f2ef] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition-all group border-none">
              <Link to="/tasks">
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {divisionProgress.map((item, i) => (
              <div key={i} className="space-y-4 group">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest flex items-center gap-2">
                      <Layers className="h-3 w-3 text-[#535366]/40" />
                      {item.label}
                    </p>
                    <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-tighter">{item.count} Tasks Synchronized</p>
                  </div>
                  <span className="text-[10px] font-black text-[#1c1c1c] bg-[#f4f2ef] px-3 py-1.5 rounded-xl border border-[#dcd7cf] group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">{item.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#f4f2ef] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1c1c1c] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The Nexus Feed */}
      <Card className="rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
        <CardHeader className="border-b-2 border-[#f4f2ef] p-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#535366] flex items-center justify-center text-white shadow-xl shadow-[#535366]/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-heading font-black tracking-tight text-[#1c1c1c]">
                Institutional <span className="text-[#535366]">Nexus</span>
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">Real-time Activity Stream</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 flex flex-col h-[500px]">
          <div className="flex-1 overflow-hidden">
            <NexusFeed />
          </div>
          <Button asChild variant="outline" className="w-full rounded-[1.5rem] border-2 border-[#dcd7cf] text-[#1c1c1c] h-14 text-[10px] font-black uppercase tracking-[0.3em] mt-8 hover:bg-[#1c1c1c] hover:text-white transition-all shadow-xl shadow-black/5">
            <Link to="/notifications">Audit Full History</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
