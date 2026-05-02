import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
  tasks,
  profiles,
  isLoading,
  onEdit,
  onDelete,
  onStatusUpdate,
  onAddTask
}: TaskBoardProps) {
  const statuses: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        onStatusUpdate(taskId, status, task.title);
      }
    }
  };

  const StatusColumn = ({ status, label }: { status: TaskStatus; label: string }) => {
    const [isOver, setIsOver] = React.useState(false);
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div 
        className="flex flex-col gap-4 w-full min-w-[320px] max-w-[400px]"
        onDragOver={(e) => {
          handleDragOver(e);
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          handleDrop(e, status);
          setIsOver(false);
        }}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">{label}</h3>
            <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px] bg-white border border-slate-100 text-slate-600 font-bold">
              {isLoading ? '...' : columnTasks.length}
            </Badge>
          </div>
          <button 
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            onClick={() => onAddTask(status)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className={cn(
          "flex flex-col gap-4 min-h-[600px] transition-all rounded-3xl p-2",
          isOver ? "bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed" : "bg-slate-50/50 border border-transparent"
        )}>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => <div key={i} className="h-32 w-full bg-white/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : columnTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 opacity-20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">No Tasks</p>
            </div>
          ) : (
            columnTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                profile={profiles[task.pic_id!]}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusUpdate={onStatusUpdate}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory">
      {statuses.map(s => (
        <StatusColumn key={s.value} status={s.value} label={s.label} />
      ))}
    </div>
  );
}
