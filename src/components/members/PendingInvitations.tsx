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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, UserCheck, UserX } from 'lucide-react';
import { type Profile } from '@/lib/supabase';

interface PendingInvitationsProps {
  members: Profile[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function PendingInvitations({
  members,
  onApprove,
  onReject
}: PendingInvitationsProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900 border-none hover:bg-slate-900">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-8">Applicant</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Division</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact / ID</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length > 0 ? (
                members.map((member, i) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all"
                  >
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 ring-4 ring-white shadow-sm shrink-0">
                          <AvatarFallback className="bg-amber-100 text-amber-700 font-black text-xs">
                            {member.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 text-sm truncate">{member.full_name}</span>
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight flex items-center gap-1">
                            <Clock className="h-2 w-2" /> Pending Approval
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-600">{member.division}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">{member.contact}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SID: {member.student_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onApprove(member.id)}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-[10px] uppercase px-4 border border-emerald-100 h-9 transition-all"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-2" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onReject(member.id)}
                          className="text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-[10px] uppercase px-4 h-9 transition-all"
                        >
                          <UserX className="h-3.5 w-3.5 mr-2" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CheckCircle2 className="h-8 w-8 opacity-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">No pending invitations</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
