import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FinanceTableRow } from './FinanceTableRow';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
  transactions, isLoading, currentPage, ITEMS_PER_PAGE, totalPages, onPageChange, canApprove, onStatusUpdate, onDelete, onEdit
}: FinanceTableProps) {
  const tableHeaders = ['#', 'Chronicle', 'Entity Details', 'Origin / Target', 'Debit', 'Credit', 'Net Position', 'Status', 'Actions'];

  return (
    <>
      <div className="overflow-x-auto custom-scrollbar">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1c1c1c] border-none hover:bg-[#1c1c1c]">
                {tableHeaders.map((h, i) => (
                  <TableHead key={h} className={cn(
                    "text-[10px] font-black uppercase tracking-[0.4em] py-8 text-white/50",
                    i === 0 && "pl-12 w-16",
                    (h === 'Debit' || h === 'Credit' || h === 'Actions') && "text-right",
                    h === 'Net Position' && "text-right text-[#535366]",
                    i === tableHeaders.length - 1 && "pr-12"
                  )}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-96 bg-white">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-8 w-8 rounded-full border-4 border-[#1c1c1c] border-t-transparent animate-spin" />
                      <span className="text-[#535366]/60 font-black uppercase tracking-[0.3em] text-xs">Compiling Financial Ledger...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-96 bg-white">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-16 w-16 bg-[#f4f2ef] rounded-3xl flex items-center justify-center text-[#dcd7cf]">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[#1c1c1c] font-black uppercase tracking-[0.2em] text-sm">No ledger records found</p>
                        <p className="text-[#535366]/40 text-xs mt-1">Transactions will appear here once recorded.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t, i) => (
                  <FinanceTableRow
                    key={t.id} transaction={t} index={(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                    canApprove={canApprove} onStatusUpdate={onStatusUpdate} onDelete={onDelete} onEdit={onEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="bg-[#f4f2ef]/50 border-t border-[#dcd7cf] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Displaying entries {(currentPage - 1) * ITEMS_PER_PAGE + 1} — {Math.min(transactions.length, currentPage * ITEMS_PER_PAGE)} of {transactions.length}</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) ? (
                  <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} className={cn("h-12 w-12 rounded-2xl font-black text-[11px] transition-all", currentPage === i + 1 ? "bg-[#1c1c1c] text-white" : "border-[#dcd7cf] text-[#535366] hover:border-[#1c1c1c] hover:text-[#1c1c1c]")} onClick={() => onPageChange(i + 1)}>{i + 1}</Button>
                ) : (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) ? <span key={i} className="text-[#dcd7cf] px-1">...</span> : null
              ))}
            </div>
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              Next <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}