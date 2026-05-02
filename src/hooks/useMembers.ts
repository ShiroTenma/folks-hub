import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { type MonthlyPayment } from '@/types';
import { toast } from 'sonner';
import { BATCH_YEARS, DIVISIONS } from '@/lib/constants';

export type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest';

export interface UseMembersReturn {
  members: Profile[];
  payments: MonthlyPayment[];
  isLoading: boolean;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Filter & Search
  search: string;
  setSearch: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  divisionFilter: string;
  setDivisionFilter: (division: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  paginatedMembers: Profile[];
  
  // Computed
  filteredMembers: Profile[];
  allAvailableTags: string[];
  pendingCount: number;
  
  // Actions
  fetchData: () => Promise<void>;
  toggleTagFilter: (tag: string) => void;
  toggleSelectAll: () => void;
  toggleSelectMember: (id: string) => void;
  handleBulkUpdate: (field: 'status' | 'division' | 'role' | 'tags', value: any) => Promise<void>;
  handleRevokeAccess: (id: string, name: string) => Promise<void>;
  handleApproveMember: (id: string) => Promise<void>;
  handleRejectMember: (id: string) => Promise<void>;
  handleSaveMember: (formData: any, editingMember: Profile | null, isSuperAdmin: boolean) => Promise<boolean>;
}

const ITEMS_PER_PAGE = 15;

export function useMembers(): UseMembersReturn {
  // Data State
  const [members, setMembers] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter & Search State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profilesRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('monthly_cash').select('*')
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      
      setMembers(profilesRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch members: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const filteredMembers = useMemo(() => {
    let result = members.filter(m => {
      // Tab Filter
      if (activeTab === 'pending' && m.status !== 'pending') return false;

      const fullName = m.full_name?.toLowerCase() || '';
      const sid = m.student_id?.toLowerCase() || '';
      const query = search.toLowerCase();

      // Text search
      const matchesSearch = fullName.includes(query) || sid.includes(query);
      
      // Status/Role/Division
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesDivision = divisionFilter === 'all' || m.division === divisionFilter;
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      
      // Tags
      const mTags = (m as any).tags || [];
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => mTags.includes(t));

      return matchesSearch && matchesStatus && matchesDivision && matchesRole && matchesTags;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });

    return result;
  }, [members, search, statusFilter, divisionFilter, roleFilter, selectedTags, sortBy, activeTab]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredMembers, currentPage]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedMembers.length && paginatedMembers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedMembers.map(m => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkUpdate = async (field: 'status' | 'division' | 'role' | 'tags', value: any) => {
    if (selectedIds.length === 0) return;
    
    setIsLoading(true);
    try {
      if (field === 'tags') {
        const { data: currentMembers } = await supabase
          .from('profiles')
          .select('id, tags')
          .in('id', selectedIds);
          
        if (currentMembers) {
          const updates = currentMembers.map(m => ({
            id: m.id,
            tags: Array.from(new Set([...((m as any).tags || []), ...value]))
          }));
          
          for (const up of updates) {
            const { error } = await supabase.from('profiles').update({ tags: up.tags }).eq('id', up.id);
            if (error) throw error;
          }
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ [field]: value })
          .in('id', selectedIds);

        if (error) throw error;
      }

      toast.success(`Bulk update for ${selectedIds.length} members completed`);
      setSelectedIds([]);
      await fetchData();
    } catch (err: any) {
      console.error('Bulk Update Error:', err);
      toast.error('Failed to update members: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Member access revoked');
      await fetchData();
    } catch (err: any) {
      toast.error('Error revoking access: ' + err.message);
    }
  };

  const handleApproveMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Member request approved');
      await fetchData();
    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    }
  };

  const handleRejectMember = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request? The account will be deleted.')) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Member request rejected');
      await fetchData();
    } catch (err: any) {
      toast.error('Rejection failed: ' + err.message);
    }
  };

  const handleSaveMember = async (formData: any, editingMember: Profile | null, isSuperAdmin: boolean) => {
    try {
      setIsLoading(true);
      if (formData.password && isSuperAdmin) {
        const { data, error: functionError } = await supabase.functions.invoke('manage-user-auth', {
          body: { 
            email: formData.contact, 
            password: formData.password,
            full_name: formData.full_name,
            id: editingMember?.id
          }
        });

        if (functionError) {
          console.error('Edge Function Error:', functionError);
          // We don't necessarily throw here if we want to allow profile update even if auth fails,
          // but the user wants to prevent silent failures.
          toast.error(`Auth Update Warning: ${functionError.message || 'Check connection'}`);
        }
      }

      const { password, ...profileData } = formData;

      if (editingMember) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast.success('Member profile updated successfully');
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            ...profileData,
            id: crypto.randomUUID()
          });

        if (error) throw error;
        toast.success('New member added successfully');
      }
      
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Save Member Error:', err);
      toast.error('Error saving member: ' + (err.message || 'Unknown error occurred'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const allAvailableTags = useMemo(() => {
    return Array.from(new Set(members.flatMap(m => (m as any).tags || []))).sort() as string[];
  }, [members]);

  const pendingCount = useMemo(() => {
    return members.filter(m => m.status === 'pending').length;
  }, [members]);

  return {
    members,
    payments,
    isLoading,
    viewMode,
    setViewMode,
    selectedIds,
    setSelectedIds,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    divisionFilter,
    setDivisionFilter,
    roleFilter,
    setRoleFilter,
    paymentFilter,
    setPaymentFilter,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedMembers,
    filteredMembers,
    allAvailableTags,
    pendingCount,
    fetchData,
    toggleTagFilter,
    toggleSelectAll,
    toggleSelectMember,
    handleBulkUpdate,
    handleRevokeAccess,
    handleApproveMember,
    handleRejectMember,
    handleSaveMember
  };
}
