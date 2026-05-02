import { motion } from 'motion/react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2, Search } from 'lucide-react';
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
import { type Profile } from '@/lib/supabase';
import { RoleBadge } from './RoleBadge';

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
}

export function MemberTable({
  members,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectMember,
  onEdit,
  onRevoke,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters
}: MemberTableProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900 border-none hover:bg-slate-900">
                <TableHead className="w-12 py-6 pl-8">
                  <Checkbox 
                    checked={selectedIds.length === members.length && members.length > 0}
                    onCheckedChange={onSelectAll}
                    className="border-slate-700 data-checked:bg-indigo-500 data-checked:border-indigo-500"
                  />
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID / Batch</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Division & Role</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-slate-400 font-bold uppercase">
                    Syncing Database...
                  </TableCell>
                </TableRow>
              ) : members.length > 0 ? (
                members.map((member, i) => {
                  const isSelected = selectedIds.includes(member.id);
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all",
                        isSelected && "bg-indigo-50/30"
                      )}
                    >
                      <TableCell className="py-5 pl-8">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => onSelectMember(member.id)}
                          className="border-slate-200 data-checked:bg-indigo-600 data-checked:border-indigo-600"
                        />
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 ring-4 ring-white shadow-sm shrink-0">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xs">
                              {member.full_name?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-slate-900 text-sm truncate">{member.full_name}</span>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.status}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{member.student_id || '-'}</span>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Class of {member.batch}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-600">{member.division}</span>
                          <RoleBadge role={member.role} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onEdit(member)} className="gap-2 py-3 px-3 cursor-pointer">
                                <Edit2 className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-bold text-slate-700">Edit Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onRevoke(member.id, member.full_name)} className="gap-2 py-3 px-3 cursor-pointer text-rose-600 focus:text-rose-700">
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm font-bold">Revoke Access</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Search className="h-8 w-8 opacity-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">No members match your criteria</p>
                      <Button variant="link" onClick={onResetFilters} className="text-indigo-600 font-black text-[10px] uppercase">Reset Filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest px-4 bg-white" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest px-4 bg-white" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
