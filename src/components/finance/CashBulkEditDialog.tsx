import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CashBulkEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  monthsConfig: string[];
  formData: any;
  setFormData: (data: any) => void;
  bulkMonths: string[];
  setBulkMonths: (months: string[]) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  paymentTypes: string[];
  isUploading?: boolean;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Bulk Entry Dialog for Monthly Cash tracking.
 * Compact version — reduced padding, smaller controls, tighter layout.
 */
export function CashBulkEditDialog({
  isOpen, onOpenChange, members, monthsConfig, formData, setFormData, bulkMonths, setBulkMonths, onSave, isSubmitting, paymentTypes, isUploading, onUpload
}: CashBulkEditDialogProps) {
  const toggleMonth = (month: string) => {
    if (bulkMonths.includes(month)) setBulkMonths(bulkMonths.filter(m => m !== month));
    else setBulkMonths([...bulkMonths, month]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-0 overflow-hidden border-none shadow-2xl">

        {/* Header */}
        <div className="bg-[#1c1c1c] px-6 pt-6 pb-10 text-white relative">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
              <Archive className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight italic leading-none">
                Bulk <span className="text-[#535366] not-italic">Registry</span>
              </DialogTitle>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em] mt-1">
                Multi-period contribution entry
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 -mt-6 bg-white rounded-t-3xl relative z-20 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Member + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Member</Label>
              <Select value={formData.profile_id} onValueChange={v => setFormData({ ...formData, profile_id: v })}>
                <SelectTrigger className="rounded-xl h-11 text-xs font-bold bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-[#dcd7cf] shadow-xl">
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id} className="py-2 font-black text-[11px] uppercase tracking-tight">
                      <div className="flex flex-col">
                        <span>{m.full_name}</span>
                        <span className="text-[8px] opacity-40 tracking-widest">{m.division}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Date</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                className="rounded-xl h-11 text-xs font-bold bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0 px-3"
              />
            </div>
          </div>

          {/* Month picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Periods</Label>
              <Badge className="bg-[#f4f2ef] text-[#1c1c1c] border border-[#dcd7cf] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Rp {formData.amount.toLocaleString()} / mo
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {monthsConfig.map(month => {
                const isSelected = bulkMonths.includes(month);
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleMonth(month)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 transition-all duration-300 text-[9px] font-black uppercase tracking-widest",
                      isSelected
                        ? "bg-[#1c1c1c] border-[#1c1c1c] text-white shadow-lg scale-95"
                        : "bg-[#f4f2ef]/30 border-[#dcd7cf] text-[#535366]/50 hover:border-[#1c1c1c] hover:bg-white"
                    )}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full border transition-all",
                      isSelected ? "bg-white border-white/60" : "bg-white border-[#dcd7cf]"
                    )} />
                    {month}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment method + Receipt row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Method</Label>
              <Select value={formData.payment_type} onValueChange={v => setFormData({ ...formData, payment_type: v })}>
                <SelectTrigger className="rounded-xl h-11 text-xs font-bold bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-[#dcd7cf] shadow-xl">
                  {paymentTypes.map(t => (
                    <SelectItem key={t} value={t} className="py-2 font-black text-[11px] uppercase tracking-widest">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Receipt</Label>
              {formData.proof_url ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-[#dcd7cf] h-11 bg-[#f4f2ef]/50">
                  <img src={formData.proof_url} alt="Proof" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, proof_url: '' })}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-11 border-2 border-dashed border-[#dcd7cf] rounded-xl cursor-pointer hover:bg-[#f4f2ef]/50 transition-all group gap-2">
                  {isUploading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1c1c1c]" />
                    : <Upload className="h-3.5 w-3.5 text-[#535366]/40 group-hover:text-[#1c1c1c] transition-colors" />
                  }
                  <span className="text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.2em] group-hover:text-[#1c1c1c]">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Total summary */}
          <div className="bg-[#1c1c1c] px-5 py-4 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/40">Total</p>
              <p className="text-2xl font-black text-white tracking-tighter italic leading-tight">
                Rp {(bulkMonths.length * formData.amount).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 h-9 px-4 rounded-xl flex items-center border border-white/10">
              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{bulkMonths.length} Periods</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f4f2ef]/50 border-t-2 border-[#f4f2ef]">
          <Button
            type="submit"
            onClick={onSave}
            disabled={isSubmitting || !formData.profile_id || bulkMonths.length === 0}
            className="w-full bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white h-11 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg transition-all active:scale-[0.97]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Synchronize Records'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}