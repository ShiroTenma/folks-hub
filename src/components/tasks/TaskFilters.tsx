import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter as FilterIcon, Layers, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DIVISIONS } from '@/lib/constants';

interface TaskFiltersProps {
  activeDivision: string;
  onDivisionChange: (division: string) => void;
  onAddTask: () => void;
}

export function TaskFilters({
  activeDivision,
  onDivisionChange,
  onAddTask
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
        <Tabs value={activeDivision} onValueChange={onDivisionChange} className="w-auto">
          <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200 h-12">
            <TabsTrigger value="all" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              All Divisions
            </TabsTrigger>
            {DIVISIONS.map(d => (
              <TabsTrigger key={d} value={d} className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                {d}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="rounded-xl border-slate-200 h-12 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 bg-white text-slate-600 hover:bg-slate-50 transition-all"
        >
          <FilterIcon className="h-4 w-4" />
          Filter
        </Button>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-12 px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
          NEW TASK
        </Button>
      </div>
    </div>
  );
}
