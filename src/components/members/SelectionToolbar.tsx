import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { X, Shield, Tag } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DIVISIONS, ROLES } from '@/lib/constants';

interface SelectionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkUpdate: (field: 'status' | 'division' | 'role' | 'tags', value: any) => Promise<void>;
}

export function SelectionToolbar({
  selectedCount,
  onClearSelection,
  onBulkUpdate
}: SelectionToolbarProps) {
  const commonTags = ['Agenda', 'Proker', 'BPH', 'Staff', 'Alumni'];

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
        >
          <div className="bg-slate-900 text-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 pl-4 shrink-0">
              <div className="bg-indigo-500 text-white h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">
                {selectedCount}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-black uppercase tracking-widest">Selected</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Bulk Actions Available</span>
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/70 hover:text-white px-3">
                    Division
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2">
                  {DIVISIONS.map(d => (
                    <DropdownMenuItem key={d} onClick={() => onBulkUpdate('division', d)} className="rounded-xl py-3 font-bold text-xs">
                      {d}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/70 hover:text-white px-3">
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2">
                  <DropdownMenuItem onClick={() => onBulkUpdate('status', 'active')} className="rounded-xl py-3 font-bold text-xs text-emerald-600">Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBulkUpdate('status', 'inactive')} className="rounded-xl py-3 font-bold text-xs text-slate-400">Inactive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/70 hover:text-white px-3">
                    Role
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2">
                  {ROLES.map(r => (
                    <DropdownMenuItem key={r.id} onClick={() => onBulkUpdate('role', r.id)} className="rounded-xl py-3 font-bold text-xs">
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/70 hover:text-white px-3">
                    Add Tags
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2">
                  {commonTags.map(t => (
                    <DropdownMenuItem key={t} onClick={() => onBulkUpdate('tags', [t])} className="rounded-xl py-3 font-bold text-xs">
                      {t}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem 
                    onClick={() => {
                      const tag = prompt('Enter custom tag:');
                      if (tag) onBulkUpdate('tags', [tag]);
                    }} 
                    className="rounded-xl py-3 font-bold text-xs border-t mt-1"
                  >
                    Custom...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-8 bg-white/10 mx-2 shrink-0" />

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClearSelection}
                className="h-10 w-10 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
