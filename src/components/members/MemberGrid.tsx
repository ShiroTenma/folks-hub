import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { type Profile } from '@/lib/supabase';
import { MemberCard } from './MemberCard';

interface MemberGridProps {
  members: Profile[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectMember: (id: string) => void;
  onEdit: (member: Profile) => void;
  onRevoke: (id: string, name: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onSnapshot: (member: Profile) => void;
  isAdmin?: boolean;
}

export function MemberGrid({
  members,
  isLoading,
  selectedIds,
  onSelectMember,
  onEdit,
  onRevoke,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
  onSnapshot,
  isAdmin = false
}: MemberGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full h-64 flex items-center justify-center text-[#535366]/40 font-bold uppercase">
            Syncing Database...
          </div>
        ) : members.length > 0 ? (
          members.map((member, i) => (
            <MemberCard
              key={member.id}
              member={member}
              isSelected={selectedIds.includes(member.id)}
              onSelect={onSelectMember}
              onEdit={onEdit}
              onRevoke={onRevoke}
              onSnapshot={onSnapshot}
              index={i}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-[#535366]/40 gap-2 bg-white rounded-3xl border border-dashed border-[#dcd7cf]">
            <Search className="h-8 w-8 opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No members match your criteria</p>
            <Button variant="link" onClick={onResetFilters} className="text-[#1c1c1c] font-black text-[10px] uppercase">Reset Filters</Button>
          </div>
        )}
      </div>

      {/* Grid Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest px-6 bg-white border-[#dcd7cf]" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#535366]/40">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest px-6 bg-white border-[#dcd7cf]" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
