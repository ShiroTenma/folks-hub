import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { type Profile } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMembers } from '@/hooks/useMembers';
import { MemberFilters } from '@/components/members/MemberFilters';
import { MemberTable } from '@/components/members/MemberTable';
import { MemberGrid } from '@/components/members/MemberGrid';
import { SelectionToolbar } from '@/components/members/SelectionToolbar';
import { PendingInvitations } from '@/components/members/PendingInvitations';
import { MemberFormDialog } from '@/components/members/MemberFormDialog';
import { ImportWizardDialog } from '@/components/members/ImportWizardDialog';
import { MemberPageHeader } from '@/components/members/MemberPageHeader';
import { MemberSnapshot } from '@/components/members/MemberSnapshot';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function MembersPage() {
  useDocumentTitle('Members');
  const { profile: currentUserProfile } = useAuthStore();
  const isSuperAdmin = (currentUserProfile?.access_level === 'super_admin' || currentUserProfile?.role === 'super_admin');
  const isAdmin = isSuperAdmin || (currentUserProfile?.access_level === 'admin' || currentUserProfile?.role === 'admin');

  const {
    isLoading, viewMode, setViewMode, selectedIds, setSelectedIds,
    activeTab, setActiveTab, search, setSearch, statusFilter, setStatusFilter,
    divisionFilter, setDivisionFilter, roleFilter, setRoleFilter, sortBy, setSortBy,
    currentPage, setCurrentPage, totalPages, paginatedMembers, filteredMembers,
    allAvailableTags, selectedTags, setSelectedTags, pendingCount, fetchData,
    toggleTagFilter, toggleSelectAll, toggleSelectMember, handleBulkUpdate,
    handleRevokeAccess, handleApproveMember, handleRejectMember, handleSaveMember
  } = useMembers();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Profile | null>(null);
  
  // Snapshot State
  const [isSnapshotOpen, setIsSnapshotOpen] = React.useState(false);
  const [snapshotMember, setSnapshotMember] = React.useState<Profile | null>(null);
  const [snapshotStats, setSnapshotStats] = React.useState<any>(null);

  const handleOpenSnapshot = async (member: Profile) => {
    setSnapshotMember(member);
    setIsSnapshotOpen(true);
    setSnapshotStats(null); // Reset while loading

    try {
      const [cashRes, taskRes] = await Promise.all([
        supabase.from('monthly_cash').select('amount, status').eq('profile_id', member.id).eq('status', 'approved'),
        supabase.from('tasks').select('id, status').eq('pic_id', member.id)
      ]);

      // Calculate simple stats for snapshot
      const totalPaid = (cashRes.data || []).reduce((sum, p) => sum + Number(p.amount), 0);
      // Assume a target or just show total payments for now
      // Let's get the months count from settings if possible, or just default
      const debt = 0; // Simplified for snapshot

      setSnapshotStats({
        finance: { totalPaid, totalDebt: debt },
        tasks: { total: taskRes.data?.length || 0, completed: taskRes.data?.filter(t => t.status === 'done').length || 0 }
      });
    } catch (e) {
      console.error('Snapshot Fetch Error:', e);
    }
  };

  const handleOpenDialog = (member?: Profile) => {
    setEditingMember(member || null);
    setIsDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearch(''); setStatusFilter('all'); setDivisionFilter('all'); setRoleFilter('all');
    setSelectedTags([]); setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <MemberPageHeader 
        isAdmin={isAdmin} viewMode={viewMode} setViewMode={setViewMode}
        onOpenAddMember={() => handleOpenDialog()} onOpenImport={() => setIsImportWizardOpen(true)}
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-2 rounded-[2rem] border-2 border-[#dcd7cf] h-18 flex items-center shadow-xl shadow-black/5 w-fit">
          <TabsTrigger value="all" className="rounded-2xl px-10 h-14 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
            Active Registry
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-2xl px-10 h-14 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300 gap-3">
            Pending Approval
            {pendingCount > 0 && <span className="bg-rose-500 text-white min-w-[24px] px-1.5 h-6 rounded-lg flex items-center justify-center text-[10px] animate-pulse shadow-lg shadow-rose-500/40">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-12 space-y-8 outline-none">
          <MemberFilters
            search={search} onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            statusFilter={statusFilter} onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            divisionFilter={divisionFilter} onDivisionFilterChange={(v) => { setDivisionFilter(v); setCurrentPage(1); }}
            roleFilter={roleFilter} onRoleFilterChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
            sortBy={sortBy} onSortByChange={(v) => { setSortBy(v); setCurrentPage(1); }}
            allAvailableTags={allAvailableTags} selectedTags={selectedTags}
            onToggleTag={toggleTagFilter} onClearTags={() => setSelectedTags([])}
          />

          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 px-2">
            <div className="h-1 w-8 bg-[#dcd7cf] rounded-full" />
            Displaying {filteredMembers.length} Organization Entities
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {viewMode === 'table' ? (
                <div className="bg-white rounded-[3rem] border-2 border-[#dcd7cf] overflow-hidden shadow-2xl shadow-black/5 premium-shadow">
                  <MemberTable
                    members={paginatedMembers} isLoading={isLoading}
                    selectedIds={selectedIds} onSelectAll={toggleSelectAll} onSelectMember={toggleSelectMember}
                    onEdit={handleOpenDialog} onRevoke={handleRevokeAccess}
                    onSnapshot={handleOpenSnapshot}
                    currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onResetFilters={handleResetFilters}
                  />
                </div>
              ) : (
                <MemberGrid
                  members={paginatedMembers} isLoading={isLoading}
                  selectedIds={selectedIds} onSelectMember={toggleSelectMember}
                  onEdit={handleOpenDialog} onRevoke={handleRevokeAccess}
                  onSnapshot={handleOpenSnapshot}
                  currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onResetFilters={handleResetFilters}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="pending" className="mt-12 outline-none">
          <div className="bg-white rounded-[3rem] border-2 border-[#dcd7cf] overflow-hidden shadow-2xl shadow-black/5 premium-shadow">
            <PendingInvitations members={paginatedMembers} onApprove={handleApproveMember} onReject={handleRejectMember} />
          </div>
        </TabsContent>
      </Tabs>

      {isAdmin && <SelectionToolbar selectedCount={selectedIds.length} onClearSelection={() => setSelectedIds([])} onBulkUpdate={handleBulkUpdate} />}

      <MemberFormDialog
        isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} member={editingMember}
        onSave={(data) => handleSaveMember(data, editingMember, isSuperAdmin)} isSuperAdmin={isSuperAdmin}
      />

      <MemberSnapshot 
        isOpen={isSnapshotOpen} 
        onOpenChange={setIsSnapshotOpen} 
        member={snapshotMember} 
        financeStats={snapshotStats?.finance}
        taskStats={snapshotStats?.tasks}
      />

      <ImportWizardDialog isOpen={isImportWizardOpen} onOpenChange={setIsImportWizardOpen} onImportComplete={fetchData} />
    </div>
  );
}
