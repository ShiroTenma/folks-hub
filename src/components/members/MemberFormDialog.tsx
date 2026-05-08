import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserPlus, Tag as TagIcon } from 'lucide-react';
import { type Profile } from '@/lib/supabase';
import { ROLES, DIVISIONS, BATCH_YEARS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MemberFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Profile | null;
  onSave: (formData: any) => Promise<boolean>;
  isSuperAdmin: boolean;
}

export function MemberFormDialog({
  isOpen,
  onOpenChange,
  member,
  onSave,
  isSuperAdmin
}: MemberFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    division: '',
    role: 'member' as Profile['role'],
    status: 'active' as Profile['status'],
    contact: '',
    batch: BATCH_YEARS[0] as string,
    password: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || '',
        student_id: member.student_id || '',
        division: member.division || DIVISIONS[0],
        role: member.role || 'member',
        status: member.status || 'active',
        contact: member.contact || '',
        batch: member.batch || BATCH_YEARS[0],
        password: '',
        tags: (member as any).tags || []
      });
    } else {
      setFormData({
        full_name: '',
        student_id: '',
        division: DIVISIONS[0],
        role: 'member',
        status: 'active',
        contact: '',
        batch: BATCH_YEARS[0],
        password: '',
        tags: []
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.student_id || !formData.division) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#1c1c1c] p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="p-2 bg-[#1c1c1c]/20 rounded-xl">
                <UserPlus className="h-6 w-6 text-[#1c1c1c]" />
              </div>
              {member ? 'Update Profile' : 'New Member'}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">Full Name</Label>
              <Input 
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                className="h-12 rounded-2xl border-[#dcd7cf] font-bold focus:ring-4 focus:ring-[#1c1c1c]/10" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">Student ID</Label>
              <Input 
                value={formData.student_id} 
                onChange={e => setFormData({...formData, student_id: e.target.value})} 
                className="h-12 rounded-2xl border-[#dcd7cf] font-bold" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">Division</Label>
              <Select value={formData.division} onValueChange={v => setFormData({...formData, division: v})}>
                <SelectTrigger className="h-12 rounded-2xl border-[#dcd7cf] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">System Role</Label>
              <Select value={formData.role} onValueChange={(v:any) => setFormData({...formData, role: v})}>
                <SelectTrigger className="h-12 rounded-2xl border-[#dcd7cf] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {ROLES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#dcd7cf]/50">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[#1c1c1c] flex items-center gap-2">
              <TagIcon className="h-3 w-3" /> Assign Categories (Tags)
            </Label>
            <div className="flex flex-wrap gap-2">
              {['Active WP', 'External', 'High Attendance', 'Committee', 'Alumni'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags.includes(tag) 
                      ? formData.tags.filter(t => t !== tag) 
                      : [...formData.tags, tag];
                    setFormData({...formData, tags: newTags});
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border",
                    formData.tags.includes(tag) ? "bg-[#1c1c1c] border-[#1c1c1c] text-white" : "bg-white border-[#dcd7cf] text-[#535366]/40 hover:border-[#dcd7cf]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-[#dcd7cf]/50">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="rounded-2xl font-bold uppercase text-[10px] tracking-widest text-[#535366]/40"
            >
              Cancel
            </Button>
            <Button 
              disabled={isSaving} 
              className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white rounded-2xl h-12 px-10 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-black/10 transition-all active:scale-95"
            >
              {isSaving ? 'Processing...' : member ? 'Update Profile' : 'Add to Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
