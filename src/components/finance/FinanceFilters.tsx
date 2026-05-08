import React from 'react';
import { Search, FileText, Download, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DIVISIONS } from '@/lib/constants';

interface FinanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterEvent: string;
  onFilterEventChange: (value: string) => void;
  filterDivision: string;
  onFilterDivisionChange: (value: string) => void;
  filterPaymentType: string;
  onFilterPaymentTypeChange: (value: string) => void;
  events: string[];
  paymentTypes: string[];
  onImportExcel: () => void;
  onExportCSV: () => void;
}

export function FinanceFilters({
  search, onSearchChange, filterType, onFilterTypeChange, filterEvent, onFilterEventChange, filterDivision, onFilterDivisionChange, filterPaymentType, onFilterPaymentTypeChange, events, paymentTypes, onImportExcel, onExportCSV
}: FinanceFiltersProps) {
  return (
    <div className="bg-[#f4f2ef]/50 border-b border-[#dcd7cf] p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#535366]/30 group-focus-within:text-[#1c1c1c] transition-colors" />
            <Input 
              placeholder="SEARCH LEDGER ENTRIES..." 
              className="pl-12 bg-white border-2 border-[#dcd7cf] rounded-2xl h-14 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/5 focus:border-[#1c1c1c] transition-all"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-2 border-[#dcd7cf] h-14 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-[#1c1c1c] hover:text-white transition-all gap-3 shadow-xl shadow-black/5" onClick={onExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" className="rounded-2xl border-2 border-[#dcd7cf] h-14 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-[#535366] hover:text-white transition-all gap-3 shadow-xl shadow-black/5" onClick={onImportExcel}>
              <FileText className="h-4 w-4" /> Import Ledger
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-[2rem] border border-[#dcd7cf]">
          <div className="flex items-center gap-3 px-4 border-r border-[#dcd7cf]">
            <SlidersHorizontal className="h-4 w-4 text-[#535366]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/60">Parameters</span>
          </div>

          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="w-40 rounded-xl h-10 border-none bg-transparent hover:bg-[#f4f2ef] transition-colors text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1">All Types</SelectItem>
              <SelectItem value="income" className="rounded-xl my-1">Income Only</SelectItem>
              <SelectItem value="expense" className="rounded-xl my-1">Expense Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEvent} onValueChange={onFilterEventChange}>
            <SelectTrigger className="w-48 rounded-xl h-10 border-none bg-transparent hover:bg-[#f4f2ef] transition-colors text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1">All Events</SelectItem>
              {events.map(e => <SelectItem key={e} value={e} className="rounded-xl my-1">{e}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterDivision} onValueChange={onFilterDivisionChange}>
            <SelectTrigger className="w-44 rounded-xl h-10 border-none bg-transparent hover:bg-[#f4f2ef] transition-colors text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1">All Divisions</SelectItem>
              {DIVISIONS.map(d => <SelectItem key={d} value={d} className="rounded-xl my-1">{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterPaymentType} onValueChange={onFilterPaymentTypeChange}>
            <SelectTrigger className="w-44 rounded-xl h-10 border-none bg-transparent hover:bg-[#f4f2ef] transition-colors text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#dcd7cf] shadow-2xl">
              <SelectItem value="all" className="rounded-xl my-1">All Payments</SelectItem>
              {paymentTypes.map(p => <SelectItem key={p} value={p} className="rounded-xl my-1">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
