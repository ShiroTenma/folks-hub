import { useState, useMemo } from 'react';
import { useMonthlyCash } from './useMonthlyCash';
import { useAuthStore } from '@/store/useAuthStore';

export function useMonthlyCashPage() {
  const { user, profile } = useAuthStore();
  const {
    payments, members, isLoading, monthlyFee, monthsConfig,
    paymentTypes, totals, ledgerTransactions, handleSavePayment, handleUploadReceipt, handleBulkSave
  } = useMonthlyCash();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    profile_id: '',
    month: '',
    status: 'approved',
    amount: 10000,
    payment_type: 'Cash',
    proof_url: '',
    notes: '',
    ledger_id: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const [bulkMonths, setBulkMonths] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const canManage = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');

  const onAdminEdit = (memberId: string, month: string, current?: any) => {
    setFormData({
      profile_id: memberId,
      month: month,
      status: current?.status || 'approved',
      amount: current?.amount || monthlyFee,
      payment_type: current?.payment_type || 'Cash',
      proof_url: current?.proof_url || '',
      notes: current?.notes || '',
      ledger_id: current?.ledger_id || '',
      payment_date: current?.payment_date || new Date().toISOString().split('T')[0]
    });
    setIsEditOpen(true);
  };

  const onBulkEdit = () => {
    setFormData({
      profile_id: '',
      month: '',
      status: 'approved',
      amount: monthlyFee,
      payment_type: 'Cash',
      proof_url: '',
      notes: '',
      ledger_id: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setBulkMonths([]);
    setIsBulkOpen(true);
  };

  const onSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profile_id || bulkMonths.length === 0) return;
    setIsSubmitting(true);
    const success = await handleBulkSave(formData.profile_id, bulkMonths, formData);
    if (success) setIsBulkOpen(false);
    setIsSubmitting(false);
  };

  const onMemberSubmit = (month: string) => {
    setFormData({
      profile_id: user?.id || '',
      month: month,
      status: 'pending',
      amount: monthlyFee,
      payment_type: 'DANA',
      proof_url: '',
      notes: '',
      ledger_id: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setIsSubmitOpen(true);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.division?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);

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

  return {
    profile, user,
    payments, members, isLoading, monthlyFee, monthsConfig, paymentTypes, totals, ledgerTransactions,
    search, setSearch, currentPage, setCurrentPage, ITEMS_PER_PAGE,
    isEditOpen, setIsEditOpen, isSubmitOpen, setIsSubmitOpen, isDetailOpen, setIsDetailOpen, isBulkOpen, setIsBulkOpen,
    isSubmitting, isUploading, formData, setFormData, selectedPayment, setSelectedPayment, bulkMonths, setBulkMonths,
    canManage, onAdminEdit, onBulkEdit, onSaveBulk, onMemberSubmit, filteredMembers, totalPages, paginatedMembers,
    onSave, onUpload, onViewDetails
  };
}
