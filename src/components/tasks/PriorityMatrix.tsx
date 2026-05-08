import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Target, 
  Clock, 
  CircleDashed,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Task } from '@/lib/supabase';

interface PriorityMatrixProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

/**
 * Executive Priority Matrix (2x2).
 * Visualizes tasks based on the Urgency vs. Importance framework.
 * Quadrants:
 * 1. Do Now (High Urgency, High Importance)
 * 2. Plan (Low Urgency, High Importance)
 * 3. Delegate (High Urgency, Low Importance)
 * 4. Eliminate/Postpone (Low Urgency, Low Importance)
 */
export function PriorityMatrix({ tasks, onTaskClick }: PriorityMatrixProps) {
  // Simple heuristic for prioritization if explicit fields don't exist
  // High Priority tasks + Overdue/Today = Do Now
  // High Priority + Future = Plan
  // Low Priority + Overdue/Today = Delegate
  // Low Priority + Future = Postpone

  const quadrants = {
    do_now: tasks.filter(t => t.priority === 'high' && t.status !== 'done'),
    plan: tasks.filter(t => t.priority === 'medium' && t.status !== 'done'),
    delegate: tasks.filter(t => t.priority === 'low' && t.status === 'todo'),
    postpone: tasks.filter(t => t.status === 'done').slice(0, 5)
  };

  const Quadrant = ({ title, subtitle, icon: Icon, tasks, color, quadrantClass }: { title: string, subtitle: string, icon: any, tasks: Task[], color: string, quadrantClass: string }) => (
    <div className={cn("flex flex-col p-8 bg-white border-2 border-[#dcd7cf] rounded-[3rem] shadow-2xl shadow-black/5 relative overflow-hidden group hover:border-[#1c1c1c] transition-all duration-500 min-h-[350px]", quadrantClass)}>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg tracking-tight text-[#1c1c1c] italic">{title}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]/40">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-black text-[#1c1c1c] bg-[#f4f2ef] px-3 py-1.5 rounded-xl border border-[#dcd7cf] group-hover:bg-[#1c1c1c] group-hover:text-white transition-all">{tasks.length}</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-3">
            <CircleDashed className="h-8 w-8" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Queue Clear</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => onTaskClick(task)}
              className="p-4 rounded-2xl bg-[#f4f2ef]/50 border border-transparent hover:border-[#1c1c1c] hover:bg-white transition-all cursor-pointer group/item flex items-center justify-between"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1c1c1c] truncate">{task.title}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">{task.division}</span>
              </div>
              <AlertCircle className="h-3 w-3 text-[#dcd7cf] group-hover/item:text-[#1c1c1c] transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Quadrant 
        title="Institutional Nexus" subtitle="Critical & Urgent" icon={Zap} tasks={quadrants.do_now} color="bg-rose-500" 
        quadrantClass="md:rounded-br-none"
      />
      <Quadrant 
        title="Strategic Planning" subtitle="High Impact / Non-Urgent" icon={Target} tasks={quadrants.plan} color="bg-emerald-500"
        quadrantClass="md:rounded-bl-none"
      />
      <Quadrant 
        title="Resource Delegation" subtitle="Low Impact / Urgent" icon={Clock} tasks={quadrants.delegate} color="bg-amber-500"
        quadrantClass="md:rounded-tr-none"
      />
      <Quadrant 
        title="Archival Queue" subtitle="Low Priority / Status Done" icon={CircleDashed} tasks={quadrants.postpone} color="bg-[#535366]"
        quadrantClass="md:rounded-tl-none"
      />
    </div>
  );
}
