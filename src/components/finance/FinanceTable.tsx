import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText,
  Tag,
  CreditCard,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn, getPastelColor, getPastelTextColor } from '@/lib/utils';

interface FinanceTableProps {
  transactions: any[];
  isLoading: boolean;
  currentPage: number;
  ITEMS_PER_PAGE: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canApprove: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (t: any) => void;
}

export function FinanceTable({
  transactions,
  isLoading,
  currentPage,
  ITEMS_PER_PAGE,
  totalPages,
  onPageChange,
  canApprove,
  onStatusUpdate,
  onDelete,
  onEdit
}: FinanceTableProps) {
  return (
    <>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-none">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 pl-4 md:pl-8 w-12">#</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Type & Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Event & Item</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">From / To</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Debt</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Credit</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right">Running Balance</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Details</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-4 md:pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest">Loading ledger data...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest italic">No matching records found.</TableCell></TableRow>
              ) : (
                transactions.map((t, index) => (
                  <TableRow key={t.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                    <TableCell className="py-5 pl-4 md:pl-8 text-[10px] font-black text-slate-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell className="py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                          t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm capitalize">{t.type}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1">
                        <p 
                          className="text-sm font-bold leading-tight line-clamp-2 px-2 py-0.5 rounded-lg w-fit"
                          style={{ backgroundColor: getPastelColor(t.item_name || t.description || ''), color: getPastelTextColor(t.item_name || t.description || '') }}
                        >
                          {t.item_name || t.description}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-[9px] font-black uppercase tracking-tighter border-slate-200 rounded px-1.5 whitespace-nowrap"
                          style={{ backgroundColor: getPastelColor(t.event_type || 'General'), color: getPastelTextColor(t.event_type || 'General'), borderColor: 'transparent' }}
                        >
                          {t.event_type || 'General'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="text-slate-300">FR:</span> {t.from_entity || '-'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                          <span className="text-slate-300">TO:</span> {t.to_entity || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600 text-sm whitespace-nowrap">
                      {t.type === 'expense' ? `(Rp ${Number(t.amount).toLocaleString()})` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 text-sm whitespace-nowrap">
                      {t.type === 'income' ? `Rp ${Number(t.amount).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900 whitespace-nowrap bg-indigo-50/20">
                      Rp {Number(t.running_balance).toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <Tag className="h-3 w-3" />
                          {t.division_target || t.category}
                        </div>
                        {t.payment_type && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <CreditCard className="h-3 w-3" />
                            {t.payment_type}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        t.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                        t.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4 md:pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {t.receipt_url && (
                          <Button 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9 rounded-xl text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors"
                            onClick={() => window.open(t.receipt_url, '_blank')}
                            title="View Receipt"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl w-56 shadow-2xl p-2 border-slate-100">
                            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Ops</div>
                            <DropdownMenuSeparator />
                            {canApprove && (
                              <>
                                <DropdownMenuItem 
                                  className="gap-2 py-3 rounded-xl cursor-pointer text-indigo-600 font-bold focus:bg-indigo-50" 
                                  onClick={() => onEdit(t)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Adjust & Review
                                </DropdownMenuItem>
                                {t.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-emerald-600 font-bold focus:bg-emerald-50" onClick={() => onStatusUpdate(t.id, 'approved')}>
                                      <CheckCircle2 className="h-4 w-4" />
                                      Approve Record
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-rose-600 font-bold focus:bg-rose-50" onClick={() => onStatusUpdate(t.id, 'rejected')}>
                                      <XCircle className="h-4 w-4" />
                                      Reject Record
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-rose-600 font-bold focus:bg-rose-50" onClick={() => onDelete(t.id)}>
                              <Trash2 className="h-4 w-4" />
                              Delete Permanent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing {Math.min(transactions.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to {Math.min(transactions.length, currentPage * ITEMS_PER_PAGE)} of {transactions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white transition-all disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl font-bold text-[10px] transition-all",
                        currentPage === page ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100" : "border-slate-200 hover:bg-white"
                      )}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-slate-300">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-9 font-bold text-[10px] uppercase tracking-widest px-4 hover:bg-white transition-all disabled:opacity-50"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
