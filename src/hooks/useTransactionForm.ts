import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { DIVISIONS } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';

export function useTransactionForm(onSuccess: () => void, editingTransaction?: any) {
  const { user, profile } = useAuthStore();
  const { ledgerEvents, ledgerPaymentTypes } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    event_type: '',
    item_name: '',
    division_target: profile?.division || DIVISIONS[0],
    from_entity: '',
    to_entity: '',
    location: '',
    payment_type: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    admin_adjustment_note: ''
  });

  useEffect(() => {
    if (ledgerEvents.length > 0 && !formData.event_type && !editingTransaction) {
      setFormData(prev => ({ ...prev, event_type: ledgerEvents[0] }));
    }
    if (ledgerPaymentTypes.length > 0 && !formData.payment_type && !editingTransaction) {
      setFormData(prev => ({ ...prev, payment_type: ledgerPaymentTypes[0] }));
    }
  }, [ledgerEvents, ledgerPaymentTypes, editingTransaction]);

  useEffect(() => {
    if (editingTransaction) {
      const type = editingTransaction.type || (editingTransaction.credit_amount > 0 ? 'income' : 'expense');
      const amount = editingTransaction.amount || (type === 'income' ? editingTransaction.credit_amount : editingTransaction.debt_amount);
      
      setFormData({
        ...editingTransaction,
        type,
        amount: Number(amount),
        item_name: editingTransaction.item_name || editingTransaction.description || '',
        division_target: editingTransaction.division_target || editingTransaction.category || '',
        date: new Date(editingTransaction.date).toISOString().split('T')[0],
        from_entity: editingTransaction.from_entity || '',
        to_entity: editingTransaction.to_entity || '',
        location: editingTransaction.location || '',
        payment_type: editingTransaction.payment_type || '',
        notes: editingTransaction.notes || '',
        receipt_url: editingTransaction.receipt_url || '',
        admin_adjustment_note: editingTransaction.admin_adjustment_note || ''
      });
    }
  }, [editingTransaction]);

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `receipts/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, receipt_url: publicUrl }));
      toast.success('Receipt uploaded successfully');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const debt_amount = formData.type === 'expense' ? formData.amount : 0;
      const credit_amount = formData.type === 'income' ? formData.amount : 0;
      const autoApprove = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin') || profile?.division === 'BPH';

      const { running_balance, id, created_at, ...cleanData } = formData as any;

      const payload = {
        ...cleanData,
        description: formData.item_name,
        category: formData.division_target,
        status: autoApprove ? 'approved' : 'pending',
        approved_by: autoApprove ? user?.id : null,
        debt_amount,
        credit_amount
      };

      const { error } = editingTransaction?.id 
        ? await supabase.from('transactions').update(payload).eq('id', editingTransaction.id)
        : await supabase.from('transactions').insert([payload]);

      if (error) throw error;
      toast.success(editingTransaction?.id ? 'Updated successfully' : 'Submitted successfully');
      onSuccess();
    } catch (err: any) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, setFormData, isSubmitting, isUploading, handleFileUpload, handleSubmit, ledgerEvents, ledgerPaymentTypes
  };
}
