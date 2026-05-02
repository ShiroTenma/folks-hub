import React from 'react';
import { Search, FileText, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
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
  onProcessImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}

export function FinanceFilters({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterEvent,
  onFilterEventChange,
  filterDivision,
  onFilterDivisionChange,
  filterPaymentType,
  onFilterPaymentTypeChange,
  events,
  paymentTypes,
  onImportExcel,
  onProcessImport,
  onExportCSV
}: FinanceFiltersProps) {
  return (
    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search ledger..." 
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-xs font-bold uppercase tracking-widest shadow-sm"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-36 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEvent} onValueChange={onFilterEventChange}>
              <SelectTrigger className="w-44 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Events</SelectItem>
                {events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterDivision} onValueChange={onFilterDivisionChange}>
              <SelectTrigger className="w-40 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Divisions</SelectItem>
                {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterPaymentType} onValueChange={onFilterPaymentTypeChange}>
              <SelectTrigger className="w-40 rounded-xl h-10 bg-white border-slate-200 text-xs font-bold shadow-sm">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Payments</SelectItem>
                {paymentTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="outline" 
                className="rounded-xl border-slate-200 h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 gap-2 shadow-sm"
                onClick={onExportCSV}
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl border-slate-200 h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 gap-2 shadow-sm"
                onClick={onImportExcel}
              >
                <FileText className="h-3.5 w-3.5" />
                Import Excel
              </Button>
            </div>
            <input 
              id="excel-input" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={onProcessImport} 
            />
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
