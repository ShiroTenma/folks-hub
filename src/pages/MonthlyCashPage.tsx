import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Search,
  Check,
  CreditCard,
  Upload,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function MonthlyCashPage() {
  const { profile } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Dynamic Settings
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [monthsConfig, setMonthsConfig] = useState<string[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>(['DANA', 'BNI', 'Cash']);
  
  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    profile_id: '',
    month: '',
    status: 'approved',
    amount: 10000,
    payment_type: 'Cash',
    proof_url: '',
    notes: ''
  });

  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  const canManage = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.division === 'BPH';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: settingsData } = await supabase.from('settings').select('*');
      settingsData?.forEach(s => {
        if (s.key === 'monthly_cash_fee') setMonthlyFee(Number(s.value));
        if (s.key === 'monthly_cash_months') setMonthsConfig(s.value);
        if (s.key === 'ledger_payment_types') setPaymentTypes(s.value);
      });

      const [payRes, memRes] = await Promise.all([
        supabase.from('monthly_cash').select('*'),
        supabase.from('profiles')
          .select('*')
          .not('division', 'is', null)
          .neq('division', '')
          .order('full_name')
      ]);

      if (payRes.error) throw payRes.error;
      if (memRes.error) throw memRes.error;

      setPayments(payRes.data || []);
      setMembers(memRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `monthly-cash/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, proof_url: publicUrl }));
      toast.success('Proof uploaded successfully');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('monthly_cash').upsert({
        profile_id: formData.profile_id,
        month: formData.month,
        amount: formData.amount,
        status: formData.status,
        payment_type: formData.payment_type,
        proof_url: formData.proof_url || null,
        notes: formData.notes || null
      }, { onConflict: 'profile_id, month' });

      if (error) throw error;

      toast.success(formData.status === 'pending' ? 'Payment submitted for review' : 'Payment recorded');
      setIsEditOpen(false);
      setIsSubmitOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Save failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdminEdit = (memberId: string, month: string, current?: any) => {
    setFormData({
      profile_id: memberId,
      month: month,
      status: current?.status || 'approved',
      amount: current?.amount || monthlyFee,
      payment_type: current?.payment_type || 'Cash',
      proof_url: current?.proof_url || '',
      notes: current?.notes || ''
    });
    setIsEditOpen(true);
  };

  const openMemberSubmit = (month: string) => {
    setFormData({
      profile_id: profile?.id || '',
      month: month,
      status: 'pending',
      amount: monthlyFee,
      payment_type: 'DANA',
      proof_url: '',
      notes: ''
    });
    setIsSubmitOpen(true);
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.division?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);
  const totalCollected = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalTarget = members.length * monthsConfig.length * monthlyFee;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            Monthly Cash Tracking
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Active Period: {monthsConfig[0]} - {monthsConfig[monthsConfig.length-1]} (Rp {monthlyFee.toLocaleString()} / month)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search member..." 
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-xs font-bold uppercase tracking-widest shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-lg bg-slate-900 text-white p-6 relative group overflow-hidden">
          <CheckCircle2 className="absolute -right-4 -top-4 h-24 w-24 opacity-5 group-hover:opacity-10 transition-opacity" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Collected</p>
          <p className="text-3xl font-black text-indigo-400">Rp {totalCollected.toLocaleString()}</p>
        </Card>
        <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Target Revenue</p>
          <p className="text-3xl font-black text-slate-900">Rp {totalTarget.toLocaleString()}</p>
        </Card>
        <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Pending Balance</p>
          <p className="text-3xl font-black text-rose-500">Rp {(totalTarget - totalCollected).toLocaleString()}</p>
        </Card>
        <Card className="rounded-2xl border-none shadow-lg bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Tracked Members</p>
          <p className="text-3xl font-black text-emerald-600">{members.length}</p>
        </Card>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-900 border-none hover:bg-slate-900">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-8 sticky left-0 bg-slate-900 z-20 w-12 border-r border-slate-800">#</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-4 sticky left-[48px] bg-slate-900 z-10 w-[250px]">Member Name</TableHead>
                  {monthsConfig.map(month => (
                    <TableHead key={month} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center border-l border-slate-800 min-w-[100px]">{month}</TableHead>
                  ))}
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center border-l border-slate-800 min-w-[120px]">Grand Total</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-rose-400 text-center border-l border-slate-800 pr-8 min-w-[140px]">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={monthsConfig.length + 4} className="h-64 text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</TableCell></TableRow>
                ) : paginatedMembers.map((member, i) => {
                  const memberPayments = payments.filter(p => p.profile_id === member.id && p.status === 'approved');
                  const grandTotal = memberPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                  const remaining = (monthsConfig.length * monthlyFee) - grandTotal;
                  const isSelf = member.id === profile?.id;

                  return (
                    <TableRow key={member.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100">
                      <TableCell className="py-4 pl-8 sticky left-0 bg-white group-hover:bg-slate-50/80 z-20 border-r border-slate-100 text-[10px] font-black text-slate-300">
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                      </TableCell>
                      <TableCell className="py-4 pl-4 sticky left-[48px] bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                              {member.full_name?.split(' ').map((n:any) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{member.full_name} {isSelf && "(You)"}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{member.division}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      {monthsConfig.map(month => {
                        const pay = payments.find(p => p.profile_id === member.id && p.month === month);
                        const isApproved = pay?.status === 'approved';
                        const isPending = pay?.status === 'pending';

                        return (
                          <TableCell 
                            key={month} 
                            className={cn(
                              "text-center border-l border-slate-50 cursor-pointer transition-all",
                              (canManage || isSelf) && "hover:bg-indigo-50/50"
                            )}
                            onClick={() => {
                              if (pay) setSelectedPayment({ ...pay, member_name: member.full_name });
                              else if (canManage) openAdminEdit(member.id, month);
                              else if (isSelf) openMemberSubmit(month);
                            }}
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              {isApproved ? (
                                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"><Check className="h-3.5 w-3.5" /></div>
                              ) : isPending ? (
                                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse"><Clock className="h-3.5 w-3.5" /></div>
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-slate-200" />
                              )}
                              {(pay?.proof_url || pay?.notes) && <div className="text-[8px] font-black text-indigo-500 uppercase">Details</div>}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-black text-slate-900 bg-indigo-50/30 border-l border-indigo-100">Rp {grandTotal.toLocaleString()}</TableCell>
                      <TableCell className={cn("text-center font-black border-l border-rose-50 pr-8", remaining > 0 ? "text-rose-600 bg-rose-50/30" : "text-emerald-600 bg-emerald-50/30")}>
                        {remaining > 0 ? `Rp ${remaining.toLocaleString()}` : 'PAID OFF'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Submit Modal */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-6 text-white">
            <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-400" />Submit Payment</DialogTitle></DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white max-h-[80vh] overflow-y-auto">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider"><Info className="h-4 w-4" /> Payment Instructions</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">Please send your payment to:</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">DANA Wallet</p><p className="text-sm font-black text-slate-900">082255403036</p><p className="text-[9px] font-bold text-slate-500">A/N ANSELLMA TITA P P</p></div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => { navigator.clipboard.writeText('082255403036'); toast.success('Copied to clipboard'); }}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">BNI Bank</p><p className="text-sm font-black text-slate-900">1807517027</p><p className="text-[9px] font-bold text-slate-500">A/N ANSELLMA TITA P P</p></div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => { navigator.clipboard.writeText('1807517027'); toast.success('Copied to clipboard'); }}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-indigo-600 bg-indigo-100/50 p-2 rounded-lg text-center uppercase tracking-wider">Cash payment amount: Rp {monthlyFee.toLocaleString()} / month</p>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div><p className="text-[9px] font-black uppercase text-slate-400">Target Period</p><p className="text-sm font-bold text-slate-900">{formData.month}</p></div>
                <div className="text-right"><p className="text-[9px] font-black uppercase text-slate-400">Amount Due</p><p className="text-sm font-black text-indigo-600">Rp {monthlyFee.toLocaleString()}</p></div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</Label>
                <Select value={formData.payment_type} onValueChange={(v) => setFormData({...formData, payment_type: v})}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold"><SelectValue placeholder="Select Method" /></SelectTrigger>
                  <SelectContent className="rounded-xl">{paymentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proof of Payment</Label>
                <div className="relative">
                  <input type="file" accept="image/*" className="hidden" id="proof-upload" onChange={handleFileUpload} disabled={isUploading} />
                  <label htmlFor="proof-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                    {isUploading ? <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /> : formData.proof_url ? <img src={formData.proof_url} alt="Proof" className="h-24 w-auto rounded-lg shadow-lg" /> : <><Upload className="h-8 w-8 text-slate-300 group-hover:text-indigo-500 transition-colors" /><p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to upload receipt</p></>}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</Label>
                <Input placeholder="e.g. Paid via DANA" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="h-12 rounded-xl border-slate-200" />
              </div>

              <Button type="submit" disabled={isSubmitting || isUploading || !formData.proof_url} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "SUBMIT PAYMENT"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between"><DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-400" />Manage Record</DialogTitle></DialogHeader></div>
          <form onSubmit={handleSavePayment} className="p-8 space-y-5 bg-white">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase text-slate-400">Target Period</p><p className="text-sm font-bold text-slate-900">{formData.month}</p></div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</Label>
              <div className="grid grid-cols-3 gap-2">{['approved', 'pending', 'rejected'].map(s => <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={cn("py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border", formData.status === s ? s === 'approved' ? "bg-emerald-600 border-emerald-600 text-white" : s === 'pending' ? "bg-amber-500 border-amber-500 text-white" : "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>{s}</button>)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</Label>
              <Select value={formData.payment_type} onValueChange={(v) => setFormData({...formData, payment_type: v})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{paymentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid (Rp)</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} className="rounded-xl border-slate-200 h-12 font-bold" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proof URL</Label><Input placeholder="https://..." value={formData.proof_url} onChange={(e) => setFormData({...formData, proof_url: e.target.value})} className="rounded-xl border-slate-200 h-12 text-xs" /></div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg mt-4">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "UPDATE RECORD"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between"><h3 className="font-bold flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4 text-indigo-400" />Payment Details: {selectedPayment?.month}</h3></div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Avatar className="h-12 w-12 ring-4 ring-white shadow-sm"><AvatarFallback className="bg-indigo-600 text-white font-black uppercase">{selectedPayment?.member_name?.split(' ').map((n:any) => n[0]).join('')}</AvatarFallback></Avatar>
              <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Payer Name</p><p className="font-black text-slate-900">{selectedPayment?.member_name}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p><Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", selectedPayment?.status === 'approved' ? "bg-emerald-100 text-emerald-700" : selectedPayment?.status === 'rejected' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>{selectedPayment?.status}</Badge></div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Method</p><p className="font-black text-slate-900">{selectedPayment?.payment_type}</p></div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Amount</p><p className="font-black text-slate-900">Rp {Number(selectedPayment?.amount).toLocaleString()}</p></div>
            {selectedPayment?.notes && <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"><p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">Notes</p><p className="text-xs font-medium text-slate-700 italic">"{selectedPayment.notes}"</p></div>}
            {selectedPayment?.proof_url && <div className="space-y-2"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Payment Proof</p><div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50 aspect-video"><img src={selectedPayment.proof_url} alt="Proof" className="w-full h-full object-contain" /></div><Button variant="ghost" className="w-full text-indigo-600 font-bold text-xs" onClick={() => window.open(selectedPayment.proof_url, '_blank')}><ExternalLink className="h-3 w-3 mr-2" /> Open Original Image</Button></div>}
            <div className="flex gap-3 pt-4"><Button variant="outline" className="flex-1 rounded-xl font-bold uppercase text-[10px] tracking-widest h-12" onClick={() => setSelectedPayment(null)}>Close</Button>{canManage && <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-indigo-100" onClick={() => { openAdminEdit(selectedPayment.profile_id, selectedPayment.month, selectedPayment); setSelectedPayment(null); }}>Edit</Button>}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
