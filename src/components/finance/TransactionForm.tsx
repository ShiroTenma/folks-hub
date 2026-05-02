import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Loader2, Upload, Receipt, Tag, MapPin, Building, User } from 'lucide-react';
import { DIVISIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const EVENTS = [
  'Opening Balance', 'WP', 'Equipment', 'Misc', 'Cash', 
  'Operational Expense', 'WP Staff', 'Merchandise', 
  'Sertijab', 'PnC', 'Open House', 'Commission', 'SPIN', 'ETAM'
];

const PAYMENT_TYPES = ['DANA', 'BNI', 'Cash'];

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction?: any; // Add support for editing/adjusting
}

export function TransactionForm({ isOpen, onClose, onSuccess, editingTransaction }: TransactionFormProps) {
  const { user, profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    event_type: EVENTS[1], 
    item_name: '',
    division_target: profile?.division || DIVISIONS[0],
    from_entity: '',
    to_entity: '',
    location: '',
    payment_type: PAYMENT_TYPES[0],
    notes: '',
    date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    admin_adjustment_note: ''
  });

  React.useEffect(() => {
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
        payment_type: editingTransaction.payment_type || PAYMENT_TYPES[0],
        notes: editingTransaction.notes || '',
        receipt_url: editingTransaction.receipt_url || '',
        admin_adjustment_note: editingTransaction.admin_adjustment_note || ''
      });
    }
  }, [editingTransaction]);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isBPH = profile?.division === 'BPH';
  const autoApprove = isAdmin || isBPH;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `receipts/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket for now
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, receipt_url: publicUrl }));
      toast.success('Receipt uploaded successfully');
    } catch (error: any) {
      console.error('Receipt Upload Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Check your connection'));
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

      // Clean payload: remove non-database fields and calculated fields
      const { 
        running_balance, 
        id, 
        created_at, 
        type: _type, // handled via debt/credit or kept as string if needed
        amount: _amount, // kept if it's a column, but here we use debt/credit too
        ...cleanData 
      } = formData as any;

      const payload = {
        ...cleanData,
        type: formData.type,
        amount: formData.amount,
        debt_amount,
        credit_amount,
        description: formData.item_name, // fallback for legacy code
        category: formData.division_target, // fallback
        status: autoApprove ? 'approved' : 'pending',
        approved_by: autoApprove ? user?.id : null
      };

      if (editingTransaction?.id) {
        // Update existing
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingTransaction.id);
        
        if (error) throw error;
        toast.success('Transaction updated successfully');
      } else {
        // Insert new
        const { error } = await supabase
          .from('transactions')
          .insert([payload]);
        
        if (error) throw error;
        toast.success(autoApprove ? 'Transaction added and approved' : 'Transaction submitted for approval');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Transaction Submit Error:', err);
      toast.error('Submission failed: ' + (err.message || 'Check your connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-400" />
              Add Ledger Entry
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-white">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={cn(
                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                formData.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Expense / Debit
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={cn(
                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                formData.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Income / Credit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</Label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl border-slate-200 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Event / Program</Label>
              <Select value={formData.event_type} onValueChange={v => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item / Description</Label>
            <Input 
              placeholder="e.g., Purchase of 10x Staff Lanyards" 
              value={formData.item_name}
              onChange={e => setFormData({ ...formData, item_name: e.target.value })}
              className="rounded-xl border-slate-200 h-12"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (Rp)</Label>
              <Input 
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="rounded-xl border-slate-200 h-12 text-lg font-black"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsible Division</Label>
              <Select value={formData.division_target} onValueChange={v => setFormData({ ...formData, division_target: v })}>
                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">From (Entity)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="e.g., Organization Cash" 
                  value={formData.from_entity}
                  onChange={e => setFormData({ ...formData, from_entity: e.target.value })}
                  className="pl-9 rounded-xl border-slate-200 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">To (Entity)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="e.g., Vendor Name" 
                  value={formData.to_entity}
                  onChange={e => setFormData({ ...formData, to_entity: e.target.value })}
                  className="pl-9 rounded-xl border-slate-200 h-12"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Place / Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="e.g., Jakarta, Store Name" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="pl-9 rounded-xl border-slate-200 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Type</Label>
              <Select value={formData.payment_type} onValueChange={v => setFormData({ ...formData, payment_type: v })}>
                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PAYMENT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Receipt</Label>
            <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 bg-slate-50/50 text-center">
              {formData.receipt_url ? (
                <div className="flex flex-col items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">Receipt Attached</Badge>
                  <button type="button" onClick={() => setFormData({...formData, receipt_url: ''})} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Remove</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={cn("h-8 w-8 text-slate-300", isUploading && "animate-bounce")} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload image</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Notes</Label>
            <Textarea 
              placeholder="Any extra context for this transaction..." 
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl border-slate-200 min-h-[100px]"
            />
          </div>

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-12" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl px-10 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "PUBLISH TO LEDGER"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
