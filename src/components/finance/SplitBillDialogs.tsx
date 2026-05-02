import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Loader2, UserPlus, Target, Trash2, Plus, UserCircle } from 'lucide-react';

interface CreateBillDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  isSubmitting: boolean;
  onCreate: (data: any) => Promise<void>;
  editBill?: any;
}

export function CreateBillDialog({ isOpen, onOpenChange, members, isSubmitting, onCreate, editBill }: CreateBillDialogProps) {
  const [newBill, setNewBill] = useState({
    title: '',
    description: '',
    total_amount: 0,
    items: [] as { profile_id: string, item_name: string, amount: number, id?: string }[]
  });

  useEffect(() => {
    if (editBill && isOpen) {
      setNewBill({
        title: editBill.title,
        description: editBill.description || '',
        total_amount: editBill.total_amount,
        items: editBill.split_bill_items?.map((i: any) => ({
          id: i.id,
          profile_id: i.profile_id,
          item_name: i.item_name || 'Individual Share',
          amount: i.amount
        })) || []
      });
    } else if (isOpen) {
      setNewBill({ title: '', description: '', total_amount: 0, items: [] });
    }
  }, [editBill, isOpen]);

  const addItem = () => setNewBill(prev => ({ ...prev, items: [...prev.items, { profile_id: '', item_name: '', amount: 0 }] }));
  const removeItem = (index: number) => setNewBill(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index: number, field: string, value: any) => setNewBill(prev => {
    const next = [...prev.items];
    next[index] = { ...next[index], [field]: value };
    return { ...prev, items: next };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBill.items.length === 0) return;
    const calculatedTotal = newBill.items.reduce((sum, item) => sum + item.amount, 0);
    await onCreate({ ...newBill, total_amount: calculatedTotal || newBill.total_amount });
    onOpenChange(false);
  };

  const total = newBill.items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Header */}
        <div className="bg-[#1c1c1c] px-6 pt-5 pb-9 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight leading-none">
                {editBill ? 'Modify' : 'New'} <span className="text-[#535366]">Allocation</span>
              </DialogTitle>
              <DialogDescription className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">
                Shared Expense Registry
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Scrollable body */}
          <div className="px-5 pt-4 -mt-5 bg-white rounded-t-3xl relative z-20 space-y-5 overflow-y-auto max-h-[60vh]">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50 ml-1">Title</Label>
              <div className="relative group">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors" />
                <Input
                  required
                  placeholder="Expense name..."
                  className="rounded-xl h-11 pl-10 text-sm font-bold bg-[#f4f2ef]/50 border-2 border-[#dcd7cf] focus:border-[#1c1c1c] focus:ring-0"
                  value={newBill.title}
                  onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[#535366]/50">Line Items</Label>
                <Button type="button" onClick={addItem} variant="outline" className="h-8 rounded-lg border-[#dcd7cf] text-[9px] font-black uppercase tracking-widest gap-1.5 hover:bg-[#1c1c1c] hover:text-white hover:border-[#1c1c1c] transition-all px-3">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>

              {newBill.items.length === 0 ? (
                <div className="h-24 flex flex-col items-center justify-center text-[#535366]/20 gap-2 bg-[#f4f2ef]/30 rounded-xl border-2 border-dashed border-[#dcd7cf]">
                  <UserPlus className="h-6 w-6 opacity-20" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]">No items yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newBill.items.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl border border-[#dcd7cf] bg-white shadow-sm space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Description</Label>
                          <Input
                            placeholder="Ticket, catering..."
                            className="h-9 rounded-lg border-[#dcd7cf] font-bold text-xs"
                            value={item.item_name}
                            onChange={e => updateItem(index, 'item_name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Member</Label>
                          <Select value={item.profile_id} onValueChange={val => updateItem(index, 'profile_id', val)}>
                            <SelectTrigger className="h-9 rounded-lg border-[#dcd7cf] font-bold text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#dcd7cf] shadow-xl p-1">
                              {members.map(m => (
                                <SelectItem key={m.id} value={m.id} className="py-2 rounded-lg focus:bg-[#1c1c1c] focus:text-white">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-xs uppercase tracking-tight">{m.full_name}</span>
                                    <span className="text-[8px] opacity-40 uppercase tracking-widest">{m.division}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t border-[#f4f2ef] pt-3">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#535366]/40">Rp</span>
                          <Input
                            type="number"
                            className="h-9 pl-8 rounded-lg border-[#dcd7cf] font-black text-xs"
                            value={item.amount}
                            onChange={e => updateItem(index, 'amount', Number(e.target.value))}
                            required
                          />
                        </div>
                        <Button type="button" size="icon" onClick={() => removeItem(index)} variant="ghost" className="h-9 w-9 rounded-lg text-rose-400 hover:bg-rose-50 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-[#f4f2ef] shrink-0 space-y-3">
            <div className="flex items-center justify-between px-4 py-3 bg-[#f4f2ef] rounded-xl border border-[#dcd7cf]">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-[#535366]/40" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]/60">{newBill.items.length} Entries</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#535366]/40 block leading-none mb-0.5">Total</span>
                <span className="text-lg font-black text-[#1c1c1c] tracking-tight italic">Rp {total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white h-11 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-lg transition-all active:scale-[0.97]"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editBill ? 'UPDATE ALLOCATION' : 'FINALIZE REGISTRY'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────

interface UploadProofDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: any;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function UploadProofDialog({ isOpen, onOpenChange, selectedItem, isUploading, onUpload }: UploadProofDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs w-[calc(100%-2rem)] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Header */}
        <div className="bg-[#1c1c1c] px-6 pt-5 pb-9 text-white flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="h-9 w-9 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 relative z-10">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="relative z-10">
            <DialogTitle className="text-xl font-black tracking-tight leading-none">Settlement <span className="text-[#535366]">Audit</span></DialogTitle>
            <DialogDescription className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Upload Verification</DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-5 -mt-5 bg-white rounded-t-3xl relative z-20 space-y-4">
          {selectedItem && (
            <div className="bg-[#f4f2ef] px-5 py-4 rounded-xl border border-[#dcd7cf] text-center space-y-0.5">
              <p className="text-2xl font-black text-[#1c1c1c] tracking-tight italic">Rp {Number(selectedItem.amount).toLocaleString()}</p>
              <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.3em]">{selectedItem.item_name || 'Personnel Share'}</p>
            </div>
          )}

          <label className="cursor-pointer group block">
            <div className="w-full h-28 rounded-xl border-2 border-dashed border-[#dcd7cf] hover:border-[#1c1c1c] hover:bg-[#f4f2ef]/30 transition-all flex flex-col items-center justify-center gap-2 bg-[#f4f2ef]/10">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#1c1c1c]" />
              ) : (
                <>
                  <div className="h-9 w-9 rounded-lg bg-white border border-[#dcd7cf] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Plus className="h-4 w-4 text-[#1c1c1c]" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]/50">Select Receipt Image</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={isUploading} />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}