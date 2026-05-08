import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit2, Trash2, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { ROLES } from '@/lib/constants';
import { RoleBadge } from './RoleBadge';

interface MemberCardProps {
  member: Profile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (member: Profile) => void;
  onRevoke: (id: string, name: string) => void;
  index: number;
  onSnapshot: (member: Profile) => void;
  isAdmin?: boolean;
}

export function MemberCard({ member, isSelected, onSelect, onEdit, onRevoke, index, onSnapshot, isAdmin = false }: MemberCardProps) {
  const roleConfig = ROLES.find(r => r.id === member.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={cn(
        "rounded-[2.5rem] border-2 border-[#f4f2ef] shadow-2xl shadow-black/5 hover:shadow-black/10 hover:border-[#1c1c1c] transition-all duration-500 overflow-hidden bg-white group relative",
        isSelected && "ring-4 ring-[#1c1c1c] ring-offset-4"
      )}>
        {isAdmin && (
          <div className="absolute top-6 left-6 z-20">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onSelect(member.id)}
              className="h-6 w-6 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-md data-[state=checked]:bg-white data-[state=checked]:text-[#1c1c1c] transition-all"
            />
          </div>
        )}
        
        {/* Institutional Header Area */}
        <div className="h-28 bg-[#1c1c1c] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="absolute top-6 right-6 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all active:scale-95 border border-white/5">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl w-56 shadow-2xl border-[#dcd7cf] p-2 bg-white/95 backdrop-blur-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]/40 px-3 py-3">Registry Controls</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#f4f2ef] mx-1" />
                  <DropdownMenuItem asChild className="rounded-xl py-4 font-bold text-sm gap-3 cursor-pointer focus:bg-[#f4f2ef]">
                    <Link to={`/profile/${member.id}`} className="flex items-center w-full">
                      <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center text-[#535366]"><User className="h-4 w-4" /></div>
                      Institutional Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-[#f4f2ef] mx-1" />
                      <DropdownMenuItem onClick={() => onEdit(member)} className="rounded-xl py-4 font-bold text-sm gap-3 cursor-pointer focus:bg-[#f4f2ef]">
                        <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center text-[#535366]"><Edit2 className="h-4 w-4" /></div>
                        Modify Credentials
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#f4f2ef] mx-1" />
                      <DropdownMenuItem onClick={() => onRevoke(member.id, member.full_name)} className="rounded-xl py-4 font-bold text-sm gap-3 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                        <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><Trash2 className="h-4 w-4" /></div>
                        Terminate Access
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="pt-0 pb-10 px-8 relative flex flex-col items-center">
          {/* Personnel Entity Identity */}
          <div className="relative -mt-14 mb-6 group/avatar cursor-pointer" onClick={() => onSnapshot(member)}>
            <Avatar className="h-28 w-28 ring-[10px] ring-white shadow-2xl shadow-black/10 transition-transform group-hover/avatar:scale-105 duration-500 rounded-[2.5rem]">
              <AvatarImage src={member.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-[#f4f2ef] text-[#1c1c1c] font-black text-2xl font-heading">
                {member.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white shadow-lg z-10",
              member.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-[#dcd7cf]"
            )} />
          </div>

          <div className="text-center space-y-2 mb-8">
            <h3 className="font-heading font-black text-[#1c1c1c] text-xl tracking-tight italic group-hover:text-[#535366] transition-colors line-clamp-1 px-4">
              {member.full_name}
            </h3>
            <div className="flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-[#535366]/40 uppercase tracking-[0.2em]">Personnel ID: {member.uid?.substring(0, 8)}</span>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-[#f4f2ef] rounded-2xl p-4 flex flex-col items-center justify-center border border-transparent hover:border-[#dcd7cf] transition-all">
              <span className="text-[8px] font-black text-[#535366]/40 uppercase tracking-[0.3em] mb-2">Institutional Unit</span>
              <span className="text-[10px] font-black text-[#1c1c1c] truncate w-full text-center uppercase tracking-widest">{member.division}</span>
            </div>
            <div className="bg-[#f4f2ef] rounded-2xl p-4 flex flex-col items-center justify-center border border-transparent hover:border-[#dcd7cf] transition-all">
              <span className="text-[8px] font-black text-[#535366]/40 uppercase tracking-[0.3em] mb-2">Cohort</span>
              <span className="text-[10px] font-black text-[#1c1c1c] uppercase tracking-widest">BATCH {member.batch}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Badge className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-none shadow-sm",
              roleConfig?.color || "bg-[#f4f2ef] text-[#535366]"
            )}>
              {roleConfig?.label || member.role}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
