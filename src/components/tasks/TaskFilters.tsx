import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
      <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
        <Tabs value={activeDivision} onValueChange={onDivisionChange} className="w-auto">
          <TabsList className="bg-white p-2 rounded-[2rem] border-2 border-[#dcd7cf] h-18 flex items-center shadow-xl shadow-black/5 w-fit">
            <TabsTrigger value="all" className="rounded-2xl px-10 h-14 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
              Complete Pipeline
            </TabsTrigger>
            {DIVISIONS.map(d => (
              <TabsTrigger key={d} value={d} className="rounded-2xl px-8 h-14 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
                {d}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          className="bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl h-14 px-10 shadow-2xl shadow-black/10 transition-all active:scale-95 gap-3"
          onClick={onAddTask}
        >
          <Plus className="h-5 w-5" />
          AUTHORIZE TASK
        </Button>
      </div>
    </div>
  );
}
