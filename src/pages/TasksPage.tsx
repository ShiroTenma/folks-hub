import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  MoreVertical,
  Filter as FilterIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Timer,
  GripVertical
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import { supabase, type Task, type Profile } from '@/lib/supabase';
import { toast } from 'sonner';
import { DIVISIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { createNotification } from '@/lib/notifications';

type TaskStatus = 'todo' | 'in_progress' | 'done';

export function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [profiles, setProfiles] = React.useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Task Form State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    division: DIVISIONS[0] as string,
    progress_percent: 0,
    deadline: '',
    pic_id: 'unassigned'
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, profilesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setTasks(tasksRes.data || []);
      
      const profileMap = (profilesRes.data || []).reduce((acc, p) => ({
        ...acc,
        [p.id]: p
      }), {});
      setProfiles(profileMap);
    } catch (err: any) {
      toast.error('Failed to load tasks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      division: DIVISIONS[0],
      progress_percent: 0,
      deadline: new Date().toISOString().split('T')[0],
      pic_id: 'unassigned'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      division: task.division,
      progress_percent: task.progress_percent,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      pic_id: task.pic_id || 'unassigned'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      await createNotification('Task Deleted', `🗑️ Task "${title}" has been removed from the board.`, 'warning');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete task: ' + err.message);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus, title: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
      
      toast.success(`Task moved to ${status}`);
      const statusEmoji = status === 'done' ? '✅' : status === 'in_progress' ? '🚧' : '⏳';
      await createNotification(
        'Task Status Updated', 
        `${statusEmoji} "${title}" moved to ${status.replace('_', ' ')}.`, 
        status === 'done' ? 'success' : 'info'
      );
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

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
        handleUpdateTaskStatus(taskId, status, task.title);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const pic_id = formData.pic_id === 'unassigned' ? null : formData.pic_id;
    const dataToSubmit = { ...formData, pic_id };
    
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(dataToSubmit)
          .eq('id', editingTask.id);
        if (error) throw error;
        toast.success('Task updated successfully');
        await createNotification('Task Updated', `Details for task "${formData.title}" have been modified.`, 'info');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([dataToSubmit]);
        if (error) throw error;
        toast.success('Task created successfully');
        await createNotification('New Task Created', `🚀 "${formData.title}" has been added to ${formData.division} board.`, 'success');
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Error saving task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const StatusColumn = ({ status, label }: { status: TaskStatus; label: string }) => {
    const [isOver, setIsOver] = React.useState(false);

    return (
      <div 
        className="flex flex-col gap-4 w-full min-w-[300px]"
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
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">{label}</h3>
            <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px] bg-slate-100 text-slate-600 font-bold border-none">
              {isLoading ? '...' : getTasksByStatus(status).length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400"
            onClick={() => {
              handleOpenAddDialog();
              setFormData(prev => ({ ...prev, status }));
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className={cn(
          "flex flex-col gap-3 min-h-[500px] transition-all rounded-2xl p-1",
          isOver ? "bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed" : ""
        )}>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : getTasksByStatus(status).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-2xl h-32 bg-slate-50/30">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No tasks here</p>
            </div>
          ) : (
            getTasksByStatus(status).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <Card 
                  className="group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md rounded-2xl overflow-hidden border-slate-200 bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          {task.division}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="h-3 w-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48 shadow-lg">
                          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage Task</div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-sm font-medium py-2" onClick={() => handleOpenEditDialog(task)}>
                            <Edit2 className="mr-2 h-4 w-4 text-slate-400" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-sm font-medium py-2"
                            onClick={() => handleUpdateTaskStatus(task.id, 'todo', task.title)}
                            disabled={task.status === 'todo'}
                          >
                            <Circle className="mr-2 h-4 w-4 text-slate-400" />
                            Move to To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-sm font-medium py-2"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in_progress', task.title)}
                            disabled={task.status === 'in_progress'}
                          >
                            <Timer className="mr-2 h-4 w-4 text-amber-500" />
                            Move to In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-sm font-medium py-2"
                            onClick={() => handleUpdateTaskStatus(task.id, 'done', task.title)}
                            disabled={task.status === 'done'}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                            Move to Done
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-sm font-bold text-rose-600 py-2"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold leading-tight mb-1 text-slate-900">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium">{task.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span className="text-slate-900">{task.progress_percent}%</span>
                      </div>
                      <Progress value={task.progress_percent} className="h-1.5 bg-slate-100" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-white shadow-sm">
                          <AvatarFallback className="text-[8px] font-black bg-slate-100 text-slate-600">
                            {task.pic_id ? (profiles[task.pic_id]?.full_name?.split(' ').map(n => n[0]).join('') || '?') : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-bold text-slate-600">
                          {task.pic_id ? (profiles[task.pic_id]?.full_name?.split(' ')[0] || 'Unassigned') : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Board</h1>
          <p className="text-slate-500 text-sm">Track and manage division programs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest h-10 px-4 transition-all">
            <FilterIcon className="h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm h-10 px-4 text-xs uppercase tracking-widest transition-all active:scale-95"
            onClick={handleOpenAddDialog}
          >
            <Plus className="h-4 w-4" />
            NEW TASK
          </Button>
        </div>
      </div>

      <div className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide">
        <StatusColumn status="todo" label="To Do" />
        <StatusColumn status="in_progress" label="In Progress" />
        <StatusColumn status="done" label="Completed" />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Title</Label>
              <Input 
                id="title" 
                placeholder="Task title" 
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Task description" 
                className="min-h-24 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all"
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Division</Label>
                <Select 
                  value={formData.division} 
                  onValueChange={value => setFormData({ ...formData, division: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {DIVISIONS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">PIC</Label>
                <Select 
                  key={`pic-select-${Object.keys(profiles).length}-${formData.pic_id}`}
                  value={formData.pic_id} 
                  onValueChange={value => setFormData({ ...formData, pic_id: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue>
                      {formData.pic_id !== 'unassigned' && profiles[formData.pic_id] 
                        ? profiles[formData.pic_id].full_name 
                        : 'Unassigned'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {Object.values(profiles).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={value => setFormData({ ...formData, status: value as TaskStatus })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  className="h-11 rounded-xl border-slate-200"
                  value={formData.deadline} 
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Progress</Label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{formData.progress_percent}%</span>
              </div>
              <input 
                id="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={formData.progress_percent}
                onChange={e => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
              />
            </div>

            <DialogFooter className="pt-6 gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 px-8 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
