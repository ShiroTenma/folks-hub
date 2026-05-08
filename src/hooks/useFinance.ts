import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { LEDGER_EVENTS, PAYMENT_TYPES } from '@/lib/constants';

export function useFinance() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [events, setEvents] = useState<string[]>(LEDGER_EVENTS);
  const [paymentTypes, setPaymentTypes] = useState<string[]>(PAYMENT_TYPES);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [transRes, budgetRes, settingsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: true }),
        supabase.from('event_budgets').select('*'),
        supabase.from('settings').select('*')
      ]);

      if (transRes.error) throw transRes.error;
      
      setTransactions(transRes.data || []);
      setBudgets(budgetRes.data || []);

      settingsRes.data?.forEach(s => {
        let parsedValue: any = s.value;
        try {
          if (typeof s.value === 'string' && (s.value.startsWith('[') || s.value.startsWith('{'))) {
            parsedValue = JSON.parse(s.value);
          }
        } catch (e) {}

        if (s.key === 'ledger_events') setEvents(Array.isArray(parsedValue) ? parsedValue : []);
        if (s.key === 'ledger_payment_types') setPaymentTypes(Array.isArray(parsedValue) ? parsedValue : []);
      });

    } catch (err: any) {
      toast.error('Failed to load ledger: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time Listeners
    const transChannel = supabase
      .channel('finance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_budgets' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(transChannel);
    };
  }, [fetchData]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Transaction marked as ${status}`);
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Update Status Error:', err);
      toast.error('Update failed: ' + (err.message || 'Check connection'));
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return false;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Transaction deleted successfully');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Delete Transaction Error:', err);
      toast.error('Delete failed: ' + (err.message || 'Check connection'));
      return false;
    }
  };

  const handleDeleteAll = async () => {
    const confirm1 = confirm('WARNING: This will permanently delete ALL transactions in the ledger. This cannot be undone. Proceed?');
    if (!confirm1) return false;
    
    const confirm2 = confirm('FINAL CONFIRMATION: Are you absolutely sure you want to clear the entire ledger?');
    if (!confirm2) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      toast.success('All ledger data has been cleared');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Clear Ledger Error:', err);
      toast.error('Failed to clear ledger: ' + (err.message || 'Check connection'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = [
      'Type', 'Date', 'Month', 'Event', 'Item', 'Debt', 'Credit', 
      'Amount', 'Division', 'From', 'To', 'Place', 'Payment Type', 'Status', 'Notes'
    ];
    
    const rows = transactions.map(t => [
      t.type,
      new Date(t.date).toLocaleDateString(),
      new Date(t.date).toLocaleString('default', { month: 'long' }),
      t.event_type || '',
      t.item_name || t.description,
      t.debt_amount || 0,
      t.credit_amount || 0,
      t.amount,
      t.division_target || t.category,
      t.from_entity || '',
      t.to_entity || '',
      t.location || '',
      t.payment_type || '',
      t.status,
      t.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `folks_finance_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting ledger to CSV...');
  };

  const transactionsWithBalance = useMemo(() => {
    let current = 0;
    return transactions
      .filter(t => t.status === 'approved')
      .map(t => {
        const amt = Number(t.amount);
        current = t.type === 'income' ? current + amt : current - amt;
        return { ...t, running_balance: current };
      }).reverse();
  }, [transactions]);

  const totalBalance = useMemo(() => {
    return transactions
      .filter(t => t.status === 'approved')
      .reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  }, [transactions]);

  const getSourceBalance = (source: string) => {
    return transactions
      .filter(t => t.status === 'approved' && t.payment_type === source)
      .reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  };

  return {
    transactions,
    transactionsWithBalance,
    budgets,
    events,
    paymentTypes,
    isLoading,
    totalBalance,
    fetchData,
    handleStatusUpdate,
    handleDelete,
    handleDeleteAll,
    getSourceBalance,
    exportToCSV
  };
}

