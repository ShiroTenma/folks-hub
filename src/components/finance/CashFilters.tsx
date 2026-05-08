import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CashFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
}

/**
 * Filter component for the Monthly Cash registry.
 * Features a high-contrast search interface with premium Geist typography.
 */
export function CashFilters({ search, onSearchChange }: CashFiltersProps) {
  return (
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <div className="relative group flex-1 sm:flex-initial">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#535366]/40 group-focus-within:text-[#1c1c1c] transition-colors" />
        <Input 
          placeholder="SEARCH REGISTRY..." 
          className="pl-12 bg-white border-[#dcd7cf] rounded-2xl h-14 w-full sm:w-80 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/5 border-2 focus:border-[#1c1c1c] transition-all"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
