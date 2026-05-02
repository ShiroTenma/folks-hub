import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
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

interface MemberCardProps {
  member: Profile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (member: Profile) => void;
  onRevoke: (id: string, name: string) => void;
  index: number;
}

export function MemberCard({ member, isSelected, onSelect, onEdit, onRevoke, index }: MemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={cn(
        "rounded-3xl border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden bg-white group relative",
        isSelected && "ring-2 ring-indigo-600 ring-offset-2"
      )}>
        <div className="absolute top-4 left-4 z-10">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onSelect(member.id)}
            className="h-5 w-5 border-white/20 bg-white/10 backdrop-blur-md data-checked:bg-indigo-600 data-checked:border-indigo-600"
          />
        </div>
        <div className="h-24 bg-gradient-to-br from-slate-900 to-indigo-950 relative">
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-xl bg-white/5 backdrop-blur-md">
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
          </div>
        </div>
        <CardContent className="pt-0 pb-6 px-6 relative flex flex-col items-center">
          <Avatar className="h-24 w-24 ring-8 ring-white shadow-lg -mt-12 mb-4">
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xl">
              {member.full_name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-black text-slate-900 text-center line-clamp-1">{member.full_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn("w-2 h-2 rounded-full", member.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.status}</span>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-2 mt-6">
            <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Division</span>
              <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">{member.division}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</span>
              <span className="text-[10px] font-bold text-slate-700">{member.batch}</span>
            </div>
          </div>

          <div className="mt-4">
            <RoleBadge role={member.role} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
