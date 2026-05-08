import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useSplitBill() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [billsRes, memRes] = await Promise.all([
        supabase
          .from('split_bills')
          .select('*, creator:profiles!created_by(full_name, avatar_url), split_bill_items(*, profiles(full_name, avatar_url))')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('full_name')
      ]);

      if (billsRes.error) throw billsRes.error;
      if (memRes.error) throw memRes.error;

      setBills(billsRes.data || []);
      setMembers(memRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load split bills: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createBill = async (data: { title: string, description: string, total_amount: number, items: { profile_id: string, item_name: string, amount: number }[] }) => {
    const { data: billData, error: billError } = await supabase
      .from('split_bills')
      .insert({
        title: data.title,
        description: data.description,
        total_amount: data.total_amount,
        created_by: user?.id
      })
      .select()
      .single();

    if (billError) throw billError;

    const items = data.items.map(item => ({
      bill_id: billData.id,
      profile_id: item.profile_id,
      amount: item.amount,
      item_name: item.item_name,
      status: 'pending'
    }));

    const { error: itemsError } = await supabase.from('split_bill_items').insert(items);
    if (itemsError) throw itemsError;

    await fetchData();
  };

  const updateBill = async (billId: string, data: { title: string, description: string, total_amount: number, items: { profile_id: string, item_name: string, amount: number, id?: string }[] }) => {
    // 1. Update the main bill
    const { error: billError } = await supabase
      .from('split_bills')
      .update({
        title: data.title,
        description: data.description,
        total_amount: data.total_amount
      })
      .eq('id', billId);

    if (billError) throw billError;

    // 2. Advanced Synchronization
    // Fetch current items to determine what to add, update, or delete
    const { data: currentItems } = await supabase.from('split_bill_items').select('id').eq('bill_id', billId);
    const currentItemIds = currentItems?.map(i => i.id) || [];
    const incomingItemIds = data.items.map(i => i.id).filter(Boolean) as string[];
    
    // Items to delete (present in DB but not in incoming data)
    const toDelete = currentItemIds.filter(id => !incomingItemIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('split_bill_items').delete().in('id', toDelete);
    }
    
    // Items to update and insert
    for (const item of data.items) {
      if (item.id) {
        // Update existing item
        await supabase
          .from('split_bill_items')
          .update({
            profile_id: item.profile_id,
            item_name: item.item_name,
            amount: item.amount
          })
          .eq('id', item.id);
      } else {
        // Insert new item
        await supabase
          .from('split_bill_items')
          .insert({
            bill_id: billId,
            profile_id: item.profile_id,
            item_name: item.item_name,
            amount: item.amount,
            status: 'pending'
          });
      }
    }

    await fetchData();
  };

  const deleteBill = async (billId: string) => {
    const { error: itemsError } = await supabase.from('split_bill_items').delete().eq('bill_id', billId);
    if (itemsError) throw itemsError;

    const { error: billError } = await supabase.from('split_bills').delete().eq('id', billId);
    if (billError) throw billError;

    await fetchData();
  };

  const uploadProof = async (itemId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `proofs/split/${user?.id}/${Date.now()}.${fileExt}`;

    // Note: Using 'avatars' bucket as it's the primary one, but folder is 'proofs'
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // IMPORTANT: Ensure the update includes a check for the user's ID to satisfy RLS
    // 'new row violates RLS' can happen if the update results in a row the user can't see,
    // or if the user doesn't have permission to update that specific row.
    const { error: dbError } = await supabase
      .from('split_bill_items')
      .update({
        proof_url: publicUrl,
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('profile_id', user?.id); // Verify ownership to satisfy strict RLS

    if (dbError) throw dbError;
    await fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('split_bill_items').update({ status }).eq('id', id);
    if (error) throw error;

    // Auto-Sync to Ledger if approved
    if (status === 'approved') {
      try {
        const { data: item } = await supabase
          .from('split_bill_items')
          .select('*, split_bills(title), profiles(full_name)')
          .eq('id', id)
          .single();
        
        if (item) {
          await supabase.from('transactions').insert({
            type: 'income',
            amount: item.amount,
            date: new Date().toISOString(),
            item_name: `Allocation: ${item.item_name}`,
            event_type: 'Other',
            payment_type: 'Cash',
            from_entity: (item.profiles as any)?.full_name,
            to_entity: 'Institutional Treasury',
            status: 'approved',
            notes: `Auto-synchronized from Split Bill: ${(item.split_bills as any)?.title}`
          });
          toast.success('Ledger entry synchronized');
        }
      } catch (e) {
        console.error('Auto-sync failed:', e);
      }
    }
    
    await fetchData();
  };

  return {
    bills,
    members,
    isLoading,
    createBill,
    updateBill,
    deleteBill,
    uploadProof,
    updateStatus,
    refresh: fetchData
  };
}
