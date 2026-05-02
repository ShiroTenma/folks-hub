import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CashSummaryCards } from '@/components/finance/CashSummaryCards';
import { CashTable } from '@/components/finance/CashTable';
import { CashFormDialogs } from '@/components/finance/CashFormDialogs';
import { CashBulkEditDialog } from '@/components/finance/CashBulkEditDialog';
import { CashFilters } from '@/components/finance/CashFilters';
import { useMonthlyCashPage } from '@/hooks/useMonthlyCashPage';
import { cn } from '@/lib/utils';

export default function MonthlyCashPage() {
  useDocumentTitle('Monthly Cash');
  const {
    user, payments, members, isLoading, monthlyFee, monthsConfig, paymentTypes, totals,
    search, setSearch, currentPage, setCurrentPage, ITEMS_PER_PAGE,
    isEditOpen, setIsEditOpen, isSubmitOpen, setIsSubmitOpen, isDetailOpen, setIsDetailOpen, isBulkOpen, setIsBulkOpen,
    isSubmitting, isUploading, formData, setFormData, selectedPayment, bulkMonths, setBulkMonths,
    canManage, onAdminEdit, onBulkEdit, onSaveBulk, onMemberSubmit, filteredMembers, totalPages, paginatedMembers,
    onSave, onUpload, onViewDetails, ledgerTransactions
  } = useMonthlyCashPage();

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#535366] flex items-center justify-center text-white shadow-xl shadow-[#535366]/20 border border-white/10">
              <Wallet className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-heading font-black text-[#1c1c1c] tracking-tight italic">Monthly <span className="not-italic text-[#535366]">Cash Tracking</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            <Calendar className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Active Period: {monthsConfig[0] || '...'} — {monthsConfig[monthsConfig.length-1] || '...'}</p>
            <div className="h-4 w-px bg-[#dcd7cf]" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1c1c1c]">Rp {monthlyFee.toLocaleString()} / Month</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {canManage && (
            <Button onClick={onBulkEdit} className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-14 px-8 shadow-2xl shadow-black/10 transition-all active:scale-95 uppercase text-[11px] tracking-[0.3em] gap-3">
              <Calendar className="h-4 w-4" /> Bulk Entry
            </Button>
          )}
          <CashFilters search={search} onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }} />
        </div>
      </div>

      <CashSummaryCards totals={totals} memberCount={members.length} />

      <Card className="rounded-[3rem] border-[#dcd7cf] shadow-2xl shadow-[#1c1c1c]/5 overflow-hidden bg-white premium-shadow">
        <CardContent className="p-0">
          <CashTable members={paginatedMembers} payments={payments} monthsConfig={monthsConfig} isLoading={isLoading} canManage={canManage} currentUserId={user?.id || ''} onAdminEdit={onAdminEdit} onMemberSubmit={onMemberSubmit} onViewDetails={onViewDetails} monthlyFee={monthlyFee} />
        </CardContent>
        {totalPages > 1 && (
          <div className="bg-[#f4f2ef]/50 border-t border-[#dcd7cf] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Showing records {(currentPage - 1) * ITEMS_PER_PAGE + 1} — {Math.min(filteredMembers.length, currentPage * ITEMS_PER_PAGE)} of {filteredMembers.length}</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Previous
              </Button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) ? (
                    <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} className={cn("h-12 w-12 rounded-2xl font-black text-[11px] transition-all", currentPage === i + 1 ? "bg-[#1c1c1c] text-white shadow-lg" : "border-[#dcd7cf] text-[#535366] hover:border-[#1c1c1c] hover:text-[#1c1c1c]")} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                  ) : (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) ? <span key={i} className="text-[#dcd7cf] px-1">...</span> : null
                ))}
              </div>
              <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                Next <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <CashFormDialogs 
        isEditOpen={isEditOpen} onEditOpenChange={setIsEditOpen} isSubmitOpen={isSubmitOpen} onSubmitOpenChange={setIsSubmitOpen} isDetailOpen={isDetailOpen} onDetailOpenChange={setIsDetailOpen}
        formData={formData} setFormData={setFormData} paymentTypes={paymentTypes} isSubmitting={isSubmitting} isUploading={isUploading} onSave={onSave} onUpload={onUpload} selectedPayment={selectedPayment}
        onAdminEditFromDetail={() => { setIsDetailOpen(false); onAdminEdit(selectedPayment.profile_id, selectedPayment.month, selectedPayment); }}
        ledgerTransactions={ledgerTransactions}
      />

      <CashBulkEditDialog 
        isOpen={isBulkOpen} onOpenChange={setIsBulkOpen} members={members} monthsConfig={monthsConfig} formData={formData} setFormData={setFormData} bulkMonths={bulkMonths} setBulkMonths={setBulkMonths}
        onSave={onSaveBulk} isSubmitting={isSubmitting} paymentTypes={paymentTypes} isUploading={isUploading} onUpload={onUpload}
      />
    </div>
  );
}
