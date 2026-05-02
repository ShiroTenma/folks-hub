import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PAYMENT_TYPES } from '@/lib/constants';

export function useMonthlyCash() {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [monthsConfig, setMonthsConfig] = useState<string[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>(PAYMENT_TYPES);
  const [ledgerTransactions, setLedgerTransactions] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: settingsData } = await supabase.from('settings').select('*');
      settingsData?.forEach(s => {
        let parsedValue: any = s.value;
        try {
          if (typeof s.value === 'string' && (s.value.startsWith('[') || s.value.startsWith('{'))) {
            parsedValue = JSON.parse(s.value);
          }
        } catch (e) {}

        if (s.key === 'monthly_cash_fee') setMonthlyFee(Number(s.value));
        if (s.key === 'monthly_cash_months') setMonthsConfig(Array.isArray(parsedValue) ? parsedValue : []);
        if (s.key === 'ledger_payment_types') setPaymentTypes(Array.isArray(parsedValue) ? parsedValue : []);
      });

      const [payRes, memRes, ledgerRes] = await Promise.all([
        supabase.from('monthly_cash').select('*'),
        supabase.from('profiles').select('*').order('full_name'),
        supabase.from('transactions').select('id, date, amount, item_name, type').eq('status', 'approved').order('date', { ascending: false })
      ]);

      if (payRes.error) throw payRes.error;
      if (memRes.error) throw memRes.error;

      setPayments(payRes.data || []);
      setMembers(memRes.data || []);
      setLedgerTransactions(ledgerRes.data || []);
    } catch (error: any) {
      console.error('[useMonthlyCash] Error:', error);
      toast.error('Failed to load cash data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const cashChannel = supabase.channel('cash_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_cash' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(cashChannel); };
  }, [fetchData]);

  const handleSavePayment = async (formData: any) => {
    try {
      const { error } = await supabase.from('monthly_cash').upsert({
        profile_id: formData.profile_id,
        month: formData.month,
        amount: formData.amount,
        status: formData.status,
        payment_type: formData.payment_type,
        proof_url: formData.proof_url || null,
        notes: formData.notes || null,
        ledger_id: formData.ledger_id || null,
        payment_date: formData.payment_date || null
      }, { onConflict: 'profile_id, month' });

      if (error) throw error;
      toast.success(formData.status === 'pending' ? 'Payment submitted for review' : 'Payment recorded');
      await fetchData();
      return true;
    } catch (error: any) {
      toast.error('Save failed: ' + error.message);
      return false;
    }
  };

  const handleUploadReceipt = async (file: File, profileId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `monthly-cash/${profileId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath);
      return publicUrl;
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
      return null;
    }
  };

  const totals = useMemo(() => {
    const collected = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.amount), 0);
    const target = members.length * monthsConfig.length * monthlyFee;
    return { collected, target, pending: Math.max(0, target - collected) };
  }, [payments, members, monthsConfig, monthlyFee]);

  const handleBulkSave = async (profileId: string, months: string[], paymentData: any) => {
    try {
      const updates = months.map(month => ({
        profile_id: profileId,
        month,
        amount: paymentData.amount,
        status: paymentData.status,
        payment_type: paymentData.payment_type,
        proof_url: paymentData.proof_url || null,
        notes: paymentData.notes || null,
        ledger_id: paymentData.ledger_id || null,
        payment_date: paymentData.payment_date || null
      }));

      const { error } = await supabase.from('monthly_cash').upsert(updates, { onConflict: 'profile_id, month' });
      if (error) throw error;
      
      toast.success(`Recorded ${months.length} months of payment`);
      await fetchData();
      return true;
    } catch (error: any) {
      toast.error('Bulk save failed: ' + error.message);
      return false;
    }
  };

  return {
    payments, members, isLoading, monthlyFee, monthsConfig, paymentTypes, totals, ledgerTransactions,
    fetchData, handleSavePayment, handleUploadReceipt, handleBulkSave
  };
}
