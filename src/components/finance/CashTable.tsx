import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, AlertCircle, Info, Copy, ExternalLink, Plus } from 'lucide-react';
import { cn, getPastelColor, getPastelTextColor } from '@/lib/utils';
import { type Profile } from '@/lib/supabase';

interface CashTableProps {
  members: Profile[];
  payments: any[];
  monthsConfig: string[];
  isLoading: boolean;
  canManage: boolean;
  currentUserId: string;
  onAdminEdit: (memberId: string, month: string, current?: any) => void;
  onMemberSubmit: (month: string) => void;
  onViewDetails: (payment: any) => void;
}

export function CashTable({
  members,
  payments,
  monthsConfig,
  isLoading,
  canManage,
  currentUserId,
  onAdminEdit,
  onMemberSubmit,
  onViewDetails
}: CashTableProps) {
  const getPayment = (memberId: string, month: string) => 
    payments.find(p => p.profile_id === memberId && p.month === month);

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 border-none">
            <TableHead className="py-5 pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[280px]">Member Entity</TableHead>
            {monthsConfig.map(month => (
              <TableHead key={month} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center min-w-[120px]">
                {month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={monthsConfig.length + 1} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest">Loading payments data...</TableCell></TableRow>
          ) : members.length === 0 ? (
            <TableRow><TableCell colSpan={monthsConfig.length + 1} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest">No members tracked.</TableCell></TableRow>
          ) : (
            members.map(member => (
              <TableRow key={member.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                <TableCell className="py-4 pl-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-2xl ring-2 ring-white shadow-sm shrink-0">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs uppercase">
                        {member.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate leading-tight mb-0.5">{member.full_name}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black px-1.5 h-4 uppercase tracking-tighter">
                          {member.division}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                {monthsConfig.map(month => {
                  const p = getPayment(member.id, month);
                  return (
                    <TableCell key={month} className="py-4 px-2 text-center">
                      {p ? (
                        <div 
                          className={cn(
                            "mx-auto w-24 py-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-sm group/btn",
                            p.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                            p.status === 'rejected' ? "bg-rose-50 border-rose-100 text-rose-600" :
                            "bg-amber-50 border-amber-100 text-amber-600"
                          )}
                          onClick={() => onViewDetails(p)}
                        >
                          {p.status === 'approved' ? <Check className="h-4 w-4" /> : 
                           p.status === 'rejected' ? <AlertCircle className="h-4 w-4" /> : 
                           <Clock className="h-4 w-4 animate-pulse" />}
                          <span className="text-[9px] font-black uppercase tracking-tighter">
                            {p.status}
                          </span>
                          {canManage && (
                            <button 
                              className="absolute top-1 right-1 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-white/50 rounded-md p-0.5"
                              onClick={(e) => { e.stopPropagation(); onAdminEdit(member.id, month, p); }}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        canManage || member.id === currentUserId ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-24 h-9 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 font-black text-[9px] uppercase tracking-tighter"
                            onClick={() => canManage ? onAdminEdit(member.id, month) : onMemberSubmit(month)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Pay {month}
                          </Button>
                        ) : (
                          <div className="w-24 h-9 rounded-xl border border-dashed border-slate-100 flex items-center justify-center text-slate-200 font-black text-[9px] uppercase tracking-tighter mx-auto">
                            Pending
                          </div>
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
