import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Timer,
  GripVertical,
  Tag as TagIcon
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Task, type Profile } from '@/lib/supabase';

interface TaskCardProps {
  task: Task;
  profile?: Profile;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onStatusUpdate: (id: string, status: any, title: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function TaskCard({
  task,
  profile,
  onEdit,
  onDelete,
  onStatusUpdate,
  onDragStart,
  onDragEnd
}: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing"
    >
      <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-100 overflow-hidden bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400" />
                <h4 className="font-bold text-sm text-slate-900 leading-tight tracking-tight">
                  {task.title}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-900 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48 p-2 border-slate-100 shadow-xl">
                <DropdownMenuItem className="gap-2 py-2.5 rounded-lg font-bold text-xs cursor-pointer" onClick={() => onEdit(task)}>
                  <Edit2 className="h-3.5 w-3.5" /> Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">Move To</div>
                <DropdownMenuItem className="gap-2 py-2.5 rounded-lg font-bold text-xs cursor-pointer text-slate-600" onClick={() => onStatusUpdate(task.id, 'todo', task.title)}>
                  <Circle className="h-3.5 w-3.5" /> To Do
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 py-2.5 rounded-lg font-bold text-xs cursor-pointer text-indigo-600" onClick={() => onStatusUpdate(task.id, 'in_progress', task.title)}>
                  <Timer className="h-3.5 w-3.5" /> In Progress
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 py-2.5 rounded-lg font-bold text-xs cursor-pointer text-emerald-600" onClick={() => onStatusUpdate(task.id, 'done', task.title)}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 py-2.5 rounded-lg font-bold text-xs cursor-pointer text-rose-600 focus:bg-rose-50" onClick={() => onDelete(task.id, task.title)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete Permanent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-1.5 py-0 h-4 text-[8px] font-black uppercase tracking-tighter bg-slate-50 text-slate-500 border-none">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Progress</span>
              <span className="text-indigo-600 bg-indigo-50 px-1 rounded">{task.progress_percent}%</span>
            </div>
            <Progress value={task.progress_percent} className="h-1 rounded-full bg-slate-50" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <div className="flex items-center gap-3">
              {task.deadline && (
                <div className={cn(
                  "flex items-center gap-1 text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded",
                  isOverdue ? "bg-rose-50 text-rose-600" : "text-slate-400"
                )}>
                  <Clock className="h-3 w-3" />
                  {new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              )}
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <TagIcon className="h-3 w-3" />
                {task.division}
              </div>
            </div>

            <Avatar className="h-6 w-6 rounded-lg ring-2 ring-white shrink-0">
              <AvatarFallback className="text-[8px] font-black bg-indigo-50 text-indigo-600 uppercase">
                {profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
