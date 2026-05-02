import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Receipt, 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  Info, 
  Search,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function SplitBillPage() {
  useDocumentTitle('Split Bill');
  const { user, profile } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  // Create Bill State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBill, setNewBill] = useState({
    title: '',
    description: '',
    total_amount: 0,
    selected_members: [] as string[]
  });

  // Payment Proof State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [billsRes, memRes] = await Promise.all([
        supabase.from('split_bills').select('*, split_bill_items(*, profiles(full_name, avatar_url))').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('full_name')
      ]);

      if (billsRes.error) throw billsRes.error;
      if (memRes.error) throw memRes.error;

      setBills(billsRes.data || []);
      setMembers(memRes.data || []);
    } catch (error: any) {
      console.error('Fetch Data Error:', error);
      toast.error('Failed to load split bills: ' + (error.message || 'Check connection'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBill.selected_members.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create main bill
      const { data: billData, error: billError } = await supabase
        .from('split_bills')
        .insert({
          title: newBill.title,
          description: newBill.description,
          total_amount: newBill.total_amount,
          created_by: user?.id
        })
        .select()
        .single();

      if (billError) throw billError;

      // 2. Create items for each member
      const amountPerPerson = Math.round(newBill.total_amount / newBill.selected_members.length);
      const items = newBill.selected_members.map(profile_id => ({
        bill_id: billData.id,
        profile_id,
        amount: amountPerPerson,
        status: 'pending'
      }));

      const { error: itemsError } = await supabase.from('split_bill_items').insert(items);
      if (itemsError) throw itemsError;

      toast.success('Split bill created successfully!');
      setIsCreateOpen(false);
      setNewBill({ title: '', description: '', total_amount: 0, selected_members: [] });
      await fetchData();
    } catch (error: any) {
      console.error('Create Bill Error:', error);
      toast.error('Creation failed: ' + (error.message || 'Check connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedItem) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `payments/split/${user?.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('split_bill_items')
        .update({
          proof_url: publicUrl,
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (dbError) throw dbError;

      toast.success('Proof uploaded! Waiting for verification.');
      setIsUploadOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error('Upload Proof Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Check connection'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('split_bill_items').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Payment marked as ${status}`);
      await fetchData();
    } catch (error: any) {
      console.error('Update Status Error:', error);
      toast.error('Update failed: ' + (error.message || 'Check connection'));
    }
  };

  const toggleMemberSelection = (profile_id: string) => {
    setNewBill(prev => ({
      ...prev,
      selected_members: prev.selected_members.includes(profile_id)
        ? prev.selected_members.filter(id => id !== profile_id)
        : [...prev.selected_members, profile_id]
    }));
  };

  const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);
  const paginatedBills = bills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            Split Bills
          </h1>
          <p className="text-slate-500 text-sm">Assign and track shared expenses among members.</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex gap-2"
          >
            <Plus className="h-4 w-4" />
            CREATE NEW BILL
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : bills.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 gap-4">
            <Receipt className="h-12 w-12 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-xs">No active split bills found</p>
          </div>
        ) : (
          paginatedBills.map((bill) => {
            const myItem = bill.split_bill_items?.find((item: any) => item.profile_id === user?.id);
            const paidCount = bill.split_bill_items?.filter((i: any) => i.status === 'approved').length || 0;
            const totalCount = bill.split_bill_items?.length || 0;
            const progress = (paidCount / totalCount) * 100;

            return (
              <Card key={bill.id} className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white hover:border-indigo-200 transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest px-2">Bill Detail</Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(bill.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{bill.title}</h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2">{bill.description}</p>
                      <div className="pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                        <p className="text-2xl font-black text-indigo-600">Rp {Number(bill.total_amount).toLocaleString()}</p>
                      </div>
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Progress</span>
                          <span>{paidCount} / {totalCount} Paid</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 flex-1 bg-slate-50/30">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignments ({totalCount})</h4>
                        {myItem && (
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            myItem.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                            myItem.status === 'paid' ? "bg-amber-100 text-amber-700" : "bg-white border border-slate-200 text-slate-500 shadow-sm"
                          )}>
                            Your Status: {myItem.status}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bill.split_bill_items?.map((item: any) => (
                          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.profiles?.avatar_url} />
                                <AvatarFallback className="text-[10px] font-bold">{item.profiles?.full_name?.split(' ').map((n:any)=>n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{item.profiles?.full_name?.split(' ')[0]}</p>
                                <p className="text-[9px] font-bold text-slate-400">Rp {Number(item.amount).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.profile_id === user?.id && item.status === 'pending' && (
                                <Button 
                                  size="icon" 
                                  className="h-7 w-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer relative z-10" 
                                  onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedItem(item); 
                                    setIsUploadOpen(true); 
                                  }}
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {isAdmin && item.status === 'paid' && (
                                <Button size="icon" className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleUpdateStatus(item.id, 'approved')}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {item.status === 'approved' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                              {item.status === 'paid' && !isAdmin && <Clock className="h-5 w-5 text-amber-500" />}
                              {item.status === 'pending' && item.profile_id !== user?.id && <div className="h-2 w-2 rounded-full bg-slate-200" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing bills {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(bills.length, currentPage * ITEMS_PER_PAGE)} of {bills.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-10 px-6 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (totalPages <= 5 || (page >= currentPage - 1 && page <= currentPage + 1) || page === 1 || page === totalPages) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-10 w-10 rounded-xl font-bold text-[10px] transition-all",
                        currentPage === page ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" : "border-slate-200 bg-white"
                      )}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-10 px-6 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-400" />
                Create Split Bill
              </DialogTitle>
              <DialogDescription className="text-slate-400">Distribute expenses among organization members.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleCreateBill} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bill Title</Label>
                <Input 
                  placeholder="e.g., Pizza for Proker Meeting" 
                  className="rounded-xl border-slate-200 h-12"
                  value={newBill.title}
                  onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount (Rp)</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="rounded-xl border-slate-200 h-12"
                  value={newBill.total_amount}
                  onChange={e => setNewBill({ ...newBill, total_amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Members to Split With</Label>
                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-2 bg-slate-50/50">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-50">
                      <Checkbox 
                        id={`mem-${m.id}`} 
                        checked={newBill.selected_members.includes(m.id)}
                        onCheckedChange={() => toggleMemberSelection(m.id)}
                      />
                      <label htmlFor={`mem-${m.id}`} className="text-xs font-bold text-slate-700 cursor-pointer flex-1 line-wrap">{m.full_name}</label>
                    </div>
                  ))}
                </div>
                {newBill.selected_members.length > 0 && (
                  <p className="text-[10px] font-bold text-indigo-600 mt-2">
                    Estimated: Rp {(newBill.total_amount / newBill.selected_members.length).toLocaleString()} per person
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold uppercase text-xs tracking-widest">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "PUBLISH SPLIT BILL"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Pay Your Share</DialogTitle>
            <DialogDescription>Upload your payment proof for this bill.</DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center gap-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 rotate-12">
              <Receipt className="h-8 w-8" />
            </div>
            {selectedItem && (
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">Rp {Number(selectedItem.amount).toLocaleString()}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Due Amount</p>
              </div>
            )}
            <label className="cursor-pointer">
              <Button variant="outline" className="pointer-events-none rounded-xl h-11 px-8 font-bold border-slate-200" disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SELECT RECEIPT"}
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
