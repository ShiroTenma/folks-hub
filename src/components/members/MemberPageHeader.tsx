import React from 'react';
import { 
  UserPlus, 
  List,
  LayoutGrid,
  Link as LinkIcon,
  Table as TableIcon,
  Users
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
import { cn } from '@/lib/utils';
import { DIVISIONS } from '@/lib/constants';
import { toast } from 'sonner';

interface MemberPageHeaderProps {
  isAdmin: boolean;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  onOpenAddMember: () => void;
  onOpenImport: () => void;
}

export function MemberPageHeader({
  isAdmin, viewMode, setViewMode, onOpenAddMember, onOpenImport
}: MemberPageHeaderProps) {
  
  const handleGenerateInviteLink = (division?: string) => {
    const baseUrl = window.location.origin;
    const link = division ? `${baseUrl}/signup?division=${encodeURIComponent(division)}` : `${baseUrl}/signup`;
    navigator.clipboard.writeText(link);
    toast.success(`Invite link copied for ${division || 'all divisions'}!`);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#535366] flex items-center justify-center text-white shadow-xl shadow-[#535366]/20 border border-white/10">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-serif font-black text-[#1c1c1c] tracking-tight italic">Member <span className="not-italic text-[#535366]">Database</span></h1>
        </div>
        <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Active Organization Directory</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-3 border-2 border-[#dcd7cf] font-black rounded-2xl h-14 px-8 bg-white text-[#1c1c1c] uppercase text-[11px] tracking-widest hover:bg-[#eae6e0] transition-all">
              <LinkIcon className="h-4 w-4" /> INVITE
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 border-[#dcd7cf] shadow-2xl mt-4">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 px-4 py-3">Distribution Link</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#eae6e0] mx-2" />
              <DropdownMenuItem onClick={() => handleGenerateInviteLink()} className="rounded-xl py-4 font-bold text-sm gap-3 focus:bg-[#eae6e0] group">
                <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center group-focus:bg-white transition-colors"><LinkIcon className="h-4 w-4" /></div>
                General Registration
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#eae6e0] mx-2" />
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                {DIVISIONS.map(d => (
                  <DropdownMenuItem key={d} onClick={() => handleGenerateInviteLink(d)} className="rounded-xl py-3 px-4 font-bold text-xs hover:bg-[#f4f2ef]">
                    {d}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center bg-[#eae6e0]/50 p-1.5 rounded-2xl border-2 border-[#dcd7cf]">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('table')}
            className={cn(
              "h-10 px-5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest gap-2",
              viewMode === 'table' ? "bg-[#1c1c1c] text-white shadow-xl" : "text-[#535366]/40 hover:text-[#535366]"
            )}
          >
            <List className="h-4 w-4" /> List
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={cn(
              "h-10 px-5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest gap-2",
              viewMode === 'grid' ? "bg-[#1c1c1c] text-white shadow-xl" : "text-[#535366]/40 hover:text-[#535366]"
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
        </div>
        
        {isAdmin && (
          <>
            <Button variant="outline" onClick={onOpenImport} className="gap-3 border-2 border-[#dcd7cf] font-black rounded-2xl h-14 px-8 bg-white text-[#535366] uppercase text-[11px] tracking-widest hover:bg-[#eae6e0] transition-all">
              <TableIcon className="h-4 w-4" /> IMPORT
            </Button>
            <Button onClick={onOpenAddMember} className="gap-3 bg-[#1c1c1c] hover:bg-[#1c1c1c]/90 text-white font-black rounded-2xl h-14 px-8 shadow-2xl shadow-black/10 transition-all active:scale-95 uppercase text-[11px] tracking-[0.3em]">
              <UserPlus className="h-4 w-4" /> REGISTER MEMBER
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
