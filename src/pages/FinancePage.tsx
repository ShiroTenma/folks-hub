import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinance } from '@/hooks/useFinance';
import { FinanceSummaryCards } from '@/components/finance/FinanceSummaryCards';
import { FinanceFilters } from '@/components/finance/FinanceFilters';
import { FinanceTable } from '@/components/finance/FinanceTable';

export function FinancePage() {
  const { profile } = useAuthStore();
  const {
    transactionsWithBalance,
    events,
    paymentTypes,
    isLoading,
    totalBalance,
    fetchData,
    handleStatusUpdate,
    handleDelete,
    handleDeleteAll,
    getSourceBalance,
    exportToCSV,
    processImport
  } = useFinance();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<any>(null);
  const [search, setSearch] = React.useState('');
  const [filterDivision, setFilterDivision] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [filterEvent, setFilterEvent] = React.useState('all');
  const [filterPaymentType, setFilterPaymentType] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 20;

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isExecutiveBoard = profile?.division === 'ExecutiveBoard';
  const canApprove = isAdmin || isExecutiveBoard;

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
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 text-sm font-medium">Detailed organization cashflow and event accounting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="rounded-xl border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-sm hover:bg-rose-50 gap-2"
              onClick={handleDeleteAll}
            >
              <Trash2 className="h-4 w-4" />
              Delete All Data
            </Button>
          )}
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            ADD TRANSACTION
          </Button>
        </div>
      </div>

      <FinanceSummaryCards 
        totalBalance={totalBalance}
        paymentTypes={paymentTypes}
        getSourceBalance={getSourceBalance}
      />

      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
        <FinanceFilters 
          search={search}
          onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          filterType={filterType}
          onFilterTypeChange={(v) => { setFilterType(v); setCurrentPage(1); }}
          filterEvent={filterEvent}
          onFilterEventChange={(v) => { setFilterEvent(v); setCurrentPage(1); }}
          filterDivision={filterDivision}
          onFilterDivisionChange={(v) => { setFilterDivision(v); setCurrentPage(1); }}
          filterPaymentType={filterPaymentType}
          onFilterPaymentTypeChange={(v) => { setFilterPaymentType(v); setCurrentPage(1); }}
          events={events}
          paymentTypes={paymentTypes}
          onImportExcel={() => document.getElementById('excel-input')?.click()}
          onProcessImport={(e) => processImport(e, canApprove)}
          onExportCSV={exportToCSV}
        />
        <FinanceTable 
          transactions={paginatedTransactions}
          isLoading={isLoading}
          currentPage={currentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          canApprove={canApprove}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          onEdit={(t) => { setEditingTransaction(t); setIsFormOpen(true); }}
        />
      </Card>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }} 
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
          fetchData();
        }}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
