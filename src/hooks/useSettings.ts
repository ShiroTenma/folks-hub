import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useSettings() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [months, setMonths] = useState<string[]>([]);
  const [ledgerEvents, setLedgerEvents] = useState<string[]>([]);
  const [ledgerPaymentTypes, setLedgerPaymentTypes] = useState<string[]>([]);
  const [taskTags, setTaskTags] = useState<string[]>([]);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      data?.forEach(setting => {
        let parsedValue: any = setting.value;
        try {
          if (typeof setting.value === 'string' && (setting.value.startsWith('[') || setting.value.startsWith('{'))) {
            parsedValue = JSON.parse(setting.value);
          }
        } catch (e) {}

        if (setting.key === 'monthly_cash_fee') setMonthlyFee(Number(setting.value));
        else if (setting.key === 'monthly_cash_months') setMonths(Array.isArray(parsedValue) ? parsedValue : []);
        else if (setting.key === 'ledger_events') setLedgerEvents(Array.isArray(parsedValue) ? parsedValue : []);
        else if (setting.key === 'ledger_payment_types') setLedgerPaymentTypes(Array.isArray(parsedValue) ? parsedValue : []);
        else if (setting.key === 'task_tags') setTaskTags(Array.isArray(parsedValue) ? parsedValue : []);
      });
    } catch (error: any) {
      toast.error('Failed to load settings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'monthly_cash_fee', value: JSON.stringify(monthlyFee) },
        { key: 'monthly_cash_months', value: JSON.stringify(months) },
        { key: 'ledger_events', value: JSON.stringify(ledgerEvents) },
        { key: 'ledger_payment_types', value: JSON.stringify(ledgerPaymentTypes) },
        { key: 'task_tags', value: JSON.stringify(taskTags) }
      ];

      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert({
          key: update.key,
          value: update.value,
          updated_at: new Date().toISOString(),
          updated_by: profile?.id
        });
        if (error) throw error;
      }

      toast.success('Settings updated successfully');
      await fetchSettings();
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    monthlyFee, setMonthlyFee,
    months, setMonths,
    ledgerEvents, setLedgerEvents,
    ledgerPaymentTypes, setLedgerPaymentTypes,
    taskTags, setTaskTags,
    handleSave
  };
}
