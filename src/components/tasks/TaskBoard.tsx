import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Target, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { type Task, type Profile } from '@/lib/supabase';
import { type TaskStatus } from '@/hooks/useTasks';

interface TaskBoardProps {
  tasks: Task[];
  profiles: Record<string, Profile>;
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onStatusUpdate: (id: string, status: TaskStatus, title: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function TaskBoard({
  tasks, profiles, isLoading, onEdit, onDelete, onStatusUpdate, onAddTask
}: TaskBoardProps) {
  const statuses: { value: TaskStatus; label: string; icon: any; color: string }[] = [
    { value: 'todo', label: 'Backlog', icon: Target, color: 'text-[#535366]' },
    { value: 'in_progress', label: 'Active', icon: Zap, color: 'text-amber-500' },
    { value: 'done', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) onStatusUpdate(taskId, status, task.title);
    }
  };

  const StatusColumn = ({ status, label, icon: Icon, color }: { status: TaskStatus; label: string; icon: any; color: string }) => {
    const [isOver, setIsOver] = React.useState(false);
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div 
        className="flex flex-col gap-6 w-full min-w-[340px] max-w-[420px]"
        onDragOver={(e) => { handleDragOver(e); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => { handleDrop(e, status); setIsOver(false); }}
      >
        <div className="flex items-center justify-between px-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-[#dcd7cf]">
          <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center bg-white border border-[#dcd7cf] shadow-sm", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="font-serif font-black italic text-sm tracking-tight text-[#1c1c1c]">{label}</h3>
            <Badge className="rounded-lg px-2 h-6 text-[10px] bg-[#1c1c1c] text-white font-black uppercase tracking-widest border-none ml-1">
              {isLoading ? '..' : columnTasks.length}
            </Badge>
          </div>
          <button 
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1c1c1c] text-white hover:bg-[#535366] transition-all shadow-lg active:scale-90"
            onClick={() => onAddTask(status)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className={cn(
          "flex flex-col gap-5 min-h-[70vh] transition-all duration-500 rounded-[2.5rem] p-4",
          isOver ? "bg-[#eae6e0] ring-4 ring-[#1c1c1c]/5 ring-inset" : "bg-[#f4f2ef]/50 border-2 border-dashed border-[#dcd7cf]"
        )}>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => <div key={i} className="h-40 w-full bg-white rounded-[2rem] animate-pulse shadow-xl shadow-black/5" />)}
            </div>
          ) : columnTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#535366]/20 py-20">
              <Icon className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Queue</p>
            </div>
          ) : (
            columnTasks.map(task => (
              <TaskCard 
                key={task.id} task={task} profile={profiles[task.pic_id!]}
                onEdit={onEdit} onDelete={onDelete} onStatusUpdate={onStatusUpdate}
                onDragStart={handleDragStart} onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar snap-x snap-mandatory">
      {statuses.map(s => (
        <StatusColumn key={s.value} status={s.value} label={s.label} icon={s.icon} color={s.color} />
      ))}
    </div>
  );
}
