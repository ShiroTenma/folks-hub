import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button'; // <--- Add this line
import { Target, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityOverviewProps {
  divisionProgress: any[];
  upcomingAgenda: any[];
}

export function ActivityOverview({ divisionProgress, upcomingAgenda }: ActivityOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Division Progress */}
      <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Division Progress
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Operational Status</CardDescription>
            </div>
            <Link to="/tasks">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all group">
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            {divisionProgress.map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.count} tasks completed</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2.5 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Agenda */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 p-8">
          <div>
            <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              Next Milestones
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Timeline Strategy</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {upcomingAgenda.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs font-bold text-slate-400 uppercase italic">No upcoming events</p>
              </div>
            ) : (
              upcomingAgenda.map((item, i) => (
                <div key={i} className="flex gap-5 group cursor-default">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/50 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-400 uppercase">{item.date.split(' ')[0]}</span>
                    <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600">{item.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{item.sub}</p>
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full rounded-2xl border-slate-200 h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 mt-4">
              <Link to="/tasks">View Full Roadmap</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
