import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, MoreVertical, CheckCircle2, XCircle, FileText, Tag, CreditCard, Trash2, Edit2, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn, getPastelColor, getPastelTextColor } from '@/lib/utils';

interface FinanceTableRowProps {
  transaction: any;
  index: number;
  canApprove: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (t: any) => void;
}

export function FinanceTableRow({ transaction: t, index, canApprove, onStatusUpdate, onDelete, onEdit }: FinanceTableRowProps) {
  return (
    <TableRow className="group hover:bg-[#eae6e0]/30 transition-all duration-300 border-[#dcd7cf]/30">
      <TableCell className="py-6 pl-12 text-[11px] font-black text-[#535366]/40">{index.toString().padStart(3, '0')}</TableCell>
      
      <TableCell className="py-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:rotate-12",
            t.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
          )}>
            {t.type === 'income' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
          </div>
          <div>
            <p className={cn("text-xs font-black uppercase tracking-[0.2em]", t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>{t.type}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-[#535366]/40 uppercase tracking-widest">
              <Calendar className="h-3 w-3" /> {new Date(t.date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="min-w-[240px]">
        <div className="space-y-2">
          <p className="text-base font-heading font-black italic text-[#1c1c1c] leading-none">{t.item_name || t.description}</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#535366]/5 text-[#535366] border-none text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">{t.event_type || 'General Ledger'}</Badge>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-[#535366]/40 uppercase tracking-widest">
            <span className="w-6 opacity-40">FR:</span>
            <span className="text-[#1c1c1c]/60 truncate max-w-[120px]">{t.from_entity || 'Organization'}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[#535366]/40 uppercase tracking-widest">
            <span className="w-6 opacity-40">TO:</span>
            <span className="text-[#1c1c1c] font-black truncate max-w-[120px]">{t.to_entity || 'Vault'}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right font-heading font-black text-rose-600 text-base italic">
        {t.type === 'expense' ? `(Rp ${Number(t.amount).toLocaleString()})` : '—'}
      </TableCell>
      
      <TableCell className="text-right font-heading font-black text-emerald-600 text-base italic">
        {t.type === 'income' ? `Rp ${Number(t.amount).toLocaleString()}` : '—'}
      </TableCell>

      <TableCell className="text-right">
        <div className="inline-block px-4 py-2 rounded-2xl bg-[#535366]/5 border border-[#535366]/10">
          <span className="font-heading font-black text-[#1c1c1c] text-sm">Rp {Number(t.running_balance).toLocaleString()}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          title={`Traceability: System updated on ${new Date(t.updated_at).toLocaleString()}`}
          className={cn(
            "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border-none shadow-sm cursor-help",
            t.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
            t.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
          )}>{t.status}</Badge>
      </TableCell>

      <TableCell className="text-right pr-12">
        <div className="flex items-center justify-end gap-3">
          {t.receipt_url && (
            <Button size="icon" variant="outline" className="h-11 w-11 rounded-[1rem] border-2 border-[#dcd7cf] text-[#535366] hover:bg-[#1c1c1c] hover:text-white transition-all shadow-xl shadow-black/5" onClick={() => window.open(t.receipt_url, '_blank')}>
              <FileText className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-11 w-11 flex items-center justify-center rounded-[1rem] bg-white border-2 border-[#dcd7cf] text-[#535366] hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-all shadow-xl shadow-black/5">
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-[1.5rem] w-64 p-3 border-[#dcd7cf] shadow-2xl mt-2 bg-white/95 backdrop-blur-xl">
              {canApprove && (
                <>
                  <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40">Administrative Operations</div>
                  <DropdownMenuSeparator className="bg-[#eae6e0] my-2" />
                  <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer focus:bg-[#eae6e0] group" onClick={() => onEdit(t)}>
                    <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center text-[#535366] group-focus:bg-[#1c1c1c] group-focus:text-white transition-colors"><Edit2 className="h-4 w-4" /></div>
                    <span className="text-sm font-bold text-[#1c1c1c]">Adjust Parameters</span>
                  </DropdownMenuItem>
                  {t.status === 'pending' && (
                    <>
                      <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer focus:bg-emerald-50 group" onClick={() => onStatusUpdate(t.id, 'approved')}>
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-focus:bg-emerald-600 group-focus:text-white transition-colors"><CheckCircle2 className="h-4 w-4" /></div>
                        <span className="text-sm font-bold text-emerald-900">Finalize Approval</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer focus:bg-rose-50 group" onClick={() => onStatusUpdate(t.id, 'rejected')}>
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-focus:bg-rose-600 group-focus:text-white transition-colors"><XCircle className="h-4 w-4" /></div>
                        <span className="text-sm font-bold text-rose-900">Decline Entry</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#eae6e0] my-2" />
                </>
              )}
              <DropdownMenuItem className="gap-3 py-4 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 group" onClick={() => onDelete(t.id)}>
                <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center group-focus:bg-rose-600 group-focus:text-white transition-colors"><Trash2 className="h-4 w-4" /></div>
                <span className="text-sm font-bold">Purge Record</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
