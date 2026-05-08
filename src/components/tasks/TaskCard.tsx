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
  onDragEnd: (e: React.DragEndEvent) => void;
}

export function TaskCard({
  task, profile, onEdit, onDelete, onStatusUpdate, onDragStart, onDragEnd
}: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing"
    >
      <Card className="rounded-[2rem] border-[#dcd7cf] shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden bg-white premium-shadow">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-[#1c1c1c]/10 group-hover:bg-[#1c1c1c] transition-colors" />
                <h4 className="font-serif font-black italic text-base text-[#1c1c1c] leading-tight tracking-tight">
                  {task.title}
                </h4>
              </div>
              <p className="text-[10px] text-[#535366]/60 font-medium line-clamp-2 leading-relaxed italic">
                {task.description || 'No description provided.'}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-[#535366]/40 hover:text-[#1c1c1c] hover:bg-[#eae6e0] shrink-0">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-[1.5rem] w-64 p-3 border-[#dcd7cf] shadow-2xl mt-2 bg-white/95 backdrop-blur-xl">
                <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer focus:bg-[#eae6e0] group" onClick={() => onEdit(task)}>
                  <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center text-[#535366] group-focus:bg-[#1c1c1c] group-focus:text-white transition-colors"><Edit2 className="h-4 w-4" /></div>
                  <span className="text-sm font-bold text-[#1c1c1c]">Modify Strategy</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#eae6e0] my-2" />
                <div className="px-4 py-2 text-[10px] font-black uppercase text-[#535366]/40 tracking-[0.2em]">Transition Phase</div>
                <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-[#f4f2ef]" onClick={() => onStatusUpdate(task.id, 'todo', task.title)}>
                  <Circle className="h-4 w-4 text-[#535366]/40" /> <span className="text-sm font-bold text-[#1c1c1c]">Backlog</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-amber-50" onClick={() => onStatusUpdate(task.id, 'in_progress', task.title)}>
                  <Timer className="h-4 w-4 text-amber-500" /> <span className="text-sm font-bold text-amber-900">Active Pipeline</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-emerald-50" onClick={() => onStatusUpdate(task.id, 'done', task.title)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-sm font-bold text-emerald-900">Completed</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#eae6e0] my-2" />
                <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50" onClick={() => onDelete(task.id, task.title)}>
                  <Trash2 className="h-4 w-4" /> <span className="text-sm font-bold">Terminate Task</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map(tag => (
                <Badge key={tag} className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[#535366]/10 text-[#535366] border-none">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em]">
              <span className="text-[#535366]/40">Execution</span>
              <span className="text-[#1c1c1c]">{task.progress_percent}%</span>
            </div>
            <div className="h-2 w-full bg-[#f4f2ef] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${task.progress_percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full", task.status === 'done' ? "bg-emerald-500" : "bg-[#1c1c1c]")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-[#f4f2ef]">
            <div className="flex items-center gap-4">
              {task.deadline && (
                <div className={cn(
                  "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-colors",
                  isOverdue ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-[#f4f2ef] border-[#dcd7cf] text-[#535366]"
                )}>
                  <Clock className="h-3 w-3" />
                  {new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              )}
              <div className="flex items-center gap-2 text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.2em]">
                <TagIcon className="h-3 w-3" />
                {task.division}
              </div>
            </div>

            <Avatar className="h-9 w-9 rounded-xl ring-4 ring-white shadow-xl shrink-0">
              <AvatarFallback className="text-[10px] font-black bg-[#eae6e0] text-[#1c1c1c] uppercase">
                {profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
