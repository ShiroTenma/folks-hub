import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Tag as TagIcon } from 'lucide-react';
import { DIVISIONS } from '@/lib/constants';
import { type Task, type Profile } from '@/lib/supabase';
import { type TaskStatus } from '@/hooks/useTasks';

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  profiles: Record<string, Profile>;
  isSubmitting: boolean;
  onSave: (formData: any) => Promise<boolean>;
  initialStatus?: TaskStatus;
}

const TASK_TAGS = ['Agenda', 'Proker', 'Meeting', 'Urgent', 'Regular'];

export function TaskFormDialog({
  isOpen,
  onOpenChange,
  task,
  profiles,
  isSubmitting,
  onSave,
  initialStatus
}: TaskFormDialogProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    division: DIVISIONS[0] as string,
    progress_percent: 0,
    deadline: '',
    pic_id: 'unassigned',
    tags: [] as string[]
  });

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        division: task.division,
        progress_percent: task.progress_percent,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        pic_id: task.pic_id || 'unassigned',
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: initialStatus || 'todo',
        division: DIVISIONS[0],
        progress_percent: 0,
        deadline: new Date().toISOString().split('T')[0],
        pic_id: 'unassigned',
        tags: []
      });
    }
  }, [task, initialStatus, isOpen]);

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <Plus className="h-5 w-5 text-indigo-600" />
              </div>
              {task ? 'Edit Task Details' : 'Publish New Task'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title</Label>
              <Input 
                required 
                className="rounded-xl border-slate-100 h-12 font-bold focus-visible:ring-indigo-500" 
                placeholder="e.g., Design Social Media Assets"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Division</Label>
                <Select value={formData.division} onValueChange={v => setFormData({...formData, division: v})}>
                  <SelectTrigger className="rounded-xl border-slate-100 h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as TaskStatus})}>
                  <SelectTrigger className="rounded-xl border-slate-100 h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
              <Textarea 
                className="rounded-xl border-slate-100 min-h-[100px] font-medium focus-visible:ring-indigo-500" 
                placeholder="Describe the task goals and requirements..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PIC / Owner</Label>
                <Select value={formData.pic_id} onValueChange={v => setFormData({...formData, pic_id: v})}>
                  <SelectTrigger className="rounded-xl border-slate-100 h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {Object.values(profiles).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</Label>
                <Input 
                  type="date" 
                  className="rounded-xl border-slate-100 h-12 font-bold" 
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tags & Labels</Label>
              <div className="flex flex-wrap gap-2">
                {TASK_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                    className={cn(
                      "px-3 py-1.5 rounded-lg cursor-pointer transition-all border-slate-200 text-[10px] font-bold uppercase tracking-tight",
                      formData.tags.includes(tag) ? "bg-indigo-600 shadow-md shadow-indigo-100" : "bg-white hover:bg-slate-50"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    <TagIcon className="h-3 w-3 mr-1.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Progress</Label>
              <Input 
                type="number" 
                className="w-20 rounded-lg border-slate-200 h-9 font-black text-center" 
                min="0" max="100"
                value={formData.progress_percent}
                onChange={e => setFormData({...formData, progress_percent: parseInt(e.target.value) || 0})}
              />
              <span className="text-[10px] font-black text-slate-400">%</span>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl h-12 px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (task ? 'Save Changes' : 'Publish Task')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
