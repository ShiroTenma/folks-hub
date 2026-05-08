import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, BookOpen, ShieldCheck } from 'lucide-react';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinance } from '@/hooks/useFinance';
import { FinanceFilters } from '@/components/finance/FinanceFilters';
import { FinanceTable } from '@/components/finance/FinanceTable';
import { LedgerImportWizard } from '@/components/finance/LedgerImportWizard';
import { LiquidityHeader } from '@/components/finance/LiquidityHeader';

export function FinancePage() {
  const { profile } = useAuthStore();
  const {
    transactionsWithBalance, events, paymentTypes, isLoading, totalBalance, fetchData,
    handleStatusUpdate, handleDelete, handleDeleteAll, getSourceBalance, exportToCSV
  } = useFinance();

  const sourceBalances = React.useMemo(() => {
    return paymentTypes.reduce((acc, type) => {
      acc[type] = getSourceBalance(type);
      return acc;
    }, {} as Record<string, number>);
  }, [paymentTypes, getSourceBalance]);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  // ... rest of state
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<any>(null);
  const [search, setSearch] = React.useState('');
  const [filterDivision, setFilterDivision] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [filterEvent, setFilterEvent] = React.useState('all');
  const [filterPaymentType, setFilterPaymentType] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 20;

  const isAdmin = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');
  const canApprove = isAdmin;

  const filteredTransactions = transactionsWithBalance.filter(t => {
    const matchesSearch = (t.item_name || t.description || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.event_type || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.from_entity || '').toLowerCase().includes(search.toLowerCase()) ||
                         (t.to_entity || '').toLowerCase().includes(search.toLowerCase());
    const matchesDivision = filterDivision === 'all' || t.division_target === filterDivision || t.category === filterDivision;
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesEvent = filterEvent === 'all' || t.event_type === filterEvent;
    const matchesPayment = filterPaymentType === 'all' || t.payment_type === filterPaymentType;
    return matchesSearch && matchesDivision && matchesType && matchesEvent && matchesPayment;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/10">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-heading font-black text-[#1c1c1c] tracking-tight italic">Financial <span className="not-italic text-[#535366]">Ledger</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Authorized: Finance & Executive Accounts</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {isAdmin && (
            <Button variant="outline" className="rounded-2xl border-2 border-rose-100 text-rose-500 font-black text-[11px] uppercase tracking-[0.2em] h-14 px-8 shadow-xl shadow-rose-100/20 hover:bg-rose-500 hover:text-white transition-all gap-3" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4" /> Reset Ledger
            </Button>
          )}
          {isAdmin && (
            <Button className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-14 px-8 shadow-2xl shadow-black/10 transition-all active:scale-95 uppercase text-[11px] tracking-[0.3em] gap-3" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4" /> New Transaction
            </Button>
          )}
        </div>
      </div>

      <LiquidityHeader totalBalance={totalBalance} sourceBalances={sourceBalances} />

      <Card className="rounded-[3rem] border-[#dcd7cf] shadow-2xl shadow-[#1c1c1c]/5 overflow-hidden bg-white premium-shadow">
        <FinanceFilters 
          search={search} onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          filterType={filterType} onFilterTypeChange={(v) => { setFilterType(v); setCurrentPage(1); }}
          filterEvent={filterEvent} onFilterEventChange={(v) => { setFilterEvent(v); setCurrentPage(1); }}
          filterDivision={filterDivision} onFilterDivisionChange={(v) => { setFilterDivision(v); setCurrentPage(1); }}
          filterPaymentType={filterPaymentType} onFilterPaymentTypeChange={(v) => { setFilterPaymentType(v); setCurrentPage(1); }}
          events={events} paymentTypes={paymentTypes} onImportExcel={() => setIsImportOpen(true)} onExportCSV={exportToCSV}
        />
        <FinanceTable 
          transactions={paginatedTransactions} isLoading={isLoading} currentPage={currentPage} ITEMS_PER_PAGE={ITEMS_PER_PAGE} totalPages={totalPages}
          onPageChange={setCurrentPage} canApprove={canApprove} onStatusUpdate={handleStatusUpdate} onDelete={handleDelete} onEdit={(t) => { setEditingTransaction(t); setIsFormOpen(true); }}
        />
      </Card>

      <TransactionForm 
        isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
        onSuccess={() => { setIsFormOpen(false); setEditingTransaction(null); fetchData(); }}
        editingTransaction={editingTransaction}
      />

      <LedgerImportWizard isOpen={isImportOpen} onOpenChange={setIsImportOpen} onImportComplete={fetchData} />
    </div>
  );
}
