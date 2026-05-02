import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMonthlyCash } from '@/hooks/useMonthlyCash';
import { CashSummaryCards } from '@/components/finance/CashSummaryCards';
import { CashTable } from '@/components/finance/CashTable';
import { CashFormDialogs } from '@/components/finance/CashFormDialogs';

export default function MonthlyCashPage() {
  useDocumentTitle('Monthly Cash');
  const { profile, user } = useAuthStore();
  const {
    payments,
    members,
    isLoading,
    monthlyFee,
    monthsConfig,
    paymentTypes,
    totals,
    handleSavePayment,
    handleUploadReceipt
  } = useMonthlyCash();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
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
  
  const canManage = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.division === 'Executive Board';

  const onAdminEdit = (memberId: string, month: string, current?: any) => {
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

  const onMemberSubmit = (month: string) => {
    setFormData({
      profile_id: user?.id || '',
      month: month,
      status: 'pending',
      amount: monthlyFee,
      payment_type: 'DANA',
      proof_url: '',
      notes: ''
    });
    setIsSubmitOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await handleSavePayment(formData);
    if (success) {
      setIsEditOpen(false);
      setIsSubmitOpen(false);
    }
    setIsSubmitting(false);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const url = await handleUploadReceipt(file, user?.id || 'unknown');
    if (url) setFormData(prev => ({ ...prev, proof_url: url }));
    setIsUploading(false);
  };

  const onViewDetails = (p: any) => {
    setSelectedPayment(p);
    setIsDetailOpen(true);
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.division?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            Monthly Cash Tracking
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Active Period: {monthsConfig[0] || '...'} - {monthsConfig[monthsConfig.length-1] || '...'} (Rp {monthlyFee.toLocaleString()} / month)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search member..." 
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-xs font-bold uppercase tracking-widest shadow-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <CashSummaryCards totals={totals} memberCount={members.length} />

      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <CashTable 
            members={paginatedMembers}
            payments={payments}
            monthsConfig={monthsConfig}
            isLoading={isLoading}
            canManage={canManage}
            currentUserId={user?.id || ''}
            onAdminEdit={onAdminEdit}
            onMemberSubmit={onMemberSubmit}
            onViewDetails={onViewDetails}
          />
        </CardContent>
      </Card>

      <CashFormDialogs 
        isEditOpen={isEditOpen}
        onEditOpenChange={setIsEditOpen}
        isSubmitOpen={isSubmitOpen}
        onSubmitOpenChange={setIsSubmitOpen}
        isDetailOpen={isDetailOpen}
        onDetailOpenChange={setIsDetailOpen}
        formData={formData}
        setFormData={setFormData}
        paymentTypes={paymentTypes}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        onSave={onSave}
        onUpload={onUpload}
        selectedPayment={selectedPayment}
        onAdminEditFromDetail={() => { setIsDetailOpen(false); onAdminEdit(selectedPayment.profile_id, selectedPayment.month, selectedPayment); }}
      />
    </div>
  );
}
