import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, AlertCircle, Plus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  monthlyFee: number;
}

export function CashTable({
  members, payments, monthsConfig, isLoading, canManage, currentUserId, onAdminEdit, onMemberSubmit, onViewDetails, monthlyFee
}: CashTableProps) {
  const getPayment = (memberId: string, month: string) => 
    payments.find(p => p.profile_id === memberId && p.month === month);

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1c1c1c] border-none hover:bg-[#1c1c1c]">
            <TableHead className="py-8 pl-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/50 w-[320px] sticky left-0 z-20 bg-[#1c1c1c] border-r-2 border-white/5 flex items-center gap-4">
              {canManage && (
                <div className="h-5 w-5 rounded-lg border-2 border-white/20 bg-transparent flex items-center justify-center cursor-pointer hover:border-white/40 transition-all">
                  <div className="h-2 w-2 bg-white rounded-full opacity-0" />
                </div>
              )}
              Member Entity
            </TableHead>
            {monthsConfig.map(month => (
              <TableHead key={month} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 text-center min-w-[140px]">
                {month}
              </TableHead>
            ))}
            <TableHead className="text-[10px] font-black uppercase tracking-[0.4em] text-white text-center">Summary</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 text-center pr-12">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={monthsConfig.length + 3} className="h-96 text-center text-[#535366]/40 font-black uppercase tracking-[0.3em] text-xs bg-white">Syncing Financial Records...</TableCell></TableRow>
          ) : members.length === 0 ? (
            <TableRow><TableCell colSpan={monthsConfig.length + 3} className="h-96 text-center text-[#535366]/40 font-black uppercase tracking-[0.3em] text-xs bg-white">No entities identified.</TableCell></TableRow>
          ) : (
            members.map(member => (
              <TableRow key={member.id} className="group hover:bg-[#eae6e0]/30 transition-all duration-300 border-[#dcd7cf]/30">
                <TableCell className="py-6 pl-12 sticky left-0 z-10 bg-white/95 backdrop-blur-md border-r-2 border-[#dcd7cf]/30 group-hover:bg-[#eae6e0]/80 transition-colors">
                  <div className="flex items-center gap-5">
                    {canManage && (
                      <div className="shrink-0 h-5 w-5 rounded-lg border-2 border-[#dcd7cf] bg-white flex items-center justify-center cursor-pointer hover:border-[#1c1c1c] transition-all">
                        <div className="h-2 w-2 bg-[#1c1c1c] rounded-full opacity-0" />
                      </div>
                    )}
                    <div className="relative">
                      <Avatar className="h-12 w-12 rounded-[1rem] ring-4 ring-white shadow-xl shrink-0 transition-transform group-hover:scale-110 duration-500">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="bg-[#eae6e0] text-[#1c1c1c] font-black text-xs">
                          {member.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-black text-[#1c1c1c] text-base truncate leading-tight italic">{member.full_name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="bg-[#535366]/10 text-[#535366] border-none text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {member.division}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                {monthsConfig.map(month => {
                  const p = getPayment(member.id, month);
                  return (
                    <TableCell key={month} className="py-6 px-3 text-center">
                      {p ? (
                        <div 
                          className={cn(
                            "mx-auto w-28 py-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:-translate-y-1 relative group/btn",
                            p.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-100/50 hover:shadow-lg" :
                            p.status === 'rejected' ? "bg-rose-50 border-rose-100 text-rose-700 shadow-rose-100/50 hover:shadow-lg" :
                            "bg-amber-50 border-amber-100 text-amber-700 shadow-amber-100/50 hover:shadow-lg"
                          )}
                          onClick={() => onViewDetails(p)}
                        >
                          <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center transition-colors", p.status === 'approved' ? "bg-emerald-500 text-white" : p.status === 'rejected' ? "bg-rose-500 text-white" : "bg-amber-500 text-white")}>
                            {p.status === 'approved' ? <Check className="h-3.5 w-3.5" /> : 
                             p.status === 'rejected' ? <AlertCircle className="h-3.5 w-3.5" /> : 
                             <Clock className="h-3.5 w-3.5 animate-pulse" />}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                            {p.status}
                          </span>
                          {p.status === 'approved' && Number(p.amount) !== monthlyFee && (
                            <div 
                              className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-amber-500 rounded-full flex items-center justify-center border border-white shadow-lg cursor-help"
                              title={`Reconciliation Required: Rp ${Number(p.amount).toLocaleString()} paid vs Rp ${monthlyFee.toLocaleString()} expected`}
                            >
                              <Info className="h-2 w-2 text-white" />
                            </div>
                          )}
                          {canManage && (
                            <button 
                              className="absolute -top-2 -right-2 opacity-0 group-hover/btn:opacity-100 transition-all bg-[#1c1c1c] text-white rounded-lg p-1.5 shadow-lg scale-75 group-hover/btn:scale-100"
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
                            className="w-28 h-12 rounded-2xl border-2 border-dashed border-[#dcd7cf] text-[#535366]/40 hover:border-[#535366] hover:bg-white hover:text-[#535366] font-black text-[9px] uppercase tracking-widest transition-all group/add"
                            onClick={() => canManage ? onAdminEdit(member.id, month) : onMemberSubmit(month)}
                          >
                            <Plus className="h-4 w-4 mr-1 transition-transform group-hover/add:rotate-90" /> {month}
                          </Button>
                        ) : (
                          <div className="w-28 h-12 rounded-2xl bg-[#f4f2ef]/50/50 flex flex-col items-center justify-center opacity-20 mx-auto">
                            <Clock className="h-4 w-4" />
                            <span className="text-[8px] font-black uppercase mt-1">Pending</span>
                          </div>
                        )
                      )}
                    </TableCell>
                  );
                })}
                
                <TableCell className="text-center">
                  <div className="inline-flex flex-col items-center px-4 py-2 rounded-2xl bg-[#535366]/5 border border-[#535366]/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#535366]/40 mb-1">Paid</span>
                    <span className="font-heading font-black text-[#1c1c1c] text-sm">Rp {(payments.filter(p => p.profile_id === member.id && p.status === 'approved').reduce((sum, p) => sum + Number(p.amount), 0)).toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center pr-12">
                  <div className="inline-flex flex-col items-center px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100">
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Debt</span>
                    <span className="font-heading font-black text-rose-600 text-sm italic">Rp {Math.max(0, (monthsConfig.length * monthlyFee) - (payments.filter(p => p.profile_id === member.id && p.status === 'approved').reduce((sum, p) => sum + Number(p.amount), 0))).toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
