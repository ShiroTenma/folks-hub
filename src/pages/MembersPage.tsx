import React from 'react';
import { 
  UserPlus, 
  List,
  LayoutGrid,
  Link as LinkIcon,
  Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'motion/react';
import { type Profile } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { DIVISIONS } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// New Hook & Components
import { useMembers } from '@/hooks/useMembers';
import { MemberFilters } from '@/components/members/MemberFilters';
import { MemberTable } from '@/components/members/MemberTable';
import { MemberGrid } from '@/components/members/MemberGrid';
import { SelectionToolbar } from '@/components/members/SelectionToolbar';
import { PendingInvitations } from '@/components/members/PendingInvitations';
import { MemberFormDialog } from '@/components/members/MemberFormDialog';
import { ImportWizardDialog } from '@/components/members/ImportWizardDialog';

export function MembersPage() {
  useDocumentTitle('Members');
  const { profile: currentUserProfile } = useAuthStore();
  const isSuperAdmin = currentUserProfile?.role === 'super_admin';

  const {
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
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedMembers,
    filteredMembers,
    allAvailableTags,
    selectedTags,
    setSelectedTags,
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
  } = useMembers();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Profile | null>(null);

  const handleOpenDialog = (member?: Profile) => {
    setEditingMember(member || null);
    setIsDialogOpen(true);
  };

  const handleGenerateInviteLink = (division?: string) => {
    const baseUrl = window.location.origin;
    const link = division 
      ? `${baseUrl}/signup?division=${encodeURIComponent(division)}`
      : `${baseUrl}/signup`;
    
    navigator.clipboard.writeText(link);
    toast.success(`Invite link copied for ${division || 'all divisions'}!`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDivisionFilter('all');
    setRoleFilter('all');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Member Database
          </h1>
          <p className="text-slate-500 text-sm font-medium">Advanced organizational management tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-slate-200 font-bold rounded-xl h-11 px-6 bg-white text-slate-600">
                <LinkIcon className="h-4 w-4" />
                INVITE
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Select Division</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleGenerateInviteLink()} className="rounded-xl py-3 font-bold text-xs gap-2">
                  General Link
                </DropdownMenuItem>
                {DIVISIONS.map(d => (
                  <DropdownMenuItem key={d} onClick={() => handleGenerateInviteLink(d)} className="rounded-xl py-3 font-bold text-xs">
                    {d}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('table')}
              className={cn(
                "h-8 w-10 p-0 rounded-lg transition-all",
                viewMode === 'table' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-8 w-10 p-0 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsImportWizardOpen(true)}
            className="gap-2 border-slate-200 font-bold rounded-xl h-11 px-6 bg-white text-slate-600 active:scale-95 transition-all"
          >
            <TableIcon className="h-4 w-4" />
            IMPORT DATA
          </Button>
          <Button 
            onClick={() => handleOpenDialog()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 h-11 px-6 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            ADD NEW MEMBER
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200 h-12">
          <TabsTrigger value="all" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
            All Members
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm gap-2">
            Invitations
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-6">
          <MemberFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            divisionFilter={divisionFilter}
            onDivisionFilterChange={(v) => { setDivisionFilter(v); setCurrentPage(1); }}
            roleFilter={roleFilter}
            onRoleFilterChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortByChange={(v) => { setSortBy(v); setCurrentPage(1); }}
            allAvailableTags={allAvailableTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTagFilter}
            onClearTags={() => setSelectedTags([])}
          />

          <div className="px-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Showing {filteredMembers.length} organization members
            </p>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'table' ? (
              <MemberTable
                key="table-view"
                members={paginatedMembers}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
                onSelectMember={toggleSelectMember}
                onEdit={handleOpenDialog}
                onRevoke={handleRevokeAccess}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onResetFilters={handleResetFilters}
              />
            ) : (
              <MemberGrid
                key="grid-view"
                members={paginatedMembers}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectMember={toggleSelectMember}
                onEdit={handleOpenDialog}
                onRevoke={handleRevokeAccess}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onResetFilters={handleResetFilters}
              />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingInvitations
            members={paginatedMembers}
            onApprove={handleApproveMember}
            onReject={handleRejectMember}
          />
        </TabsContent>
      </Tabs>

      <SelectionToolbar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkUpdate={handleBulkUpdate}
      />

      <MemberFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={editingMember}
        onSave={(data) => handleSaveMember(data, editingMember, isSuperAdmin)}
        isSuperAdmin={isSuperAdmin}
      />

      <ImportWizardDialog
        isOpen={isImportWizardOpen}
        onOpenChange={setIsImportWizardOpen}
        onImportComplete={fetchData}
      />
    </div>
  );
}
