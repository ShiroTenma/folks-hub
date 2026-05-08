import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, ExternalLink, Info, Copy, Calendar, ShieldCheck, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CashFormDialogsProps {
  isEditOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  isSubmitOpen: boolean;
  onSubmitOpenChange: (open: boolean) => void;
  isDetailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  paymentTypes: string[];
  isSubmitting: boolean;
  isUploading: boolean;
  onSave: (e: React.FormEvent) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPayment: any;
  onAdminEditFromDetail: () => void;
  ledgerTransactions?: any[];
}

export function CashFormDialogs({
  isEditOpen, onEditOpenChange, isSubmitOpen, onSubmitOpenChange, isDetailOpen, onDetailOpenChange, formData, setFormData, paymentTypes, isSubmitting, isUploading, onSave, onUpload, selectedPayment, onAdminEditFromDetail, ledgerTransactions = []
}: CashFormDialogsProps) {
  return (
    <>
      {/* Admin Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="max-w-sm rounded-xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#1c1c1c] p-8 pb-12 text-white relative">
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#535366] flex items-center justify-center border border-white/10 shadow-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif font-black italic tracking-tight">Manage <span className="not-italic text-[#535366]">Registry</span></DialogTitle>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Authorized Personnel Only</p>
              </DialogHeader>
            </div>
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#535366]/20 to-transparent pointer-events-none" />
          </div>

          <form onSubmit={onSave} className="p-8 -mt-6 bg-white rounded-t-[3rem] relative z-20 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Valuation (IDR)</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })} className="rounded-2xl h-14 font-black border-2 border-[#eae6e0] bg-[#f4f2ef]/50 focus:border-[#1c1c1c] transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Status Class</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="rounded-2xl h-14 font-black border-2 border-[#eae6e0] bg-[#f4f2ef]/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="pending" className="rounded-xl my-1 focus:bg-amber-50 focus:text-amber-700">Pending Approval</SelectItem>
                    <SelectItem value="approved" className="rounded-xl my-1 focus:bg-emerald-50 focus:text-emerald-700">Verified Entry</SelectItem>
                    <SelectItem value="rejected" className="rounded-xl my-1 focus:bg-rose-50 focus:text-rose-700">Flagged Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Method</Label>
                <Select value={formData.payment_type} onValueChange={v => setFormData({ ...formData, payment_type: v })}>
                  <SelectTrigger className="rounded-2xl h-14 font-black border-2 border-[#eae6e0] bg-[#f4f2ef]/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {paymentTypes.map(t => <SelectItem key={t} value={t} className="rounded-xl my-1">{t}</SelectItem>)}
                    <SelectItem value="Reimbursement" className="rounded-xl my-1">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Entry Date</Label>
                <Input type="date" value={formData.payment_date || ''} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} className="rounded-2xl h-14 font-black border-2 border-[#eae6e0] bg-[#f4f2ef]/50" />
              </div>
            </div>

            {formData.payment_type === 'Reimbursement' && (
              <div className="space-y-3 bg-[#535366]/5 p-6 rounded-3xl border-2 border-dashed border-[#535366]/20">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]">Linked Ledger Transaction</Label>
                <Select value={formData.ledger_id} onValueChange={v => setFormData({ ...formData, ledger_id: v })}>
                  <SelectTrigger className="rounded-2xl h-14 font-black border-2 border-white bg-white/50">
                    <SelectValue placeholder="Select entry..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {ledgerTransactions.map(lt => (
                      <SelectItem key={lt.id} value={lt.id} className="rounded-xl my-1">
                        <div className="flex flex-col py-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#535366]/60">{lt.date}</span>
                          <span className="text-sm font-bold text-[#1c1c1c]">{lt.item_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">System Notes</Label>
              <Input value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="rounded-2xl h-14 font-medium border-2 border-[#eae6e0] bg-[#f4f2ef]/50" placeholder="Internal commentary..." />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Visual Verification</Label>
              {formData.proof_url ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-[#eae6e0] aspect-video bg-[#f4f2ef]">
                  <img src={formData.proof_url} alt="Proof" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button type="button" onClick={() => setFormData({ ...formData, proof_url: '' })} className="bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-[10px] px-6 h-10 uppercase tracking-widest">Remove</Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#dcd7cf] rounded-xl cursor-pointer hover:bg-[#f4f2ef] hover:border-[#535366] transition-all group">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-[#535366]" /> : <Upload className="h-8 w-8 text-[#535366]/30 group-hover:text-[#535366] transition-colors" />}
                    <p className="text-[10px] font-black text-[#535366]/40 uppercase tracking-[0.2em]">Attach Evidence</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                </label>
              )}
            </div>

            <DialogFooter className="pt-8">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white rounded-[1.5rem] h-16 font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-black/10 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'COMMIT CHANGES'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Submit Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={onSubmitOpenChange}>
        <DialogContent className="max-w-sm rounded-xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#1c1c1c] p-10 pb-16 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            <Wallet className="h-16 w-16 text-[#535366]/40 mx-auto mb-6 relative z-10" />
            <DialogTitle className="text-3xl font-serif font-black italic tracking-tight relative z-10">Confirm <span className="not-italic text-[#535366]">{formData.month}</span> Contribution</DialogTitle>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 mt-3 relative z-10">Finalizing Transfer Request</p>
          </div>

          <form onSubmit={onSave} className="p-10 -mt-10 bg-white rounded-t-[4rem] relative z-20 space-y-8">
            <div className="bg-[#f4f2ef] p-8 rounded-xl border-2 border-[#eae6e0] space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#535366]/40 tracking-[0.3em]">Beneficiary Account</span>
                <Badge className="bg-[#535366] text-white border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">FOLKS TREASURY</Badge>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border-2 border-[#eae6e0] flex items-center justify-between">
                  <p className="text-sm font-black text-[#1c1c1c]">081234567890 (DANA)</p>
                  <button type="button" onClick={() => { navigator.clipboard.writeText('081234567890'); toast.success('Number copied'); }} className="h-10 w-10 bg-[#eae6e0] rounded-xl flex items-center justify-center text-[#535366] hover:bg-[#1c1c1c] hover:text-white transition-all"><Copy className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center justify-between gap-4 p-5 bg-[#1c1c1c] rounded-2xl">
                  <p className="text-2xl font-serif font-black italic text-[#ffffff]">Rp {formData.amount.toLocaleString()}</p>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(formData.amount.toString()); toast.success('Amount copied'); }} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50 hover:bg-white hover:text-[#1c1c1c] transition-all"><Copy className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Official Receipt Upload</Label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#dcd7cf] rounded-xl cursor-pointer hover:bg-[#f4f2ef] transition-all group">
                <div className="flex flex-col items-center justify-center gap-3">
                  {isUploading ? <Loader2 className="h-10 w-10 animate-spin text-[#535366]" /> : <Upload className="h-10 w-10 text-[#535366]/20 group-hover:text-[#535366] transition-colors" />}
                  <p className="text-[11px] font-black text-[#535366]/50 uppercase tracking-[0.2em]">{formData.proof_url ? 'EVIDENCE CAPTURED' : 'SELECT RECEIPT IMAGE'}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
              </label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !formData.proof_url} className="w-full bg-[#535366] hover:bg-[#535366]/90 text-white rounded-[1.5rem] h-18 font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-[#535366]/20 transition-all active:scale-95 mt-4">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AUTHORIZE PAYMENT'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={onDetailOpenChange}>
        <DialogContent className="max-w-sm rounded-xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#eae6e0] flex items-center justify-center text-[#1c1c1c]">
                  <Wallet className="h-6 w-6" />
                </div>
                <DialogTitle className="text-3xl font-serif font-black italic tracking-tight text-[#1c1c1c]">Evidence <span className="not-italic text-[#535366]">Folio</span></DialogTitle>
              </div>
              <Badge className={cn(
                "border-none font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl",
                selectedPayment?.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                selectedPayment?.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
              )}>{selectedPayment?.status}</Badge>
            </div>

            {selectedPayment?.proof_url ? (
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden border-8 border-[#f4f2ef] shadow-2xl relative group">
                <img src={selectedPayment.proof_url} alt="Receipt" className="w-full h-full object-cover" />
                <a href={selectedPayment.proof_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Button variant="secondary" className="gap-3 font-black rounded-2xl h-14 px-8 uppercase text-xs tracking-widest bg-white text-[#1c1c1c] hover:bg-[#eae6e0]"><ExternalLink className="h-5 w-5" /> Inspect Document</Button>
                </a>
              </div>
            ) : (
              <div className="h-72 w-full rounded-xl bg-[#f4f2ef] border-2 border-dashed border-[#dcd7cf] flex flex-col items-center justify-center text-[#535366]/30">
                <Info className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Visual Evidence</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#f4f2ef] p-6 rounded-xl border border-[#eae6e0]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 mb-3">Transmission</p>
                <p className="text-lg font-serif font-black text-[#1c1c1c] italic">{selectedPayment?.payment_type || 'Unknown'}</p>
              </div>
              <div className="bg-[#535366] p-6 rounded-xl text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Verified Date</p>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white/40" />
                  <p className="text-lg font-serif font-black italic">{selectedPayment?.payment_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {selectedPayment?.notes && (
              <div className="bg-[#eae6e0]/50 p-8 rounded-xl border-2 border-[#eae6e0] relative">
                <div className="absolute -top-3 left-8 bg-[#1c1c1c] text-white text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-lg">Admin Remarks</div>
                <p className="text-sm font-medium text-[#535366] leading-relaxed italic">"{selectedPayment.notes}"</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-[1.5rem] font-black h-16 border-2 border-[#eae6e0] text-[#535366] uppercase text-xs tracking-widest hover:bg-[#eae6e0]" onClick={() => onDetailOpenChange(false)}>Dismiss</Button>
              {onAdminEditFromDetail && <Button className="flex-1 rounded-[1.5rem] font-black h-16 bg-[#1c1c1c] shadow-2xl shadow-black/10 text-white uppercase text-xs tracking-[0.3em]" onClick={onAdminEditFromDetail}>Modify Record</Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
