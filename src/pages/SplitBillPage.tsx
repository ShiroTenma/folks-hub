import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Receipt, Plus, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Layers, Search as SearchIcon, Filter as FilterIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSplitBill } from '@/hooks/useSplitBill';
import { SplitBillCard } from '@/components/finance/SplitBillCard';
import { CreateBillDialog, UploadProofDialog } from '@/components/finance/SplitBillDialogs';

const ITEMS_PER_PAGE = 5;

export default function SplitBillPage() {
  useDocumentTitle('Split Bill');
  const { user, profile } = useAuthStore();
  const { bills, members, isLoading, createBill, updateBill, deleteBill, uploadProof, updateStatus } = useSplitBill();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editBill, setEditBill] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isAdmin = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');

  const filteredBills = useMemo(() => {
    return bills.filter(b => 
      b.title.toLowerCase().includes(search.toLowerCase()) || 
      b.creator?.full_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [bills, search]);

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCreateOrUpdate = async (data: any) => {
    setIsActionLoading(true);
    try {
      if (editBill) await updateBill(editBill.id, data);
      else await createBill(data);
      toast.success(`Bill ${editBill ? 'updated' : 'created'} successfully!`);
      setIsCreateOpen(false);
      setEditBill(null);
    } catch (e: any) { toast.error('Action failed: ' + e.message); }
    finally { setIsActionLoading(false); }
  };

  const handleUpload = async (file: File) => {
    if (!selectedItem) return;
    setIsActionLoading(true);
    try {
      await uploadProof(selectedItem.id, file);
      toast.success('Proof uploaded!');
      setIsUploadOpen(false);
    } catch (e: any) { toast.error('Upload failed: ' + e.message); }
    finally { setIsActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently expunge this allocation entry?')) return;
    try { await deleteBill(id); toast.success('Bill expunged'); }
    catch (e: any) { toast.error('Delete failed: ' + e.message); }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/10"><Receipt className="h-6 w-6" /></div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-[#1c1c1c]">Cost <span className="text-[#535366]">Allocation</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" /><p className="text-xs font-black uppercase tracking-[0.2em]">Shared Expense Registry & Audit</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditBill(null); setIsCreateOpen(true); }} className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-14 px-10 shadow-2xl shadow-black/10 transition-all active:scale-95 gap-3 uppercase text-[11px] tracking-[0.3em]"><Plus className="h-5 w-5" /> Initialize Split Bill</Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border-2 border-[#dcd7cf] shadow-xl shadow-black/5">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#535366]/30 group-focus-within:text-[#1c1c1c] transition-colors" />
          <Input placeholder="Search Registry (Title, Initiator...)" className="pl-14 h-14 rounded-2xl bg-[#f4f2ef]/50 border-2 border-transparent focus:border-[#1c1c1c] focus:bg-white" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-[#dcd7cf] gap-3 font-black text-[11px] uppercase tracking-widest"><FilterIcon className="h-4 w-4" /> Parameters</Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-[#dcd7cf] gap-6"><Loader2 className="h-12 w-12 animate-spin text-[#1c1c1c]" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#535366]/40">Accessing Nexus...</p></div>
        ) : filteredBills.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-[#dcd7cf] text-[#535366]/20 gap-6"><Layers className="h-20 w-20 opacity-10" /><p className="font-black uppercase tracking-[0.4em] text-xs">Registry Clear</p></div>
        ) : (
          <div className="space-y-8">{paginatedBills.map(b => <SplitBillCard key={b.id} bill={b} currentUserId={user?.id || ''} isAdmin={isAdmin} onUpload={i => { setSelectedItem(i); setIsUploadOpen(true); }} onUpdateStatus={updateStatus} onEdit={b => { setEditBill(b); setIsCreateOpen(true); }} onDelete={handleDelete} />)}</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-8 rounded-[2.5rem] border-2 border-[#dcd7cf] shadow-xl shadow-black/5 gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Registry Audit — Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-8 border-2 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ArrowLeft className="h-4 w-4 mr-2" /> Prev</Button>
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-8 border-2 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}

      <CreateBillDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} members={members} isSubmitting={isActionLoading} onCreate={handleCreateOrUpdate} editBill={editBill} />
      <UploadProofDialog isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} selectedItem={selectedItem} isUploading={isActionLoading} onUpload={handleUpload} />
    </div>
  );
}