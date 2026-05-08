import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2, Search, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { type Profile } from '@/lib/supabase';
import { ROLES } from '@/lib/constants';

interface MemberTableProps {
  members: Profile[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: () => void;
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

export function MemberTable({
  members, isLoading, selectedIds, onSelectAll, onSelectMember, onEdit, onRevoke, currentPage, totalPages, onPageChange, onResetFilters, onSnapshot, isAdmin = false
}: MemberTableProps) {
  return (
    <>
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1c1c1c] border-none hover:bg-[#1c1c1c]">
              {isAdmin && (
                <TableHead className="w-[80px] pl-12">
                  <Checkbox 
                    checked={members.length > 0 && selectedIds.length === members.length}
                    onCheckedChange={onSelectAll}
                    className="h-5 w-5 rounded-lg border-2 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-[#1c1c1c] transition-all"
                  />
                </TableHead>
              )}
              <TableHead className={cn("text-[10px] font-black uppercase tracking-[0.4em] text-white/50 py-8", !isAdmin && "pl-12")}>Organization Member</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Classification</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Unit & Cohort</TableHead>
              {isAdmin && <TableHead className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 text-right pr-12">Operations</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-96 bg-white">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 rounded-full border-4 border-[#1c1c1c] border-t-transparent animate-spin" />
                    <span className="text-[#535366]/60 font-black uppercase tracking-[0.3em] text-xs">Accessing Registry Archives...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : members.length > 0 ? (
              members.map((member, i) => {
                const isSelected = selectedIds.includes(member.id);
                const roleConfig = ROLES.find(r => r.id === member.role);
                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className={cn(
                      "group hover:bg-[#eae6e0]/30 transition-all duration-300 border-[#dcd7cf]/30",
                      isSelected && "bg-[#eae6e0]/50"
                    )}
                  >
                    {isAdmin && (
                      <TableCell className="py-6 pl-12">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => onSelectMember(member.id)}
                          className="h-5 w-5 rounded-lg border-2 border-[#dcd7cf] data-[state=checked]:bg-[#1c1c1c] data-[state=checked]:border-[#1c1c1c] transition-all"
                        />
                      </TableCell>
                    )}
                    <TableCell className={cn(!isAdmin && "pl-12")}>
                      <div className="flex items-center gap-5">
                        <div className="relative cursor-pointer" onClick={() => onSnapshot(member)}>
                          <Avatar className="h-12 w-12 rounded-[1rem] ring-4 ring-white shadow-xl shrink-0 transition-transform group-hover:scale-110 duration-500">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="bg-[#eae6e0] text-[#1c1c1c] font-black text-xs">
                              {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm", member.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-[#dcd7cf]")} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link to={`/profile/${member.id}`} className="font-heading font-black text-[#1c1c1c] text-base truncate italic hover:text-[#535366] transition-colors cursor-pointer">
                            {member.full_name}
                          </Link>
                          <span className="text-[9px] font-black text-[#535366]/40 uppercase tracking-widest">{member.status} Account</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                        roleConfig?.color || "bg-white text-[#535366] border-[#dcd7cf]"
                      )}>
                        {roleConfig?.label || member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#1c1c1c]">{member.division}</span>
                        <span className="text-[10px] font-black text-[#535366]/40 uppercase tracking-widest">Cohort {member.batch}</span>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right pr-12">
                        <div className="flex items-center justify-end gap-3">
                          <Button variant="ghost" size="icon" asChild className="h-11 w-11 rounded-[1rem] bg-white border-2 border-[#dcd7cf] text-[#535366] hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-all">
                            <Link to={`/profile/${member.id}`}><UserCheck className="h-5 w-5" /></Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-11 w-11 flex items-center justify-center rounded-[1rem] bg-white border-2 border-[#dcd7cf] text-[#535366] hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-all shadow-xl shadow-black/5">
                              <MoreVertical className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[1.5rem] w-64 p-3 border-[#dcd7cf] shadow-2xl mt-2 bg-white/95 backdrop-blur-xl">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 px-4 py-3">Member Operations</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#eae6e0] mx-2" />
                                <DropdownMenuItem onClick={() => onEdit(member)} className="gap-3 py-4 rounded-xl cursor-pointer focus:bg-[#eae6e0] group">
                                  <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center text-[#535366] group-focus:bg-[#1c1c1c] group-focus:text-white transition-colors"><Edit2 className="h-4 w-4" /></div>
                                  <span className="text-sm font-bold text-[#1c1c1c]">Modify Credentials</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#eae6e0] mx-2" />
                                <DropdownMenuItem onClick={() => onRevoke(member.id, member.full_name)} className="gap-3 py-4 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 group">
                                  <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center group-focus:bg-rose-600 group-focus:text-white transition-colors"><Trash2 className="h-4 w-4" /></div>
                                  <span className="text-sm font-bold">Terminate Access</span>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-72 text-center bg-white">
                  <div className="flex flex-col items-center justify-center text-[#535366]/40 gap-4">
                    <Search className="h-12 w-12 opacity-20" />
                    <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Registry Entries Found</p>
                    <Button variant="outline" onClick={onResetFilters} className="rounded-xl border-2 border-[#dcd7cf] text-[#535366] font-black text-[10px] uppercase tracking-widest h-10 px-6 mt-4">Reset Parameters</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="bg-[#f4f2ef]/50 border-t border-[#dcd7cf] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">Organization Registry — Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Previous
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl h-12 font-black text-[11px] uppercase tracking-widest px-6 border-[#dcd7cf] hover:bg-[#1c1c1c] hover:text-white transition-all group" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
