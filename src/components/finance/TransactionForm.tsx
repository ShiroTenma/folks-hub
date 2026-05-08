import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Receipt, Tag, MapPin, Building, User } from 'lucide-react';
import { DIVISIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTransactionForm } from '@/hooks/useTransactionForm';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction?: any;
}

export function TransactionForm({ isOpen, onClose, onSuccess, editingTransaction }: TransactionFormProps) {
  const { formData, setFormData, isSubmitting, isUploading, handleFileUpload, handleSubmit, ledgerEvents, ledgerPaymentTypes } = useTransactionForm(onSuccess, editingTransaction);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#1c1c1c] p-6 text-white flex items-center justify-between">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-2"><Receipt className="h-5 w-5 text-[#1c1c1c]" />{editingTransaction ? 'Edit' : 'Add'} Ledger Entry</DialogTitle></DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-white">
          <div className="grid grid-cols-2 gap-4 bg-[#f4f2ef]/50 p-2 rounded-2xl border border-[#dcd7cf]">
            {['expense', 'income'].map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type: type as any })} className={cn("py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.type === type ? `bg-white text-${type === 'income' ? 'emerald' : 'rose'}-600 shadow-sm` : "text-[#535366]/40")}>
                {type === 'income' ? 'Income / Credit' : 'Expense / Debit'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Date</Label>
              <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="rounded-xl h-12" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Event / Program</Label>
              <Select value={formData.event_type} onValueChange={v => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger className="rounded-xl h-12"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-[#535366]/40" /><SelectValue /></div></SelectTrigger>
                <SelectContent className="rounded-xl">{ledgerEvents.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-[#535366]/40">Item / Description</Label>
            <Input placeholder="e.g., Purchase of 10x Staff Lanyards" value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} className="rounded-xl h-12" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Amount (Rp)</Label>
              <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="rounded-xl h-12 text-lg font-black" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Responsible Division</Label>
              <Select value={formData.division_target} onValueChange={v => setFormData({ ...formData, division_target: v })}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[ {label: 'From (Entity)', key: 'from_entity', icon: Building}, {label: 'To (Entity)', key: 'to_entity', icon: User} ].map(f => (
              <div key={f.key} className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-[#535366]/40">{f.label}</Label>
                <div className="relative"><f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#535366]/40" /><Input value={(formData as any)[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} className="pl-9 rounded-xl h-12" /></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Place / Location</Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#535366]/40" /><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="pl-9 rounded-xl h-12" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-[#535366]/40">Payment Type</Label>
              <Select value={formData.payment_type} onValueChange={v => setFormData({ ...formData, payment_type: v })}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{ledgerPaymentTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-[#535366]/40">Upload Receipt</Label>
            <div className="border-2 border-dashed border-[#dcd7cf] rounded-2xl p-6 bg-[#f4f2ef]/50/50 text-center">
              {formData.receipt_url ? (
                <div className="flex flex-col items-center gap-2"><Badge className="bg-emerald-100 text-emerald-700">Receipt Attached</Badge><button type="button" onClick={() => setFormData({...formData, receipt_url: ''})} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Remove</button></div>
              ) : (
                <label className="cursor-pointer"><Upload className={cn("h-8 w-8 mx-auto text-[#535366]/30", isUploading && "animate-bounce")} /><p className="text-[10px] font-black text-[#535366]/40 mt-2 uppercase">Click to upload image</p><input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={isUploading} /></label>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase text-[10px] h-12" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 h-12 rounded-xl px-10 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-black/10">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "PUBLISH TO LEDGER"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
