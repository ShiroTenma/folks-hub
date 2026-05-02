import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, ExternalLink, Info, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

export function CashFormDialogs({
  isEditOpen,
  onEditOpenChange,
  isSubmitOpen,
  onSubmitOpenChange,
  isDetailOpen,
  onDetailOpenChange,
  formData,
  setFormData,
  paymentTypes,
  isSubmitting,
  isUploading,
  onSave,
  onUpload,
  selectedPayment,
  onAdminEditFromDetail
}: CashFormDialogsProps) {
  return (
    <>
      {/* Admin Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Manage Payment Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (IDR)</Label>
                <Input 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} 
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</Label>
              <Select value={formData.payment_type} onValueChange={v => setFormData({...formData, payment_type: v})}>
                <SelectTrigger className="rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {paymentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Notes</Label>
              <Input 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="rounded-xl font-medium"
                placeholder="Optional reason for rejection or details..."
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 rounded-2xl h-12 font-black text-xs uppercase tracking-widest">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'UPDATE RECORD'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Submit Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={onSubmitOpenChange}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Submit {formData.month} Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-6 py-4">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Transfer To</span>
                <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase">DANA / BNI</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-900">Account: 081234567890 (FOLKS)</p>
                <div className="flex items-center gap-2 text-indigo-600">
                  <p className="text-lg font-black tracking-tight">Rp {formData.amount.toLocaleString()}</p>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(formData.amount.toString()); toast.success('Amount copied'); }}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Receipt</Label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-indigo-600" /> : <Upload className="h-8 w-8 text-slate-400 mb-2" />}
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formData.proof_url ? 'File Selected' : 'Choose Receipt Image'}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
              </label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !formData.proof_url} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CONFIRM PAYMENT'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={onDetailOpenChange}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Payment Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedPayment?.proof_url ? (
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative group">
                <img src={selectedPayment.proof_url} alt="Receipt" className="w-full h-full object-cover" />
                <a href={selectedPayment.proof_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" className="gap-2 font-bold rounded-xl"><ExternalLink className="h-4 w-4" /> Open Full Image</Button>
                </a>
              </div>
            ) : (
              <div className="h-48 w-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Evidence Uploaded</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <Badge className={cn(
                  "border-none font-bold uppercase text-[10px]",
                  selectedPayment?.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                  selectedPayment?.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                )}>{selectedPayment?.status}</Badge>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Method</p>
                <p className="font-bold text-slate-900">{selectedPayment?.payment_type || 'Unknown'}</p>
              </div>
            </div>

            {selectedPayment?.notes && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Admin Feedback</p>
                <p className="text-sm font-medium text-slate-600">{selectedPayment.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl font-bold h-11" onClick={() => onDetailOpenChange(false)}>Close</Button>
              {onAdminEditFromDetail && <Button className="flex-1 rounded-xl font-bold h-11 bg-indigo-600 shadow-lg shadow-indigo-100" onClick={onAdminEditFromDetail}>Edit Record</Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
