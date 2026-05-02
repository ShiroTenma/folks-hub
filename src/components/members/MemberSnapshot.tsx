import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  CheckSquare, 
  ShieldCheck, 
  Mail, 
  Hash,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

interface MemberSnapshotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  financeStats?: {
    totalPaid: number;
    totalDebt: number;
  };
  taskStats?: {
    total: number;
    completed: number;
  };
}

/**
 * Member Profile Snapshot Modal.
 * High-fidelity rapid-view component for institutional personnel audits.
 * Displays vitals, financial standing, and operational task load.
 */
export function MemberSnapshot({ isOpen, onOpenChange, member, financeStats, taskStats }: MemberSnapshotProps) {
  if (!member) return null;

  const roleLabel = ROLES.find(r => r.id === member.role)?.label || 'Personnel';
  const roleColor = ROLES.find(r => r.id === member.role)?.color || 'bg-[#eae6e0] text-[#535366]';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white backdrop-blur-xl">
        <div className="bg-[#1c1c1c] p-10 text-white relative">
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="flex flex-col items-center gap-6 relative z-10">
            <Avatar className="h-28 w-28 rounded-3xl border-4 border-white/10 shadow-2xl ring-8 ring-white/5 transition-transform hover:scale-105 duration-500">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback className="bg-white/10 text-white font-black text-2xl">{member.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-heading font-black tracking-tight italic">
                {member.full_name?.split(' ')[0]} <span className="text-[#535366] not-italic">{member.full_name?.split(' ').slice(1).join(' ')}</span>
              </DialogTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge className={cn("rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none", roleColor)}>
                  {roleLabel}
                </Badge>
                <div className="h-1 w-1 bg-white/20 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{member.division}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10 bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3 p-6 rounded-3xl bg-[#f4f2ef] border border-[#dcd7cf]/50 group hover:border-[#1c1c1c] transition-all duration-500">
              <div className="flex items-center gap-2 text-[#535366]/40">
                <CreditCard className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Financial Status</span>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-tighter">Outstanding Debt</p>
                <p className="text-lg font-heading font-black text-[#1c1c1c] tracking-tighter">Rp {financeStats?.totalDebt.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="space-y-3 p-6 rounded-3xl bg-[#f4f2ef] border border-[#dcd7cf]/50 group hover:border-[#1c1c1c] transition-all duration-500">
              <div className="flex items-center gap-2 text-[#535366]/40">
                <CheckSquare className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Operational Load</span>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-tighter">Active Tasks</p>
                <p className="text-lg font-heading font-black text-[#1c1c1c] tracking-tighter">{taskStats?.total || '0'} Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-[#f4f2ef] flex items-center justify-center border border-[#dcd7cf] group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Institutional Identity</p>
                <p className="text-xs font-bold truncate text-[#1c1c1c]">{member.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-[#f4f2ef] flex items-center justify-center border border-[#dcd7cf] group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                <Hash className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Personnel Tag</p>
                <p className="text-xs font-bold truncate text-[#1c1c1c]">BATCH-{member.batch || '2024'} / {member.uid?.substring(0, 8)}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = `/profile/${member.id}`}
            className="w-full h-14 rounded-2xl bg-[#1c1c1c] text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-95 transition-all group"
          >
            Launch Full Profile <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
