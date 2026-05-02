import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Users,
  CheckSquare,
  BookOpen,
  Calendar,
  Receipt,
  LayoutDashboard,
  Settings,
  Search,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

/**
 * Command Palette for rapid institutional navigation.
 * Accessible via Ctrl+K or Cmd+K.
 * Features search for Members, Tasks, and Ledger entries.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ members: any[], tasks: any[] }>({ members: [], tasks: [] });
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const isAdmin = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!search || search.length < 2) {
      setResults({ members: [], tasks: [] });
      return;
    }

    const performSearch = async () => {
      const [membersRes, tasksRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, division').ilike('full_name', `%${search}%`).limit(5),
        supabase.from('tasks').select('id, title, status').ilike('title', `%${search}%`).limit(5)
      ]);

      setResults({
        members: membersRes.data || [],
        tasks: tasksRes.data || []
      });
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="SEARCH REGISTRY..."
        className="h-16 font-black uppercase text-[10px] tracking-[0.3em] bg-transparent outline-none border-none placeholder:text-[#535366]/30"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[450px] custom-scrollbar bg-white p-2">
        <CommandEmpty className="py-12 text-center text-[#535366]/40 font-black uppercase tracking-[0.3em] text-[10px]">
          No matching records identified.
        </CommandEmpty>

        <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#535366]/40 px-2 py-4">Navigation Shortcuts</span>}>
          <CommandItem onSelect={() => runCommand(() => navigate('/'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <LayoutDashboard className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">Dashboard Nexus</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/finance'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <BookOpen className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">Financial Ledger</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/members'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <Users className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">Personnel Registry</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/tasks'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <CheckSquare className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">Strategy Board</span>
          </CommandItem>
        </CommandGroup>

        {(results.members.length > 0 || results.tasks.length > 0) && <CommandSeparator className="my-2 bg-[#f4f2ef]" />}

        {results.members.length > 0 && (
          <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#535366]/40 px-2 py-4">Personnel Matches</span>}>
            {results.members.map((m) => (
              <CommandItem key={m.id} onSelect={() => runCommand(() => navigate(`/profile/${m.id}`))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-[#535366]/10 flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-[#535366]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#1c1c1c]">{m.full_name}</span>
                      <span className="text-[9px] font-black uppercase text-[#535366]/40 tracking-widest">{m.division}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#dcd7cf] group-focus:text-[#1c1c1c] transition-colors" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.tasks.length > 0 && (
          <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#535366]/40 px-2 py-4">Strategy Matches</span>}>
            {results.tasks.map((t) => (
              <CommandItem key={t.id} onSelect={() => runCommand(() => navigate('/tasks'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                      <Target className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#1c1c1c]">{t.title}</span>
                      <span className="text-[9px] font-black uppercase text-amber-600/40 tracking-widest">{t.status}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#dcd7cf] group-focus:text-[#1c1c1c] transition-colors" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator className="my-2 bg-[#f4f2ef]" />
        <CommandGroup heading={<span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#535366]/40 px-2 py-4">Administrative Tools</span>}>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <Settings className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">System Configuration</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/finance/split'))} className="py-4 px-4 rounded-xl cursor-pointer focus:bg-[#f4f2ef] group">
            <Receipt className="mr-3 h-5 w-5 text-[#535366] group-focus:text-[#1c1c1c]" />
            <span className="font-bold text-sm text-[#1c1c1c]">Split Allocation Registry</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="p-4 border-t bg-[#f4f2ef]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#1c1c1c] opacity-20" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#535366]/40 italic">Folks Hub Unified Nexus</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-[#dcd7cf]">
            <span className="text-[8px] font-black text-[#535366]">ENTER</span>
          </div>
          <span className="text-[8px] font-black text-[#535366]/40 uppercase tracking-widest">To Navigate</span>
        </div>
      </div>
    </CommandDialog>
  );
}
